import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  const [materials, setMaterials] = useState([]);
  
  // Navigation State
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // --- SMART LOGIC ---
  const isClass12 = categoryName.includes('Class 12');
  const isClass10 = categoryName.includes('Class 10');
  const isDeepFolder = isClass12 || isClass10; // Applies to both now

  // --- DEFINE DATA FOR BOTH CLASSES ---
  let subjects = [];
  let types = [];

  if (isClass12) {
      subjects = ['Physics', 'Chemistry', 'Biology', 'Maths'];
      types = ['NCERT Solutions', 'Handwritten Notes', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass10) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT solutions', 'Notes', 'Syllabus', 'Previous Year Paper', 'Question Bank'];
  }

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedType(null);

    axios.get('https://study-marrow-api.onrender.com/api/materials')
      .then(res => {
        // Smart Filter: Match generic category OR match specific folder category
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

  // Final File Filter
  const currentFiles = materials.filter(item => {
    if (selectedSubject && item.subject !== selectedSubject) return false;
    if (selectedType && item.resourceType !== selectedType) return false;
    return true;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Breadcrumbs */}
      <div style={{ marginBottom: '20px', color: '#64748b' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#3b82f6' }}>Home</Link> 
        {' > '} 
        <span onClick={() => {setSelectedSubject(null); setSelectedType(null)}} style={{ cursor: 'pointer', color: selectedSubject ? '#3b82f6' : 'black' }}>
          {categoryName}
        </span>
        {selectedSubject && (
          <>
            {' > '}
            <span onClick={() => setSelectedType(null)} style={{ cursor: 'pointer', color: selectedType ? '#3b82f6' : 'black' }}>
              {selectedSubject}
            </span>
          </>
        )}
        {selectedType && <span>{' > '} {selectedType}</span>}
      </div>

      <h1 style={{ color: '#1e293b', marginBottom: '30px' }}>
        {selectedType ? `${selectedSubject}: ${selectedType}` : 
         selectedSubject ? `${selectedSubject} Dashboard` : 
         categoryName}
      </h1>

      {/* 1. Subjects Grid (Smart for 10 & 12) */}
      {!selectedSubject && isDeepFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {subjects.map((sub) => (
            <div 
              key={sub} 
              onClick={() => setSelectedSubject(sub)} 
              style={cardStyle}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem' }}>📚</div>
              <h3>{sub}</h3>
              <p>View Materials</p>
            </div>
          ))}
        </div>
      )}

      {/* 2. Types Grid (Smart for 10 & 12) */}
      {selectedSubject && !selectedType && (
        <div>
          <button onClick={() => setSelectedSubject(null)} style={backButtonStyle}>← Back to Subjects</button>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {types.map((type) => (
              <div 
                key={type} 
                onClick={() => setSelectedType(type)} 
                style={cardStyle}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '2.5rem' }}>📁</div>
                <h3>{type}</h3>
                <p>{materials.filter(m => m.subject === selectedSubject && m.resourceType === type).length} Files</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. File List (Shows for 10, 12, or plain categories like Current Affairs) */}
      {(selectedType || !isDeepFolder) && (
        <div>
           {isDeepFolder && (
             <button onClick={() => setSelectedType(null)} style={backButtonStyle}>← Back to Folders</button>
           )}
           
           <div style={{ marginTop: '20px', display: 'grid', gap: '15px' }}>
             {currentFiles.length === 0 ? (
               <p style={{ color: '#666' }}>No files found in this folder yet.</p>
             ) : (
               currentFiles.map((file) => (
                 <div key={file._id} style={fileCardStyle}>
                   <div style={{ fontSize: '1.5rem' }}>📄</div>
                   <div style={{ flex: 1 }}>
                     <h4 style={{ margin: 0 }}>{file.title}</h4>
                     
                     {/* Clean Label (Date Hidden) */}
                     <small style={{ color: '#64748b' }}>
                        {file.subject || file.category}
                     </small>

                   </div>
                   <a href={file.link} target="_blank" rel="noreferrer" style={downloadButtonStyle}>Download</a>
                 </div>
               ))
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