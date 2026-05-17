import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">FuriousCabs</div>
        <div className="footer-links">
          <a href="#">About Us</a>
          <a href="#">Contact</a>
          <a href="#">Policies</a>
        </div>
        <div className="social-icons">
          <a href="#" aria-label="Facebook">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" aria-label="Twitter">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-1 1-2 1a4.4 4.4 0 0 0-3-1.3c-2.4 0-4.3 2-4.3 4.4 0 .3 0 .6.1.9-3.6-.2-6.8-1.9-9-4.7a4.3 4.3 0 0 0 1.4 5.9 4 4 0 0 1-2-.6v.1c0 2.1 1.5 3.9 3.5 4.3a4 4 0 0 1-1.9.1c.5 1.8 2.3 3.1 4.3 3.1a8.6 8.6 0 0 1-5.4 1.9c-.3 0-.7 0-1-.1a12.3 12.3 0 0 0 6.7 2c8 0 12.4-6.6 12.4-12.4v-.6A8.8 8.8 0 0 0 22 4z"></path></svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>
        <p className="copyright">© {new Date().getFullYear()} FuriousCabs. All rights reserved.</p>
      </div>
    </footer>
  )
}

export default Footer
