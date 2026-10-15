
export default function Dashboard() {
  return (
    <>

            <div className="container-xxl flex-grow-1 container-p-y">
              {/*  Card Border Shadow  */}
              <div className="row g-6">
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-border-shadow-primary h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span className="avatar-initial rounded-3 bg-label-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path fill="currentColor" d="M3 3a1 1 0 0 0-1 1v4h5.5V3zm6.5 0v5h5V3zm7 0v5H22V4a1 1 0 0 0-1-1zm5.5 7h-5.5v4H22zm0 6h-5.5v5H21a1 1 0 0 0 1-1zm-7.5 5v-5h-5v5zm-7 0v-5H2v4a1 1 0 0 0 1 1zM2 14h5.5v-4H2zm7.5-4h5v4h-5z" />
                            </svg>
                          </span>
                        </div>
                        <h4 className="mb-0">42</h4>
                      </div>
                      <h6 className="mb-0 fw-normal">Total Equipment</h6>
                      <p className="mb-0">
                        <span className="me-1 fw-medium">+18.2%</span>
                        <small className="text-body-secondary">than last week</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-border-shadow-warning h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span className="avatar-initial rounded-3 bg-label-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path fill="currentColor" d="m20 3l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004L4 3zm0 6H4v10h16zm-8 1l4 4h-3v4h-2v-4H8zm6.764-5H5.236l-.999 2h15.527z" />
                            </svg>
                          </span>
                        </div>
                        <h4 className="mb-0">8</h4>
                      </div>
                      <h6 className="mb-0 fw-normal">Borrowing Equipment</h6>
                      <p className="mb-0">
                        <span className="me-1 fw-medium">-8.7%</span>
                        <small className="text-body-secondary">than last week</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-border-shadow-success h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span className="avatar-initial rounded-3 bg-label-success">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                              <path d="M0 0h24v24H0z" fill="none" />
                              <path fill="currentColor" d="M4 3h16l2 4v13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.004zm9 11v-4h-2v4H8l4 4l4-4zm6.764-7l-1-2H5.237l-1 2z" />
                            </svg>
                          </span>
                        </div>
                        <h4 className="mb-0">27</h4>
                      </div>
                      <h6 className="mb-0 fw-normal">Available Equipment</h6>
                      <p className="mb-0">
                        <span className="me-1 fw-medium">+4.3%</span>
                        <small className="text-body-secondary">than last week</small>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-lg-3">
                  <div className="card card-border-shadow-danger h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-2">
                        <div className="avatar me-4">
                          <span className="avatar-initial rounded-3 bg-label-danger"
                            ><i className="icon-base ri ri-time-line icon-24px"></i
                          ></span>
                        </div>
                        <h4 className="mb-0">13</h4>
                      </div>
                      <h6 className="mb-0 fw-normal">Late Return</h6>
                      <p className="mb-0">
                        <span className="me-1 fw-medium">-2.5%</span>
                        <small className="text-body-secondary">than last week</small>
                      </p>
                    </div>
                  </div>
                </div>
                {/* / Card Border Shadow  */}
                {/*  Borrowing overview  */}
                <div className="col-xxl-6 order-5 order-xxl-0">
                  <div className="card h-100">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <div className="card-title mb-0">
                        <h5 className="m-0 me-2">Borrowing overview</h5>
                      </div>
                      <div className="dropdown">
                        <button
                          className="btn btn-text-secondary rounded-pill text-body-secondary border-0 p-1"
                          type="button"
                          id="deliveryExceptions"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false">
                          <i className="icon-base ri ri-more-2-line"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end" aria-labelledby="deliveryExceptions">
                          <a className="dropdown-item" href="#">Select All</a>
                          <a className="dropdown-item" href="#">Refresh</a>
                          <a className="dropdown-item" href="#">Share</a>
                        </div>
                      </div>
                    </div>
                    <div className="card-body pb-2">
                      <div className="d-none d-lg-flex vehicles-progress-labels mb-5">
                        <div className="vehicles-progress-label on-the-way-text" style={{"width":"39.7%"}}>On the way</div>
                        <div className="vehicles-progress-label unloading-text" style={{"width":"28.3%"}}>Unloading</div>
                        <div className="vehicles-progress-label loading-text" style={{"width":"17.4%"}}>Loading</div>
                        <div className="vehicles-progress-label waiting-text" style={{"width":"14.6%"}}>Waiting</div>
                      </div>
                      <div
                        className="vehicles-overview-progress progress rounded-4 bg-transparent mb-2"
                        style={{"height":"46px"}}>
                        <div
                          className="progress-bar small fw-medium text-start rounded-start bg-lightest text-heading px-1 px-lg-4"
                          role="progressbar"
                          style={{"width":"39.7%"}}
                          aria-valuenow={39.7}
                          aria-valuemin={0}
                          aria-valuemax={100}>
                          39.7%
                        </div>
                        <div
                          className="progress-bar small fw-medium text-start bg-primary px-1 px-lg-4"
                          role="progressbar"
                          style={{"width":"28.3%"}}
                          aria-valuenow={28.3}
                          aria-valuemin={0}
                          aria-valuemax={100}>
                          28.3%
                        </div>
                        <div
                          className="progress-bar small fw-medium text-start text-bg-info px-1 px-lg-4"
                          role="progressbar"
                          style={{"width":"17.4%"}}
                          aria-valuenow={17.4}
                          aria-valuemin={0}
                          aria-valuemax={100}>
                          17.4%
                        </div>
                        <div
                          className="progress-bar small fw-medium text-start rounded-end bg-gray-900 px-1 px-lg-4"
                          role="progressbar"
                          style={{"width":"14.6%"}}
                          aria-valuenow={14.6}
                          aria-valuemin={0}
                          aria-valuemax={100}>
                          14.6%
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table card-table">
                          <tbody className="table-border-bottom-0">
                            <tr>
                              <td className="w-75 ps-0">
                                <div className="d-flex justify-content-start align-items-center">
                                  <div className="me-2">
                                    <i className="text-heading icon-base ri ri-car-line icon-24px"></i>
                                  </div>
                                  <h6 className="mb-0 fw-normal">On the way</h6>
                                </div>
                              </td>
                              <td className="text-end pe-0 text-nowrap">
                                <h6 className="mb-0">2hr 10min</h6>
                              </td>
                              <td className="text-end pe-0 ps-6">
                                <span>39.7%</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="w-75 ps-0">
                                <div className="d-flex justify-content-start align-items-center">
                                  <div className="me-2">
                                    <i className="text-heading icon-base ri ri-download-line icon-24px"></i>
                                  </div>
                                  <h6 className="mb-0 fw-normal">Unloading</h6>
                                </div>
                              </td>
                              <td className="text-end pe-0 text-nowrap">
                                <h6 className="mb-0">3hr 15min</h6>
                              </td>
                              <td className="text-end pe-0 ps-6">
                                <span>28.3%</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="w-75 ps-0">
                                <div className="d-flex justify-content-start align-items-center">
                                  <div className="me-2">
                                    <i className="text-heading icon-base ri ri-upload-line icon-24px"></i>
                                  </div>
                                  <h6 className="mb-0 fw-normal">Loading</h6>
                                </div>
                              </td>
                              <td className="text-end pe-0 text-nowrap">
                                <h6 className="mb-0">1hr 24min</h6>
                              </td>
                              <td className="text-end pe-0 ps-6">
                                <span>17.4%</span>
                              </td>
                            </tr>
                            <tr>
                              <td className="w-75 ps-0">
                                <div className="d-flex justify-content-start align-items-center">
                                  <div className="me-2">
                                    <i className="text-heading icon-base ri ri-time-line icon-24px"></i>
                                  </div>
                                  <h6 className="mb-0 fw-normal">Waiting</h6>
                                </div>
                              </td>
                              <td className="text-end pe-0 text-nowrap">
                                <h6 className="mb-0">5hr 19min</h6>
                              </td>
                              <td className="text-end pe-0 ps-6">
                                <span>14.6%</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                {/* / Borrowing overview  */}
                {/*  Borrowing statistics */}
                <div className="col-lg-6 col-xxl-6 order-3 order-xxl-1">
                  <div className="card h-100">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <div className="card-title mb-0">
                        <h5 className="m-0 me-2 mb-1">Borrowing statistics</h5>
                        <p className="card-subtitle mb-0">Total number of deliveries 23.8k</p>
                      </div>
                      <div className="btn-group">
                        <button type="button" className="btn btn-outline-primary">January</button>
                        <button
                          type="button"
                          className="btn btn-outline-primary dropdown-toggle dropdown-toggle-split"
                          data-bs-toggle="dropdown"
                          aria-expanded="false">
                          <span className="visually-hidden">Toggle Dropdown</span>
                        </button>
                        <ul className="dropdown-menu">
                          <li><a className="dropdown-item" href="#">January</a></li>
                          <li><a className="dropdown-item" href="#">February</a></li>
                          <li><a className="dropdown-item" href="#">March</a></li>
                          <li><a className="dropdown-item" href="#">April</a></li>
                          <li><a className="dropdown-item" href="#">May</a></li>
                          <li><a className="dropdown-item" href="#">June</a></li>
                          <li><a className="dropdown-item" href="#">July</a></li>
                          <li><a className="dropdown-item" href="#">August</a></li>
                          <li><a className="dropdown-item" href="#">September</a></li>
                          <li><a className="dropdown-item" href="#">October</a></li>
                          <li><a className="dropdown-item" href="#">November</a></li>
                          <li><a className="dropdown-item" href="#">December</a></li>
                        </ul>
                      </div>
                    </div>
                    <div className="card-body">
                      <div id="shipmentStatisticsChart"></div>
                    </div>
                  </div>
                </div>
                {/* / Borrowing statistics  */}
                {/*  Borrow History Table  */}
                <div className="col-12 order-5">
                  <div className="card">
                    <div className="card-header d-flex align-items-center justify-content-between">
                      <div className="card-title mb-0">
                        <h5 className="m-0 me-2">Borrow History</h5>
                      </div>
                      <div className="dropdown">
                        <button
                          className="btn btn-text-secondary rounded-pill text-body-secondary border-0 p-1"
                          type="button"
                          id="routeVehicles"
                          data-bs-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false">
                          <i className="icon-base ri ri-more-2-line"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end" aria-labelledby="routeVehicles">
                          <a className="dropdown-item" href="#">Select All</a>
                          <a className="dropdown-item" href="#">Refresh</a>
                          <a className="dropdown-item" href="#">Share</a>
                        </div>
                      </div>
                    </div>
                    <div className="card-datatable table-responsive">
                      <table className="dt-route-vehicles table">
                        <thead>
                          <tr>
                            <th></th>
                            <th></th>
                            <th>Equipment</th>
                            <th>Borrow Date</th>
                            <th>Return Date</th>
                            <th>Borrower</th>
                            <th className="w-20">Staff</th>
                          </tr>
                        </thead>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              {/* / Borrow History Table  */}
            </div>
            
    </>
  );
}
