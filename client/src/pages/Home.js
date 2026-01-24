import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // We use Link instead of <a>
import axios from 'axios';

function Home() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredMaterials = materials.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Hero */}
      
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

        
        {/* ... rest of your code ... */}
        <h1>Welcome to Study Marrow</h1>
        <p>The core of your preparation. Access notes, papers, and articles instantly.</p>
        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search for physics, notes, papers..." 
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="grid-categories">
          
          {/* Link to Class 10 */}
          <Link to="/category/Class 10" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="card">
              <div className="card-icon"><i className="fas fa-book-open"></i></div>
              <h3>Class 10 Materials</h3>
              <p>NCERT solutions and revision notes.</p>
            </div>
          </Link>

          {/* Link to Class 12 */}
          <Link to="/category/Class 12" style={{ textDecoration: 'none', color: 'inherit' }}>
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

        <h2 className="section-title">Recently Added Materials</h2>
        <div className="recent-list">
          {filteredMaterials.map((item) => (
             <div className="recent-item" key={item._id}>
                <i className={`fas ${item.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-alt'} file-icon`}></i>
                <div className="file-info">
                  <span className="file-title">{item.title}</span>
                  <span className="file-meta">{item.category} • {item.subCategory}</span>
                </div>
                <a href={item.link} target="_blank" rel="noopener noreferrer" className="download-btn">View</a>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;