import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const MonthlyView = () => {
    const { yearMonth } = useParams(); // Grabs "2026-05" from the browser link
    const [data, setData] = useState({ monthName: '', articles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlyData = async () => {
            try {
                const response = await axios.get(`https://study-marrow-api-us.onrender.com/api/current-affairs/monthly/${yearMonth}`);
                setData(response.data);
            } catch (err) {
                console.error("Error loading monthly compilation", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMonthlyData();
    }, [yearMonth]);

    if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading Monthly Compilation... ⏳</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ color: '#1e293b', marginBottom: '5px' }}>Current Affairs: {data.monthName}</h1>
            <p style={{ color: '#64748b', marginBottom: '30px' }}>All topics compiled in one place.</p>

            <div style={{ display: 'grid', gap: '15px' }}>
                {data.articles.length > 0 ? (
                    data.articles.map((article) => (
                        <Link 
                            key={article._id} 
                            to={`/view-material?id=${article._id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                        >
                            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
                                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                    {article.category}
                                </span>
                                <h3 style={{ marginTop: '10px', color: '#1e293b' }}>{article.title}</h3>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p style={{ textAlign: 'center', color: '#94a3b8' }}>No updates found for this month yet.</p>
                )}
            </div>
        </div>
    );
};

export default MonthlyView;