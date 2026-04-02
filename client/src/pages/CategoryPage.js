import ReactMarkdown from 'react-markdown';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  
  // --- STATE FOR BOTH MEDIA TYPES ---
  const [materials, setMaterials] = useState([]);           
  const [currentAffairs, setCurrentAffairs] = useState([]); 
  
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
  
  // Detect Current Affairs
  const isCurrentAffairs = categoryName.includes('Current Affairs');
  const isDeepFolder = !isCurrentAffairs;
  const parentVertical = isCurrentAffairs ? 'Current Affairs' : 'School Academics';

  // --- DEFINE DATA DYNAMICALLY (For School Only) ---
  let subjects = [];
  let types = [];

  if (isClass12) {
      subjects = ['Physics', 'Chemistry', 'Biology', 'Maths'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass11) {
      subjects = ['Physics', 'Chemistry', 'Biology', 'Maths'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Question Bank']; 
  } else if (isClass10) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Syllabus', 'Previous Year Papers', 'Question Bank'];
  } else if (isClass9 || isClass8) {
      subjects = ['English', 'Mathematics', 'General Science', 'Social Science', 'Information Technology'];
      types = ['NCERT Book', 'NCERT Solutions', 'Notes', 'Question Bank'];
  }

  const isPapersFolder = selectedType === 'Previous Year Papers' || selectedType === 'Previous Year Paper';

  useEffect(() => {
    // Reset all navigation on category change
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedBoard(null);

    // FETCH SPLIT: Get the right data based on what page we are on
    if (isCurrentAffairs) {
        axios.get('https://study-marrow-api.onrender.com/api/current-affairs')
          .then(res => setCurrentAffairs(res.data))
          .catch(err => console.log("Error fetching news:", err));
    } else {
        axios.get('https://study-marrow-api.onrender.com/api/materials')
          .then(res => {
            const filtered = res.data.filter(item => item.category === categoryName);
            setMaterials(filtered.sort((a, b) => a.order - b.order));
          })
          .catch(err => console.log("Error fetching materials:", err));
    }
  }, [categoryName, isCurrentAffairs]);

  // --- 📰 FILTER CURRENT AFFAIRS (Simplified for the Magazine Layout!) ---
  const getFilteredNews = () => {
      return currentAffairs.filter(news => news.category === categoryName);
  };

  // --- 📄 FILTER SCHOOL MATERIALS (The PDF & Article Logic) ---
  const currentFiles = materials.filter(item => {
    if (selectedSubject && item.subject !== selectedSubject) return false;
    if (selectedType) {
        const itemType = (item.resourceType || '').toLowerCase();
        const targetType = selectedType.toLowerCase();
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

      {/* ================================================================= */}
      {/* 📰 CURRENT AFFAIRS VIEW (Adda247 / ExamCharcha Accordion Style)   */}
      {/* ================================================================= */}
      {isCurrentAffairs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              
              <p style={{ color: '#64748b', marginBottom: '10px' }}>
                  Stay informed with the latest {categoryName.toLowerCase()}, crucial for your competitive exam preparation.
              </p>

              {getFilteredNews().length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                      <span style={{ fontSize: '3rem' }}>🗞️</span>
                      <h3>No study guides uploaded yet.</h3>
                  </div>
              ) : (
                  getFilteredNews().map(news => (
                      <details key={news._id} style={accordionStyle}>
                          
                          {/* The Clickable Title */}
                          <summary style={accordionSummaryStyle}>
                              <span style={{ marginRight: '10px', color: '#2563eb' }}>➡️</span>
                              {news.title}
                          </summary>
                          
                          {/* The Expanded Content Area with ReactMarkdown */}
                          <div style={accordionContentStyle}>
                              
                              <ReactMarkdown>{news.content}</ReactMarkdown>
                              
                              {/* Show the PDF button ONLY if a link was manually provided */}
                              {news.pdfLink && (
                                  <div style={{ marginTop: '25px' }}>
                                      <a href={news.pdfLink} target="_blank" rel="noreferrer" style={downloadButtonStyle}>
                                          📄 View Official PDF
                                      </a>
                                  </div>
                              )}
                          </div>

                      </details>
                  ))
              )}
          </div>
      )}

      {/* ================================================================= */}
      {/* 🏫 SCHOOL ACADEMICS VIEW (PDF Deep Folders + Optional Articles)     */}
      {/* ================================================================= */}
      {!isCurrentAffairs && (
          <>
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
              {selectedSubject && !selectedType && isDeepFolder && (
                <div>
                  <button onClick={() => setSelectedSubject(null)} style={backButtonStyle}>← Back to Subjects</button>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
                    {types.map((type) => {
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
                            <p>{fileCount} Files/Articles</p>
                          </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* --- 3. FILES / ARTICLES / BOARD SELECTION --- */}
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
                        /* STANDARD FILE & ARTICLE LIST */
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {currentFiles.length === 0 ? (
                                <p style={{ color: '#666' }}>No content found here yet.</p>
                            ) : (
                                currentFiles.map((file) => (
                                <div key={file._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: file.description ? '15px' : '0' }}>
                                        <div style={{ fontSize: '1.8rem' }}>{file.description ? '✍️' : '📄'}</div>
                                        
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{file.title}</h3>
                                            <small style={{ color: '#64748b', fontWeight: 'bold' }}>
                                                {file.subject || file.category} {file.board ? ` • ${file.board}` : ''}
                                            </small>
                                        </div>
                                        
                                        {file.link && (
                                            <a href={file.link} target="_blank" rel="noreferrer" style={downloadButtonStyle}>View PDF</a>
                                        )}
                                    </div>
                                    
                                    {file.description && (
                                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                            {file.description}
                                        </div>
                                    )}
                                </div>
                                ))
                            )}
                        </div>
                     )}
                   </div>
                </div>
              )}
          </>
      )}
    </div>
  );
}

// --- SHARED STYLES ---
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'transform 0.2s' };
const backButtonStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: 0 };
const downloadButtonStyle = { textDecoration: 'none', background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

// --- 🆕 NEW ACCORDION STYLES (ExamCharcha Style) ---
const accordionStyle = { 
    background: 'white', 
    borderRadius: '8px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    overflow: 'hidden'
};
const accordionSummaryStyle = { 
    padding: '18px 20px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '1.1rem', 
    color: '#1e293b', 
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center'
};
const accordionContentStyle = { 
    padding: '25px', 
    // Removed whiteSpace: 'pre-wrap' because ReactMarkdown handles formatting naturally!
    lineHeight: '1.8', 
    color: '#334155', 
    borderTop: '1px solid #e2e8f0',
    fontSize: '1rem'
};

export default CategoryPage;