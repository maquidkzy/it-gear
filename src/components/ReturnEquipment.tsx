import { useState, useRef, useEffect } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function ReturnEquipment() {
  const [searchParams] = useSearchParams();
  
  const assetId = searchParams.get('id');

  const [asset, setAsset] = useState<any>(null);
  const [currentBorrow, setCurrentBorrow] = useState<{ borrowerName: string; borrowerEmail: string } | null>(null);
  const [itPassword, setItPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const [validated, setValidated] = useState(false);
  const [otpError, setOtpError] = useState(false);
  const [itPasswordError, setItPasswordError] = useState(false);
    
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (!assetId) {
      setError('Asset ID not found. Please scan the QR Code again.');
      setLoading(false);
      return;
    }

    fetch(`/api/assets/${assetId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError('This asset does not exist in the system.');
        } else if (data.asset.isReturnable === false || data.asset.isReturnable === 0) {
          setError('This asset is non-returnable.');
        } else if (!data.isCurrentlyBorrowed) {
          setError('This asset is not currently borrowed.');
        } else {
          setAsset(data.asset);
          if (data.currentBorrow) {
            setCurrentBorrow(data.currentBorrow);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to connect to the server.');
        setLoading(false);
      });
  }, [assetId]);

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
    let isOtpValid = true;
    let returnCode = '';
    otpRefs.forEach((ref) => {
      if (!ref.current?.value) isOtpValid = false;
      else returnCode += ref.current.value;
    });

    const isPassValid = !!itPassword.trim();
    setOtpError(!isOtpValid);
    setItPasswordError(!isPassValid);
    setValidated(true);

    if (isOtpValid && isPassValid) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/return', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ assetId, returnCode, itPassword: itPassword.trim() })
        });
        if (res.ok) {
          setIsSuccess(true);
          Swal.fire({
            title: 'Equipment Returned!',
            text: 'Thank you for returning the equipment.',
            icon: 'success',
            confirmButtonText: 'Back to Home',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          }).then(() => {
            window.location.href = '/';
          });
        } else {
          const errorData = await res.json();
          Swal.fire({
            title: 'Error',
            text: errorData.error || 'Invalid return code or IT password',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false
          });
        }
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to connect to the server.',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (error || !asset) {
    if (loading) return <div className="text-center p-5">Loading...</div>;
    if (!asset) return <div className="text-center p-5 text-danger">Asset not found or QR code was not scanned.</div>;

    return (
      <div className="p-5 text-center">
        <h3 className="text-danger">⚠️ {error}</h3>
      </div>
    );
  }

  return (
    <div className="position-relative">
      <div className="authentication-wrapper authentication-basic container-p-y">
        <div className="authentication-inner py-6">
          <div className="card p-md-7 p-1 shadow-none border-0">
            <div className="app-brand justify-content-center mt-5 mb-4">
              <span className="app-brand-logo demo">
                <img src="/assets/img/stamford-logo-full.png" alt="Stamford Logo" />
              </span>
            </div>

            <div className="card-body mt-1">
              <h4 className="btn btn-label-success d-flex w-100 justify-content-start align-items-center mb-1 fs-5 fw-bold" style={{ cursor: 'default' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" className="me-2">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path fill="currentColor" d="M4 3h16l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004zm9 11v-4h-2v4H8l4 4l4-4zm6.764-7l-1-2H5.237l-1 2z" />
                </svg>
                Return Equipment
              </h4>
              
              {/* Equipment Info */}
              <div className="d-flex align-items-center mb-5 mt-4 w-100">
                <img
                  src={asset.imageUrl || "https://placehold.co/100"}
                  alt="Equipment"
                  className="rounded me-3"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <div className="w-100">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-label-primary">{asset.category || 'IT Gear'}</span>
                    <span className="text-muted" style={{ fontSize: '0.85rem' }}>ID: {asset.id}</span>
                  </div>
                  <h5 className="mb-1 text-truncate" style={{ maxWidth: '250px' }}>{asset.title}</h5>
                  <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>{asset.description || 'No description provided'}</p>
                </div>
              </div>

              {!isSuccess ? (
                <form 
                  id="formReturn" 
                  className={`mb-5 needs-validation ${validated ? 'was-validated' : ''}`} 
                  noValidate 
                  onSubmit={handleSubmit}
                >
                  {/* Full Name (Disabled) */}
                  <div className="form-floating form-floating-outline mb-5">
                    <input
                      type="text"
                      className="form-control"
                      id="borrowerName"
                      name="borrowerName"
                      placeholder="Full Name"
                      value={currentBorrow?.borrowerName || ''}
                      disabled
                    />
                    <label htmlFor="borrowerName">Full Name</label>
                  </div>

                  {/* Email Address (Disabled) */}
                  <div className="form-floating form-floating-outline mb-5">
                    <input
                      type="email"
                      className="form-control"
                      id="borrowerEmail"
                      name="borrowerEmail"
                      placeholder="Email Address"
                      value={currentBorrow?.borrowerEmail || ''}
                      disabled
                    />
                    <label htmlFor="borrowerEmail">Email Address</label>
                  </div>

                  {/* 4-digit return code */}
                  <div className="mb-5 position-relative">
                    <p className="mb-2">4-digit return code</p>
                    <div className="auth-input-wrapper d-flex align-items-center justify-content-between numeral-mask-wrapper">
                      {otpRefs.map((ref, index) => (
                        <input 
                          key={index}
                          ref={ref}
                          type="tel"
                          inputMode="numeric"
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

                  {/* IT Staff Password */}
                  <div className="form-floating form-floating-outline mb-5">
                    <input
                      type="password"
                      className={`form-control ${itPasswordError ? 'is-invalid' : ''}`}
                      id="itPassword"
                      name="itPassword"
                      placeholder="IT Staff Password"
                      value={itPassword}
                      onChange={(e) => {
                        setItPassword(e.target.value);
                        if (itPasswordError) setItPasswordError(false);
                      }}
                      required
                    />
                    <label htmlFor="itPassword">IT Staff Password</label>
                    {itPasswordError && (
                      <div className="invalid-feedback d-block">
                        Please enter the IT staff password
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button className="btn btn-primary d-grid w-100 mb-5" type="submit" disabled={submitting}>
                    {submitting ? 'Confirming...' : 'Confirm Return'}
                  </button>
                </form>
              ) : (
                <div className="text-center mb-5 mt-4">
                  <i className="ri-checkbox-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
                  <h4 className="mt-3">Return Successful</h4>
                  <p className="text-muted">The return record has been processed successfully.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}