import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDataTable } from '../hooks/useDataTable';
import { DataTableTopControls, DataTableBottomControls } from '../components/DataTableControls';

export default function AssetsStatus() {
  const [assets, setAssets] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/assets', { credentials: 'same-origin' }).then((res) => res.json()),
      fetch('/api/admin/history', { credentials: 'same-origin' }).then((res) => res.json()),
    ])
      .then(([assetsData, historyData]) => {
        setAssets(Array.isArray(assetsData) ? assetsData : []);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load assets or history', err);
        setLoading(false);
      });
  }, []);

  const allAssetsWithStatus = useMemo(() => {
    return assets.map((asset) => {
      const activeBorrow = history.find(
        (h) => h.assetId === asset.id && h.status === 'Borrowed'
      );

      let statusType: 'on_loan' | 'available' | 'remaining' | 'broken' | 'lost' = 'available';
      let statusText = 'Available';
      let borrowerName = activeBorrow ? activeBorrow.borrowerName : '';

      if (asset.status === 'Broken') {
        statusType = 'broken';
        statusText = 'Broken';
      } else if (asset.status === 'Lost') {
        statusType = 'lost';
        statusText = 'Lost';
      } else if (!asset.isReturnable || asset.isReturnable === 0) {
        statusType = 'remaining';
        statusText = `Remaining: ${asset.stock}`;
      } else if (activeBorrow || asset.stock <= 0) {
        statusType = 'on_loan';
        statusText = 'On loan';
      } else {
        statusType = 'available';
        statusText = 'Available';
      }

      return {
        id: asset.id,
        title: asset.title || 'N/A',
        statusType,
        statusText,
        borrowerName,
      };
    });
  }, [assets, history]);

  const filterActive = useCallback((item: any, search: string) => {
    return (
      (item.id && item.id.toLowerCase().includes(search)) ||
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.statusText && item.statusText.toLowerCase().includes(search)) ||
      (item.borrowerName && item.borrowerName.toLowerCase().includes(search))
    );
  }, []);

  const formatDateTime = (dateVal: any) => {
    if (!dateVal) return '-';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString([], {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filterHistory = useCallback((item: any, search: string) => {
    const isRequested = item.status === 'Requested' || item.isReturnable === 0 || item.isReturnable === false;
    const displayStatus = isRequested ? 'requested' : (item.status ? item.status.toLowerCase() : '');
    return (
      (item.assetId && item.assetId.toLowerCase().includes(search)) ||
      (item.title && item.title.toLowerCase().includes(search)) ||
      (item.borrowerName && item.borrowerName.toLowerCase().includes(search)) ||
      (item.staffName && item.staffName.toLowerCase().includes(search)) ||
      displayStatus.includes(search) ||
      (item.status && item.status.toLowerCase().includes(search)) ||
      (item.borrowDate && formatDateTime(item.borrowDate).toLowerCase().includes(search)) ||
      (item.returnDate && formatDateTime(item.returnDate).toLowerCase().includes(search))
    );
  }, []);

  const statusTable = useDataTable(allAssetsWithStatus, filterActive, 7);
  const historyTable = useDataTable(history, filterHistory, 7);

  return (
    <>
      <div className="container-xxl flex-grow-1 container-p-y">
        <div className="row gy-6">
          {/* Assets Status Table */}
          <div className="col-12">
            <div className="card">
              <h5 className="card-header text-center text-md-start pb-md-0">Assets Status</h5>
              <div className="card-datatable text-nowrap">
                <div className="dt-container dt-bootstrap5">
                  <DataTableTopControls
                    pageSize={statusTable.pageSize}
                    onPageSizeChange={statusTable.setPageSize}
                    search={statusTable.search}
                    onSearchChange={statusTable.setSearch}
                    rowClassName="row mx-2 justify-content-between"
                  />

                  <div className="table-responsive">
                    <table
                      className="dt-scrollableTable table table-bordered table-responsive dataTable"
                      id="table-assets-status"
                    >
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={3} className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : statusTable.paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="text-center">
                              No matching records found
                            </td>
                          </tr>
                        ) : (
                          statusTable.paginatedData.map((item) => (
                            <tr key={'status-' + item.id}>
                              <td>{item.id}</td>
                              <td>{item.title}</td>
                              <td>
                                {item.statusType === 'on_loan' ? (
                                  <span
                                    className="badge bg-label-warning"
                                    title={item.borrowerName ? `Borrowed by ${item.borrowerName}` : undefined}
                                  >
                                    On loan
                                  </span>
                                ) : item.statusType === 'remaining' ? (
                                  <span className="badge bg-label-info">{item.statusText}</span>
                                ) : item.statusType === 'broken' ? (
                                  <span className="badge bg-label-danger">Broken</span>
                                ) : item.statusType === 'lost' ? (
                                  <span className="badge bg-label-secondary">Lost</span>
                                ) : (
                                  <span className="badge bg-label-success">Available</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <DataTableBottomControls
                    totalEntries={statusTable.totalEntries}
                    startIndex={statusTable.startIndex}
                    endIndex={statusTable.endIndex}
                    currentPage={statusTable.currentPage}
                    totalPages={statusTable.totalPages}
                    pageNumbers={statusTable.pageNumbers}
                    onPageChange={statusTable.setCurrentPage}
                    rowClassName="row mx-2 justify-content-between"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Borrow History Table */}
          <div className="col-12">
            <div className="card">
              <h5 className="card-header text-center text-md-start pb-md-0">Borrow History</h5>
              <div className="card-datatable text-nowrap">
                <div className="dt-container dt-bootstrap5">
                  <DataTableTopControls
                    pageSize={historyTable.pageSize}
                    onPageSizeChange={historyTable.setPageSize}
                    search={historyTable.search}
                    onSearchChange={historyTable.setSearch}
                    rowClassName="row mx-2 justify-content-between"
                  />

                  <div className="table-responsive">
                    <table
                      className="dt-scrollableTable table table-bordered table-responsive dataTable"
                      id="table-borrow-history"
                    >
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Borrower</th>
                          <th>Borrow Date</th>
                          <th>Return Date</th>
                          <th>Status</th>
                          <th>Staff</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan={7} className="text-center">
                              Loading...
                            </td>
                          </tr>
                        ) : historyTable.paginatedData.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center">
                              No matching records found
                            </td>
                          </tr>
                        ) : (
                          historyTable.paginatedData.map((h) => (
                            <tr key={h.id}>
                              <td>{h.assetId}</td>
                              <td>{h.title || 'N/A'}</td>
                              <td>{h.borrowerName}</td>
                              <td>{formatDateTime(h.borrowDate)}</td>
                              <td>{formatDateTime(h.returnDate)}</td>
                              <td>
                                {(() => {
                                  if (h.status === 'Returned') {
                                    return <span className="badge bg-label-success">Returned</span>;
                                  }
                                  if (h.status === 'Requested' || h.isReturnable === 0 || h.isReturnable === false) {
                                    return <span className="badge bg-label-danger">Requested</span>;
                                  }
                                  return <span className="badge bg-label-warning">Borrowed</span>;
                                })()}
                              </td>
                              <td>{h.staffName || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <DataTableBottomControls
                    totalEntries={historyTable.totalEntries}
                    startIndex={historyTable.startIndex}
                    endIndex={historyTable.endIndex}
                    currentPage={historyTable.currentPage}
                    totalPages={historyTable.totalPages}
                    pageNumbers={historyTable.pageNumbers}
                    onPageChange={historyTable.setCurrentPage}
                    rowClassName="row mx-2 justify-content-between"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
