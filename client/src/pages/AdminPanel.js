import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- STATE ---
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Class 12 Materials');
    const [subject, setSubject] = useState('Physics');          // NEW
    const [resourceType, setResourceType] = useState('Notes');  // NEW
    const [materials, setMaterials] = useState([]);
    const [subscribers, setSubscribers] = useState([]);

    useEffect(() => {
        fetchMaterials();
        fetchSubscribers();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/materials');
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/subscribe');
            setSubscribers(res.data);
        } catch (err) { console.error(err); }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('subject', subject);          // Sending Subject
        formData.append('resourceType', resourceType); // Sending Type

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('File Uploaded Successfully!');
            fetchMaterials();
        } catch (err) {
            alert('Upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            await axios.delete(`https://study-marrow-api.onrender.com/api/materials/${id}`);
            fetchMaterials();
        } catch (err) { alert("Error deleting"); }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>⚡ Admin Command Center</h1>

            {/* --- UPLOAD SECTION --- */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb' }}>Upload New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input type="text" placeholder="File Title (e.g. Electric Charges Notes)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px' }} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px' }}>
                            <option>Class 10 Materials</option>
                            <option>Class 12 Materials</option>
                            <option>Current Affairs</option>
                        </select>

                        {/* ONLY SHOW SUBJECTS FOR CLASS 12 */}
                        {category === 'Class 12 Materials' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={{ padding: '10px' }}>
                                <option>Physics</option>
                                <option>Chemistry</option>
                                <option>Maths</option>
                                <option>Biology</option>
                            </select>
                        )}
                    </div>

                    {category === 'Class 12 Materials' && (
                        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} style={{ padding: '10px' }}>
                            <option>NCERT Solutions</option>
                            <option>Handwritten Notes</option>
                            <option>Previous Year Papers</option>
                            <option>Question Bank</option>
                        </select>
                    )}

                    <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                    <button type="submit" style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>Upload File</button>
                </form>
            </div>
            
            {/* FILE LIST (Simplified for brevity) */}
            <div>
                <h3>Recent Uploads</h3>
                {materials.slice(0, 5).map(f => (
                    <div key={f._id} style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>
                        {f.title} <span style={{fontSize:'0.8rem', color:'gray'}}>({f.subject} - {f.resourceType})</span>
                        <button onClick={() => handleDelete(f._id)} style={{marginLeft:'10px', color:'red'}}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;