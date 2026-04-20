import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  
  // --- STATE FOR BOTH MEDIA TYPES ---
  const [materials, setMaterials] = useState([]);           
  const [currentAffairs, setCurrentAffairs] = useState([]); 
  
  // 🚀 NEW: State for the Seamless HTML iFrame Embed
  const [activeIframeUrl, setActiveIframeUrl] = useState(null);
  
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
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedBoard(null);

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

 const getFilteredNews = () => {
      return currentAffairs
          .filter(news => news.category === categoryName)
          .sort((a, b) => (a.order || 0) - (b.order || 0)); 
  };

  const groupedNews = getFilteredNews().reduce((groups, news) => {
      let groupName = news.groupName; 
      if (!groupName || groupName.trim() === "") {
          const monthYearMatch = news.title.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{4}/i);
          groupName = monthYearMatch ? monthYearMatch[0] : "General Updates";
      }
      if (!groups[groupName]) {
          groups[groupName] = [];
      }
      groups[groupName].push(news);
      return groups;
  }, {});

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

  const cleanMarkdown = (text) => {
      if (!text) return "";
      let cleaned = text;
      cleaned = cleaned.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
          const up = p1.toUpperCase();
          if (up.includes('POLITY') || up.includes('ECONOMY') || up.includes('INTERNATIONAL') || up.includes('SCIENCE') || up.includes('AWARDS') || up.includes('ASSAM')) {
              return `### ${p1.replace(/###/g, '').trim()}`;
          }
          return match;
      });
      cleaned = cleaned.replace(/### /g, '\n\n### ');
      cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
      return cleaned;
  };

  const getCleanInnerTitle = (fullTitle) => {
      if (fullTitle.includes(':')) {
          return fullTitle.split(':')[1].trim();
      }
      return fullTitle;
  };

  // Prevent scrolling on the main page when the popup is open
  useEffect(() => {
      if (activeIframeUrl) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'unset';
      }
  }, [activeIframeUrl]);

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
      {/* 📰 CURRENT AFFAIRS VIEW (NESTED ACCORDIONS)   */}
      {/* ================================================================= */}
      {isCurrentAffairs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: '#64748b', marginBottom: '10px' }}>
                  Stay informed with the latest {categoryName.toLowerCase()}, crucial for your competitive exam preparation.
              </p>

              {Object.keys(groupedNews).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                      <span style={{ fontSize: '3rem' }}>🗞️</span>
                      <h3>No study guides uploaded yet.</h3>
                  </div>
              ) : (
                  Object.entries(groupedNews).map(([monthGroup, newsItems], index) => (
                      <details key={monthGroup} style={groupAccordionStyle} open={index === 0}>
                          <summary style={groupSummaryStyle}>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <span style={{ marginRight: '15px', fontSize: '1.5rem' }}>🗓️</span>
                                  {monthGroup}
                              </div>
                              <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                  {newsItems.length} Topics
                              </span>
                          </summary>
                          
                          <div style={groupContentStyle}>
                              {newsItems.map(news => (
                                  <details key={news._id} style={accordionStyle}>
                                      <summary style={accordionSummaryStyle}>
                                          <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>⚡</span>
                                          {getCleanInnerTitle(news.title)}
                                      </summary>
                                      
                                      <div style={accordionContentStyle}>
                                          <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                              h3: ({node, ...props}) => <h3 style={markdownHeaderStyle} {...props} />,
                                              ul: ({node, ...props}) => <ul style={{ paddingLeft: '25px', marginBottom: '20px', color: '#334155' }} {...props} />,
                                              li: ({node, ...props}) => <li style={{ marginBottom: '10px', lineHeight: '1.7' }} {...props} />,
                                              p: ({node, ...props}) => <p style={{ marginBottom: '15px', lineHeight: '1.7', color: '#334155' }} {...props} />
                                            }}
                                          >
                                            {cleanMarkdown(news.content)}
                                          </ReactMarkdown>
                                          
                                          {news.pdfLink && (
                                              <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                                                  {/* 🚀 EXCLUSIVE IN-PORTAL BUTTON */}
                                                  <button onClick={() => setActiveIframeUrl(news.pdfLink)} style={{...downloadButtonStyle, background: '#10b981', border: 'none', cursor: 'pointer'}}>
                                                      📖 Read in Portal
                                                  </button>
                                              </div>
                                          )}
                                      </div>
                                  </details>
                              ))}
                          </div>
                      </details>
                  ))
              )}
          </div>
      )}

      {/* ================================================================= */}
      {/* 🏫 SCHOOL ACADEMICS VIEW   */}
      {/* ================================================================= */}
      {!isCurrentAffairs && (
          <>
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
                                    </div>
                                    
                                    {/* 🚀 EXCLUSIVE IN-PORTAL HTML EMBED BUTTON */}
                                    {file.link && (
                                        <div style={{ marginTop: '15px' }}>
                                            <button onClick={() => setActiveIframeUrl(file.link)} style={{...downloadButtonStyle, background: '#10b981', border: 'none', cursor: 'pointer'}}>
                                                📖 Read in Portal
                                            </button>
                                        </div>
                                    )}
                                    
                                    {file.description && (
                                        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.6', marginTop: '15px' }}>
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

      {/* ================================================================= */}
      {/* 🚀 THE FULL-SCREEN HTML READER MODAL */}
      {/* ================================================================= */}
      {activeIframeUrl && (
          <div style={modalOverlayStyle}>
              <div style={modalContainerStyle}>
                  
                  {/* Modal Header */}
                  <div style={modalHeaderStyle}>
                      <h3 style={{ margin: 0, color: 'white' }}>📖 Study Marrow Reader</h3>
                      <button onClick={() => setActiveIframeUrl(null)} style={closeBtnStyle}>
                          ✖ Close Reader
                      </button>
                  </div>

                  {/* The iFrame rendering your HTML Notes */}
                  <div style={{ width: '100%', height: 'calc(100% - 60px)', background: '#fff' }}>
                      <iframe 
                          src={activeIframeUrl} 
                          title="Study Material"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                          allowFullScreen
                      />
                  </div>

              </div>
          </div>
      )}
    </div>
  );
}

// --- SHARED STYLES ---
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'transform 0.2s' };
const backButtonStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: 0 };
const downloadButtonStyle = { textDecoration: 'none', background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

const groupAccordionStyle = { background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px', overflow: 'hidden' };
const groupSummaryStyle = { padding: '20px 25px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.3rem', color: '#0f172a', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', listStyle: 'none' };
const groupContentStyle = { padding: '20px', background: '#f1f5f9' };
const accordionStyle = { background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', overflow: 'hidden' };
const accordionSummaryStyle = { padding: '16px 20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b', background: '#ffffff', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f1f5f9' };
const accordionContentStyle = { padding: '30px 40px', background: '#ffffff' };
const markdownHeaderStyle = { backgroundColor: '#2563eb', color: 'white', padding: '12px 18px', borderRadius: '6px', marginTop: '30px', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' };

// --- 🚀 MODAL STYLES ---
const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
};

const modalContainerStyle = {
    width: '95%',
    maxWidth: '1400px',
    height: '90%',
    backgroundColor: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column'
};

const modalHeaderStyle = {
    height: '60px',
    backgroundColor: '#1e293b',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 25px',
    borderBottom: '1px solid #334155'
};

const closeBtnStyle = {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'background 0.2s'
};

export default CategoryPage;