import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- LOGIN STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [token, setToken] = useState(''); // 🆕 Changed from adminKey to token

    // --- DATA STATE ---
    const [vertical, setVertical] = useState('School Academics'); 
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [board, setBoard] = useState(''); 

    const [materials, setMaterials] = useState([]); 
    const [subscribers, setSubscribers] = useState([]);

    // --- 🏗️ THE MEGA-PORTAL STRUCTURE ---
    const portalData = {
        'School Academics': {
            categories: ['Class 12 Materials', 'Class 11 Materials', 'Class 10 Materials', 'Class 9 Materials', 'Class 8 Materials'],
            subjects: {
                'Class 12 Materials': ['Physics', 'Chemistry', 'Maths', 'Biology'],
                'Class 11 Materials': ['Physics', 'Chemistry', 'Maths', 'Biology'],
                'Class 10 Materials': ['Mathematics', 'General Science', 'Social Science', 'English', 'Information Technology'],
                'Class 9 Materials':  ['Mathematics', 'General Science', 'Social Science', 'English', 'Information Technology'],
                'Class 8 Materials':  ['Mathematics', 'General Science', 'Social Science', 'English', 'Information Technology']
            },
            types: ['NCERT Book', 'NCERT Solutions', 'Notes', 'Syllabus', 'Previous Year Papers', 'Question Bank']
        },
        'Current Affairs': {
            categories: ['Weekly Current Affairs', 'Monthly Current Affairs', 'Specific Event Current Affairs']
        },
        'Job Exam Preparation': {
            categories: ['Under Progress']
        }
    };

    // --- LOGIN HANDLER ---
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('https://study-marrow-api.onrender.com/api/verify-admin', {}, {
                headers: { 'admin-key': passwordInput } // Initial login still uses password
            });
            
            // 🆕 Catch the secure JWT Token and save it!
            const receivedToken = res.data.token;
            setToken(receivedToken);
            setIsAuthenticated(true);
            fetchData(receivedToken);
        } catch (err) { alert("❌ Wrong Password! Access Denied."); }
    };

    const fetchData = (currentToken) => { fetchMaterials(); fetchSubscribers(currentToken); };
    
    const fetchMaterials = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/materials');
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };
    
    const fetchSubscribers = async (currentToken) => {
        try {
            // 🆕 Send the Bearer Token to fetch private data
            const res = await axios.get('https://study-marrow-api.onrender.com/api/subscribe', { 
                headers: { Authorization: `Bearer ${currentToken}` } 
            });
            setSubscribers(res.data);
        } catch (err) { console.error("Error fetching subscribers"); }
    };

    // --- UPLOAD HANDLER ---
    const handleUpload = async (e) => {
        e.preventDefault();
        
        let finalSubject = subject;
        let finalType = resourceType;

        if (vertical === 'Job Exam Preparation') {
            return alert("⚠️ This section is under progress.");
        }

        if (vertical === 'Current Affairs') {
            if (!category || !title || !link) return alert("Please fill Title, Category, and Link!");
            finalSubject = ''; 
            finalType = 'Current Affairs'; 
        } else {
            if (!category || !subject || !resourceType || !title || !link) return alert("Please fill all dropdowns!");
            if (resourceType.includes('Papers') && !board) return alert("⚠️ Please select a Board (CBSE or ASSEB)!");
        }

        const materialData = { vertical, category, subject: finalSubject, resourceType: finalType, link, board, title };

        try {
            // 🆕 Send Bearer Token to authorize upload
            await axios.post('https://study-marrow-api.onrender.com/api/upload', materialData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Link Added Successfully!');
            setTitle(''); setLink(''); setBoard(''); 
            fetchMaterials(); 
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.message || "Server Error"));
        }
    };

    // --- EDIT & DELETE HANDLERS ---
    const handleEdit = async (id, currentTitle) => {
        const newTitle = window.prompt("Enter the new file name:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return; 
        try {
            // 🆕 Send Bearer Token to authorize edit
            await axios.put(`https://study-marrow-api.onrender.com/api/materials/${id}`, { title: newTitle }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchMaterials(); 
        } catch (err) { alert("❌ Update failed."); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this file?")) return;
        try {
            // 🆕 Send Bearer Token to authorize delete
            await axios.delete(`https://study-marrow-api.onrender.com/api/materials/${id}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchMaterials();
        } catch (err) { alert("Error deleting"); }
    };

    // --- REORDER LOGIC ---
    const handleMove = async (fileToMove, direction, config) => {
        const currentList = materials.filter(m => 
            (m.vertical === config.vert || (!m.vertical && config.vert === 'School Academics')) && 
            m.category === config.cat && 
            (!config.sub || m.subject === config.sub)
        );

        const index = currentList.findIndex(m => m._id === fileToMove._id);
        if (index === -1) return;

        const newIndex = index + direction;
        if (newIndex < 0 || newIndex >= currentList.length) return; 

        const temp = currentList[index];
        currentList[index] = currentList[newIndex];
        currentList[newIndex] = temp;

        const updates = currentList.map((item, idx) => ({ id: item._id, order: idx }));

        try {
            setMaterials(prev => {
                const updated = [...prev];
                updates.forEach(u => {
                   const found = updated.find(m => m._id === u.id);
                   if (found) found.order = u.order;
                });
                return updated.sort((a, b) => a.order - b.order);
            });
            // 🆕 Send Bearer Token to authorize reorder
            await axios.put('https://study-marrow-api.onrender.com/api/materials/reorder', { updates }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
        } catch (err) { alert("❌ Reorder failed"); fetchMaterials(); }
    };

    // --- HELPER: Filter materials ---
    const getFiles = (vert, cat, sub) => {
        return materials.filter(m => 
            (m.vertical === vert || (!m.vertical && vert === 'School Academics')) && 
            m.category === cat && 
            (sub ? m.subject === sub : true)
        );
    };

    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' }}>
                <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>🔐 Admin Access</h2>
                    <input type="password" placeholder="Enter Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={inputStyle} />
                    <button type="submit" style={buttonStyle}>Unlock Panel</button>
                </form>
            </div>
        );
    }

    // --- DASHBOARD ---
    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#1e293b' }}>⚡ Mega-Portal Command Center</h1>

            {/* UPLOAD FORM */}
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>Add New Material</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input type="text" placeholder="File Title (e.g. Chapter 1 Notes or March PDF)" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                    
                    {/* 1. VERTICAL SELECTOR */}
                    <select 
                        value={vertical} 
                        onChange={(e) => { setVertical(e.target.value); setCategory(''); setSubject(''); setResourceType(''); setBoard(''); }} 
                        style={{...inputStyle, background: '#eff6ff', fontWeight: 'bold', borderColor: '#bfdbfe'}}
                    >
                        {Object.keys(portalData).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: vertical === 'Current Affairs' ? '1fr' : '1fr 1fr', gap: '15px' }}>
                        {/* 2. CATEGORY SELECTOR */}
                        <select 
                            value={category} 
                            onChange={(e) => { setCategory(e.target.value); setSubject(''); }} 
                            style={inputStyle} disabled={!vertical}
                        >
                            <option value="">-- Select Category --</option>
                            {vertical && portalData[vertical].categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {/* 3. SUBJECT SELECTOR (Hidden for Current Affairs) */}
                        {vertical === 'School Academics' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} disabled={!category}>
                                <option value="">-- Select Subject --</option>
                                {category && portalData[vertical].subjects[category]?.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        )}
                    </div>

                    {/* 4. RESOURCE TYPE & BOARD (Hidden for Current Affairs) */}
                    {vertical === 'School Academics' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <select value={resourceType} onChange={(e) => { setResourceType(e.target.value); setBoard(''); }} style={inputStyle} disabled={!vertical}>
                                <option value="">-- Select Type --</option>
                                {vertical && portalData[vertical].types.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>

                            {(resourceType === 'Previous Year Papers' || resourceType === 'Previous Year Paper') && (
                                <select value={board} onChange={(e) => setBoard(e.target.value)} required style={{ ...inputStyle, borderColor: '#16a34a', borderWidth: '2px', backgroundColor: '#f0fdf4' }}>
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
            
            {/* --- 📁 MEGA LIBRARY OVERVIEW --- */}
            <div>
                <h2 style={{borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px'}}>
                    📚 Manage Library Files
                </h2>

                {/* DYNAMICALLY RENDER VERTICALS */}
                {['School Academics', 'Current Affairs'].map(vert => (
                    <div key={vert} style={sectionStyle}>
                        <h2 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            {vert === 'School Academics' ? '🏫' : '🌍'} {vert}
                        </h2>
                        
                        {portalData[vert].categories.map(cat => (
                            <div key={cat} style={{ marginBottom: '20px', paddingLeft: '15px', borderLeft: vert === 'School Academics' && (cat.includes('12') || cat.includes('11')) ? '3px solid #bfdbfe' : '3px solid #bbf7d0'}}>
                                <h3 style={{margin: '15px 0 10px 0', color: '#334155'}}>{cat}</h3>
                                
                                {/* IF CURRENT AFFAIRS: Show Direct Files */}
                                {vert === 'Current Affairs' ? (
                                    <div style={{ marginLeft: '10px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {getFiles(vert, cat, null).length === 0 ? <small style={{color:'#94a3b8'}}>No files yet.</small> : 
                                                getFiles(vert, cat, null).map((f, idx, arr) => (
                                                <div key={f._id} style={miniItemStyle}>
                                                    <span>{f.title}</span>
                                                    <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                                        <button onClick={() => handleMove(f, -1, {vert, cat, sub: null})} style={{...arrowBtn, opacity: idx === 0 ? 0.3 : 1}} disabled={idx === 0}>⬆️</button>
                                                        <button onClick={() => handleMove(f, 1, {vert, cat, sub: null})} style={{...arrowBtn, opacity: idx === arr.length - 1 ? 0.3 : 1}} disabled={idx === arr.length - 1}>⬇️</button>
                                                        <button onClick={() => handleEdit(f._id, f.title)} style={miniEditBtn}>✎</button>
                                                        <button onClick={() => handleDelete(f._id)} style={miniDeleteBtn}>🗑</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* IF SCHOOL ACADEMICS: Show Subjects first */
                                    portalData[vert].subjects[cat].map(sub => (
                                        <div key={sub} style={{ marginLeft: '10px', marginBottom: '15px' }}>
                                            <h4 style={{ margin: '5px 0', color: '#64748b' }}>{sub}</h4>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                {getFiles(vert, cat, sub).length === 0 ? <small style={{color:'#94a3b8'}}>No files yet.</small> : 
                                                 getFiles(vert, cat, sub).map((f, idx, arr) => (
                                                    <div key={f._id} style={miniItemStyle}>
                                                        <span>
                                                            {f.title} 
                                                            <small style={{color:'#94a3b8', marginLeft:'5px'}}>
                                                                ({f.resourceType} {f.board ? ` - ${f.board}` : ''})
                                                            </small>
                                                        </span>
                                                        <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                                                            <button onClick={() => handleMove(f, -1, {vert, cat, sub})} style={{...arrowBtn, opacity: idx === 0 ? 0.3 : 1}} disabled={idx === 0}>⬆️</button>
                                                            <button onClick={() => handleMove(f, 1, {vert, cat, sub})} style={{...arrowBtn, opacity: idx === arr.length - 1 ? 0.3 : 1}} disabled={idx === arr.length - 1}>⬇️</button>
                                                            <button onClick={() => handleEdit(f._id, f.title)} style={miniEditBtn}>✎</button>
                                                            <button onClick={() => handleDelete(f._id)} style={miniDeleteBtn}>🗑</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ))}
                    </div>
                ))}

                <div style={{...sectionStyle, opacity: 0.5}}>
                    <h2 style={{ marginTop: 0, color: '#64748b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🏢 Job Exam Preparation</h2>
                    <p style={{fontStyle: 'italic', color: '#94a3b8'}}>Under Progress...</p>
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
const miniItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '5px', fontSize: '0.9rem', border: '1px solid #e2e8f0' };
const miniEditBtn = { background: '#fef08a', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const miniDeleteBtn = { background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const arrowBtn = { background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', marginRight: '5px' };

export default AdminPanel;