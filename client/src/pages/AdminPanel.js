import React, { useState } from 'react';
import axios from 'axios';

function AdminPanel() {
    // --- LOGIN STATE ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [token, setToken] = useState(''); 

    // --- DATA STATE (Materials) ---
    const [vertical, setVertical] = useState('School Academics'); 
    const [link, setLink] = useState('');
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [resourceType, setResourceType] = useState('');
    const [board, setBoard] = useState(''); 
    const [materials, setMaterials] = useState([]); 
    const [subscribers, setSubscribers] = useState([]);

    // 🆕 --- DATA STATE (Current Affairs Text Feed) ---
    const [currentAffairs, setCurrentAffairs] = useState([]);
    const [caTopic, setCaTopic] = useState('National');
    const [caHeadline, setCaHeadline] = useState('');
    const [caSummary, setCaSummary] = useState('');
    const [caIsEvent, setCaIsEvent] = useState(false);
    const [caEventName, setCaEventName] = useState('');

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
                headers: { 'admin-key': passwordInput } 
            });
            const receivedToken = res.data.token;
            setToken(receivedToken);
            setIsAuthenticated(true);
            fetchData(receivedToken);
        } catch (err) { alert("❌ Wrong Password! Access Denied."); }
    };

    const fetchData = (currentToken) => { 
        fetchMaterials(); 
        fetchSubscribers(currentToken); 
        fetchCurrentAffairs(); // 🆕 Fetch the news feed!
    };
    
    const fetchMaterials = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/materials');
            setMaterials(res.data);
        } catch (err) { console.error(err); }
    };
    
    const fetchSubscribers = async (currentToken) => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/subscribe', { 
                headers: { Authorization: `Bearer ${currentToken}` } 
            });
            setSubscribers(res.data);
        } catch (err) { console.error("Error fetching subscribers"); }
    };

    // 🆕 FETCH CURRENT AFFAIRS TEXT DATA
    const fetchCurrentAffairs = async () => {
        try {
            const res = await axios.get('https://study-marrow-api.onrender.com/api/current-affairs');
            setCurrentAffairs(res.data);
        } catch (err) { console.error("Error fetching current affairs", err); }
    };

    // --- UPLOAD HANDLER (PDFs/Links) ---
    const handleUpload = async (e) => {
        e.preventDefault();
        let finalSubject = subject;
        let finalType = resourceType;

        if (vertical === 'Job Exam Preparation') return alert("⚠️ This section is under progress.");
        if (vertical === 'Current Affairs') {
            if (!category || !title || !link) return alert("Please fill Title, Category, and Link!");
            finalSubject = ''; finalType = 'Current Affairs'; 
        } else {
            if (!category || !subject || !resourceType || !title || !link) return alert("Please fill all dropdowns!");
            if (resourceType.includes('Papers') && !board) return alert("⚠️ Please select a Board!");
        }

        const materialData = { vertical, category, subject: finalSubject, resourceType: finalType, link, board, title };
        try {
            await axios.post('https://study-marrow-api.onrender.com/api/upload', materialData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('✅ Link Added Successfully!');
            setTitle(''); setLink(''); setBoard(''); 
            fetchMaterials(); 
        } catch (err) { alert('Upload failed'); }
    };

    // 🆕 --- POST NEW CURRENT AFFAIR ONE-LINER ---
    const handleAddCurrentAffair = async (e) => {
        e.preventDefault();
        if (!caHeadline || !caSummary) return alert("Headline and Summary are required!");
        if (caIsEvent && !caEventName) return alert("Please enter the specific event name!");

        try {
            await axios.post('https://study-marrow-api.onrender.com/api/current-affairs', {
                topic: caTopic,
                headline: caHeadline,
                summary: caSummary,
                isSpecificEvent: caIsEvent,
                eventName: caEventName
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            alert("📰 News One-Liner Published!");
            setCaHeadline(''); setCaSummary(''); setCaEventName(''); setCaIsEvent(false);
            fetchCurrentAffairs(); // Refresh the list below
        } catch (err) { alert("Failed to publish news."); }
    };

    const handleDeleteCA = async (id) => {
        if (!window.confirm("Delete this news update?")) return;
        try {
            await axios.delete(`https://study-marrow-api.onrender.com/api/current-affairs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCurrentAffairs();
        } catch (err) { alert("Error deleting news"); }
    };

    // --- EDIT & DELETE HANDLERS (Materials) ---
    const handleEdit = async (id, currentTitle) => {
        const newTitle = window.prompt("Enter the new file name:", currentTitle);
        if (!newTitle || newTitle === currentTitle) return; 
        try {
            await axios.put(`https://study-marrow-api.onrender.com/api/materials/${id}`, { title: newTitle }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            fetchMaterials(); 
        } catch (err) { alert("❌ Update failed."); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this file?")) return;
        try {
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
            m.category === config.cat && (!config.sub || m.subject === config.sub)
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
            await axios.put('https://study-marrow-api.onrender.com/api/materials/reorder', { updates }, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
        } catch (err) { alert("❌ Reorder failed"); fetchMaterials(); }
    };

    const getFiles = (vert, cat, sub) => {
        return materials.filter(m => 
            (m.vertical === vert || (!m.vertical && vert === 'School Academics')) && 
            m.category === cat && (sub ? m.subject === sub : true)
        );
    };

    // --- LOGIN SCREEN ---
    if (!isAuthenticated) {
        return (
            <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9' }}>
                <form onSubmit={handleLogin} style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
                    <h2 style={{ color: '#333', marginBottom: '20px' }}>🔐 Admin Access</h2>
                    <input type="password" placeholder="Enter Password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={inputStyle} />
                    <button type="submit" style={{...buttonStyle, width: '100%', marginTop: '15px'}}>Unlock Panel</button>
                </form>
            </div>
        );
    }

    // --- DASHBOARD ---
    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#1e293b' }}>⚡ Mega-Portal Command Center</h1>

            {/* 1. PDF / LINK UPLOAD FORM */}
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#2563eb', marginBottom: '20px' }}>📁 Upload PDF/Material Link</h2>
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <input type="text" placeholder="File Title (e.g. Chapter 1 Notes)" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} />
                    
                    <select value={vertical} onChange={(e) => { setVertical(e.target.value); setCategory(''); setSubject(''); setResourceType(''); setBoard(''); }} style={{...inputStyle, background: '#eff6ff', fontWeight: 'bold', borderColor: '#bfdbfe'}}>
                        {Object.keys(portalData).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>

                    <div style={{ display: 'grid', gridTemplateColumns: vertical === 'Current Affairs' ? '1fr' : '1fr 1fr', gap: '15px' }}>
                        <select value={category} onChange={(e) => { setCategory(e.target.value); setSubject(''); }} style={inputStyle} disabled={!vertical}>
                            <option value="">-- Select Category --</option>
                            {vertical && portalData[vertical].categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        {vertical === 'School Academics' && (
                            <select value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} disabled={!category}>
                                <option value="">-- Select Subject --</option>
                                {category && portalData[vertical].subjects[category]?.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        )}
                    </div>

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

            {/* 🆕 2. DAILY NEWS TEXT FORM */}
            <div style={{ background: '#fdf4ff', padding: '25px', borderRadius: '12px', marginBottom: '30px', border: '1px solid #fbcfe8', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h2 style={{ marginTop: 0, color: '#d946ef', marginBottom: '20px' }}>📰 Post Daily News One-Liner</h2>
                <form onSubmit={handleAddCurrentAffair} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <select value={caTopic} onChange={(e) => setCaTopic(e.target.value)} style={{...inputStyle, flex: 1}}>
                            <option value="National">National</option>
                            <option value="Assam">Assam</option>
                            <option value="International">International</option>
                            <option value="Sports">Sports</option>
                            <option value="Appointments">Appointments</option>
                            <option value="Other">Other</option>
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '0 15px', borderRadius: '6px', border: '1px solid #ccc' }}>
                            <input type="checkbox" id="caEvent" checked={caIsEvent} onChange={(e) => setCaIsEvent(e.target.checked)} />
                            <label htmlFor="caEvent" style={{ fontSize: '0.9rem', color: '#475569', cursor: 'pointer' }}>Specific Event?</label>
                        </div>
                    </div>

                    {caIsEvent && (
                        <input type="text" placeholder="Event Name (e.g. Union Budget 2026)" value={caEventName} onChange={(e) => setCaEventName(e.target.value)} style={{...inputStyle, borderColor: '#d946ef', background: 'white'}} required />
                    )}

                    <input type="text" placeholder="Headline (e.g. RBI Keeps Repo Rate Unchanged)" value={caHeadline} onChange={(e) => setCaHeadline(e.target.value)} required style={inputStyle} />
                    
                    <textarea placeholder="Short Summary / Bullet Points..." value={caSummary} onChange={(e) => setCaSummary(e.target.value)} required style={{...inputStyle, height: '100px', resize: 'vertical'}} />
                    
                    <button type="submit" style={{...buttonStyle, background: '#d946ef'}}>Post News</button>
                </form>
            </div>

            {/* 🆕 3. CURRENT AFFAIRS DATABASE VIEW */}
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '30px' }}>
                <h3 style={{ marginTop: 0, color: '#d946ef', borderBottom: '2px solid #d946ef', paddingBottom: '10px' }}>
                    🗞️ Recent News Posts ({currentAffairs.length})
                </h3>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    {currentAffairs.length === 0 ? <p>No news posted yet.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {currentAffairs.map(ca => (
                                <div key={ca._id} style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <span style={{ fontSize: '0.8rem', background: '#e0e7ff', color: '#3730a3', padding: '2px 6px', borderRadius: '4px', marginRight: '8px' }}>{ca.topic}</span>
                                            {ca.isSpecificEvent && <span style={{ fontSize: '0.8rem', background: '#fce7f3', color: '#be185d', padding: '2px 6px', borderRadius: '4px' }}>{ca.eventName}</span>}
                                            <h4 style={{ margin: '5px 0 2px 0', color: '#1e293b' }}>{ca.headline}</h4>
                                            <small style={{ color: '#64748b' }}>{new Date(ca.date).toLocaleDateString()}</small>
                                        </div>
                                        <button onClick={() => handleDeleteCA(ca._id)} style={miniDeleteBtn}>🗑</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* 4. SUBSCRIBER LIST */}
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
                <h2 style={{borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px'}}>📚 Manage Library Files (PDFs)</h2>
                {['School Academics', 'Current Affairs'].map(vert => (
                    <div key={vert} style={sectionStyle}>
                        <h2 style={{ marginTop: 0, color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
                            {vert === 'School Academics' ? '🏫' : '🌍'} {vert}
                        </h2>
                        
                        {portalData[vert].categories.map(cat => (
                            <div key={cat} style={{ marginBottom: '20px', paddingLeft: '15px', borderLeft: vert === 'School Academics' && (cat.includes('12') || cat.includes('11')) ? '3px solid #bfdbfe' : '3px solid #bbf7d0'}}>
                                <h3 style={{margin: '15px 0 10px 0', color: '#334155'}}>{cat}</h3>
                                
                                {vert === 'Current Affairs' ? (
                                    <div style={{ marginLeft: '10px', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {getFiles(vert, cat, null).length === 0 ? <small style={{color:'#94a3b8'}}>No PDF files yet.</small> : 
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
                                    portalData[vert].subjects[cat].map(sub => (
                                        <div key={sub} style={{ marginLeft: '10px', marginBottom: '15px' }}>
                                            <h4 style={{ margin: '5px 0', color: '#64748b' }}>{sub}</h4>
                                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                                {getFiles(vert, cat, sub).length === 0 ? <small style={{color:'#94a3b8'}}>No files yet.</small> : 
                                                 getFiles(vert, cat, sub).map((f, idx, arr) => (
                                                    <div key={f._id} style={miniItemStyle}>
                                                        <span>
                                                            {f.title} 
                                                            <small style={{color:'#94a3b8', marginLeft:'5px'}}>({f.resourceType} {f.board ? ` - ${f.board}` : ''})</small>
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
            </div>
        </div>
    );
}

// STYLES
const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };
const buttonStyle = { padding: '12px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', width: '100%' };
const sectionStyle = { background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' };
const miniItemStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: '#f8f9fa', borderRadius: '5px', fontSize: '0.9rem', border: '1px solid #e2e8f0' };
const miniEditBtn = { background: '#fef08a', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const miniDeleteBtn = { background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '5px 10px', borderRadius: '4px' };
const arrowBtn = { background: 'white', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', padding: '2px 6px', marginRight: '5px' };

export default AdminPanel;