import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, or } from 'drizzle-orm';
import { assets, borrowHistory, staff } from '../src/db/schema';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

type Bindings = {
  DB: D1Database;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
};

async function hashPassword(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

// --- User Routes ---

// Get all active assets for users to borrow
app.get('/assets', async (c) => {
  const db = drizzle(c.env.DB);
  const allAssets = await db.select().from(assets).where(eq(assets.status, 'Active')).all();
  return c.json(allAssets);
});


// Get a single asset by ID and check its borrow status
app.get('/assets/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const assetId = c.req.param('id');
  
  const asset = await db.select().from(assets).where(eq(assets.id, assetId)).get();
  
  if (!asset) {
    return c.json({ error: 'Asset not found' }, 404);
  }

  // Check if it's currently borrowed
  const activeBorrow = await db.select().from(borrowHistory).where(
    and(
      eq(borrowHistory.assetId, assetId),
      eq(borrowHistory.status, 'Borrowed')
    )
  ).get();

  return c.json({
    asset,
    isCurrentlyBorrowed: !!activeBorrow,
    currentBorrow: activeBorrow ? {
      borrowerName: activeBorrow.borrowerName,
      borrowerEmail: activeBorrow.borrowerEmail
    } : null
  });
});

// Borrow an asset
app.post('/borrow', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  // Basic validation
  if (!body.assetId || !body.borrowerName || !body.borrowerEmail || !body.returnCode) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Check if asset exists and is available
  const asset = await db.select().from(assets).where(eq(assets.id, body.assetId)).get();
  if (!asset) return c.json({ error: 'Asset not found' }, 404);
  if (asset.stock <= 0) return c.json({ error: 'Asset out of stock' }, 400);

  const isReturnable = asset.isReturnable !== false && asset.isReturnable !== 0;
  const borrowStatus = isReturnable ? 'Borrowed' : 'Requested';

  // Insert borrow history
  await db.insert(borrowHistory).values({
    assetId: body.assetId,
    borrowerName: body.borrowerName,
    borrowerEmail: body.borrowerEmail,
    returnCode: body.returnCode || '',
    status: borrowStatus,
    borrowDate: new Date()
  });

  // Decrease stock if it's returnable and trackable, or just decrease stock generally
  // Actually, stock tracking is essential
  await db.update(assets).set({ stock: asset.stock - 1 }).where(eq(assets.id, body.assetId));

  return c.json({ success: true, message: isReturnable ? 'Asset borrowed successfully' : 'Asset requested successfully' });
});

// Return an asset
app.post('/return', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  if (!body.assetId || !body.returnCode || !body.itPassword) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  // Verify IT staff password from staff table or fallback to ADMIN_PASSWORD
  const trimmedPassword = body.itPassword.trim();
  const hashedPassword = await hashPassword(trimmedPassword);
  const staffMember = await db
    .select()
    .from(staff)
    .where(or(eq(staff.password, hashedPassword), eq(staff.password, trimmedPassword)))
    .get();
  let staffName = '';
  if (staffMember) {
    staffName = staffMember.username;
  } else if (trimmedPassword === c.env.ADMIN_PASSWORD) {
    staffName = 'Admin';
  } else {
    return c.json({ error: 'Invalid IT staff password' }, 401);
  }

  // Find active borrow record
  const record = await db.select().from(borrowHistory).where(
    and(
      eq(borrowHistory.assetId, body.assetId),
      eq(borrowHistory.status, 'Borrowed'),
      eq(borrowHistory.returnCode, body.returnCode)
    )
  ).get();

  if (!record) {
    return c.json({ error: 'Invalid return code or no active borrow record found' }, 404);
  }

  // Mark as returned
  await db.update(borrowHistory).set({
    status: 'Returned',
    returnDate: new Date(),
    staffName: staffName
  }).where(eq(borrowHistory.id, record.id));

  // Increase stock back
  const asset = await db.select().from(assets).where(eq(assets.id, body.assetId)).get();
  if (asset) {
    await db.update(assets).set({ stock: asset.stock + 1 }).where(eq(assets.id, body.assetId));
  }

  return c.json({ success: true, message: 'Asset returned successfully' });
});


// --- Auth Routes ---
app.post('/admin/login', async (c) => {
  const body = await c.req.json();
  if (body.username === c.env.ADMIN_USERNAME && body.password === c.env.ADMIN_PASSWORD) {
    const token = await sign({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 }, c.env.JWT_SECRET, 'HS256');
    setCookie(c, 'admin_token', token, { httpOnly: true, secure: false, sameSite: 'Strict', path: '/' });
    return c.json({ success: true });
  }
  return c.json({ success: false, error: 'Invalid password', debugEnv: { u: c.env.ADMIN_USERNAME, p: c.env.ADMIN_PASSWORD } }, 401);
});

app.post('/admin/logout', async (c) => {
  deleteCookie(c, 'admin_token', { path: '/' });
  return c.json({ success: true });
});

app.get('/admin/check-auth', async (c) => {
  const token = getCookie(c, 'admin_token');
  if (!token) return c.json({ authenticated: false, reason: 'No token cookie found' }, 401);
  try {
    await verify(token, c.env.JWT_SECRET, 'HS256');
    return c.json({ authenticated: true });
  } catch (err: any) {
    const isExpired = err?.message && err.message.toLowerCase().includes('expired');
    const reason = isExpired
      ? 'Token verification failed: token expired, please sign-in again.'
      : 'Token verification failed: session invalid, please sign-in again.';
    return c.json({ authenticated: false, reason }, 401);
  }
});

// Middleware for all other /admin/* routes
app.use('/admin/*', async (c, next) => {
  if (c.req.path === '/api/admin/login' || c.req.path === '/api/admin/check-auth' || c.req.path === '/api/admin/logout') {
    return next();
  }
  const token = getCookie(c, 'admin_token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  try {
    await verify(token, c.env.JWT_SECRET, 'HS256');
    return next();
  } catch (err) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
});

// --- Admin Routes ---

// Get all assets (including inactive/broken)
app.get('/admin/assets', async (c) => {
  const db = drizzle(c.env.DB);
  const allAssets = await db.select().from(assets).all();
  return c.json(allAssets);
});

// Create a new asset
app.post('/admin/assets', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  try {
    await db.insert(assets).values({
      id: body.id,
      title: body.title,
      description: body.description,
      category: body.category,
      campus: body.campus,
      stock: body.stock,
      isReturnable: body.isReturnable,
      status: body.status,
      serialNumber: body.serialNumber,
      imageUrl: body.imageUrl
    });
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Update an asset
app.put('/admin/assets/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  const body = await c.req.json();
  
  try {
    const updateData: any = {
      title: body.title,
      description: body.description,
      category: body.category,
      campus: body.campus,
      stock: body.stock,
      isReturnable: body.isReturnable,
      status: body.status,
      serialNumber: body.serialNumber,
      updatedAt: new Date()
    };
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl;
    }
    await db.update(assets).set(updateData).where(eq(assets.id, id));
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// Get all borrow history
app.get('/admin/history', async (c) => {
  const db = drizzle(c.env.DB);
  const history = await db
    .select({
      id: borrowHistory.id,
      assetId: borrowHistory.assetId,
      borrowerName: borrowHistory.borrowerName,
      borrowDate: borrowHistory.borrowDate,
      returnDate: borrowHistory.returnDate,
      status: borrowHistory.status,
      staffName: borrowHistory.staffName,
      title: assets.title,
      isReturnable: assets.isReturnable
    })
    .from(borrowHistory)
    .leftJoin(assets, eq(borrowHistory.assetId, assets.id))
    .orderBy(desc(borrowHistory.borrowDate))
    .all();
    
  return c.json(history);
});

// --- IT Staff Routes ---

// Get all staff (passwords are NOT returned for security)
app.get('/admin/staff', async (c) => {
  const db = drizzle(c.env.DB);
  const allStaff = await db
    .select({
      id: staff.id,
      username: staff.username,
      createdAt: staff.createdAt
    })
    .from(staff)
    .all();
  return c.json(allStaff);
});

// Create a new staff member (hashed with SHA-256)
app.post('/admin/staff', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  if (!body.username || !body.password) {
    return c.json({ error: 'Username and password are required' }, 400);
  }

  const trimmedUsername = body.username.trim();
  const trimmedPassword = body.password.trim();

  if (!trimmedUsername || !trimmedPassword) {
    return c.json({ error: 'Username and password cannot be empty' }, 400);
  }

  // Password must be unique across staff members and not equal to admin password
  if (trimmedPassword === c.env.ADMIN_PASSWORD) {
    return c.json({ error: 'This password is reserved. Please choose a different password.' }, 400);
  }

  const hashedPassword = await hashPassword(trimmedPassword);

  const existing = await db
    .select()
    .from(staff)
    .where(or(eq(staff.password, hashedPassword), eq(staff.password, trimmedPassword)))
    .get();
  if (existing) {
    return c.json({ error: 'This password is already in use by another staff member' }, 400);
  }

  try {
    const result = await db
      .insert(staff)
      .values({
        username: trimmedUsername,
        password: hashedPassword
      })
      .returning({
        id: staff.id,
        username: staff.username,
        createdAt: staff.createdAt
      })
      .get();
    return c.json({ success: true, staff: result });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete a staff member
app.delete('/admin/staff/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = Number(c.req.param('id'));

  if (!id) {
    return c.json({ error: 'Invalid staff ID' }, 400);
  }

  try {
    await db.delete(staff).where(eq(staff.id, id));
    return c.json({ success: true });
  } catch (err: any) {
    return c.json({ error: err.message }, 500);
  }
});

export default app;
