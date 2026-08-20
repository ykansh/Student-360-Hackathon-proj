import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import logoDarkHero from '../Things-to-be-added/logo-360.png';
import logoLightHero from '../Things-to-be-added/Logo_white.png';
import logoDarkNav from '../Things-to-be-added/logoblack.png';
import logoLightNav from '../Things-to-be-added/logowhite.png';


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
    setActiveFaq((current) => (current === index ? null : index));
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
            <a href="#hero">
              <img 
                src={theme === 'dark' ? logoLightNav : logoDarkNav} 
                alt="Student 360 Logo" 
                onError={(e) => e.target.src='https://via.placeholder.com/150x50?text=Student+360'} 
              />
            </a>
          </div>

          <div className="nav-links">
            <a href="#hero">Home</a>
            <a href="#features">Features</a>
            <a href="#pdf-guide">PDF Guide</a>
            <a href="#comparison">Comparison</a>
            <a href="#faqs">FAQs</a>
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
      <section id="features" className="features-section">
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
      <section id="pdf-guide" className="tutorial-section bg-alt">
        <div className="section-container">
          <h2 className="section-title">How to Install</h2>
          <div className="tutorial-actions">
            <a
              href="../Things-to-be-added/pdf-Recovered_01.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary tutorial-open-btn"
            >
              Open PDF
            </a>
          </div>
        </div>
      </section>

      {/* Compare Section */}
      <section id="comparison" className="compare-section">
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
      <section id="faqs" className="faq-section bg-alt">
        <div className="section-container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="faq-container">
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`} ref={addToRefs}>
              <button type="button" className="faq-question" onClick={() => toggleFaq(0)} aria-expanded={activeFaq === 0}>
                Is the extension safe?
                <i className={`bx ${activeFaq === 0 ? 'bx-x' : 'bx-plus'}`}></i>
              </button>
              <div className={`faq-answer ${activeFaq === 0 ? 'open' : ''}`}>
                <p>Yes, as it runs locally when you download it. It is 100% safe.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`} ref={addToRefs}>
              <button type="button" className="faq-question" onClick={() => toggleFaq(1)} aria-expanded={activeFaq === 1}>
                Is the extension free?
                <i className={`bx ${activeFaq === 1 ? 'bx-x' : 'bx-plus'}`}></i>
              </button>
              <div className={`faq-answer ${activeFaq === 1 ? 'open' : ''}`}>
                <p>Yes, Student 360 is completely free to download and use.</p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`} ref={addToRefs}>
              <button type="button" className="faq-question" onClick={() => toggleFaq(2)} aria-expanded={activeFaq === 2}>
                Is the extension easy to use?
                <i className={`bx ${activeFaq === 2 ? 'bx-x' : 'bx-plus'}`}></i>
              </button>
              <div className={`faq-answer ${activeFaq === 2 ? 'open' : ''}`}>
                <p>Yes, it is easy to use, easy to parse.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <img 
                  src={theme === 'dark' ? logoLightHero : logoDarkHero} 
                  alt="Student 360 Logo" 
                  onError={(e) => e.target.src='https://via.placeholder.com/150x50?text=Student+360'} 
                />
              </div>
              <p>Student 360 helps learners stay focused, manage distractions, and build better study habits with a smart and simple extension.</p>
            </div>

            <div className="footer-links">
              <div>
                <h4>Quick Links</h4>
                <a href="#hero">Home</a>
                <a href="#download">Download</a>
                <a href="#faq">FAQ</a>
              </div>
              <div>
                <h4>Why it helps</h4>
                <a href="#features">Focus tracking</a>
                <a href="#features">Distraction control</a>
                <a href="#features">Better study flow</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2026 Student 360. Built for students who want to study with intention.</p>
            <p>Need help? Reach out through the project support channels for installation guidance and updates.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
