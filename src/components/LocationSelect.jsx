import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rentalStationService } from '../services';
import '../App.css';

// Thêm keyframes animation vào head
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseGlow {
        0%, 100% {
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
        }
        50% {
            box-shadow: 0 2px 16px rgba(16, 185, 129, 0.8);
        }
    }
`;
if (!document.head.querySelector('[data-location-select-styles]')) {
    style.setAttribute('data-location-select-styles', 'true');
    document.head.appendChild(style);
}

const LocationSelect = () => {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [loading, setLoading] = useState(false);
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
                    const district = station.district?.toLowerCase() || '';

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
    }, []);

    // Hàm tự động chọn chi nhánh gần nhất khi load trang
    const autoSelectNearestBranch = (stationList) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    setUserLocation({ lat: userLat, lng: userLng });

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
                (error) => {
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

    // Lấy vị trí hiện tại
    const getCurrentLocation = () => {
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;
                    setUserLocation({ lat: userLat, lng: userLng });

                    let nearest = null;
                    let minDistance = Infinity;

                    locations.forEach(location => {
                        const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearest = { ...location, distance: distance.toFixed(2) };
                        }
                    });

                    setNearestLocation(nearest);
                    setSelectedBranch(nearest.id);
                    setLoading(false);
                },
                (error) => {
                    alert("Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí!");
                    setLoading(false);
                }
            );
        } else {
            alert("Trình duyệt của bạn không hỗ trợ Geolocation!");
            setLoading(false);
        }
    };

    const goToListCar = () => {
        // Nếu chưa chọn chi nhánh, tự động chọn chi nhánh đầu tiên hoặc xem tất cả
        const branchId = selectedBranch || (locations.length > 0 ? locations[0].id : 'all');
        navigate(`/listcar?branch=${branchId}`);
    };

    return (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>Chọn chi nhánh</h2>
            <p style={{ fontSize: 18, color: '#666', marginBottom: 40 }}>
                Chọn chi nhánh gần bạn để xem danh sách xe có sẵn
            </p>

            {/* Hiển thị chi nhánh gần nhất nếu đã tìm được */}
            {nearestLocation && (
                <div style={{
                    maxWidth: 600,
                    margin: '0 auto 40px',
                    padding: 24,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 16,
                    color: 'white',
                    boxShadow: '0 8px 24px rgba(245, 87, 108, 0.3)',
                }}>
                    <h3 style={{ marginBottom: 16 }}>✅ Chi nhánh gần bạn nhất</h3>
                    <h4 style={{ fontSize: 20, marginBottom: 12 }}>{nearestLocation.name}</h4>
                    <p><strong> Địa chỉ:</strong> {nearestLocation.address}</p>
                    <p><strong> Điện thoại:</strong> {nearestLocation.phone}</p>
                    <p style={{ marginTop: 8 }}><strong> Khoảng cách:</strong> ~{nearestLocation.distance} km</p>
                </div>
            )}

            {/* Danh sách 3 chi nhánh */}
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 40 }}>
                {locations.map(location => {
                    // So sánh chính xác - CRITICAL FIX
                    const locationId = String(location.id);
                    const selectedId = String(selectedBranch);
                    const isSelected = locationId === selectedId;

                    console.log('🔍 COMPARE:', location.name, '| locationId:', locationId, '| selectedId:', selectedId, '| MATCH:', isSelected);

                    return (
                        <div
                            key={location.id}
                            style={{
                                padding: 24,
                                background: isSelected
                                    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fcd34d 100%)'
                                    : 'white',
                                color: '#333',
                                borderRadius: 16,
                                boxShadow: isSelected
                                    ? '0 8px 24px rgba(245, 158, 11, 0.4), 0 0 0 4px rgba(245, 158, 11, 0.3)'
                                    : '0 4px 12px rgba(0,0,0,0.1)',
                                transition: 'all 0.3s',
                                border: isSelected ? '3px solid #f59e0b' : '2px solid #eee',
                                position: 'relative',
                                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                            }}
                        >
                            <h4 style={{
                                fontSize: 18,
                                fontWeight: 700,
                                marginBottom: 12,
                                color: isSelected ? '#92400e' : '#333'
                            }}>
                                {location.name}
                            </h4>

                            {isSelected && (
                                <div style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    background: '#10b981',
                                    color: 'white',
                                    padding: '6px 14px',
                                    borderRadius: 20,
                                    fontSize: 13,
                                    fontWeight: 700,
                                    animation: 'pulseGlow 2s infinite'
                                }}>
                                    ✓ ĐÃ CHỌN
                                </div>
                            )}

                            <div style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                marginBottom: 8,
                                gap: 8
                            }}>
                                <span style={{ fontSize: 14, color: isSelected ? '#f59e0b' : '#dc2626', minWidth: 20 }}>📍</span>
                                <p style={{
                                    fontSize: 14,
                                    margin: 0,
                                    lineHeight: 1.5,
                                    color: isSelected ? '#92400e' : '#333',
                                    fontWeight: isSelected ? 600 : 400
                                }}>
                                    {location.address}
                                </p>
                            </div>

                            <p style={{
                                fontSize: 14,
                                marginBottom: 16,
                                color: isSelected ? '#92400e' : '#333',
                                fontWeight: isSelected ? 600 : 400
                            }}>
                                {location.phone}
                            </p>

                            <button
                                onClick={() => {
                                    const branchId = String(location.id);
                                    setSelectedBranch(branchId);
                                    console.log('🖱️ NGƯỜI DÙNG CHỌN:', location.name, '| ID:', branchId);
                                }}
                                disabled={isSelected}
                                style={{
                                    width: '100%',
                                    padding: '12px 20px',
                                    background: isSelected ? '#9ca3af' : '#dc2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: isSelected ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    opacity: isSelected ? 0.6 : 1,
                                    pointerEvents: isSelected ? 'none' : 'auto',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isSelected) {
                                        e.target.style.background = '#b91c1c';
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isSelected) {
                                        e.target.style.background = '#dc2626';
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }
                                }}
                            >
                                {isSelected ? '✓ Đã chọn địa điểm này' : 'Chọn địa điểm này'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Nút chuyển sang List Car */}
            <button
                onClick={goToListCar}
                style={{
                    marginTop: 40,
                    padding: '14px 40px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                    transition: 'all 0.3s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
            >
                Xem danh sách xe →
            </button>
        </div>
    );
};

export default LocationSelect;
