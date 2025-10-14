import React from 'react';
import { useLocation } from 'react-router-dom';
import CarFilter from './CarFilter';
import '../App.css';

const ListCarPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedBranch = queryParams.get('branch') || '';

    const branchNames = {
        'q1': 'Chi nhánh Quận 1',
        'q7': 'Chi nhánh Quận 7',
        'td': 'Chi nhánh Thủ Đức',
    };

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
