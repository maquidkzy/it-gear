import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const assets = sqliteTable('assets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  imageUrl: text('image_url'),
  status: text('status').default('Active'),
  campus: text('campus').default('RAMA_9'),
  isReturnable: integer('is_returnable', { mode: 'boolean' }).default(true),
  stock: integer('stock').default(1),
  serialNumber: text('serial_number'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const borrowHistory = sqliteTable('borrow_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  assetId: text('asset_id').notNull().references(() => assets.id),
  borrowerName: text('borrower_name').notNull(),
  borrowerEmail: text('borrower_email').notNull(),
  returnCode: text('return_code').notNull(),
  borrowDate: integer('borrow_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  expectedReturnDate: integer('expected_return_date', { mode: 'timestamp' }),
  returnDate: integer('return_date', { mode: 'timestamp' }),
  status: text('status').default('Borrowed'),
  staffName: text('staff_name')
});

export const staff = sqliteTable('staff', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull(),
  password: text('password').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});
