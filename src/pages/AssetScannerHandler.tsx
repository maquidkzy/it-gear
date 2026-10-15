import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function AssetScannerHandler() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAsset() {
      try {
        const response = await fetch(`/api/assets/${id}`);
        if (!response.ok) {
          setError('อุปกรณ์ชำรุด/สูญหาย หรือไม่มีในระบบ ไม่สามารถทำรายการได้');
          return;
        }

        const data = await response.json();
        const { asset, isCurrentlyBorrowed } = data;

        // ด่านที่ 1: เช็คสถานะพัง/หาย
        if (asset.status === 'Broken' || asset.status === 'Lost') {
          setError('อุปกรณ์ชิ้นนี้ชำรุด/สูญหาย ไม่สามารถทำรายการได้');
          return;
        }

        // ด่านที่ 2: เช็คประเภทของอุปกรณ์
        if (asset.isReturnable === false || asset.isReturnable === 0) {
          // อุปกรณ์เบิกขาด พาไปหน้ายืม (เบิก) เสมอ
          navigate(`/borrow?id=${asset.id}`, { replace: true });
        } else {
          // อุปกรณ์ยืม-คืนปกติ
          if (isCurrentlyBorrowed || asset.stock <= 0) {
            // โดนยืมอยู่ พาไปหน้าคืน
            navigate(`/return?id=${asset.id}`, { replace: true });
          } else {
            // ว่าง พาไปหน้ายืม
            navigate(`/borrow?id=${asset.id}`, { replace: true });
          }
        }

      } catch (err) {
        setError('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
      }
    }

    if (id) {
      checkAsset();
    }
  }, [id, navigate]);

  if (error) {
    return (
      <div className="container-xxl container-p-y d-flex justify-content-center align-items-center min-vh-100">
        <div className="misc-wrapper text-center">
          <h2 className="mb-1 mt-4 text-danger">ไม่สามารถทำรายการได้ ⚠️</h2>
          <p className="mb-4 mx-2">{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xxl container-p-y d-flex justify-content-center align-items-center min-vh-100">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4>กำลังตรวจสอบสถานะอุปกรณ์...</h4>
      </div>
    </div>
  );
}
