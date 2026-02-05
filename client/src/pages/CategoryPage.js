import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  const [materials, setMaterials] = useState([]);
  
  // --- NAVIGATION STATE ---
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null); // ✅ NEW: Tracks CBSE/ASSEB

  // --- SMART LOGIC ---
  const isClass12 = categoryName.includes('Class 12');
  const isClass10 = categoryName.includes('Class 10');
  const isDeepFolder = isClass12 || isClass10;

  // --- DEFINE DATA FOR BOTH CLASSES ---
  let subjects = [];
  let types = [];

  if (isClass12) {
      subjects = ['Physics', 'Chemistry', 'Biology', 'Maths'];
      types = ['NCERT Book', 'NCERT Solutions', 'Handwritten Notes', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass10) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT Book', 'NCERT solutions', 'Notes', 'Syllabus', 'Previous Year Paper', 'Question Bank'];
  }

  // ✅ HELPER: Check if current folder is for Papers
  const isPapersFolder = selectedType === 'Previous Year Papers' || selectedType === 'Previous Year Paper';

  useEffect(() => {
    // Reset all navigation on category change
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedBoard(null);

    console.log("Category Page Loaded: " + categoryName);

    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => {
        const filtered = res.data.filter(item => {
            if (item.category === categoryName) return true;
            if (isClass12 && item.category === 'Class 12 Materials') return true;
            if (isClass10 && item.category === 'Class 10 Materials') return true;
            return false;
        });
        setMaterials(filtered);
      })
      .catch(err => console.log(err));
  }, [categoryName, isClass12, isClass10]);

  // --- FINAL FILE FILTER ---
  const currentFiles = materials.filter(item => {
    // 1. Filter by Subject
    if (selectedSubject && item.subject !== selectedSubject) return false;
    // 2. Filter by Type
    if (selectedType && item.resourceType !== selectedType) return false;
    // 3. ✅ Filter by Board (Only if we are in Papers folder and a board is selected)
    if (isPapersFolder && selectedBoard && item.board !== selectedBoard) return false;
    
    return true;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* --- BREADCRUMBS --- */}
      <div style={{ marginBottom: '20px', color: '#64748b' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6' }}>Home</Link> 
        {' > '} 
        <span onClick={() => {setSelectedSubject(null); setSelectedType(null); setSelectedBoard(null)}} style={{ cursor: 'pointer', color: selectedSubject ? '#3b82f6' : 'black' }}>
          {categoryName}
        </span>
        {selectedSubject && (
          <>
            {' > '}
            <span onClick={() => {setSelectedType(null); setSelectedBoard(null)}} style={{ cursor: 'pointer', color: selectedType ? '#3b82f6' : 'black' }}>
              {selectedSubject}
            </span>
          </>
        )}
        {selectedType && (
            <>
             {' > '} 
             <span onClick={() => setSelectedBoard(null)} style={{ cursor: 'pointer', color: selectedBoard ? '#3b82f6' : 'black' }}>
                {selectedType}
             </span>
            </>
        )}
        {selectedBoard && <span>{' > '} {selectedBoard}</span>}
      </div>

      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>
        {selectedBoard ? `${selectedSubject}: ${selectedBoard} Papers` :
         selectedType ? `${selectedSubject}: ${selectedType}` : 
         selectedSubject ? `${selectedSubject} Dashboard` : 
         categoryName}
      </h1>

      {/* --- 1. SUBJECTS GRID --- */}
      {!selectedSubject && isDeepFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {subjects.map((sub) => (
            <div key={sub} onClick={() => setSelectedSubject(sub)} style={cardStyle}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <h3>{sub}</h3>
              <p>View Materials</p>
            </div>
          ))}
        </div>
      )}

      {/* --- 2. TYPES GRID --- */}
      {selectedSubject && !selectedType && (
        <div>
          <button onClick={() => setSelectedSubject(null)} style={backButtonStyle}>← Back to Subjects</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {types.map((type) => (
              <div key={type} onClick={() => setSelectedType(type)} style={cardStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '2.5rem' }}>📁</div>
                <h3>{type}</h3>
                <p>{materials.filter(m => m.subject === selectedSubject && m.resourceType === type).length} Files</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- 3. FILES (OR BOARD SELECTION) --- */}
      {(selectedType || !isDeepFolder) && (
        <div>
           {/* Back Button Logic */}
           {isDeepFolder && (
             <button onClick={() => {
                 if(selectedBoard) setSelectedBoard(null); // Go back to Board selection
                 else setSelectedType(null); // Go back to Types
             }} style={backButtonStyle}>
                {selectedBoard ? `← Back to ${selectedType}` : '← Back to Folders'}
             </button>
           )}
           
           <div style={{ marginTop: '20px' }}>
             
             {/* ✅ NEW: BOARD SELECTION GRID (Only if Papers folder & No board selected) */}
             {isPapersFolder && !selectedBoard ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    
                    {/* CBSE Card */}
                    <div onClick={() => setSelectedBoard('CBSE')} style={cardStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏛️</div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>CBSE</h3>
                        <p style={{ color: '#64748b' }}>Central Board</p>
                    </div>

                    {/* ASSEB Card */}
                    <div onClick={() => setSelectedBoard('ASSEB')} style={cardStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏫</div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>ASSEB</h3>
                        <p style={{ color: '#64748b' }}>Assam State Board</p>
                    </div>
                </div>
             ) : (
                /* ✅ STANDARD FILE LIST */
                <div style={{ display: 'grid', gap: '15px' }}>
                    {currentFiles.length === 0 ? (
                        <p style={{ color: '#666' }}>No files found here yet.</p>
                    ) : (
                        currentFiles.map((file) => (
                        <div key={file._id} style={fileCardStyle}>
                            <div style={{ fontSize: '1.5rem' }}>📄</div>
                            <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{file.title}</h4>
                            <small style={{ color: '#64748b' }}>
                                {file.subject || file.category}
                                {file.board ? ` • ${file.board}` : ''}
                            </small>
                            </div>
                            <a href={file.link} target="_blank" rel="noreferrer" style={downloadButtonStyle}>Download</a>
                        </div>
                        ))
                    )}
                </div>
             )}
           </div>
        </div>
      )}

    </div>
  );
}

// Styles
const cardStyle = { 
  background: 'white', 
  padding: '30px', 
  borderRadius: '15px', 
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
  textAlign: 'center', 
  cursor: 'pointer', 
  border: '1px solid #e2e8f0', 
  transition: 'transform 0.2s'
};

const fileCardStyle = { display: 'flex', alignItems: 'center', gap: '15px', background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const backButtonStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: 0 };
const downloadButtonStyle = { textDecoration: 'none', background: '#3b82f6', color: 'white', padding: '8px 15px', borderRadius: '5px', fontSize: '0.9rem' };

export default CategoryPage;