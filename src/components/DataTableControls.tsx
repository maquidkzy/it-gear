interface DataTableTopControlsProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  search: string;
  onSearchChange: (search: string) => void;
  rowClassName?: string;
}

export function DataTableTopControls({
  pageSize,
  onPageSizeChange,
  search,
  onSearchChange,
  rowClassName = 'row m-3 mx-2 my-0 justify-content-between',
}: DataTableTopControlsProps) {
  return (
    <div className={rowClassName}>
      <div className="d-md-flex justify-content-between align-items-center dt-layout-start col-md-auto me-auto px-3">
        <div className="dt-length">
          <label>
            Show{' '}
            <select
              className="form-select form-select-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={7}>7</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>{' '}
            entries
          </label>
        </div>
      </div>
      <div className="d-md-flex justify-content-between align-items-center dt-layout-end col-md-auto ms-auto px-3">
        <div className="dt-search">
          <label>
            Search:{' '}
            <input
              type="search"
              className="form-control form-control-sm"
              placeholder="Type search here"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

interface DataTableBottomControlsProps {
  totalEntries: number;
  startIndex: number;
  endIndex: number;
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  rowClassName?: string;
}

export function DataTableBottomControls({
  totalEntries,
  startIndex,
  endIndex,
  currentPage,
  totalPages,
  pageNumbers,
  onPageChange,
  rowClassName = 'row mx-3 justify-content-between',
}: DataTableBottomControlsProps) {
  return (
    <div className={rowClassName}>
      <div className="d-md-flex justify-content-between align-items-center dt-layout-start col-md-auto me-auto px-3">
        <div className="dt-info" role="status" aria-live="polite">
          {totalEntries === 0
            ? 'Showing 0 to 0 of 0 entries'
            : `Showing ${startIndex + 1} to ${endIndex} of ${totalEntries} entries`}
        </div>
      </div>
      <div className="d-md-flex justify-content-between align-items-center dt-layout-end col-md-auto ms-auto px-3">
        <div className="dt-paging paging_simple_numbers">
          <ul className="pagination mb-0">
            <li className={`dt-paging-button page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous"
              >
                <i className="icon-base ri ri-arrow-left-s-line scaleX-n1-rtl icon-22px"></i>
              </button>
            </li>
            {pageNumbers.map((page) => (
              <li
                key={page}
                className={`dt-paging-button page-item ${page === currentPage ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="page-link"
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            ))}
            <li
              className={`dt-paging-button page-item ${
                currentPage >= totalPages || totalPages === 0 ? 'disabled' : ''
              }`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages || totalPages === 0}
                aria-label="Next"
              >
                <i className="icon-base ri ri-arrow-right-s-line scaleX-n1-rtl icon-22px"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
