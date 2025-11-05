import React from 'react';
import './Stats.css';

const Stats = () => {
    const stats = [
        { number: '120', label: 'XE TRONG ĐỘI XE' },
        { number: '3', label: 'CHI NHÁNH TRÊN TOÀN QUỐC' },
        { number: '1000+', label: 'ĐƠN HÀNG ĐÃ HOÀN THÀNH' },
        { number: '1+', label: 'TRÊN 1 NĂM KINH NGHIỆM' }
    ];

    return (
        <section className="stats" style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)',
        }}>
            <div className="stats-overlay"></div>

            <div className="stats-container">
                <div className="stats-grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-item">
                            <div className="stat-number">{stat.number}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
