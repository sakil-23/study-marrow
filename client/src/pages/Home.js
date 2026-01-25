import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');
  const [email, setEmail] = useState(''); // State for Newsletter

  // Fetch materials when page loads
  useEffect(() => {
    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => setMaterials(res.data))
      .catch(err => console.log(err));
  }, []);

  // Filter materials based on search
  const filteredMaterials = materials.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  // Handle Newsletter Subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter an email!");
    
    try {
      await axios.post('https://study-marrow-api.onrender.com/api/subscribe', { email });
      alert("🎉 You are now subscribed!");
      setEmail('');
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      
      {/* --- NAVBAR --- */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#6366f1', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span> STUDY MARROW
        </h1>
        <div>
          <Link to="/" style={{ marginRight: '20px', textDecoration: 'none', color: '#334155', fontWeight: '500' }}>Home</Link>
          <Link to="/library" style={{ textDecoration: 'none', color: '#334155', fontWeight: '500' }}>Library</Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header style={{ 
        background: '#0f172a', 
        color: 'white', 
        padding: '4rem 2rem', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Welcome to Study Marrow</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>The core of your preparation. Access notes, papers, and articles instantly.</p>
          
          <input 
            type="text" 
            placeholder="Search for physics, notes, papers..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
              padding: '12px 20px', 
              width: '100%', 
              maxWidth: '500px', 
              borderRadius: '50px', 
              border: 'none', 
              outline: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }} 
          />
        </div>
        
        {/* Abstract Background Shapes */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '150px', height: '150px', background: '#ffffff10', borderRadius: '30px', transform: 'rotate(15deg)' }}></div>
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '100px', height: '100px', background: '#6366f120', borderRadius: '50%' }}></div>
      </header>

      {/* --- BROWSE CATEGORIES --- */}
      <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h3 style={{ borderLeft: '5px solid #3b82f6', paddingLeft: '10px', color: '#1e293b' }}>Browse by Category</h3>
        <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap' }}>
          {['Class 10 Materials', 'Class 12 Materials', 'Current Affairs'].map((cat, index) => (
            <div key={index} style={{ 
              background: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
              flex: '1', 
              minWidth: '200px',
              border: '1px solid #e2e8f0'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#334155' }}>{cat}</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>NCERT solutions and revision notes.</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- RECENT MATERIALS --- */}
      <section style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        <h3 style={{ borderLeft: '5px solid #10b981', paddingLeft: '10px', color: '#1e293b' }}>Recently Added Materials</h3>
        
        {materials.length === 0 ? (
          <p style={{ color: '#64748b', marginTop: '20px' }}>No materials uploaded yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {filteredMaterials.slice(0, 6).map((file) => (
              <div key={file._id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📄</div>
                <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{file.title}</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                  <span style={{ fontSize: '0.7rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#475569' }}>{file.category}</span>
                  <a href={file.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold', fontSize: '0.9rem' }}>Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* --- SLIM FOOTER NEWSLETTER --- */}
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

          <form onSubmit={handleSubscribe} style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
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