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
        
        {/* ========================================== */}
        {/* 🆕 UPDATED GLOBAL NAVBAR (Careers Style)   */}
        {/* ========================================== */}
        <header style={{ padding: '10px 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          
          {/* Logo & Brand Name Section */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img 
              src={logo} 
              alt="SM Logo" 
              style={{ 
                width: '55px',     // Makes the logo nice and big
                height: '55px', 
                borderRadius: '50%', 
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              // The pulsing blue glow hover effect
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.08)';
                e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.7)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <span style={{ fontSize: '1.5rem', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px' }}>
              STUDY MARROW
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="nav-links" style={{ display: 'flex', gap: '25px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: '#475569', fontWeight: '700', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#475569'}>Home</Link>
            <Link to="/library" style={{ textDecoration: 'none', color: '#475569', fontWeight: '700', fontSize: '1.05rem', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#0f172a'} onMouseLeave={(e) => e.target.style.color = '#475569'}>Library</Link> 
          </nav>
        </header>

        {/* The Content Changes Here */}
        <Routes>
          <Route path="/syn-world-23" element={<AdminPanel />} />
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/library" element={<Library />} />
        </Routes>
        
      </div>
    </Router>
  );
}

export default App;