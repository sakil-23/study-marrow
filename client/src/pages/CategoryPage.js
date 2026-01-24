import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams(); // Gets "Class 10" from the URL
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    // Fetch data specifically for this category
    axios.get(`https://study-marrow-api.onrender.com/api/materials/${categoryName}`)
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, [categoryName]);

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <div style={{ margin: '1rem 0', color: '#64748b' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link> / <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{categoryName}</span>
      </div>

      <h1 className="section-title">{categoryName} Materials</h1>
      
      {/* List of Files */}
      <div className="recent-list">
        {materials.length === 0 ? (
          <p style={{ padding: '2rem' }}>No materials found for {categoryName} yet.</p>
        ) : (
          materials.map((item) => (
            <div className="recent-item" key={item._id}>
              <i className={`fas ${item.type === 'PDF' ? 'fa-file-pdf' : 'fa-file-alt'} file-icon`}></i>
              <div className="file-info">
                <span className="file-title">{item.title}</span>
                <span className="file-meta">{item.subCategory} • {item.type}</span>
              </div>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="download-btn">
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CategoryPage;