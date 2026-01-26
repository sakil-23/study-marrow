import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- STATE FOR UPLOADS ---
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Class 10 Materials');
    const [materials, setMaterials] = useState([]);
    
    // --- STATE FOR SUBSCRIBERS ---
    const [subscribers, setSubscribers] = useState([]);

    // --- FETCH DATA ON LOAD ---
    useEffect(() => {
        fetchMaterials();
        fetchSubscribers();
    }, []);

    const fetchMaterials = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/materials');
            setMaterials(res.data);
        } catch (err) {
            console.error("Error fetching materials:", err);
        }
    };

    const fetchSubscribers = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/subscribe');
            setSubscribers(res.data);
        } catch (err) {
            console.error("Error fetching subscribers:", err);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('category', category);

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('File Uploaded Successfully!');
            fetchMaterials(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Upload failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await axios.delete(`https://study-marrow-api.onrender.com/api/materials/${id}`);
            alert("File deleted");
            fetchMaterials(); // Refresh list
        } catch (err) {
            alert("Error deleting file");
        }
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>⚡ Admin Command Center</h1>

            {/* --- UPLOAD SECTION --- */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb' }}>Upload New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="File Title (e.g. Physics Chapter 1)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '10px' }} />
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: '10px' }}>
                        <option>Class 10 Materials</option>
                        <option>Class 12 Materials</option>
                        <option>Current Affairs</option>
                    </select>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
                    <button type="submit" style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Upload File</button>
                </form>
            </div>

            {/* --- SUBSCRIBER LIST SECTION (NEW) --- */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '30px' }}>
                <h2 style={{ marginTop: 0, color: '#16a34a', borderBottom: '2px solid #16a34a', paddingBottom: '10px' }}>
                    📬 Subscriber List ({subscribers.length})
                </h2>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {subscribers.length === 0 ? (
                        <p>No subscribers yet.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', background: '#f1f5f9' }}>
                                    <th style={{ padding: '8px' }}>Email</th>
                                    <th style={{ padding: '8px' }}>Date Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((sub) => (
                                    <tr key={sub._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px', color: '#334155' }}>{sub.email}</td>
                                        <td style={{ padding: '8px', color: '#64748b', fontSize: '0.9rem' }}>
                                            {new Date(sub.dateJoined).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* --- FILE MANAGEMENT SECTION --- */}
            <div>
                <h2 style={{ color: '#d97706' }}>📂 Manage Files</h2>
                {materials.map((file) => (
                    <div key={file._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee', alignItems: 'center' }}>
                        <div>
                            <strong>{file.title}</strong> <span style={{ fontSize: '0.8rem', color: '#666' }}>({file.category})</span>
                        </div>
                        <button onClick={() => handleDelete(file._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer', borderRadius: '5px' }}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;