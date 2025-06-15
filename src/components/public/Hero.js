import React from 'react';

export function Hero() {
  return (
    <div className="hero-section position-relative overflow-hidden py-5" 
         style={{
           background: "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
           minHeight: "500px"
         }}>
      {/* Animated background elements */}
      <div className="position-absolute" style={{
        top: "10%", 
        left: "5%", 
        width: "300px", 
        height: "300px", 
        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        animation: "float 8s ease-in-out infinite"
      }}></div>
      <div className="position-absolute" style={{
        bottom: "10%", 
        right: "15%", 
        width: "200px", 
        height: "200px", 
        background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)",
        borderRadius: "50%",
        animation: "float 6s ease-in-out infinite 1s"
      }}></div>
      
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
            <div className="ps-lg-5 animate__animated animate__fadeInLeft">
              <h5 className="text-warning fw-bold mb-3">LIMITED TIME OFFER</h5>
              <h1 className="display-3 fw-bold text-white mb-4">Discover Your <br/><span className="text-warning">Next Adventure</span></h1>
              <p className="lead text-white opacity-75 mb-4">Explore our curated collection with up to 50% off on bestselling titles. Free shipping on orders over $35.</p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <button className="btn btn-warning btn-lg px-4 py-3 fw-semibold shadow-sm">
                  SHOP NOW
                </button>
                <button className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold">
                  VIEW DEALS
                </button>
              </div>
              
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mt-4 text-white">
                <div className="d-flex">
                  <span className="position-relative">
                    <img src="/api/placeholder/35/35" className="rounded-circle border border-2 border-light" alt="Customer" />
                  </span>
                  <span className="position-relative" style={{marginLeft: "-10px"}}>
                    <img src="/api/placeholder/35/35" className="rounded-circle border border-2 border-light" alt="Customer" />
                  </span>
                  <span className="position-relative" style={{marginLeft: "-10px"}}>
                    <img src="/api/placeholder/35/35" className="rounded-circle border border-2 border-light" alt="Customer" />
                  </span>
                </div>
                <div className="ms-2">
                  <span className="opacity-75 small">4.9 <i className="bi bi-star-fill text-warning"></i> from 2,500+ reviews</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className="position-relative animate__animated animate__fadeInRight">
              <div className="position-relative overflow-hidden rounded-4 shadow-lg" style={{transform: "rotate(2deg)"}}>
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Book collection" 
                  className="img-fluid rounded-4"
                  style={{transition: "transform 0.5s", filter: "brightness(0.9)"}}
                  onMouseOver={(e) => e.target.style.transform = "scale(1.05)"}
                  onMouseOut={(e) => e.target.style.transform = "scale(1)"}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient-overlay"></div>
              </div>
              
              <div className="position-absolute p-4 bg-white shadow-lg rounded-4" 
                   style={{bottom: "-30px", right: "-20px", maxWidth: "200px", zIndex: "2"}}>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 p-2 rounded-3 me-3">
                    <i className="bi bi-lightning-charge-fill text-primary fs-4"></i>
                  </div>
                  <div>
                    <h6 className="mb-0 fw-bold">Flash Sale</h6>
                    <p className="small text-muted mb-0">Ends in 48 hours</p>
                  </div>
                </div>
                <div className="progress" style={{height: "6px"}}>
                  <div className="progress-bar bg-danger" role="progressbar" style={{width: "65%"}}></div>
                </div>
                <p className="small text-muted mt-2 mb-0">65% of items sold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for animations to your stylesheet */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .bg-gradient-overlay {
          background: linear-gradient(to bottom right, rgba(0,0,0,0.2), rgba(0,0,0,0));
        }
        .animate__animated {
          animation-duration: 1s;
        }
        .animate__fadeInLeft {
          animation-name: fadeInLeft;
        }
        .animate__fadeInRight {
          animation-name: fadeInRight;
        }
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translate3d(-50px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translate3d(50px, 0, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}