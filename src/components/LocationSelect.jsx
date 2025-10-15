import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const LocationSelect = () => {
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState('');

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // 3 địa điểm giống Contact
    const locations = [
        {
            id: '1',
            name: "Chi nhánh Quận 1",
            address: "123 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM",
            lat: 10.7758,
            lng: 106.7008,
            phone: "028 1234 5678",
        },
        {
            id: '2',
            name: "Chi nhánh Quận 8",
            address: "456 Nguyễn Thị Thập, Tân Phú, Quận 8, TP.HCM",
            lat: 10.7292,
            lng: 106.7196,
            phone: "028 8765 4321",
        },
        {
            id: '3',
            name: "Chi nhánh Thủ Đức",
            address: "789 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
            lat: 10.8508,
            lng: 106.7717,
            phone: "028 9999 8888",
        }
    ];

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
        if (!selectedBranch) {
            alert("Vui lòng chọn chi nhánh trước!");
            return;
        }
        navigate(`/listcar?branch=${selectedBranch}`);
    };

    return (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20 }}>Chọn chi nhánh</h2>
            <p style={{ fontSize: 18, color: '#666', marginBottom: 40 }}>
                Chọn chi nhánh gần bạn để xem danh sách xe có sẵn
            </p>

            {/* Nút lấy vị trí */}
            <button
                onClick={getCurrentLocation}
                disabled={loading}
                style={{
                    padding: '12px 32px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: 40,
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
            >
                {loading ? '🔍 Đang tìm...' : '📍 Tìm chi nhánh gần bạn nhất'}
            </button>

            {/* Hiển thị chi nhánh gần nhất */}
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
                    <p><strong>📍 Địa chỉ:</strong> {nearestLocation.address}</p>
                    <p><strong>🚗 Khoảng cách:</strong> ~{nearestLocation.distance} km</p>
                </div>
            )}

            {/* Danh sách 3 chi nhánh */}
            <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {locations.map(location => (
                    <div
                        key={location.id}
                        onClick={() => setSelectedBranch(location.id)}
                        style={{
                            padding: 24,
                            background: selectedBranch === location.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                            color: selectedBranch === location.id ? 'white' : '#333',
                            borderRadius: 16,
                            boxShadow: selectedBranch === location.id ? '0 8px 24px rgba(102, 126, 234, 0.4)' : '0 4px 12px rgba(0,0,0,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            border: selectedBranch === location.id ? '3px solid #fff' : '2px solid #eee',
                        }}
                    >
                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{location.name}</h4>
                        <p style={{ fontSize: 14, marginBottom: 8 }}>📍 {location.address}</p>
                        <p style={{ fontSize: 14 }}>📞 {location.phone}</p>
                        {selectedBranch === location.id && (
                            <div style={{ marginTop: 12, fontSize: 24 }}>✓</div>
                        )}
                    </div>
                ))}
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
