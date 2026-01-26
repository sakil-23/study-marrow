import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- STATE ---
    const [link, setLink] = useState(''); // Changed from 'file' to 'link'
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Class 12 Materials');
    const [subject, setSubject] = useState('Physics');
    const [resourceType, setResourceType] = useState('NCERT Solutions');
    
    const [materials, setMaterials] = useState([]);
    const [subscribers, setSubscribers] = useState([]); // Subscriber State

    // --- FETCH DATA ---
    useEffect(() => {
        fetchMaterials();
        fetchSubscribers(); // Fetch emails on load
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
        } catch (err) { console.error("Error fetching subscribers"); }
    };

    // --- HANDLERS ---
    const handleUpload = async (e) => {
        e.preventDefault();
        
        // We send JSON now, not FormData
        const materialData = {
            title,
            category,
            subject,
            resourceType,
            link // Sending the text link
        };

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', materialData);
            alert('Link Added Successfully!');
            setTitle('');
            setLink('');
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
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>Add New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input 
                        type="text" 
                        placeholder="File Title (e.g. Electric Charges Notes)" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        required 
                        style={inputStyle} 
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                            <option>Class 10 Materials</option>
                            <option>Class 12 Materials</option>
                            <option>Current Affairs</option>
                        </select>

                        {category === 'Class 12 Materials' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                                <option>Physics</option>
                                <option>Chemistry</option>
                                <option>Maths</option>
                                <option>Biology</option>
                            </select>
                        )}
                    </div>

                    {category === 'Class 12 Materials' && (
                        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} style={inputStyle}>
                            <option>NCERT Solutions</option>
                            <option>Handwritten Notes</option>
                            <option>Previous Year Papers</option>
                            <option>Question Bank</option>
                        </select>
                    )}

                    {/* NEW LINK INPUT */}
                    <input 
                        type="url" 
                        placeholder="Paste PDF/Drive Link here (https://...)" 
                        value={link} 
                        onChange={(e) => setLink(e.target.value)} 
                        required 
                        style={{ ...inputStyle, borderColor: '#2563eb', background: '#eff6ff' }} 
                    />

                    <button type="submit" style={buttonStyle}>Add Link</button>
                </form>
            </div>

            {/* --- SUBSCRIBER LIST (RESTORED) --- */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#16a34a', borderBottom: '2px solid #16a34a', paddingBottom: '10px' }}>
                    📬 Subscriber List ({subscribers.length})
                </h3>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {subscribers.length === 0 ? <p>No subscribers yet.</p> : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {subscribers.map((sub) => (
                                    <tr key={sub._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '8px' }}>{sub.email}</td>
                                        <td style={{ padding: '8px', color: '#666', fontSize: '0.8rem', textAlign: 'right' }}>
                                            {new Date(sub.dateJoined).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {/* --- RECENT UPLOADS (FIXED ALIGNMENT) --- */}
            <div>
                <h3>Recent Uploads</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {materials.slice(0, 10).map(f => (
                        <div key={f._id} style={listItemStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#333' }}>{f.title}</strong> 
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {f.category} • {f.subject} • {f.resourceType}
                                </span>
                                <a href={f.link} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none' }}>
                                    {f.link.substring(0, 40)}...
                                </a>
                            </div>
                            
                            {/* FIXED DELETE BUTTON ALIGNMENT */}
                            <button onClick={() => handleDelete(f._id)} style={deleteButtonStyle}>
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- STYLES ---
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const listItemStyle = { 
    display: 'flex', 
    justifyContent: 'space-between', // Pushes Delete to the right
    alignItems: 'center', 
    padding: '15px', 
    background: 'white', 
    border: '1px solid #eee', 
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
};
const deleteButtonStyle = { 
    background: '#fee2e2', color: '#ef4444', border: 'none', 
    padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', 
    fontWeight: 'bold', fontSize: '0.85rem' 
};

export default AdminPanel;