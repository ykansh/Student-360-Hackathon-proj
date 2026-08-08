import React, { useState, useEffect, useRef } from 'react';
import './index.css';

function App() {
  const [theme, setTheme] = useState('dark');
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const mainDownloadBtnRef = useRef(null);
  const faderRefs = useRef([]);

  useEffect(() => {
    // Theme setup
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  // Reset faderRefs on each render to prevent duplicates in strict mode
  faderRefs.current = [];

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  useEffect(() => {
    // Floating download button observer
    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: "-100px 0px 0px 0px"
    };

    const btnObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setShowFloatingBtn(!entry.isIntersecting);
      });
    }, observerOptions);

    if (mainDownloadBtnRef.current) {
      btnObserver.observe(mainDownloadBtnRef.current);
    }

    return () => {
      if (mainDownloadBtnRef.current) {
        btnObserver.unobserve(mainDownloadBtnRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Scroll animations observer
    const appearOptions = {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('appear');
          observer.unobserve(entry.target);
        }
      });
    }, appearOptions);

    faderRefs.current.forEach(fader => {
      if (fader) {
        appearOnScroll.observe(fader);
      }
    });

    return () => {
      faderRefs.current.forEach(fader => {
        if (fader) {
          appearOnScroll.unobserve(fader);
        }
      });
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !faderRefs.current.includes(el)) {
      faderRefs.current.push(el);
    }
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <>
      {/* Floating Download Button */}
      <div className={`floating-download-btn glass-effect ${showFloatingBtn ? 'visible' : ''}`} id="floatingDownload">
        <a href="#hero" className="btn btn-glass">
          <i className='bx bx-download'></i> Download Now
        </a>
      </div>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img 
              src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} 
              alt="Student 360 Logo" 
              onError={(e) => e.target.src='https://via.placeholder.com/150x50?text=Student+360'} 
            />
          </div>
          <div className="nav-actions">
            <button onClick={toggleTheme} className="theme-btn" aria-label="Toggle Dark Mode">
              <i className={theme === 'dark' ? 'bx bx-sun' : 'bx bx-moon'}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero" id="hero">
        <div className="hero-content">
          <div className="hero-logo" style={{ marginBottom: '30px' }}>
            <img 
              src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} 
              alt="Student 360 Logo" 
              style={{ maxHeight: '80px', width: 'auto' }}
              onError={(e) => e.target.src='https://via.placeholder.com/150x50?text=Student+360'} 
            />
          </div>
          <h1 className="hero-title">‘Kal Se’ to <span className="highlight">‘Aaj Se’</span></h1>
          <p className="hero-subtitle">Because “I’ll start tomorrow” is getting old.</p>
          <div className="hero-cta">
            <a href="#download" className="btn btn-primary btn-large" ref={mainDownloadBtnRef}>
              Download Extension
            </a>
          </div>
        </div>
        
        {/* Abstract decorative shapes */}
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <h2 className="section-title">Why Student 360?</h2>
          <div className="grid-container">
            
            <div className="feature-box glass-effect fade-in-up" ref={addToRefs}>
              <div className="box-front">
                <h3>Feature #1</h3>
              </div>
              <div className="box-back">
                <p>Advance short format blocking system</p>
              </div>
            </div>

            <div className="feature-box glass-effect fade-in-up delay-1" ref={addToRefs}>
              <div className="box-front">
                <h3>Feature #2</h3>
              </div>
              <div className="box-back">
                <p>Realtime tracking system</p>
              </div>
            </div>

            <div className="feature-box glass-effect fade-in-up delay-2" ref={addToRefs}>
              <div className="box-front">
                <h3>Feature #3</h3>
              </div>
              <div className="box-back">
                <p>Analytics</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <section className="tutorial-section bg-alt">
        <div className="section-container">
          <h2 className="section-title">How to Install</h2>
          <div className="tutorial-placeholder glass-effect fade-in-up" ref={addToRefs}>
            <i className='bx bx-file-blank'></i>
            <h3>PDF Tutorial Space</h3>
            <p>Your installation guide PDF will be embedded here.</p>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section className="compare-section">
        <div className="section-container">
          <h2 className="section-title">How We Stack Up</h2>
          <div className="grid-container">
            
            <div className="feature-box compare-box glass-effect fade-in-up" ref={addToRefs}>
              <div className="box-front">
                <h3>Compare #1</h3>
              </div>
              <div className="box-back">
                <p><span className="competitor">MINDOX</span> - It's complicated and does not have realtime tracking</p>
              </div>
            </div>

            <div className="feature-box compare-box glass-effect fade-in-up delay-1" ref={addToRefs}>
              <div className="box-front">
                <h3>Compare #2</h3>
              </div>
              <div className="box-back">
                <p><span className="competitor">STUDYFOC.US</span> - Very complex and design is outdated</p>
              </div>
            </div>

            <div className="feature-box compare-box glass-effect fade-in-up delay-2" ref={addToRefs}>
              <div className="box-front">
                <h3>Compare #3</h3>
              </div>
              <div className="box-back">
                <p><span className="competitor">PROMOFOCUS</span> - It has no advance features</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section bg-alt">
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="faq-container">
            <div className={`faq-item fade-in-up ${activeFaq === 0 ? 'active' : ''}`} ref={addToRefs}>
              <button className="faq-question" onClick={() => toggleFaq(0)}>
                Is the extension safe?
                <i className='bx bx-chevron-down'></i>
              </button>
              <div className="faq-answer">
                <p>Yes, as it runs locally when you download it. It is 100% safe.</p>
              </div>
            </div>

            <div className={`faq-item fade-in-up delay-1 ${activeFaq === 1 ? 'active' : ''}`} ref={addToRefs}>
              <button className="faq-question" onClick={() => toggleFaq(1)}>
                Is the extension free?
                <i className='bx bx-chevron-down'></i>
              </button>
              <div className="faq-answer">
                <p>Yes, Student 360 is completely free to download and use.</p>
              </div>
            </div>
            <div className={`faq-item fade-in-up delay-2 ${activeFaq === 2 ? 'active' : ''}`} ref={addToRefs}>
              <button className="faq-question" onClick={() => toggleFaq(2)}>
                Is the extension easy to use?
                <i className='bx bx-chevron-down'></i>
              </button>
              <div className="faq-answer">
                <p>Yes, it is easy to use, easy to parse.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
             <img 
              src={theme === 'dark' ? "/logo-white.png" : "/logo-black.png"} 
              alt="Student 360 Logo" 
              onError={(e) => e.target.src='https://via.placeholder.com/150x50?text=Student+360'} 
            />
          </div>
          <p>&copy; 2026 Student 360. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default App;
