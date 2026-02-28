import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState('');
  const [materials, setMaterials] = useState([]);

  // ✅ SMART NAVIGATION
  const [selectedVertical, setSelectedVertical] = useState(location.state?.selectedVertical || null);

  useEffect(() => {
    if (location.state?.selectedVertical) {
      setSelectedVertical(location.state.selectedVertical);
    }
  }, [location.state]);

  useEffect(() => {
    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredMaterials = materials.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.subject?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.toLowerCase().includes(search.toLowerCase()) ||
    item.vertical?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter an email!");
    try {
      await axios.post('https://study-marrow-api.onrender.com/api/subscribe', { email });
      alert("🎉 You are now subscribed!");
      setEmail(''); 
    } catch (err) { alert(err.response?.data?.message || "Something went wrong."); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* --- HERO SECTION --- */}
      <section className="hero" style={{ padding: '4rem 1rem', background: '#0f172a', color: 'white', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div className="particles">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', position: 'relative', zIndex: 1 }}>Welcome to Study Marrow</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
          The core of your preparation. Access notes, papers, and articles instantly.
        </p>
        
        <div className="search-container" style={{ position: 'relative', zIndex: 1 }}>
          <input 
            type="text" 
            placeholder="🔍 Search for physics, daily updates, mock tests..." 
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            style={{ padding: '15px 20px', width: '100%', maxWidth: '600px', borderRadius: '30px', border: 'none', fontSize: '1.1rem', outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
          />
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <div className="container" style={{ flex: 1, padding: '3rem 1rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

        {/* 🔍 SEARCH RESULTS */}
        {search.length > 0 && (
          <div style={{ marginBottom: '40px', animation: 'fadeIn 0.3s ease-in-out' }}>
            <h2 style={sectionTitleStyle}>Search Results for "{search}" ({filteredMaterials.length})</h2>
            {filteredMaterials.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#64748b' }}>No materials found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {filteredMaterials.map((item) => (
                  <div key={item._id} style={fileItemStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <i className={`fas ${item.resourceType === 'NCERT Book' ? 'fa-book' : 'fa-file-alt'}`} style={{ fontSize: '1.5rem', color: '#ef4444' }}></i>
                      <div>
                        <span style={{ display: 'block', fontWeight: 'bold', color: '#1e293b' }}>{item.title}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {item.vertical || 'School Academics'} • {item.category}
                        </span>
                      </div>
                    </div>
                    <a href={item.link} target="_blank" rel="noopener noreferrer" style={downloadBtnStyle}>View</a>
                  </div>
                ))}
              </div>
            )}
            <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />
          </div>
        )}

        {/* --- 🏗️ MEGA-PORTAL NAVIGATION --- */}
        {!search && (
            <>
                {selectedVertical && (
                    <button onClick={() => setSelectedVertical(null)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        ← Back to Main Portal
                    </button>
                )}

                {/* LEVEL 1: VERTICALS */}
                {!selectedVertical && (
                    <div>
                        <h2 style={sectionTitleStyle}>Explore Categories</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            
                            <div onClick={() => setSelectedVertical('School Academics')} style={verticalCardStyle} className="hover-card">
                                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🏫</div>
                                <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>School Academics</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Class 8 to 12 materials, NCERT solutions, and Board Papers.</p>
                            </div>

                            {/* ✅ NEW: Current Affairs unlocked! */}
                            <div onClick={() => setSelectedVertical('Current Affairs')} style={verticalCardStyle} className="hover-card">
                                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🌍</div>
                                <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Current Affairs</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>Weekly, Monthly, and Specific event compilations.</p>
                            </div>

                            <div style={{...verticalCardStyle, opacity: 0.6, cursor: 'not-allowed'}} title="Coming Soon!">
                                <div style={{ fontSize: '4rem', marginBottom: '15px' }}>🏢</div>
                                <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>Job Exam Preparation</h2>
                                <p style={{ color: '#64748b', margin: 0 }}>ADRE, APSC, Junior Assistant & Banking notes.</p>
                                <span style={comingSoonBadge}>Coming Soon</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* LEVEL 2: INSIDE SCHOOL ACADEMICS */}
                {selectedVertical === 'School Academics' && (
                    <div className="fade-in">
                        <h2 style={sectionTitleStyle}>🏫 School Academics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            {['Class 12 Materials', 'Class 11 Materials', 'Class 10 Materials', 'Class 9 Materials', '