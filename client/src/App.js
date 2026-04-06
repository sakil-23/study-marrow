import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import Library from './pages/Library';
import AdminPanel from './pages/AdminPanel';

// 🆕 Import the SM logo from the src folder
import logo from './logo.png'; 

function App() {
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
            {/* Because we are using className="logo" on the Link, your App.css blinking colors still work here! */}
            <span className="responsive-text">Study Marrow</span>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/library">Library</Link> 
          </nav>
        </header>

        {/* The Content Changes Here */}
        <Routes>
          <Route path="/syn-world-23" element={<AdminPanel />} />
          <Route path="/" element={<Home />} />
          
          {/* 🚀 NEW: DIRECT SHAREABLE LINKS */}
          <Route path="/current-affairs" element={<Home />} />
          <Route path="/school-academics" element={<Home />} />

          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/library" element={<Library />} />
        </Routes>
        
        {/* ========================================== */}
        {/* 📱 RESPONSIVE CSS STYLES                   */}
        {/* ========================================== */}
        <style>{`
          /* --- DESKTOP STYLES (Replaces your old inline styles) --- */
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
            white-space: nowrap; /* Prevents "STUDY" and "MARROW" from splitting into two lines */
          }

          /* --- MOBILE STYLES (Fixes the squished layout on phones!) --- */
          @media (max-width: 768px) {
            .responsive-header {
              flex-direction: column; /* Stacks the logo and the nav links vertically */
              gap: 15px;
              padding: 15px 10px;
            }

            .responsive-brand {
              gap: 12px; /* Reduces space between the logo and text */
            }

            .responsive-logo {
              width: 60px; /* Shrinks the giant logo for phone screens */
              height: 60px;
            }

            .responsive-text {
              font-size: 1.6rem; /* Shrinks the text slightly so it fits perfectly */
            }
          }
        `}</style>
      </div>
    </Router>
  );
}

export default App;