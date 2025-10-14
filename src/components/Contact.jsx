import React, { useState } from 'react';
import './Contact.css';

const Contact = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);

    // 3 địa điểm fake ở TP.HCM - BẠN CÓ THỂ SỬA ĐỔI Ở ĐÂY
    const locations = [
        {
            id: 1,
            name: "Chi nhánh Quận 1",
            address: "123 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM",
            lat: 10.7758,
            lng: 106.7008,
            phone: "028 1234 5678",
            email: "q1@carrent.vn"
        },
        {
            id: 2,
            name: "Chi nhánh Quận 7",
            address: "456 Nguyễn Thị Thập, Tân Phú, Quận 7, TP.HCM",
            lat: 10.7292,
            lng: 106.7196,
            phone: "028 8765 4321",
            email: "q7@carrent.vn"
        },
        {
            id: 3,
            name: "Chi nhánh Thủ Đức",
            address: "789 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
            lat: 10.8508,
            lng: 106.7717,
            phone: "028 9999 8888",
            email: "thuduc@carrent.vn"
        }
    ];

    // Hàm tính khoảng cách giữa 2 tọa độ (công thức Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Bán kính trái đất (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance;
    };

    // Hàm lấy vị trí hiện tại
    const getCurrentLocation = () => {
        setLoading(true);
        console.log("🔍 Đang yêu cầu quyền truy cập vị trí...");

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log("✅ Đã được cấp quyền truy cập vị trí!");
                    console.log("📍 Vị trí của bạn:", position.coords.latitude, position.coords.longitude);
                    const userLat = position.coords.latitude;
                    const userLng = position.coords.longitude;

                    setUserLocation({ lat: userLat, lng: userLng });

                    // Tìm địa điểm gần nhất
                    let nearest = null;
                    let minDistance = Infinity;

                    locations.forEach(location => {
                        const distance = calculateDistance(
                            userLat,
                            userLng,
                            location.lat,
                            location.lng
                        );

                        if (distance < minDistance) {
                            minDistance = distance;
                            nearest = { ...location, distance: distance.toFixed(2) };
                        }
                    });

                    setNearestLocation(nearest);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Không thể lấy vị trí của bạn. Vui lòng cho phép truy cập vị trí!");
                    setLoading(false);
                }
            );
        } else {
            alert("Trình duyệt của bạn không hỗ trợ Geolocation!");
            setLoading(false);
        }
    };

    // Hàm xem vị trí trên bản đồ
    const viewOnMap = (location) => {
        setSelectedLocation(location);
        // Scroll xuống map
        const mapElement = document.querySelector('.contact-map');
        if (mapElement) {
            mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // Tạo URL Google Maps cho từng vị trí (có marker/ghim)
    const getMapUrl = (location) => {
        if (!location) {
            // Map mặc định - Quận 1 với marker
            return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=10.7758,106.7008&zoom=15`;
        }
        // Tạo embed URL với marker tại tọa độ cụ thể
        // Format: q=lat,lng sẽ tự động tạo marker đỏ tại vị trí đó
        return `https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    };

    return (
        <section id="contact" className="contact">
            <div className="contact-container">
                <div className="contact-divider"></div>
                <h2 className="contact-title">CONTACT US</h2>

                {/* Nút tìm chi nhánh gần nhất */}
                <div className="location-finder">
                    <button
                        className="find-location-btn"
                        onClick={getCurrentLocation}
                        disabled={loading}
                    >
                        {loading ? '🔍 Đang tìm...' : '📍 Tìm chi nhánh gần bạn nhất'}
                    </button>
                </div>

                {/* Hiển thị chi nhánh gần nhất */}
                {nearestLocation && (
                    <div className="nearest-location-card">
                        <h3>✅ Chi nhánh gần bạn nhất</h3>
                        <div className="location-info">
                            <h4>{nearestLocation.name}</h4>
                            <p><strong>📍 Địa chỉ:</strong> {nearestLocation.address}</p>
                            <p><strong>📞 Điện thoại:</strong> {nearestLocation.phone}</p>
                            <p><strong>📧 Email:</strong> {nearestLocation.email}</p>
                            <p className="distance"><strong>🚗 Khoảng cách:</strong> ~{nearestLocation.distance} km</p>
                        </div>
                    </div>
                )}

                {/* Hiển thị tất cả chi nhánh */}
                <div className="all-locations">
                    <h3>Tất cả chi nhánh</h3>
                    <div className="locations-grid">
                        {locations.map(location => (
                            <div key={location.id} className={`location-card ${selectedLocation?.id === location.id ? 'selected' : ''}`}>
                                <h4>{location.name}</h4>
                                <p className="location-address">📍 {location.address}</p>
                                <p>📞 {location.phone}</p>
                                <p>📧 {location.email}</p>
                                <button
                                    className="view-map-btn"
                                    onClick={() => viewOnMap(location)}
                                >
                                    🗺️ Xem trên bản đồ
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map */}
                <div className="contact-map-section">
                    <h3>Bản đồ chi nhánh</h3>
                    {selectedLocation && (
                        <div className="selected-location-info">
                            <p>📍 Đang hiển thị: <strong>{selectedLocation.name}</strong></p>
                        </div>
                    )}
                    <div className="contact-map">
                        <iframe
                            key={selectedLocation?.id || 'default'}
                            src={getMapUrl(selectedLocation)}
                            allowFullScreen=""
                            loading="lazy"
                            title="Location Map"
                        ></iframe>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
