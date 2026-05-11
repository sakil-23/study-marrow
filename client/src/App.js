import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Library from './pages/Library';
import AdminPanel from './pages/AdminPanel';

// 🆕 NEW SEO IMPORTS: The page Google will actually read
import MaterialViewer from './pages/MaterialViewer'; 

// Import the SM logo from the src folder
import logo from './logo.png'; 

function App() {
  // 🌙 State to remember if Dark Mode is on
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🧠 The Magic Logic that applies the Dark Mode to the whole page
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode-active');
    } else {
      document.body.classList.remove('dark-mode-active');
    }
  }, [isDarkMode]);

  return (
    <Router>
      <div className="App">
        
        {/* Navbar */}
        <header className="responsive-header">
          
          <Link to="/" className="logo responsive-brand">
            <img 
              src={logo} 
              alt="SM Logo" 
              className="responsive-logo"
            />
            <span className="responsive-text">Study Marrow</span>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link to="/">Home</Link>
            <Link to="/library">Library</Link> 
            
            {/* 🌓 The Dark Mode Toggle Button */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '5px', transition: 'transform 0.2s' }}
              title="Toggle Reading Mode"
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </nav>
        </header>

        {/* The Content Changes Here */}
        <Routes>
          <Route path="/syn-world-23" element={<AdminPanel />} />
          <Route path="/" element={<Home />} />
          
          {/* DIRECT SHAREABLE LINKS */}
          <Route path="/current-affairs" element={<Home />} />
          <Route path="/school-academics" element={<Home />} />

          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/library" element={<Library />} />
          
          {/* 🚀 NEW SEO DEEP LINK ROUTE */}
          {/* This catches deep URLs and sends them to the MaterialViewer page */}
          <Route path="/study/:className/:subject/:materialType/:slug" element={<MaterialViewer />} />
        </Routes>
        
        {/* ========================================== */}
        {/* 📱 RESPONSIVE & DARK MODE CSS              */}
        {/* ========================================== */}
        <style>{`
          /* 🌙 THE 1-MINUTE DARK MODE MAGIC */
          body.dark-mode-active {
            filter: invert(0.92) hue-rotate(180deg);
            background-color: #f8fafc;
          }
          
          body.dark-mode-active img, 
          body.dark-mode-active .particles,
          body.dark-mode-active iframe { /* Added iframe so your PDFs don't invert! */
            filter: invert(1) hue-rotate(180deg);
          }

          /* --- DESKTOP STYLES --- */
          .responsive-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 20px;
          }

          .responsive-brand {
            display: flex;
            align-items: center;
            gap: 20px;
            text-decoration: none;
          }

          .responsive-logo {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            transition: all 0.3s ease;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          }

          .responsive-logo:hover {
            transform: scale(1.05);
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.8);
          }

          .responsive-text {
            white-space: nowrap;
          }

          /* --- MOBILE STYLES --- */
          @media (max-width: 768px) {
            .responsive-header {
              flex-direction: column;
              gap: 15px;
              padding: 15px 10px;
            }

            .responsive-brand {
              gap: 12px;
            }

            .responsive-logo {
              width: 60px;
              height: 60px;
            }

            .responsive-text {
              font-size: 1.6rem;
            }
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;