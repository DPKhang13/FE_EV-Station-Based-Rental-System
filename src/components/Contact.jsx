import React, { useState, useEffect } from 'react';
import { rentalStationService } from '../services';
import './Contact.css';

const Contact = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [nearestLocation, setNearestLocation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [locations, setLocations] = useState([]);
    const [loadingStations, setLoadingStations] = useState(true);

    // Load stations từ API
    useEffect(() => {
        const loadStations = async () => {
            try {
                setLoadingStations(true);
                const stations = await rentalStationService.getAll();

                // Transform API data sang format cũ
                const transformedStations = stations.map(station => ({
                    id: station.stationid || station.id,
                    name: station.name,
                    address: `${station.street}, ${station.ward}, ${station.district}, ${station.city}`,
                    lat: station.latitude || 10.7758, // Default HCM if no lat/lng
                    lng: station.longitude || 106.7008,
                    phone: station.phone || "Đang cập nhật",
                    email: station.email || `${station.name.toLowerCase().replace(/\s+/g, '')}@carrent.vn`
                }));

                setLocations(transformedStations);
                console.log('✅ Loaded stations from API:', transformedStations);
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
        // Sử dụng địa chỉ hoặc tọa độ để hiển thị chính xác
        // Encode address để tránh lỗi với ký tự đặc biệt
        const query = encodeURIComponent(location.address || `${location.lat},${location.lng}`);
        return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${query}&zoom=15`;
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
