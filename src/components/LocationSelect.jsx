import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { rentalStationService } from '../services';
import './LocationSelect.css';

const LocationSelect = () => {
    const navigate = useNavigate();
    const location = useLocation();
    // Nhận state từ Offers (nếu có)
    const { gradeFilter, seatCount } = location.state || {};
    const [nearestLocation, setNearestLocation] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [locations, setLocations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // Load stations từ API
    useEffect(() => {
        const loadStations = async () => {
            try {
                setLoadingStations(true);
                const stations = await rentalStationService.getAll();

                // Transform API data với toạ độ chính xác dựa theo địa chỉ thật
                const transformedStations = stations.map((station) => {
                    let lat = station.latitude || station.lat;
                    let lng = station.longitude || station.lng;
                    let phone = station.phone || station.phoneNumber;

                    const city = station.city?.toLowerCase() || '';
                    const name = station.name?.toLowerCase() || '';

                    // Assign toạ độ dựa theo thành phố thực tế
                    if (!lat || !lng) {
                        if (city.includes('hà nội') || name.includes('hanoi')) {
                            // Hà Nội - Cầu Giấy
                            lat = 21.0285;
                            lng = 105.7821;
                            phone = phone || '024-3456-7890';
                        } else if (city.includes('đà nẵng') || name.includes('da nang')) {
                            // Đà Nẵng - Hải Châu
                            lat = 16.0545;
                            lng = 108.2022;
                            phone = phone || '0236-3456-789';
                        } else if (city.includes('tp.hcm') || city.includes('hồ chí minh') || name.includes('hcm')) {
                            // HCM - Quận 1
                            lat = 10.7758;
                            lng = 106.7008;
                            phone = phone || '028-3456-7890';
                        } else {
                            // Default HCM nếu không xác định được
                            lat = 10.7758;
                            lng = 106.7008;
                            phone = phone || '028-3456-7890';
                        }
                    } else {
                        // Nếu có lat/lng từ API nhưng không có phone, assign phone theo city
                        if (!phone) {
                            if (city.includes('hà nội') || name.includes('hanoi')) {
                                phone = '024-3456-7890';
                            } else if (city.includes('đà nẵng') || name.includes('da nang')) {
                                phone = '0236-3456-789';
                            } else {
                                phone = '028-3456-7890';
                            }
                        }
                    }

                    return {
                        id: String(station.stationid || station.id || station.stationId || ''),
                        name: station.name || station.stationName,
                        address: `${station.street}, ${station.ward}, ${station.district}, ${station.city}`,
                        lat: lat,
                        lng: lng,
                        phone: phone
                    };
                });

                setLocations(transformedStations);
                console.log('✅ Loaded stations from API:', transformedStations);

                // Tự động lấy vị trí và chọn chi nhánh gần nhất khi load xong
                autoSelectNearestBranch(transformedStations);
            } catch (error) {
                console.error('❌ Error loading stations:', error);
                // ⚠️ NO FALLBACK - App bắt buộc phải dùng API
                setLocations([]);
            } finally {
                setLoadingStations(false);
            }
        };

        loadStations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Hàm tự động chọn chi nhánh gần nhất khi load trang
    const autoSelectNearestBranch = (stationList) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    let nearest = null;
                    let minDistance = Infinity;

                    stationList.forEach(location => {
                        const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearest = { ...location, distance: distance.toFixed(2) };
                        }
                    });

                    if (nearest) {
                        setNearestLocation(nearest);
                        const branchId = String(nearest.id);
                        setSelectedBranch(branchId);
                        console.log('✅ TỰ ĐỘNG CHỌN:', nearest.name, '| ID:', branchId, '| Type:', typeof branchId);
                    }
                },
                () => {
                    console.warn('⚠️ Không lấy được vị trí, chọn chi nhánh đầu tiên');
                    // Nếu không lấy được vị trí, chọn chi nhánh đầu tiên
                    if (stationList.length > 0) {
                        const branchId = String(stationList[0].id);
                        setSelectedBranch(branchId);
                        console.log('✅ CHỌN ĐẦU TIÊN:', stationList[0].name, '| ID:', branchId);
                    }
                }
            );
        } else {
            // Trình duyệt không hỗ trợ geolocation, chọn chi nhánh đầu tiên
            if (stationList.length > 0) {
                const branchId = String(stationList[0].id);
                setSelectedBranch(branchId);
                console.log('✅ CHỌN ĐẦU TIÊN (no geo):', stationList[0].name, '| ID:', branchId);
            }
        }
    };

    // Hàm tính khoảng cách (Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const goToListCar = () => {
        // Nếu chưa chọn chi nhánh, tự động chọn chi nhánh đầu tiên hoặc xem tất cả
        const branchId = selectedBranch || (locations.length > 0 ? locations[0].id : 'all');
        
        // Điều hướng đến ListCarPage với gradeFilter (nếu có từ Offers)
        navigate(`/listcar?branch=${branchId}`, {
            state: {
                gradeFilter: gradeFilter || null,
                seatCount: seatCount || null
            }
        });
    };

    return (
        <div className="location-select-container">
            {/* Header */}
            <div className="location-header">
                <h1 className="location-title">Chọn chi nhánh</h1>
                <p className="location-subtitle">
                    Chọn chi nhánh gần bạn để xem danh sách xe có sẵn
                </p>
            </div>

            {/* Hiển thị chi nhánh gần nhất nếu đã tìm được */}
            {nearestLocation && (
                <div className="nearest-branch-card">
                    <div className="nearest-badge">
                        <span>✓</span>
                        <span>Chi nhánh gần bạn nhất</span>
                    </div>
                    <h3 className="nearest-branch-name">{nearestLocation.name}</h3>
                    <div className="nearest-branch-info">
                        <div className="nearest-info-item">
                            <span className="branch-icon">📍</span>
                            <div>
                                <span className="nearest-info-label">Địa chỉ:</span> {nearestLocation.address}
                            </div>
                        </div>
                        <div className="nearest-info-item">
                            <span className="branch-icon">📞</span>
                            <div>
                                <span className="nearest-info-label">Điện thoại:</span> {nearestLocation.phone}
                            </div>
                        </div>
                    </div>
                    <div className="nearest-distance">
                        <span className="distance-text">Khoảng cách: ~{nearestLocation.distance} km</span>
                    </div>
                </div>
            )}

            {/* Danh sách chi nhánh */}
            {loadingStations ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Đang tải chi nhánh...</p>
                </div>
            ) : (
                <div className="branches-grid">
                    {locations.map(location => {
                        const locationId = String(location.id);
                        const selectedId = String(selectedBranch);
                        const isSelected = locationId === selectedId;

                        return (
                            <div
                                key={location.id}
                                className={`branch-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                    if (!isSelected) {
                                        const branchId = String(location.id);
                                        setSelectedBranch(branchId);
                                        console.log('🖱️ NGƯỜI DÙNG CHỌN:', location.name, '| ID:', branchId);
                                    }
                                }}
                            >
                                <h4 className="branch-name">{location.name}</h4>

                                {isSelected && (
                                    <div className="selected-badge">
                                        ✓ Đã chọn
                                    </div>
                                )}

                                <div className="branch-info">
                                    <div className="branch-info-item">
                                        <span className="branch-icon">📍</span>
                                        <span>{location.address}</span>
                                    </div>
                                    <div className="branch-info-item">
                                        <span className="branch-icon">📞</span>
                                        <span>{location.phone}</span>
                                    </div>
                                </div>

                                <button
                                    className="branch-button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isSelected) {
                                            const branchId = String(location.id);
                                            setSelectedBranch(branchId);
                                            console.log('🖱️ NGƯỜI DÙNG CHỌN:', location.name, '| ID:', branchId);
                                        }
                                    }}
                                    disabled={isSelected}
                                >
                                    <span>{isSelected ? '✓ Đã chọn địa điểm này' : 'Chọn địa điểm này'}</span>
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Nút chuyển sang List Car */}
            <div className="view-cars-container">
                <button className="view-cars-button" onClick={goToListCar}>
                    <span>Xem danh sách xe →</span>
                </button>
            </div>
        </div>
    );
};

export default LocationSelect;
