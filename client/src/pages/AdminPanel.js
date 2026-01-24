import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
  // 1. Form Data: This stores what you type in the boxes
  const [formData, setFormData] = useState({
    title: '', 
    category: 'Current Affairs', 
    subCategory: '', 
    type: 'PDF', 
    link: ''
  });
  
  const [materials, setMaterials] = useState([]);
  const [refresh, setRefresh] = useState(false); // Helps reload the list after you add/delete

  // 2. Load existing files when page opens
  useEffect(() => {
    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => setMaterials(res.data))
      .catch(err => console.error(err));
  }, [refresh]);

  // 3. Handle typing
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Submit the new file to your Server
  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('https://study-marrow-api.onrender.com/api/materials', formData)
      .then(() => {
        alert('✅ Added Successfully!');
        // Clear the form so you can add another one
        setFormData({ title: '', category: 'Current Affairs', subCategory: '', type: 'PDF', link: '' }); 
        setRefresh(!refresh); // Refresh the list below
      })
      .catch(err => alert('Error adding material. Check console.'));
  };

  // 5. Delete a file
  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this?")) {
      axios.delete(`https://study-marrow-api.onrender.com/api/materials/${id}`)
        .then(() => {
          setRefresh(!refresh);
        });
    }
  };

  return (
    <div className="container">
      <h1 className="section-title">Admin Dashboard (Secret)</h1>

      {/* --- UPLOAD SECTION --- */}
      <div className="card" style={{ cursor: 'default', marginBottom: '3rem', border: '2px solid #2563eb' }}>
        <h3>📤 Add New Content</h3>
        <p style={{marginBottom: '1rem', color: '#64748b'}}>Paste your Google Drive link below.</p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input type="text" name="title" placeholder="Title (e.g. Weekly One Liners Jan 2026)" 
                 value={formData.title} onChange={handleChange} required 
                 style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />

          <div style={{ display: 'flex', gap: '1rem' }}>
            <select name="category" value={formData.category} onChange={handleChange} style={{ padding: '10px', flex: 1 }}>
              <option>Current Affairs</option>
              <option>Class 10</option>
              <option>Class 12</option>
            </select>
            
            <input type="text" name="subCategory" placeholder="Sub Category (e.g. Monthly, Notes)" 
                   value={formData.subCategory} onChange={handleChange} required 
                   style={{ padding: '10px', flex: 1, borderRadius: '8px', border: '1px solid #ccc' }} />
          </div>

          <input type="url" name="link" placeholder="Paste Link (Google Drive / PDF URL)" 
                 value={formData.link} onChange={handleChange} required 
                 style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />

          <button type="submit" style={{ background: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Add to Website
          </button>
        </form>
      </div>

      {/* --- DELETE LIST --- */}
      <h3 className="section-title">🗑️ Manage Existing Files</h3>
      <div className="recent-list">
        {materials.map((item) => (
          <div className="recent-item" key={item._id}>
            <div className="file-info">
              <span className="file-title">{item.title}</span>
              <span className="file-meta">{item.category} • {item.subCategory}</span>
            </div>
            <button onClick={() => handleDelete(item._id)} 
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;