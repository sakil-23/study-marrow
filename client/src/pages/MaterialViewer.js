import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MaterialViewer = () => {
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        setError(true);
        return;
    }

    const fetchMaterial = async () => {
      try {
        const response = await axios.get(`https://study-marrow-api-us.onrender.com/api/materials/${id}`);
        setMaterial(response.data);
      } catch (err) {
        console.error("Failed to load material", err);
        setError(true);
      }
    };

    fetchMaterial();
  }, [location]);

  const getEmbeddableUrl = (url) => {
      if (!url) return "";
      if (url.includes('drive.google.com')) {
          const match1 = url.match(/\/d\/(.+?)\//);
          if (match1 && match1[1]) return `https://drive.google.com/file/d/${match1[1]}/preview`;
          const match2 = url.match(/id=(.+?)(&|$)/);
          if (match2 && match2[1]) return `https://drive.google.com/file/d/${match2[1]}/preview`;
      }
      return url; 
  };

  // 🧹 Cleans up the AI formatting to look beautiful
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

  if (error) {
      return (
          <div style={{ padding: '40px', textAlign: 'center' }}>
              <h2>Oops! We couldn't find that material.</h2>
              <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', cursor: 'pointer' }}>Go Back</button>
          </div>
      );
  }

  if (!material) {
      return <div style={{ padding: '40px', textAlign: 'center', fontSize: '1.2rem' }}>Loading your study material... ⏳</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem', fontWeight: 'bold' }}>
          ← Back to Folders
      </button>

      <h1 style={{ marginBottom: '10px', color: '#1e293b' }}>{material.title}</h1>
      <p style={{ color: '#64748b', marginBottom: '20px', fontWeight: 'bold' }}>
          {material.subject || material.category} • {material.resourceType}
      </p>

      {/* 🧠 SMART RENDERER: Chooses between AI Text or PDF Iframe */}
      {material.content ? (
          <div style={{ 
              background: 'white', 
              padding: '40px 50px', 
              borderRadius: '12px', 
              border: '1px solid #e2e8f0', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              lineHeight: '1.8',
              fontSize: '1.1rem',
              color: '#334155'
          }}>
              <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                      h3: ({node, ...props}) => <h3 style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 18px', borderRadius: '6px', marginTop: '30px', marginBottom: '15px', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)' }} {...props} />,
                      ul: ({node, ...props}) => <ul style={{ paddingLeft: '25px', marginBottom: '20px' }} {...props} />,
                      li: ({node, ...props}) => <li style={{ marginBottom: '12px' }} {...props} />,
                      p: ({node, ...props}) => <p style={{ marginBottom: '15px' }} {...props} />
                  }}
              >
                  {cleanMarkdown(material.content)}
              </ReactMarkdown>
              
              {/* If there is ALSO a PDF link attached to the news, show a button at the bottom */}
              {material.link && (
                  <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #f1f5f9', textAlign: 'center' }}>
                      <a href={material.link} target="_blank" rel="noopener noreferrer" style={{ background: '#10b981', color: 'white', padding: '12px 25px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}>
                          📥 Download Original PDF
                      </a>
                  </div>
              )}
          </div>
      ) : (
          <div style={{ width: '100%', height: '80vh', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <iframe 
              src={getEmbeddableUrl(material.link)} 
              title={material.title}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
            />
          </div>
      )}
      
    </div>
  );
};

export default MaterialViewer;