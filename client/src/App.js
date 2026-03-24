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
          
          <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
            {/* Because we are using className="logo", your App.css blinking colors will work here! */}
            Study Marrow
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