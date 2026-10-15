import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface StaffRow {
  id?: number;
  tempId: string;
  username: string;
  password: string;
  isSaved: boolean;
  showPassword: boolean;
  saving?: boolean;
}

export default function ITStaff() {
  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Load staff list from API
  useEffect(() => {
    fetch('/api/admin/staff', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setRows(
            data.map((item) => ({
              id: item.id,
              tempId: String(item.id),
              username: item.username,
              password: '••••••••',
              isSaved: true,
              showPassword: false,
            }))
          );
        } else {
          // If no staff yet, show one empty row ready to fill
          setRows([
            {
              tempId: 'row-' + Date.now(),
              username: '',
              password: '',
              isSaved: false,
              showPassword: false,
            },
          ]);
        }
        setLoading(false);
      })
      .catch(() => {
        setRows([
          {
            tempId: 'row-' + Date.now(),
            username: '',
            password: '',
            isSaved: false,
            showPassword: false,
          },
        ]);
        setLoading(false);
      });
  }, []);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      {
        tempId: 'row-' + Date.now(),
        username: '',
        password: '',
        isSaved: false,
        showPassword: false,
      },
    ]);
  };

  const updateField = (tempId: string, field: 'username' | 'password', value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.tempId === tempId ? { ...row, [field]: value } : row))
    );
  };

  const togglePassword = (tempId: string) => {
    setRows((prev) =>
      prev.map((row) =>
        row.tempId === tempId ? { ...row, showPassword: !row.showPassword } : row
      ))
    ;
  };

  const handleSave = async (row: StaffRow) => {
    const trimmedUsername = row.username.trim();
    const trimmedPassword = row.password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please enter both Username and Password',
        icon: 'warning',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false,
      });
      return;
    }

    setRows((prev) =>
      prev.map((r) => (r.tempId === row.tempId ? { ...r, saving: true } : r))
    );

    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: trimmedUsername,
          password: trimmedPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setRows((prev) =>
          prev.map((r) =>
            r.tempId === row.tempId
              ? {
                  ...r,
                  id: data.staff.id,
                  username: trimmedUsername,
                  password: '••••••••',
                  isSaved: true,
                  showPassword: false,
                  saving: false,
                }
              : r
          )
        );

        Swal.fire({
          title: 'Saved!',
          text: `IT Staff "${trimmedUsername}" has been saved.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        setRows((prev) =>
          prev.map((r) => (r.tempId === row.tempId ? { ...r, saving: false } : r))
        );
        Swal.fire({
          title: 'Failed to Save',
          text: data.error || 'Failed to save IT staff member',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: false,
        });
      }
    } catch (err) {
      setRows((prev) =>
        prev.map((r) => (r.tempId === row.tempId ? { ...r, saving: false } : r))
      );
      Swal.fire({
        title: 'Network Error',
        text: 'Failed to connect to the server',
        icon: 'error',
        customClass: { confirmButton: 'btn btn-primary' },
        buttonsStyling: false,
      });
    }
  };

  const handleDelete = (row: StaffRow) => {
    // If not saved to database yet, simply remove from list
    if (!row.isSaved || !row.id) {
      setRows((prev) => prev.filter((r) => r.tempId !== row.tempId));
      return;
    }

    // If saved in database, confirm before deleting
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to delete IT Staff "${row.username}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      customClass: {
        confirmButton: 'btn btn-danger me-3',
        cancelButton: 'btn btn-outline-secondary',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/admin/staff/${row.id}`, {
            method: 'DELETE',
            credentials: 'same-origin',
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setRows((prev) => prev.filter((r) => r.tempId !== row.tempId));
            Swal.fire({
              title: 'Deleted!',
              text: 'IT Staff member has been deleted.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              title: 'Error',
              text: data.error || 'Failed to delete IT staff member',
              icon: 'error',
              customClass: { confirmButton: 'btn btn-primary' },
              buttonsStyling: false,
            });
          }
        } catch {
          Swal.fire({
            title: 'Error',
            text: 'Network error occurred while deleting',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false,
          });
        }
      }
    });
  };

  return (
    <div className="container-xxl flex-grow-1 container-p-y">
      <div className="row gy-6">
        <div className="col-12">
          <div className="card">
            <h5 className="card-header border-bottom">IT Staff</h5>
            <div className="card-body pt-6">
              {loading ? (
                <div className="text-center p-5">Loading IT Staff...</div>
              ) : (
                <form className="form-repeater" onSubmit={(e) => e.preventDefault()}>
                  <div data-repeater-list="group-staff">
                    {rows.map((row, index) => (
                      <div key={row.tempId} data-repeater-item>
                        <div className="row g-4 align-items-center">
                          {/* Username */}
                          <div className="col-12 col-md-4">
                            <div className="form-floating form-floating-outline">
                              <input
                                type="text"
                                id={`staff-username-${row.tempId}`}
                                className="form-control"
                                placeholder="Username"
                                value={row.username}
                                disabled={row.isSaved}
                                onChange={(e) => updateField(row.tempId, 'username', e.target.value)}
                              />
                              <label htmlFor={`staff-username-${row.tempId}`}>Username</label>
                            </div>
                          </div>

                          {/* Password */}
                          <div className="col-12 col-md-4">
                            {row.isSaved ? (
                              <div className="form-floating form-floating-outline">
                                <input
                                  type="password"
                                  id={`staff-password-${row.tempId}`}
                                  className="form-control"
                                  value="••••••••"
                                  disabled
                                />
                                <label htmlFor={`staff-password-${row.tempId}`}>Password (Encrypted)</label>
                              </div>
                            ) : (
                              <div className="form-password-toggle">
                                <div className="input-group input-group-merge">
                                  <div className="form-floating form-floating-outline">
                                    <input
                                      type={row.showPassword ? 'text' : 'password'}
                                      id={`staff-password-${row.tempId}`}
                                      className="form-control"
                                      placeholder="············"
                                      value={row.password}
                                      onChange={(e) => updateField(row.tempId, 'password', e.target.value)}
                                    />
                                    <label htmlFor={`staff-password-${row.tempId}`}>Password</label>
                                  </div>
                                  <span
                                    className="input-group-text cursor-pointer"
                                    onClick={() => togglePassword(row.tempId)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <i
                                      className={`icon-base ri ${
                                        row.showPassword ? 'ri-eye-line' : 'ri-eye-off-line'
                                      } icon-20px`}
                                    ></i>
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons: Save & Delete */}
                          <div className="col-12 col-md-4 d-flex align-items-center gap-2">
                            {!row.isSaved && (
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleSave(row)}
                                disabled={row.saving}
                              >
                                <i className="icon-base ri ri-save-line me-1"></i>
                                <span className="align-middle">
                                  {row.saving ? 'Saving...' : 'Save'}
                                </span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => handleDelete(row)}
                            >
                              <i className="icon-base ri ri-close-line icon-md me-1"></i>
                              <span className="align-middle">Delete</span>
                            </button>
                          </div>
                        </div>
                        {index < rows.length - 1 && <hr className="my-4" />}
                      </div>
                    ))}
                  </div>

                  <div className="mb-0 mt-4">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleAddRow}
                    >
                      <i className="icon-base ri ri-add-line me-1"></i>
                      <span className="align-middle">Add</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
