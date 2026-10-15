import { useEffect, useState, useCallback } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { DataTableTopControls, DataTableBottomControls } from '../components/DataTableControls';

export default function AssetList() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Form & Editing state
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Accessories');
  const [formStatus, setFormStatus] = useState('Active');
  const [formCampus, setFormCampus] = useState('RAMA_9');
  const [formIsReturnable, setFormIsReturnable] = useState(true);
  const [formStock, setFormStock] = useState<number>(1);
  const [formSerial, setFormSerial] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const filterAsset = useCallback((asset: any, search: string) => {
    return (
      (asset.id && asset.id.toLowerCase().includes(search)) ||
      (asset.title && asset.title.toLowerCase().includes(search)) ||
      (asset.campus && asset.campus.toLowerCase().includes(search)) ||
      (asset.status && asset.status.toLowerCase().includes(search)) ||
      (asset.isReturnable && 'returnable'.includes(search)) ||
      (asset.stock && String(asset.stock).includes(search)) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(search))
    );
  }, []);

  const {
    pageSize,
    setPageSize,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    totalEntries,
    totalPages,
    startIndex,
    endIndex,
    paginatedData: paginatedAssets,
    pageNumbers,
  } = useDataTable(assets, filterAsset, 7);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/asset/${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    });
  };

  const openAddModal = () => {
    setEditingAsset(null);
    setFormId('');
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Accessories');
    setFormStatus('Active');
    setFormCampus('RAMA_9');
    setFormIsReturnable(true);
    setFormStock(1);
    setFormSerial('');
    setImageBase64(null);

    const el = document.getElementById('add-new-record');
    if (el && (window as any).bootstrap) {
      (window as any).bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  };

  const openEditModal = (asset: any) => {
    setEditingAsset(asset);
    setFormId(asset.id || '');
    setFormTitle(asset.title || '');
    setFormDescription(asset.description || '');
    setFormCategory(asset.category || 'Accessories');
    setFormStatus(asset.status || 'Active');
    setFormCampus(asset.campus || 'RAMA_9');
    setFormIsReturnable(asset.isReturnable ?? true);
    setFormStock(asset.stock ?? 1);
    setFormSerial(asset.serialNumber || '');
    setImageBase64(asset.imageUrl || null);

    const el = document.getElementById('add-new-record');
    if (el && (window as any).bootstrap) {
      (window as any).bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  };

  const handleSaveAsset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const assetPayload = {
      id: formId,
      title: formTitle,
      description: formDescription,
      category: formCategory,
      status: formStatus,
      campus: formCampus,
      stock: Number(formStock) || 1,
      isReturnable: formIsReturnable,
      imageUrl: imageBase64,
      serialNumber: formSerial,
    };

    try {
      const url = editingAsset ? `/api/admin/assets/${editingAsset.id}` : '/api/admin/assets';
      const method = editingAsset ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetPayload),
        credentials: 'same-origin',
      });

      if (res.ok) {
        const updated = await fetch('/api/admin/assets', { credentials: 'same-origin' }).then((r) => r.json());
        setAssets(updated);

        const el = document.getElementById('add-new-record');
        if (el && (window as any).bootstrap) {
          (window as any).bootstrap.Offcanvas.getInstance(el)?.hide();
        }
      } else {
        const errorData = await res.json();
        alert(`Failed to ${editingAsset ? 'update' : 'add'} asset: ` + (errorData.error || res.statusText));
      }
    } catch (err) {
      alert('Network error');
    }
  };

  useEffect(() => {
    fetch('/api/admin/assets', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((data) => {
        setAssets(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        {/* DataTable with Buttons */}
        <div className="card">
          <div className="card-header border-bottom d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Assets List</h5>
            <button className="btn btn-primary create-new" type="button" onClick={openAddModal}>
              <span className="d-flex align-items-center">
                <i className="icon-base ri ri-add-line icon-18px me-sm-1"></i>
                <span className="d-none d-sm-inline-block">Add Asset</span>
              </span>
            </button>
          </div>
          <div className="card-datatable text-nowrap">
            <div className="dt-container dt-bootstrap5">
              <DataTableTopControls
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                search={search}
                onSearchChange={setSearch}
                rowClassName="row m-3 mx-2 my-0 justify-content-between"
              />

              <div className="table-responsive">
                <table className="datatables-basic table table-bordered table-responsive dataTable">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Link</th>
                      <th>Stock / Returnable</th>
                      <th>Campus</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : paginatedAssets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center">
                          No matching records found
                        </td>
                      </tr>
                    ) : (
                      paginatedAssets.map((asset: any) => (
                        <tr key={asset.id}>
                          <td>{asset.id}</td>
                          <td>{asset.title}</td>
                          <td>
                            <button onClick={() => copyLink(asset.id)} className="btn btn-sm btn-label-info">
                              <i
                                className={
                                  copiedLinkId === asset.id
                                    ? 'icon-base ri ri-check-line me-1'
                                    : 'icon-base ri ri-link-m me-1'
                                }
                              ></i>
                              {copiedLinkId === asset.id ? 'Copied!' : 'Link'}
                            </button>
                          </td>
                          <td>{asset.isReturnable ? 'Returnable' : asset.stock}</td>
                          <td>{asset.campus}</td>
                          <td>
                            <span
                              className={`badge ${
                                asset.status === 'Active'
                                  ? 'bg-label-success'
                                  : asset.status === 'Broken'
                                  ? 'bg-label-danger'
                                  : 'bg-label-warning'
                              }`}
                            >
                              {asset.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-label-primary waves-effect"
                              onClick={() => openEditModal(asset)}
                            >
                              <i className="icon-base ri ri-edit-box-line me-1"></i> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <DataTableBottomControls
                totalEntries={totalEntries}
                startIndex={startIndex}
                endIndex={endIndex}
                currentPage={currentPage}
                totalPages={totalPages}
                pageNumbers={pageNumbers}
                onPageChange={setCurrentPage}
                rowClassName="row mx-3 justify-content-between"
              />
            </div>
          </div>
        </div>

        {/* Offcanvas to add / edit record */}
        <div className="offcanvas offcanvas-end" id="add-new-record">
          <div className="offcanvas-header border-bottom">
            <h5 className="offcanvas-title" id="exampleModalLabel">
              {editingAsset ? 'Edit Asset' : 'Add Asset'}
            </h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body flex-grow-1">
            <form className="add-new-record pt-0 row g-4" id="form-add-new-record" onSubmit={handleSaveAsset}>
              {/* ID and Title */}
              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <input
                    type="text"
                    className="form-control"
                    id="assetId"
                    name="assetId"
                    placeholder="e.g. HDMI-C-001"
                    required={true}
                    value={formId}
                    onChange={(e) => setFormId(e.target.value)}
                    disabled={!!editingAsset}
                  />
                  <label htmlFor="assetId">ID {editingAsset && '(Cannot be changed)'}</label>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <input
                    type="text"
                    className="form-control"
                    id="assetTitle"
                    name="assetTitle"
                    placeholder="e.g. C to HDMI converter"
                    required={true}
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                  <label htmlFor="assetTitle">Title</label>
                </div>
              </div>

              {/* Description and Category */}
              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <input
                    type="text"
                    className="form-control"
                    id="assetDescription"
                    name="assetDescription"
                    placeholder="Short description"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                  />
                  <label htmlFor="assetDescription">Description</label>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <select
                    className="form-select"
                    id="assetCategory"
                    name="assetCategory"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                  >
                    <option value="Accessories">Accessories</option>
                    <option value="Laptops">Laptops</option>
                    <option value="Displays">Displays</option>
                    <option value="Cables">Cables</option>
                  </select>
                  <label htmlFor="assetCategory">Category</label>
                </div>
              </div>

              {/* Image Upload Placeholder */}
              <div className="col-sm-12">
                <label className="form-label">Asset Image (100x100 px)</label>
                <div
                  className="d-flex align-items-center border rounded p-4 border-dashed cursor-pointer position-relative"
                  style={{
                    borderStyle: 'dashed !important',
                    justifyContent: 'center',
                    height: '120px',
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <label className="text-center w-100 cursor-pointer mb-0" style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" className="d-none" onChange={handleImageUpload} />
                    {imageBase64 ? (
                      <div className="position-relative d-inline-block">
                        <img
                          src={imageBase64}
                          alt="Preview"
                          style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px' }}
                        />
                      </div>
                    ) : (
                      <>
                        <i className="icon-base ri ri-upload-cloud-2-line fs-3 text-secondary mb-2 d-block"></i>
                        <p className="mb-0 text-muted">Click to upload image</p>
                      </>
                    )}
                  </label>
                  {imageBase64 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-icon btn-danger position-absolute top-0 end-0 m-2"
                      onClick={() => setImageBase64(null)}
                      title="Remove image"
                    >
                      <i className="icon-base ri ri-close-line"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Condition Status */}
              <div className="col-sm-12">
                <label className="form-label d-block mb-3">Condition Status</label>
                <div className="form-check form-check-inline mt-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="assetStatus"
                    id="statusActive"
                    value="Active"
                    checked={formStatus === 'Active'}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="statusActive">
                    Active
                  </label>
                </div>
                <div className="form-check form-check-inline mt-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="assetStatus"
                    id="statusBroken"
                    value="Broken"
                    checked={formStatus === 'Broken'}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="statusBroken">
                    Broken
                  </label>
                </div>
                <div className="form-check form-check-inline mt-1">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="assetStatus"
                    id="statusLost"
                    value="Lost"
                    checked={formStatus === 'Lost'}
                    onChange={(e) => setFormStatus(e.target.value)}
                  />
                  <label className="form-check-label" htmlFor="statusLost">
                    Lost
                  </label>
                </div>
              </div>

              {/* Campus */}
              <div className="col-sm-12">
                <label className="form-label mb-3">Campus</label>
                <div className="row g-2">
                  <div className="col-4">
                    <div
                      className={`form-check custom-option custom-option-icon px-2 py-3 text-center ${
                        formCampus === 'RAMA_9' ? 'checked' : ''
                      }`}
                    >
                      <label className="form-check-label custom-option-content" htmlFor="campusRama9">
                        <span className="custom-option-body">
                          <i className="icon-base ri ri-building-line"></i>
                          <span className="custom-option-title mb-0 d-block mt-2">RAMA 9</span>
                        </span>
                        <input
                          name="campus"
                          className="form-check-input"
                          type="radio"
                          value="RAMA_9"
                          id="campusRama9"
                          checked={formCampus === 'RAMA_9'}
                          onChange={(e) => setFormCampus(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="col-4">
                    <div
                      className={`form-check custom-option custom-option-icon px-2 py-3 text-center ${
                        formCampus === 'ASOK' ? 'checked' : ''
                      }`}
                    >
                      <label className="form-check-label custom-option-content" htmlFor="campusAsok">
                        <span className="custom-option-body">
                          <i className="icon-base ri ri-building-2-line"></i>
                          <span className="custom-option-title mb-0 d-block mt-2">ASOK</span>
                        </span>
                        <input
                          name="campus"
                          className="form-check-input"
                          type="radio"
                          value="ASOK"
                          id="campusAsok"
                          checked={formCampus === 'ASOK'}
                          onChange={(e) => setFormCampus(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="col-4">
                    <div
                      className={`form-check custom-option custom-option-icon px-2 py-3 text-center ${
                        formCampus === 'HUA_HIN' ? 'checked' : ''
                      }`}
                    >
                      <label className="form-check-label custom-option-content" htmlFor="campusHuaHin">
                        <span className="custom-option-body">
                          <i className="icon-base ri ri-building-4-line"></i>
                          <span className="custom-option-title mb-0 d-block mt-2">HUA HIN</span>
                        </span>
                        <input
                          name="campus"
                          className="form-check-input"
                          type="radio"
                          value="HUA_HIN"
                          id="campusHuaHin"
                          checked={formCampus === 'HUA_HIN'}
                          onChange={(e) => setFormCampus(e.target.value)}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-sm-12 my-2">
                <hr />
              </div>

              {/* Borrow Settings */}
              <div className="col-sm-12">
                <label className="form-label d-block mb-3">Is Returnable?</label>
                <label className="switch switch-primary">
                  <input
                    type="checkbox"
                    className="switch-input"
                    id="isReturnable"
                    name="isReturnable"
                    checked={formIsReturnable}
                    onChange={(e) => setFormIsReturnable(e.target.checked)}
                  />
                  <span className="switch-toggle-slider">
                    <span className="switch-on">
                      <i className="icon-base ri ri-check-line"></i>
                    </span>
                    <span className="switch-off">
                      <i className="icon-base ri ri-close-line"></i>
                    </span>
                  </span>
                  <span className="switch-label">Yes, Requires Return</span>
                </label>
              </div>

              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <input
                    type="number"
                    className="form-control"
                    id="assetStock"
                    name="assetStock"
                    placeholder="e.g. 50"
                    disabled={formIsReturnable}
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                  />
                  <label htmlFor="assetStock">Stock Quantity {formIsReturnable ? '(1 for Returnable)' : ''}</label>
                </div>
              </div>

              <div className="col-sm-12">
                <div className="form-floating form-floating-outline">
                  <input
                    type="text"
                    className="form-control"
                    id="assetSerial"
                    name="assetSerial"
                    placeholder="e.g. HDMI-001"
                    value={formSerial}
                    onChange={(e) => setFormSerial(e.target.value)}
                  />
                  <label htmlFor="assetSerial">Serial Number (Optional)</label>
                </div>
              </div>

              <div className="col-sm-12 mt-5">
                <button type="submit" className="btn btn-primary data-submit me-sm-4 me-1">
                  {editingAsset ? 'Update Asset' : 'Submit'}
                </button>
                <button type="reset" className="btn btn-outline-secondary" data-bs-dismiss="offcanvas">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
