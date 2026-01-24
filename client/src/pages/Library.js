import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Library() {
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/api/materials')
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, []);

  // Filter based on search
  const filtered = materials.filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <h1 className="section-title">Full Library</h1>
      
      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Search entire library..." 
        style={{ padding: '12px', width: '100%', maxWidth: '400px', marginBottom: '2rem', borderRadius: '8px', border: '1px solid #ccc' }}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table Layout */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '1rem' }}>Title</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Type</th>
              <th style={{ padding: '1rem' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '1rem', fontWeight: '500' }}>{item.title}</td>
                <td style={{ padding: '1rem', color: '#64748b' }}>{item.category}</td>
                <td style={{ padding: '1rem' }}>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{item.type}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No results found.</p>}
      </div>
    </div>
  );
}

export default Library;