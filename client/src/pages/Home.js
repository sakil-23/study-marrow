import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  // 1. Kept 'search' state so the Hero Input works (visually)
  const [search, setSearch] = useState('');
  
  // 2. Kept 'email' state for Newsletter
  const [email, setEmail] = useState('');

  // Note: 'materials' state and 'useEffect' (fetching logic) were removed
  // because the "Recently Added" section is gone.

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter an email!");
    
    try {
      await axios.post('https://study-marrow-api.onrender.com/api/subscribe', { email });
      alert("🎉 You are now subscribed!");
      setEmail(''); // Clear the box
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div>
      {/* --- HERO SECTION (UNCHANGED) --- */}
      <section className="hero">
        {/* --- PARTICLE LAYER START --- */}
        <div className="particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        {/* --- PARTICLE LAYER END --- */}

        <h1>Welcome to Study Marrow</h1>
        <p>The core of your preparation. Access notes, papers, and articles instantly.</p>
        
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for physics, notes, papers..." 
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="grid-categories">
          
          {/* Link to Class 10 */}
          <Link to="/category/Class 10 Materials" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-icon"><i className="fas fa-book-open"></i></div>
              <h3>Class 10 Materials</h3>
              <p>NCERT solutions and revision notes.</p>
            </div>
          </Link>

          {/* Link to Class 12 */}
          <Link to="/category/Class 12 Materials" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-icon"><i className="fas fa-microscope"></i></div>
              <h3>Class 12 Materials</h3>
              <p>Resources of Science stream</p>
            </div>
          </Link>

          {/* Link to Current Affairs */}
          <Link to="/category/Current Affairs" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-icon"><i className="fas fa-globe-americas"></i></div>
              <h3>Current Affairs</h3>
              <p>Weekly and Monthly Current Affairs</p>
            </div>
          </Link>
        </div>

        {/* ❌ REMOVED: "Recently Added Materials" Section was here */}

      </div>

      {/* --- FOOTER (UNCHANGED) --- */}
      <footer style={{ 
        marginTop: '5rem',
        width: '100%',
        padding: '1.5rem 0',
        background: '#0f172a',
        borderTop: '1px solid #334155',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
          
          <h3 style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '5px' }}>
            Stay Updated
          </h3>
          
          <p style={{ color: '#94a3b8', marginBottom: '15px', fontSize: '0.85rem' }}>
            Get notified when materials are uploaded.
          </p>

          <form onSubmit={handleSubscribe} style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px',
            alignItems: 'center'
          }}>
            <input 
              type="email" 
              placeholder="Your email..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid #475569', 
                background: '#1e293b',
                color: 'white',
                width: '200px',
                fontSize: '0.85rem'
              }} 
            />
            <button type="submit" style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              border: 'none', 
              background: '#3b82f6', 
              color: 'white', 
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}>
              Join
            </button>
          </form>
          
          <p style={{ marginTop: '20px', color: '#475569', fontSize: '0.7rem' }}>
            © 2026 Study Marrow. Built for Students.
          </p>
        </div>
      </footer>
      
    </div>
  );
}

export default Home;