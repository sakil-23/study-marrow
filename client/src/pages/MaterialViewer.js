import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MaterialViewer = () => {
  const [material, setMaterial] = useState(null);
  const [error, setError] = useState(false);
  
  // These hooks let us read the URL and navigate back
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Grab the exact ID from the URL (e.g., ?id=12345)
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    if (!id) {
        setError(true);
        return;
    }

    // 2. Ask the backend for that specific file
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

  // Google Drive auto-converter (same as CategoryPage)
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {/* A nice back button to return to the folders */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}>
          ← Back to Folders
      </button>

      {/* 🚀 SEO GOLDMINE: The title is actually written on the webpage now! */}
      <h1 style={{ marginBottom: '10px' }}>{material.title}</h1>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>
          {material.subject || material.category} • {material.resourceType}
      </p>

      {/* The Reader Frame */}
      <div style={{ width: '100%', height: '80vh', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <iframe 
          src={getEmbeddableUrl(material.link)} 
          title={material.title}
          style={{ width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
        />
      </div>
      
    </div>
  );
};

export default MaterialViewer;