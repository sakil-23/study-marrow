import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- LOGIN STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [adminKey, setAdminKey] = useState('');

    // --- DATA STATE ---
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Class 12 Materials');
    const [subject, setSubject] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [materials, setMaterials] = useState([]);
    const [subscribers, setSubscribers] = useState([]);

    // --- LOGIN HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await axios.post('https://study-marrow-api.onrender.com/api/verify-admin', {}, {
                headers: { 'admin-key': passwordInput }
            });
            setAdminKey(passwordInput);
            setIsAuthenticated(true);
            fetchData(passwordInput);
        } catch (err) {
            alert("❌ Wrong Password! Access Denied.");
        }
    };

    // --- DATA FETCHING ---
    const fetchData = (key) => {
        fetchMaterials();
        fetchSubscribers(key);
    };

    const fetchMaterials = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/materials');
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };

    const fetchSubscribers = async (key) => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/subscribe', {
                headers: { 'admin-key': key }
            });
            setSubscribers(res.data);
        } catch (err) { console.error("Error fetching subscribers"); }
    };

    // --- UPLOAD HANDLER ---
    const handleUpload = async (e) => {
        e.preventDefault();
        
        if ((category.includes('Class')) && (!subject || !resourceType)) {
            return alert("Please select both a Subject and a Resource Type!");
        }

        const materialData = { title, category, subject, resourceType, link };

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', materialData, {
                headers: { 'admin-key': adminKey }
            });
            alert('✅ Link Added Successfully!');
            setTitle('');
            setLink('');
            fetchMaterials(); // Refresh list immediately
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || "Server Error"));
        }
    };

    // --- ✏️ NEW: EDIT HANDLER ---
    const handleEdit = async (id, currentTitle) => {
        const newTitle = window.prompt("Enter the new file name:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return; // Cancelled or same name

        try {
            await axios.put(`https://study-marrow-api.onrender.com/api/materials/${id}`, 
                { title: newTitle }, 
                { headers: { 'admin-key': adminKey } }
            );
            fetchMaterials(); // Refresh list to show new name
        } catch (err) {
            alert("❌ Update failed.");
        }
    };

    // --- DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            await axios.delete(`https://study-marrow-api.onrender.com/api/materials/${id}`, {
                headers: { 'admin-key': adminKey }
            });
            fetchMaterials();
        } catch (err) { alert("Error deleting"); }
    };

    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' }}>
                <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>🔐 Admin Access</h2>
                    <input 
                        type="password" 
                        placeholder="Enter Password" 
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        style={{ width: '90%', padding: '12px', fontSize: '1rem', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        Unlock Panel
                    </button>
                </form>
            </div>
        );
    }

    // --- DASHBOARD ---
    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>⚡ Admin Command Center</h1>

            {/* UPLOAD FORM */}
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>Add New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input type="text" placeholder="File Title (e.g. Real Numbers Notes)" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <select value={category} onChange={(e) => { setCategory(e.target.value); setSubject(''); setResourceType(''); }} style={inputStyle}>
                            <option>Class 12 Materials</option>
                            <option>Class 10 Materials</option>
                            <option>Current Affairs</option>
                        </select>

                        {category === 'Class 12 Materials' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                                <option value="">-- Select Subject --</option>
                                <option>Physics</option>
                                <option>Chemistry</option>
                                <option>Maths</option>
                                <option>Biology</option>
                            </select>
                        )}
                        {category === 'Class 10 Materials' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                                <option value="">-- Select Subject --</option>
                                <option>English</option>
                                <option>Mathematics</option>
                                <option>General Science</option>
                                <option>Social Science</option>
                                <option>Information Technology</option>
                            </select>
                        )}
                    </div>

                    {category === 'Class 12 Materials' && (
                        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} style={inputStyle}>
                            <option value="">-- Select Type --</option>
                            <option>NCERT Book</option>
                            <option>NCERT Solutions</option>
                            <option>Handwritten Notes</option>
                            <option>Previous Year Papers</option>
                            <option>Question Bank</option>
                        </select>
                    )}
                    {category === 'Class 10 Materials' && (
                        <select value={resourceType} onChange={(e) => setResourceType(e.target.value)} style={inputStyle}>
                            <option value="">-- Select Type --</option>
                            <option>NCERT Book</option>
                            <option>NCERT solutions</option>
                            <option>Notes</option>
                            <option>Syllabus</option>
                            <option>Previous Year Paper</option>
                            <option>Question Bank</option>
                        </select>
                    )}

                    <input type="url" placeholder="Paste PDF/Drive Link here (https://...)" value={link} onChange={(e) => setLink(e.target.value)} required style={{ ...inputStyle, borderColor: '#2563eb', background: '#eff6ff' }} />
                    <button type="submit" style={buttonStyle}>Add Link</button>
                </form>
            </div>

            {/* SUBSCRIBER LIST */}
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
            
            {/* RECENT UPLOADS with EDIT BUTTON */}
            <div>
                <h3>Recent Uploads</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {materials.slice(0, 15).map(f => (
                        <div key={f._id} style={listItemStyle}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <strong style={{ color: '#333' }}>{f.title}</strong> 
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                    {f.category} • {f.subject} • {f.resourceType}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleEdit(f._id, f.title)} style={editButtonStyle}>Edit</button>
                                <button onClick={() => handleDelete(f._id)} style={deleteButtonStyle}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const listItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const deleteButtonStyle = { background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' };
const editButtonStyle = { background: '#fef08a', color: '#854d0e', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' };

export default AdminPanel;