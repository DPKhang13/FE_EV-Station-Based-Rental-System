import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CarFilter from './CarFilter';
import '../App.css';

const ListCarPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedBranch = queryParams.get('branch') || '';

    const branchNames = {
        '1': 'Chi nhánh Quận 1',
        '2': 'Chi nhánh Quận 8',
        '3': 'Chi nhánh Thủ Đức',
    };

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    return (
        <div className="listcar-main" style={{ padding: '60px 0', textAlign: 'center' }}>
            <h2 style={{ marginBottom: 20, fontSize: 32, fontWeight: 700 }}>Danh sách xe</h2>
            {selectedBranch && (
                <p style={{ fontSize: 18, color: '#dc2626', fontWeight: 600, marginBottom: 40 }}>
                    📍 {branchNames[selectedBranch]}
                </p>
            )}
            <CarFilter selectedBranch={selectedBranch} />
        </div>
    );
};

export default ListCarPage;
