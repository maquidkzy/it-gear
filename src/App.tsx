import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BorrowEquipment from './components/BorrowEquipment';
import ReturnEquipment from './components/ReturnEquipment';
import AdminLogin from './pages/AdminLogin';
import AssetScannerHandler from './pages/AssetScannerHandler';
import Dashboard from './pages/Dashboard';
import AssetList from './pages/AssetList';
import AssetsStatus from './pages/AssetsStatus';
import ITStaff from './pages/ITStaff';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div style={{height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f8f9fa"}}></div>} />
        <Route path="/borrow" element={<BorrowEquipment />} />
        <Route path="/asset/:id" element={<AssetScannerHandler />} />
        <Route path="/return" element={<ReturnEquipment />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Admin Routes wrapped in Layout */}
        <Route path="/admin" element={<Layout><Dashboard /></Layout>} />
        <Route path="/admin/assets" element={<Layout><AssetList /></Layout>} />
        <Route path="/admin/status" element={<Layout><AssetsStatus /></Layout>} />
        <Route path="/admin/staff" element={<Layout><ITStaff /></Layout>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
