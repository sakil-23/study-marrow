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
    
    // ✅ 1. NEW STATE FOR BOARD
    const [board, setBoard] = useState(''); 

    const [materials, setMaterials] = useState([]); 
    const [subscribers, setSubscribers] = useState([]);

    // --- DEFINED STRUCTURE FOR VIEWING ---
    const structure = {
        'Class 12 Materials': ['Physics', 'Chemistry', 'Maths', 'Biology'],
        'Class 10 Materials': ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'],
        'Current Affairs': [] 
    };

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

        // ✅ 2. VALIDATION: FORCE BOARD SELECTION
        if (resourceType === 'Previous Year Papers' && !board) {
            return alert("⚠️ Please select a Board (CBSE or ASSEB)!");
        }

        // ✅ 3. INCLUDE BOARD IN DATA
        const materialData = { title, category, subject, resourceType, link, board };

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', materialData, {
                headers: { 'admin-key': adminKey }
            });
            alert('✅ Link Added Successfully!');
            setTitle('');
            setLink('');
            setBoard(''); // Reset board selection
            fetchMaterials(); 
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || "Server Error"));
        }
    };

    // --- EDIT HANDLER ---
    const handleEdit = async (id, currentTitle) => {
        const newTitle = window.prompt("Enter the new file name:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return; 

        try {
            await axios.put(`https://study-marrow-api.onrender.com/api/materials/${id}`, 
                { title: newTitle }, 
                { headers: { 'admin-key': adminKey } }
            );
            fetchMaterials(); 
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

    // ✅ NEW: REORDER LOGIC (Move Up / Down)
    const handleMove = async (fileToMove, direction, allFilesConfig) => {
        // 1. Get the current visible list for this folder
        const currentList = materials.filter(m => 
            m.category === allFilesConfig.cat && 
            (!allFilesConfig.sub || m.subject === allFilesConfig.sub)
        );

        // 2. Find index of clicked item
        const index = currentList.findIndex(m => m._id === fileToMove._id);
        if (index === -1) return;

        // 3. Swap in local array
        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= currentList.length) return; // Can't move past edges

        // Swap the items
        const temp = currentList[index];
        currentList[index] = currentList[newIndex];
        currentList[newIndex] = temp;

        // 4. Send NEW ORDER to Server
        // We assign order 0, 1, 2... based on current list position
        const updates = currentList.map((item, idx) => ({
            id: item._id,
            order: idx
        }));

        try {
            // Optimistic UI Update (Fast)
            setMaterials(prev => {
                const updated = [...prev];
                updates.forEach(u => {
                   const found = updated.find(m => m._id === u.id);
                   if (found) found.order = u.order;
                });
                return updated.sort((a, b) => a.order - b.order); // Re-sort locally
            });

            // Server Update (Background)
            await axios.put('https://study-marrow-api.onrender.com/api/materials/reorder', 
                { updates }, 
                { headers: { 'admin-key': adminKey } }
            );
        } catch (err) {
            alert("❌ Reorder failed");
            fetchMaterials(); // Revert on error
        }
    };


    // --- HELPER: Filter materials for display ---
    const getFiles = (cat, sub) => {
        return materials.filter(m => m.category === cat && (sub ? m.subject === sub : true));
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
        <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>⚡ Admin Command Center</h1>

            {/* UPLOAD FORM */}
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>Add New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input type="text" placeholder="File Title (e.g. Real Numbers Notes)" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <select value={category} onChange={(e) => { setCategory(e.target.value); setSubject(''); setResourceType(''); setBoard(''); }} style={inputStyle}>
                            <option>Class 12 Materials</option>
                            <option>Class 10 Materials</option>
                            <option>Current Affairs</option>
                        </select>

                        {category.includes('Class') && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle}>
                                <option value="">-- Select Subject --</option>
                                {structure[category].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                            </select>
                        )}
                    </div>

                    {category.includes('Class') && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <select value={resourceType} onChange={(e) => { setResourceType(e.target.value); setBoard(''); }} style={inputStyle}>
                                <option value="">-- Select Type --</option>
                                {category === 'Class 12 Materials' ? (
                                    <>
                                        <option>NCERT Book</option>
                                        <option>NCERT Solutions</option>
                                        <option>Handwritten Notes</option>
                                        <option>Previous Year Papers</option>
                                        <option>Question Bank</option>
                                    </>
                                ) : (
                                    <>
                                        <option>NCERT Book</option>
                                        <option>NCERT solutions</option>
                                        <option>Notes</option>
                                        <option>Syllabus</option>
                                        <option>Previous Year Paper</option>
                                        <option>Question Bank</option>
                                    </>
                                )}
                            </select>

                            {/* ✅ 4. BOARD SELECTOR (Only appears for Previous Year Papers) */}
                            {(resourceType === 'Previous Year Papers' || resourceType === 'Previous Year Paper') && (
                                <select 
                                    value={board} 
                                    onChange={(e) => setBoard(e.target.value)} 
                                    required 
                                    style={{ ...inputStyle, borderColor: '#16a34a', borderWidth: '2px', backgroundColor: '#f0fdf4' }}
                                >
                                    <option value="">-- Select Board --</option>
                                    <option value="CBSE">CBSE</option>
                                    <option value="ASSEB">ASSEB</option>
                                </select>
                            )}
                        </div>
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
            
            {/* --- 📁 ORGANIZED LIBRARY VIEW --- */}
            <div>
                <h2 style={{borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px'}}>
                    📚 Manage Library Files
                </h2>

                {/* --- 1. CLASS 12 SECTION --- */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}>Class 12 Materials</h3>
                    {structure['Class 12 Materials'].map(sub => (
                        <div key={sub} style={{marginBottom: '20px', paddingLeft: '15px', borderLeft: '3px solid #bfdbfe'}}>
                            <h4 style={{margin: '10px 0', color: '#2563eb'}}>{sub}</h4>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {getFiles('Class 12 Materials', sub).length === 0 ? <small style={{color:'#999'}}>Empty</small> : 
                                 getFiles('Class 12 Materials', sub).map((f, idx, arr) => (
                                    <div key={f._id} style={miniItemStyle}>
                                        <span>
                                            {f.title} 
                                            <small style={{color:'#666', marginLeft:'5px'}}>
                                                ({f.resourceType} {f.board ? ` - ${f.board}` : ''})
                                            </small>
                                        </span>
                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                            {/* ⬆️ UP ARROW */}
                                            <button 
                                                onClick={() => handleMove(f, -1, {cat: 'Class 12 Materials', sub})} 
                                                style={{...arrowBtn, opacity: idx === 0 ? 0.3 : 1}}
                                                disabled={idx === 0}
                                            >
                                                ⬆️
                                            </button>
                                            
                                            {/* ⬇️ DOWN ARROW */}
                                            <button 
                                                onClick={() => handleMove(f, 1, {cat: 'Class 12 Materials', sub})} 
                                                style={{...arrowBtn, opacity: idx === arr.length - 1 ? 0.3 : 1}}
                                                disabled={idx === arr.length - 1}
                                            >
                                                ⬇️
                                            </button>

                                            <button onClick={() => handleEdit(f._id, f.title)} style={miniEditBtn}>✎</button>
                                            <button onClick={() => handleDelete(f._id)} style={miniDeleteBtn}>🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- 2. CLASS 10 SECTION --- */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}>Class 10 Materials</h3>
                    {structure['Class 10 Materials'].map(sub => (
                        <div key={sub} style={{marginBottom: '20px', paddingLeft: '15px', borderLeft: '3px solid #bbf7d0'}}>
                            <h4 style={{margin: '10px 0', color: '#16a34a'}}>{sub}</h4>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {getFiles('Class 10 Materials', sub).length === 0 ? <small style={{color:'#999'}}>Empty</small> : 
                                 getFiles('Class 10 Materials', sub).map((f, idx, arr) => (
                                    <div key={f._id} style={miniItemStyle}>
                                        <span>
                                            {f.title} 
                                            <small style={{color:'#666', marginLeft:'5px'}}>
                                                ({f.resourceType} {f.board ? ` - ${f.board}` : ''})
                                            </small>
                                        </span>
                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                            {/* ⬆️ UP ARROW */}
                                            <button 
                                                onClick={() => handleMove(f, -1, {cat: 'Class 10 Materials', sub})} 
                                                style={{...arrowBtn, opacity: idx === 0 ? 0.3 : 1}}
                                                disabled={idx === 0}
                                            >
                                                ⬆️
                                            </button>
                                            
                                            {/* ⬇️ DOWN ARROW */}
                                            <button 
                                                onClick={() => handleMove(f, 1, {cat: 'Class 10 Materials', sub})} 
                                                style={{...arrowBtn, opacity: idx === arr.length - 1 ? 0.3 : 1}}
                                                disabled={idx === arr.length - 1}
                                            >
                                                ⬇️
                                            </button>

                                            <button onClick={() => handleEdit(f._id, f.title)} style={miniEditBtn}>✎</button>
                                            <button onClick={() => handleDelete(f._id)} style={miniDeleteBtn}>🗑</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- 3. CURRENT AFFAIRS SECTION --- */}
                <div style={sectionStyle}>
                    <h3 style={headerStyle}>Current Affairs</h3>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {getFiles('Current Affairs').length === 0 ? <small style={{color:'#999'}}>Empty</small> : 
                            getFiles('Current Affairs').map((f, idx, arr) => (
                            <div key={f._id} style={miniItemStyle}>
                                <span>{f.title}</span>
                                <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                    {/* ⬆️ UP ARROW */}
                                    <button 
                                        onClick={() => handleMove(f, -1, {cat: 'Current Affairs', sub: null})} 
                                        style={{...arrowBtn, opacity: idx === 0 ? 0.3 : 1}}
                                        disabled={idx === 0}
                                    >
                                        ⬆️
                                    </button>
                                    
                                    {/* ⬇️ DOWN ARROW */}
                                    <button 
                                        onClick={() => handleMove(f, 1, {cat: 'Current Affairs', sub: null})} 
                                        style={{...arrowBtn, opacity: idx === arr.length - 1 ? 0.3 : 1}}
                                        disabled={idx === arr.length - 1}
                                    >
                                        ⬇️
                                    </button>
                                    <button onClick={() => handleEdit(f._id, f.title)} style={miniEditBtn}>✎</button>
                                    <button onClick={() => handleDelete(f._id)} style={miniDeleteBtn}>🗑</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

// STYLES
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };
const sectionStyle = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' };
const headerStyle = { marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#444' };
const miniItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '5px', fontSize: '0.9rem' };

const miniEditBtn = { background: '#fef08a', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const miniDeleteBtn = { background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const arrowBtn = { background: 'transparent', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', marginRight: '5px' };

export default AdminPanel;