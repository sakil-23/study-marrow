import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom'; 
import axios from 'axios';

function CategoryPage() {
  const { categoryName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams(); 
  const selectedGroup = searchParams.get('group'); 
  
  const [materials, setMaterials] = useState([]);           
  const [currentAffairs, setCurrentAffairs] = useState([]); 
  const [activeIframeUrl, setActiveIframeUrl] = useState(null);
  
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBoard, setSelectedBoard] = useState(null); 
  
  // 🚀 THE FIX: New Loading State
  const [loading, setLoading] = useState(true);

  const isClass12 = categoryName.includes('Class 12');
  const isClass11 = categoryName.includes('Class 11');
  const isClass10 = categoryName.includes('Class 10');
  const isClass9  = categoryName.includes('Class 9');
  const isClass8  = categoryName.includes('Class 8');
  
  const isCurrentAffairs = categoryName.includes('Current Affairs');
  const isDeepFolder = !isCurrentAffairs;
  const parentVertical = isCurrentAffairs ? 'Current Affairs' : 'School Academics';

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

  const generateSlug = (text) => {
      if (!text) return 'study-material';
      return text.toString().toLowerCase()
          .replace(/\s+/g, '-')           
          .replace(/[^\w\-]+/g, '')       
          .replace(/\-\-+/g, '-')         
          .replace(/^-+/, '')             
          .replace(/-+$/, '');            
  };

  useEffect(() => {
    setSelectedSubject(null);
    setSelectedType(null);
    setSelectedBoard(null);
    
    // 🚀 Start loading animation when page opens
    setLoading(true);

    if (isCurrentAffairs) {
        axios.get('https://study-marrow-api-us.onrender.com/api/current-affairs')
          .then(res => {
              setCurrentAffairs(res.data);
              setLoading(false); // 👈 Stop loading when data arrives
          })
          .catch(err => {
              console.log("Error fetching news:", err);
              setLoading(false); // 👈 Stop loading even if there's an error
          });
    } else {
        axios.get('https://study-marrow-api-us.onrender.com/api/materials')
          .then(res => {
            const filtered = res.data.filter(item => item.category === categoryName);
            setMaterials(filtered.sort((a, b) => a.order - b.order));
            setLoading(false); // 👈 Stop loading when data arrives
          })
          .catch(err => {
              console.log("Error fetching materials:", err);
              setLoading(false); // 👈 Stop loading even if there's an error
          });
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

  const getCleanInnerTitle = (fullTitle) => {
      if (fullTitle.includes(':')) {
          return fullTitle.split(':')[1].trim();
      }
      return fullTitle;
  };

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
        <span onClick={() => {setSelectedSubject(null); setSelectedType(null); setSelectedBoard(null); setSearchParams({})}} style={{ cursor: 'pointer', color: selectedSubject || selectedGroup ? '#3b82f6' : 'black' }}>
          {categoryName.replace(' Materials', '')}
        </span>
        
        {isCurrentAffairs && selectedGroup && (
          <>
            {' > '}
            <span style={{ color: 'black' }}>{selectedGroup}</span>
          </>
        )}

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

      {/* 🚀 THE FIX: Show this screen while Render wakes up */}
      {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}>⏳</div>
              <h2 style={{ color: '#3b82f6', marginBottom: '10px' }}>Fetching Materials...</h2>
              <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto' }}>Please wait a moment while we securely load your study guides from the database.</p>
              
              <style>
                {`
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}
              </style>
          </div>
      ) : (
          /* ================================================================= */
          /* EVERYTHING BELOW ONLY SHOWS AFTER LOADING IS COMPLETE             */
          /* ================================================================= */
          <>
              {/* 📰 CURRENT AFFAIRS VIEW */}
              {isCurrentAffairs && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                      {Object.keys(groupedNews).length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                              <span style={{ fontSize: '3rem' }}>🗞️</span>
                              <h3>No study guides uploaded yet.</h3>
                          </div>
                      ) : !selectedGroup ? (
                          <div>
                              <p style={{ color: '#64748b', marginBottom: '20px' }}>Select a month to view the compiled current affairs.</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                  {Object.entries(groupedNews).map(([monthGroup, newsItems]) => (
                                      <div 
                                          key={monthGroup} 
                                          onClick={() => setSearchParams({ group: monthGroup })} 
                                          style={cardStyle}
                                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                      >
                                          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
                                          <h3 style={{ margin: 0, color: '#1e293b' }}>{monthGroup}</h3>
                                          <p style={{ color: '#64748b', marginTop: '5px' }}>{newsItems.length} Topics</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ) : (
                          <div>
                              <button onClick={() => setSearchParams({})} style={backButtonStyle}>← Back to Months</button>
                              
                              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginTop: '20px', marginBottom: '20px' }}>
                                  <span style={{ marginRight: '10px', fontSize: '1.5rem' }}>🗓️</span>
                                  <h2 style={{ margin: 0, color: '#0f172a', fontSize: '1.4rem' }}>{selectedGroup}</h2>
                                  <span style={{ marginLeft: 'auto', background: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                      {groupedNews[selectedGroup]?.length || 0} Topics
                                  </span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                  {(groupedNews[selectedGroup] || []).map(news => (
                                      <div key={news._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                          
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                              <div style={{ fontSize: '1.8rem' }}>📰</div>
                                              <div style={{ flex: 1 }}>
                                                  <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{getCleanInnerTitle(news.title)}</h3>
                                                  <small style={{ color: '#64748b', fontWeight: 'bold' }}>
                                                      {categoryName} • {selectedGroup}
                                                  </small>
                                              </div>
                                          </div>
                                          
                                          <div>
                                              <Link 
                                                  to={`/study/current-affairs/general/article/${generateSlug(news.title)}?id=${news._id}`} 
                                                  style={{...downloadButtonStyle, background: '#10b981', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px'}}
                                              >
                                                  📖 Read in Portal
                                              </Link>
                                          </div>
                                          
                                      </div>
                                  ))}
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {/* 🏫 SCHOOL ACADEMICS VIEW   */}
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
                                        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '10px', color: '#64748b' }}>
                                            <span style={{ fontSize: '3rem' }}>📂</span>
                                            <h3>No study guides uploaded yet.</h3>
                                        </div>
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
                                            
                                            {file.link && (
                                                <div style={{ marginTop: '15px' }}>
                                                    <Link 
                                                      to={`/study/${generateSlug(categoryName)}/${generateSlug(file.subject || 'general')}/${generateSlug(file.resourceType || 'doc')}/${generateSlug(file.title)}?id=${file._id}`} 
                                                      style={{...downloadButtonStyle, background: '#10b981', border: 'none', cursor: 'pointer'}}
                                                    >
                                                        📖 Read in Portal
                                                    </Link>
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
          </>
      )}

      {/* ================================================================= */}
      {/* 🕵️‍♂️ THE SEO MAGIC TRICK: Invisible Links for GoogleBot Indexing */}
      {/* ================================================================= */}
      <div style={{ display: 'none' }}>
        {materials.map(file => (
            <Link key={`seo-${file._id}`} to={`/study/${generateSlug(categoryName)}/${generateSlug(file.subject || 'general')}/${generateSlug(file.resourceType || 'doc')}/${generateSlug(file.title)}?id=${file._id}`}>
                {file.title}
            </Link>
        ))}
        {currentAffairs.map(news => (
            <Link key={`seo-${news._id}`} to={`/study/current-affairs/general/article/${generateSlug(news.title)}?id=${news._id}`}>
                {news.title}
            </Link>
        ))}
      </div>

    </div>
  );
}

// --- SHARED STYLES ---
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: 'transform 0.2s' };
const backButtonStyle = { background: 'none', border: 'none', color: '#6366f1', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', padding: 0 };
const downloadButtonStyle = { textDecoration: 'none', background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '5px', fontSize: '0.9rem', fontWeight: 'bold', display: 'inline-block' };

export default CategoryPage;