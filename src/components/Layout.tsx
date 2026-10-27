import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  const [authChecking, setAuthChecking] = useState(true);

  const toggleItModal = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('itDepartmentModal');
    if (el && (window as any).bootstrap) {
      const modal = (window as any).bootstrap.Modal.getOrCreateInstance(el);
      modal.show();
    }
  };
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/admin/check-auth', { credentials: 'same-origin' })
      .then(res => res.json())
      .then(data => {
        if (!data.authenticated) navigate('/admin/login?reason=' + encodeURIComponent(data.reason || 'not_auth'));
        else setAuthChecking(false);
      })
      .catch((err) => navigate('/admin/login?reason=' + encodeURIComponent(err.message)));
  }, [navigate]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const customizer = document.querySelector('#template-customizer');
      if (!customizer || !customizer.classList.contains('template-customizer-open')) return;

      const target = e.target as HTMLElement;
      if (
        customizer.contains(target) ||
        target.closest('#nav-theme') ||
        target.closest('.pcr-app')
      ) {
        return;
      }

      document.querySelector<HTMLElement>('.template-customizer-close-btn')?.click() ||
        customizer.classList.remove('template-customizer-open');
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (authChecking) return <div className="p-5 text-center">Loading Admin...</div>;

  const location = useLocation();
  return (
    <>
      
    {/*  Layout wrapper  */}
    <div className="layout-wrapper layout-content-navbar">
      <div className="layout-container">
        {/*  Menu  */}

        <aside id="layout-menu" className="layout-menu menu-vertical menu">
          <div className="app-brand demo">
            <Link to="/admin" className="app-brand-link">
              <span className="app-brand-logo demo">
                <span
                  className="text-primary rainbow-logo"
                  style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'currentColor',
                    maskImage: "url('/assets/img/stamford-logo-icon.png')",
                    maskSize: 'contain',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    WebkitMaskImage: "url('/assets/img/stamford-logo-icon.png')",
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                  }}
                ></span>
              </span>
              <span
                className="app-brand-text demo menu-text fw-semibold ms-2 text-primary rainbow-logo"
                style={{ fontSize: '2rem' }}
              >
                Stamford
              </span>
            </Link>

            <a href="#" className="layout-menu-toggle menu-link text-large ms-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.47365 11.7183C8.11707 12.0749 8.11707 12.6531 8.47365 13.0097L12.071 16.607C12.4615 16.9975 12.4615 17.6305 12.071 18.021C11.6805 18.4115 11.0475 18.4115 10.657 18.021L5.83009 13.1941C5.37164 12.7356 5.37164 11.9924 5.83009 11.5339L10.657 6.707C11.0475 6.31653 11.6805 6.31653 12.071 6.707C12.4615 7.09747 12.4615 7.73053 12.071 8.121L8.47365 11.7183Z"
                  fill-opacity="0.9" />
                <path
                  d="M14.3584 11.8336C14.0654 12.1266 14.0654 12.6014 14.3584 12.8944L18.071 16.607C18.4615 16.9975 18.4615 17.6305 18.071 18.021C17.6805 18.4115 17.0475 18.4115 16.657 18.021L11.6819 13.0459C11.3053 12.6693 11.3053 12.0587 11.6819 11.6821L16.657 6.707C17.0475 6.31653 17.6805 6.31653 18.071 6.707C18.4615 7.09747 18.4615 7.73053 18.071 8.121L14.3584 11.8336Z"
                  fill-opacity="0.4" />
              </svg>
            </a>
          </div>

          <div className="menu-inner-shadow"></div>

          <ul className="menu-inner py-1">
            {/*  Dashboards  */}
            <li className={`menu-item ${location.pathname === "/admin" ? "active" : ""}`}>
              <Link to="/admin" className="menu-link">
                <i className="menu-icon icon-base ri ri-home-smile-line"></i>
                <div data-i18n="Dashboard">Dashboard</div>
              </Link>
            </li>
            
            {/*  Assets Group  */}
            <li className="menu-item active={true} open">
              <a href="#" className="menu-link menu-toggle">
                <i className="menu-icon icon-base ri ri-computer-line"></i>
                <div data-i18n="Assets">Assets</div>
              </a>
              <ul className="menu-sub">
                <li className="menu-item">
                  <Link to="/admin/assets" className="menu-link">
                    <div data-i18n="Asset List">Asset List</div>
                  </Link>
                </li>
                <li className="menu-item">
                  <Link to="/admin/status" className="menu-link">
                    <div data-i18n="Assets Status">Assets Status</div>
                  </Link>
                </li>
              </ul>
            </li>

            {/* IT Staff */}
            <li className={`menu-item ${location.pathname === "/admin/staff" ? "active" : ""}`}>
              <Link to="/admin/staff" className="menu-link">
                <i className="menu-icon icon-base ri ri-user-settings-line"></i>
                <div data-i18n="IT Staff">IT Staff</div>
              </Link>
            </li>
          </ul>
        </aside>

        <div className="menu-mobile-toggler d-xl-none rounded-1">
          <a href="#" className="layout-menu-toggle menu-link text-large text-bg-secondary p-2 rounded-1">
            <i className="ri ri-menu-line icon-base"></i>
            <i className="ri ri-arrow-right-s-line icon-base"></i>
          </a>
        </div>
        {/*  / Menu  */}

        {/*  Layout container  */}
        <div className="layout-page">
          {/*  Navbar  */}

          <nav
            className="layout-navbar container-xxl navbar-detached navbar navbar-expand-xl align-items-center bg-navbar-theme"
            id="layout-navbar">
            <div className="layout-menu-toggle navbar-nav align-items-xl-center me-4 me-xl-0 d-xl-none">
              <a className="nav-item nav-link px-0 me-xl-6" href="javascript:void(0)">
                <i className="icon-base ri ri-menu-line icon-22px"></i>
              </a>
            </div>

            <div className="navbar-nav-right d-flex align-items-center justify-content-end" id="navbar-collapse">
              

              <ul className="navbar-nav flex-row align-items-center ms-md-auto">
                

                                {/*  Style Switcher  */}
                <li className="nav-item me-sm-2 me-xl-0">
                  <a
                    className="nav-link hide-arrow btn btn-icon btn-text-secondary rounded-pill"
                    id="nav-theme"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      const customizer = document.querySelector('#template-customizer');
                      if (customizer?.classList.contains('template-customizer-open')) {
                        document.querySelector<HTMLElement>('.template-customizer-close-btn')?.click() ||
                          customizer.classList.remove('template-customizer-open');
                      } else {
                        document.querySelector<HTMLElement>('.template-customizer-open-btn')?.click() ||
                          customizer?.classList.add('template-customizer-open');
                      }
                    }}>
                    <i className="icon-base ri ri-sun-line icon-22px theme-icon-active"></i>
                    <span className="d-none ms-2" id="nav-theme-text">Toggle theme</span>
                  </a>
                </li>
                {/*  / Style Switcher */}

                

                

                
              
                                {/*  User  */}
                <li className="nav-item navbar-dropdown dropdown-user dropdown">
                  <a className="nav-link dropdown-toggle hide-arrow" href="#" data-bs-toggle="dropdown">
                    <div className="avatar avatar-online">
                      <img src="../../assets/img/avatars/1.png" alt="avatar" className="rounded-circle" />
                    </div>
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end mt-3 py-2">
                    <li>
                      <a className="dropdown-item" href="#">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-2">
                            <div className="avatar avatar-online">
                              <img
                                src="../../assets/img/avatars/1.png"
                                alt="alt"
                                className="w-px-40 h-auto rounded-circle" />
                            </div>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0 small">John Doe</h6>
                            <small className="text-body-secondary">Admin</small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div className="dropdown-divider"></div>
                    </li>
                    <li>
                      <div className="d-grid px-4 pt-2 pb-1">
                        <a className="btn btn-sm btn-danger d-flex" href="#">
                          <small className="align-middle">Logout</small>
                          <i className="icon-base ri ri-logout-box-r-line ms-2 icon-16px"></i>
                        </a>
                      </div>
                    </li>
                  </ul>
                </li>
                {/* / User  */}

              </ul>
            </div>
          </nav>

          {/*  / Navbar  */}

          {/*  Content wrapper  */}
          <div className="content-wrapper">
            
{children}


            {/*  Footer  */}
            <footer className="content-footer footer bg-footer-theme">
              <div className="container-xxl">
                <div
                  className="footer-container d-flex align-items-center justify-content-between py-4 flex-md-row flex-column">
                  <div className="mb-2 mb-md-0">
                    &#169; {new Date().getFullYear()}, made with ❤️ by 
                    <a href="#" onClick={toggleItModal} className="footer-link fw-medium">IT Department</a>
                  </div>
                  
                </div>
              </div>
            {/*  IT Department Modal  */}
<div className="modal-onboarding modal fade animate__animated" id="itDepartmentModal" tabIndex={-1} aria-hidden={true}>
  <div className="modal-dialog" role="document">
    <div className="modal-content text-center">
      <div className="modal-header border-0">
        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div id="itModalCarouselControls" className="carousel slide pb-6 mb-2" data-bs-interval="false">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#itModalCarouselControls" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#itModalCarouselControls" data-bs-slide-to="1"></button>
        </div>
        <div className="carousel-inner">
          {/*  Slide 1  */}
          <div className="carousel-item active">
            <div className="onboarding-media">
              <div className="mx-2">
                <img src="../../assets/img/illustrations/boy-with-laptop-light.png" alt="boy-with-laptop-light" width="300" className="img-fluid" data-app-light-img="illustrations/boy-with-laptop-light.png" data-app-dark-img="illustrations/boy-with-laptop-dark.png" />
              </div>
            </div>
            <div className="onboarding-content">
              <h4 className="onboarding-title text-body">Developer: Nipit Nakpong</h4>
            </div>
          </div>
          {/*  Slide 2  */}
          <div className="carousel-item">
            <div className="onboarding-media">
              <div className="mx-2">
                <img src="../../assets/img/illustrations/girl-with-laptop-light.png" alt="girl-with-laptop-light" width="335" className="img-fluid" data-app-light-img="illustrations/girl-with-laptop-light.png" data-app-dark-img="illustrations/girl-with-laptop-dark.png" />
              </div>
            </div>
            <div className="onboarding-content">
              <h4 className="onboarding-title text-body">Thanks to Support Team</h4>
              <div className="onboarding-info">
                Chaiwat Upprakorn, Franz Mikel Belway Estera, Phanudet Phraekhao, Phornsek Dittakorn, Rattapon Intarathoot, Supang Nuammano, Takdanai Cherdchookitkul
              </div>
            </div>
          </div>
        </div>
        <a className="carousel-control-prev" href="#itModalCarouselControls" role="button" data-bs-slide="prev">
          <i className="icon-base ri ri-arrow-left-double-line icon-18px scaleX-n1-rtl lh-1 me-1"></i><span>Previous</span>
        </a>
        <a className="carousel-control-next" href="#itModalCarouselControls" role="button" data-bs-slide="next">
          <span>Next</span><i className="icon-base ri ri-arrow-right-double-line icon-18px scaleX-n1-rtl lh-1 ms-1"></i>
        </a>
      </div>
    </div>
  </div>
</div>
{/* / IT Department Modal  */}
            </footer>
            {/*  / Footer  */}

            <div className="content-backdrop fade"></div>
          </div>
          {/*  Content wrapper  */}
        </div>
        {/*  / Layout page  */}
      </div>

      {/*  Overlay  */}
      <div className="layout-overlay layout-menu-toggle"></div>

      {/*  Drag Target Area To SlideIn Menu On Small Screens  */}
      <div className="drag-target"></div>
    </div>
    {/*  / Layout wrapper  */}

    {/*  Core JS  */}

    {/*  build:js assets/vendor/js/theme.js   */}

    

    
    
    

    

    

    

    

    

    

    {/*  endbuild  */}

    {/*  Vendors JS  */}
    
    

    {/*  Main JS  */}

    

    {/*  Page JS  */}
    
  
    {/*  Hidden Theme Toggles for Template Customizer sync logic  */}
    <div style={{"display":"none"}}>
      <button data-bs-theme-value="light"><i data-icon="sun-line"></i></button>
      <button data-bs-theme-value="dark"><i data-icon="moon-clear-line"></i></button>
      <button data-bs-theme-value="system"><i data-icon="computer-line"></i></button>
    </div>

    </>
  );
}
