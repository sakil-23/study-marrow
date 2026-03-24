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
        
        {/* Navbar (Always Visible - Restored to your original App.css styles!) */}
        <header>
          
          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '20px', textDecoration: 'none' }}>
            <img 
              src={logo} 
              alt="SM Logo" 
              style={{ 
                width: '100px',    // 🚀 MADE THE LOGO VERY BIG (Increased from 55px to 100px)
                height: '100px', 
                borderRadius: '50%', 
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)' // Base shadow so it pops
              }}
              // The pulsing blue glow hover effect
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }}
            />
            {/* Because we are using className="logo", your App.css blinking colors will work here! */}
            <span>Study Marrow</span>
          </Link>

          {/* Navigation Links (Back to your original styling) */}
          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/library">Library</Link> 
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