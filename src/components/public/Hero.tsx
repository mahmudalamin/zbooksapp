// components/ui/Hero.tsx
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../ui/Hero.module.css';

const Hero: React.FC = () => {
  return (
    <div className={`${styles.heroSection} position-relative overflow-hidden py-5`}>
      {/* Animated background elements */}
      <div className={`${styles.floatingElement1} position-absolute`}></div>
      <div className={`${styles.floatingElement2} position-absolute`}></div>
      
      <div className="container py-5">
        <div className="row align-items-center g-5">
          <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
            <div className={`ps-lg-5 ${styles.fadeInLeft}`}>
              <h5 className="text-warning fw-bold mb-3">LIMITED TIME OFFER</h5>
              <h1 className="display-3 fw-bold text-white mb-4">
                Discover Your <br />
                <span className="text-warning">Next Adventure</span>
              </h1>
              <p className="lead text-white opacity-75 mb-4">
                Explore our curated collection with up to 50% off on bestselling titles. 
                Free shipping on orders over $35.
              </p>
              <div className="d-flex gap-3 justify-content-center justify-content-lg-start">
                <Link href="/books" className="btn btn-warning btn-lg px-4 py-3 fw-semibold shadow-sm text-decoration-none">
                  SHOP NOW
                </Link>
                <Link href="/deals" className="btn btn-outline-light btn-lg px-4 py-3 fw-semibold text-decoration-none">
                  VIEW DEALS
                </Link>
              </div>
              
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mt-4 text-white">
                <div className="d-flex">
                  <span className="position-relative">
                    <Image 
                      src="/images/customer1.jpg" 
                      width={35} 
                      height={35} 
                      className="rounded-circle border border-2 border-light" 
                      alt="Customer review" 
                    />
                  </span>
                  <span className="position-relative" style={{marginLeft: "-10px"}}>
                    <Image 
                      src="/images/customer2.jpg" 
                      width={35} 
                      height={35} 
                      className="rounded-circle border border-2 border-light" 
                      alt="Customer review" 
                    />
                  </span>
                  <span className="position-relative" style={{marginLeft: "-10px"}}>
                    <Image 
                      src="/images/customer3.jpg" 
                      width={35} 
                      height={35} 
                      className="rounded-circle border border-2 border-light" 
                      alt="Customer review" 
                    />
                  </span>
                </div>
                <div className="ms-2">
                  <span className="opacity-75 small">
                    4.9 <i className="bi bi-star-fill text-warning"></i> from 2,500+ reviews
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-6">
            <div className={`position-relative ${styles.fadeInRight}`}>
              <div className={`position-relative overflow-hidden rounded-4 shadow-lg ${styles.rotatedImage}`}>
                <Image 
                  src="/images/book-collection.jpg" 
                  width={600}
                  height={400}
                  alt="Book collection" 
                  className={`img-fluid rounded-4 ${styles.heroImage}`}
                  priority
                />
                <div className={`position-absolute top-0 start-0 w-100 h-100 ${styles.gradientOverlay}`}></div>
              </div>
              
              <div className={`position-absolute p-4 bg-white shadow-lg rounded-4 ${styles.flashSaleCard}`}>
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
                  <div 
                    className="progress-bar bg-danger" 
                    role="progressbar" 
                    style={{width: "65%"}}
                    aria-valuenow={65}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  ></div>
                </div>
                <p className="small text-muted mt-2 mb-0">65% of items sold</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;