import { useState, useRef, useEffect } from "react";
import Swal from 'sweetalert2';
import { useSearchParams } from "react-router-dom";
import type { FormEvent, KeyboardEvent } from "react";

export default function BorrowEquipment() {
  const [searchParams] = useSearchParams();
  const assetId = searchParams.get('id');
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (assetId) {
      fetch(`/api/assets/${assetId}`)
        .then(res => res.json())
        .then(data => {
          setAsset(data.asset);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [assetId]);

  const [validated, setValidated] = useState(false);
  const [otpError, setOtpError] = useState(false);
  
  // Refs for OTP inputs to handle auto-focus
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpKeyUp = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key >= '0' && e.key <= '9') {
      if (index < otpRefs.length - 1) {
        otpRefs[index + 1].current?.focus();
      }
    } else if (e.key === 'Backspace') {
      if (index > 0 && !(e.target as HTMLInputElement).value) {
        otpRefs[index - 1].current?.focus();
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Check standard HTML5 validity
    let isValid = form.checkValidity();
    
    // Check OTP validity
    let isOtpValid = true;
    otpRefs.forEach((ref) => {
      if (!ref.current?.value) {
        isOtpValid = false;
      }
    });

    setOtpError(!isOtpValid);

    if (!isValid || !isOtpValid) {
      e.stopPropagation();
    } else {
      const code = otpRefs.map(ref => ref.current?.value).join('');
      const payload = {
        assetId: asset.id,
        borrowerName: (e.target as any).borrowerName.value,
        borrowerEmail: (e.target as any).borrowerEmail.value,
        returnCode: code
      };
      
      try {
        const res = await fetch('/api/borrow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          setIsSuccess(true);
          Swal.fire({
            title: 'ทำรายการสำเร็จ!',
            text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
            icon: 'success',
            confirmButtonText: 'กลับสู่หน้าหลัก',
            customClass: { confirmButton: 'btn btn-primary btn-lg' },
            buttonsStyling: false
          }).then(() => {
            window.location.href = '/';
          });
        } else {
          const errorData = await res.json();
          Swal.fire({ title: 'เกิดข้อผิดพลาด', text: errorData.error || 'ไม่สามารถทำรายการได้', icon: 'error', customClass: { confirmButton: 'btn btn-primary btn-lg' } });
        }
      } catch (err) {
        Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', icon: 'error', customClass: { confirmButton: 'btn btn-primary btn-lg' } });
      }
    }

    setValidated(true);
  };

  
  if (loading) return <div className="text-center p-5">Loading...</div>;
  if (!asset) return <div className="text-center p-5 text-danger">ไม่พบอุปกรณ์ หรือไม่ได้สแกน QR Code</div>;

  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic" style={{ paddingBlockStart: 0, paddingBlockEnd: 0 }}>
        <div className="authentication-inner" style={{ paddingBlockStart: 0, paddingBlockEnd: 0 }}>
          <div className="card p-md-7 p-3 shadow-none border-0">
            <div className="app-brand justify-content-center mt-5 mb-4">
              <span className="app-brand-logo demo">
  <img src="data:image/png;base64,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" alt="Stamford Logo" />
</span>
            </div>

            <div className="card-body mt-1">
              {(() => {
                const isReturnable = asset.isReturnable !== false && asset.isReturnable !== 0;
                return (
                  <h4 className={`btn ${isReturnable ? 'btn-label-warning' : 'btn-label-danger'} d-flex w-100 justify-content-start align-items-center mb-1 fs-5 fw-bold`} style={{ cursor: 'default' }}>
                    {isReturnable ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" className="me-2">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="currentColor" d="m20 3l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004L4 3zm0 6H4v10h16zm-8 1l4 4h-3v4h-2v-4H8zm6.764-5H5.236l-.999 2h15.527z" />
                      </svg>
                    ) : (
                      <i className="icon-base ri ri-inbox-unarchive-line me-2" style={{ fontSize: '1.2em' }}></i>
                    )}
                    {isReturnable ? 'Borrow Equipment' : 'Request Equipment'}
                  </h4>
                );
              })()}
              
              {/* 1. Equipment Info */}
              <div className="d-flex align-items-center mb-5 mt-4 w-100">
                <img src={asset.imageUrl || "https://placehold.co/100"} alt="Equipment" className="rounded me-3" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                <div className="w-100">
                  <h5 className="mb-1">{asset.title}</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{asset.description}</p>
                </div>
              </div>

              {!isSuccess ? (
              <form 
                id="formBorrow" 
                className={`mb-5 needs-validation ${validated ? 'was-validated' : ''}`} 
                noValidate 
                onSubmit={handleSubmit}
              >
                {/* 2. Textbox: Name */}
                <div className="form-floating form-floating-outline mb-5">
                  <input type="text" className="form-control" id="borrowerName" name="borrowerName" placeholder="Full Name" required />
                  <label htmlFor="borrowerName">Full Name</label>
                  <div className="invalid-feedback">Please enter your full name</div>
                </div>

                {/* 3. Textbox: Email */}
                <div className="form-floating form-floating-outline mb-5">
                  <input type="email" className="form-control" id="borrowerEmail" name="borrowerEmail" placeholder="Email Address" required />
                  <label htmlFor="borrowerEmail">Email Address</label>
                  <div className="invalid-feedback">Please enter a valid email address</div>
                </div>

                {/* 4. 4-digit code */}
                <div className="mb-5 position-relative">
                  <p className="mb-2">
                    {asset.isReturnable !== false && asset.isReturnable !== 0
                      ? '4-digit return code'
                      : '4-digit confirmation code'}
                  </p>
                  <div className="auth-input-wrapper d-flex align-items-center justify-content-between numeral-mask-wrapper">
                    {otpRefs.map((ref, index) => (
                      <input 
                        key={index}
                        ref={ref}
                        type="tel" 
                        className="form-control auth-input text-center numeral-mask h-px-50 mx-sm-1 my-2" 
                        maxLength={1} 
                        required 
                        onKeyUp={(e) => handleOtpKeyUp(index, e)}
                      />
                    ))}
                  </div>
                  <div className="invalid-feedback position-absolute" style={{ bottom: '-20px', display: otpError ? 'block' : 'none' }}>
                    Please enter a complete 4-digit code
                  </div>
                </div>

                {/* 5. Submit button */}
                <button className="btn btn-primary btn-lg d-grid w-100 mb-5" type="submit">
                  {asset.isReturnable !== false && asset.isReturnable !== 0
                    ? 'Confirm Borrowing'
                    : 'Confirm Request'}
                </button>
              </form>
            ) : (
              <div className="text-center mb-5 mt-4">
                <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                <h4 className="mt-3">ทำรายการสำเร็จ</h4>
                <p className="text-muted">ข้อมูลถูกบันทึกเรียบร้อยแล้ว</p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}