import Library from './pages/Library';
import AdminPanel from './pages/AdminPanel';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';


function App() {
  return (
    <Router>
      <div className="App">
        {/* Navbar (Always Visible) */}
        <header>
          <Link to="/" className="logo">
            <i className="fas fa-graduation-cap"></i> Study Marrow
          </Link>
          <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/library">Library</Link>  {/* <--- This is the change */}
          
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