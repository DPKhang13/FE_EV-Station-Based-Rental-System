import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CarFilter from './CarFilter';
import { rentalStationService } from '../services';
import './ListCarPage.css';

const ListCarPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedBranch = queryParams.get('branch') || '';
    const [branchName, setBranchName] = useState('');
    const [loading, setLoading] = useState(true);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Load tên chi nhánh từ API
    useEffect(() => {
        const loadBranchName = async () => {
            if (!selectedBranch) {
                setBranchName('Tất cả chi nhánh');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const stations = await rentalStationService.getAll();
                const station = stations.find(s =>
                    String(s.id || '') === String(selectedBranch) ||
                    String(s.stationid || '') === String(selectedBranch)
                );

                if (station) {
                    setBranchName(station.name || `Chi nhánh ${selectedBranch}`);
                } else {
                    setBranchName(`Chi nhánh ${selectedBranch}`);
                }
                console.log('✅ Loaded branch name:', station?.name);
            } catch (error) {
                console.error('❌ Error loading branch name:', error);
                setBranchName(`Chi nhánh ${selectedBranch}`);
            } finally {
                setLoading(false);
            }
        };

        loadBranchName();
    }, [selectedBranch]);

    return (
        <div className="listcar-main">
            <div className="listcar-header">
                <h1 className="listcar-title">Danh sách xe</h1>
                {selectedBranch && !loading && (
                    <p className="branch-name">{branchName}</p>
                )}
            </div>
            <CarFilter selectedBranch={selectedBranch} />
        </div>
    );
};

export default ListCarPage;
