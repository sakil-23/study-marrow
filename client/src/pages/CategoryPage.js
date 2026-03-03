import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  const [materials, setMaterials] = useState([]);
  
  // --- NAVIGATION STATE ---
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null); 

  // --- SMART LOGIC FOR CLASSES & VERTICALS ---
  const isClass12 = categoryName.includes('Class 12');
  const isClass11 = categoryName.includes('Class 11');
  const isClass10 = categoryName.includes('Class 10');
  const isClass9  = categoryName.includes('Class 9');
  const isClass8  = categoryName.includes('Class 8');
  
  const isCurrentAffairs = categoryName.includes('Current Affairs');

  const isDeepFolder = !isCurrentAffairs;
  const parentVertical = isCurrentAffairs ? 'Current Affairs' : 'School Academics';

  // --- DEFINE DATA DYNAMICALLY (Unified to match Admin Panel perfectly) ---
  let subjects = [];
  let types = [];

  if (isClass12 || isClass11) {
      subjects = ['Physics', 'Chemistry', 'Biology', 'Maths'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass10) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Syllabus', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass9 || isClass8) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Question Bank'];
  }

  const isPapersFolder = selectedType === 'Previous Year Papers';

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedBoard(null);

    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => {
        const filtered = res.data.filter(item => item.category === categoryName);
        setMaterials(filtered.sort((a, b) => a.order - b.order));
      })
      .catch(err => console.log(err));
  }, [categoryName]);

  // --- FINAL FILE FILTER (Upgraded to be Smart & Case-Insensitive) ---
  const currentFiles = materials.filter(item => {
    if (isCurrentAffairs) return true; 
    
    if (selectedSubject && item.subject !== selectedSubject) return false;
    
    if (selectedType) {
        // Force both strings to lowercase to prevent uppercase/lowercase bugs
        const itemType = (item.resourceType || '').toLowerCase();
        const targetType = selectedType.toLowerCase();
        
        // Handles exact matches AND keeps your older uploads visible!
        const isMatch = itemType === targetType || 
                        (targetType === 'notes' && itemType === 'handwritten notes') ||
                        (targetType === 'previous year papers' && itemType === 'previous year paper');
        
        if (!isMatch) return false;
    }
    
    if (isPapersFolder && selectedBoard && item.board !== selectedBoard) return false;
    return true;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* --- BREADCRUMBS --- */}
      <div style={{ marginBottom: '20px', color: '#64748b' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6' }}>Home</Link> 
        {' > '} 
        <Link to="/" state={{ selectedVertical: parentVertical }} style={{ textDecoration: 'none', color: '#3b82f6' }}>
            {parentVertical}
        </Link>
        {' > '} 
        <span onClick={() => {setSelectedSubject(null); setSelectedType(null); setSelectedBoard(null)}} style={{ cursor: 'pointer', color: selectedSubject ? '#3b82f6' : 'black' }}>
          {categoryName.replace(' Materials', '')}
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
         categoryName.replace(' Materials', '')}
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

      {/* --- 2. TYPES GRID (Fixed to accurately count matching items) --- */}
      {selectedSubject && !selectedType && isDeepFolder && (
        <div>
          <button onClick={() => setSelectedSubject(null)} style={backButtonStyle}>← Back to Subjects</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {types.map((type) => {
              // Smart counter to match the new filter logic
              const fileCount = materials.filter(m => {
                  if (m.subject !== selectedSubject) return false;
                  const iType = (m.resourceType || '').toLowerCase();
                  const tType = type.toLowerCase();
                  return iType === tType || 
                         (tType === 'notes' && iType === 'handwritten notes') ||
                         (tType === 'previous year papers' && iType === 'previous year paper');
              }).length;

              return (
                  <div key={type} onClick={() => setSelectedType(type)} style={cardStyle}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '2.5rem' }}>📁</div>
                    <h3>{type}</h3>
                    <p>{fileCount} Files</p>
                  </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- 3. FILES / BOARD SELECTION --- */}
      {(selectedType || !isDeepFolder) && (
        <div>
           {isDeepFolder && (
             <button onClick={() => {
                 if(selectedBoard) setSelectedBoard(null); 
                 else setSelectedType(null); 
             }} style={backButtonStyle}>
                {selectedBoard ? `← Back to ${selectedType}` : '← Back to Folders'}
             </button>
           )}
           
           <div style={{ marginTop: '20px' }}>
             
             {/* BOARD SELECTION GRID */}
             {isPapersFolder && !selectedBoard ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div onClick={() => setSelectedBoard('CBSE')} style={cardStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏛️</div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>CBSE</h3>
                        <p style={{ color: '#64748b' }}>Central Board</p>
                    </div>

                    <div onClick={() => setSelectedBoard('ASSEB')} style={cardStyle}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🏫</div>
                        <h3 style={{ margin: 0, color: '#1e293b' }}>ASSEB</h3>
                        <p style={{ color: '#64748b' }}>Assam State Board</p>
                    </div>
                </div>
             ) : (
                /* STANDARD FILE LIST */
                <div style={{ display: 'grid', gap: '15px' }}>
                    {currentFiles.length === 0 ? (
                        <p style={{ color: '#666' }}>No files found here yet.</p>
                    ) : (
                        currentFiles.map((file) => (
                        <div key={file._id} style={fileCardStyle}>
                            <div style={{ fontSize: '1.5rem' }}>{isCurrentAffairs ? '📰' : '📄'}</div>
                            <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0 }}>{file.title}</h4>
                            
                            {!isCurrentAffairs && (
                                <small style={{ color: '#64748b' }}>
                                    {file.subject || file.category}
                                    {file.board ? ` • ${file.board}` : ''}
                                </small>
                            )}
                            </div>
                            <a href={file.link} target="_blank" rel="noreferrer" style={downloadButtonStyle}>View / Download</a>
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