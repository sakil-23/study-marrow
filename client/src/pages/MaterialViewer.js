import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MaterialViewer = () => {
  // 1. Grab the dynamic pieces from the URL
  const { className, subject, materialType, slug } = useParams();
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    // 2. Ask your US-based backend for this specific file
    const fetchMaterial = async () => {
      try {
        // We will need to create this route in your server.js later!
        const response = await axios.get(`https://study-marrow-api-us.onrender.com/api/materials/${slug}`);
        setMaterial(response.data);
      } catch (error) {
        console.error("Failed to load material", error);
      }
    };
    fetchMaterial();
  }, [slug]);

  if (!material) return <div>Loading your study material...</div>;

  return (
    <div className="material-container">
      {/* 3. SEO GOLDMINE: Put the title in an h1 tag so Google reads it */}
      <h1>{material.title}</h1>
      
      {/* Optional: Add a brief description here for even better SEO */}
      <p>Free {materialType} for {className} {subject}.</p>

      {/* 4. Your custom iFrame pointing to your GitHub pages HTML */}
      <div className="iframe-wrapper">
        <iframe 
          src={material.githubLink} 
          title={material.title}
          width="100%" 
          height="800px"
        />
      </div>
    </div>
  );
};

export default MaterialViewer;