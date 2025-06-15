// components/ui/Footer.tsx
import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4">
      <div className="container">
        <div className="row gy-4">
          <div className="col-lg-3 col-md-6">
            <h3 className="h5 fw-bold mb-3">zBooks</h3>
            <p className="text-muted mb-4">Your destination for the best books at the best prices.</p>
            <div className="d-flex gap-3">
              <a href="#" className="text-secondary fs-5" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Twitter">
                <i className="bi bi-twitter"></i>
              </a>
              <a href="#" className="text-secondary fs-5" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h3 className="h6 fw-bold mb-3">Shop</h3>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/books" className="text-secondary text-decoration-none">
                  Books
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h3 className="h6 fw-bold mb-3">Customer Service</h3>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/contact" className="text-secondary text-decoration-none">
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/help" className="text-secondary text-decoration-none">
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/returns" className="text-secondary text-decoration-none">
                  Returns & Refunds
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/faq" className="text-secondary text-decoration-none">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h3 className="h6 fw-bold mb-3">Newsletter</h3>
            <p className="text-muted mb-3">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                aria-label="Your email"
              />
              <button className="btn btn-primary" type="button">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        
        <hr className="my-4 border-secondary" />
        
        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="text-muted mb-0 small">
              &copy; {new Date().getFullYear()} BookStore. All rights reserved.
            </p>
          </div>
          <div className="col-md-6">
            <ul className="list-inline text-center text-md-end mb-0">
              <li className="list-inline-item">
                <Link href="/privacy" className="text-secondary small text-decoration-none">
                  Privacy Policy
                </Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link href="/terms" className="text-secondary small text-decoration-none">
                  Terms of Service
                </Link>
              </li>
              <li className="list-inline-item ms-3">
                <Link href="/accessibility" className="text-secondary small text-decoration-none">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;