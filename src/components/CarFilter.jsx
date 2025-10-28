import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

const carTypes = [
    { value: '', label: 'Chọn loại xe (Select car type)' },
    { value: '4-seater', label: '4-Seater' },
    { value: '7-seater', label: '7-Seater' },
];

const carGrades = [
    { value: '', label: 'Chọn hạng xe (Select grade)' },
    { value: 'Air', label: 'Air' },
    { value: 'Plus', label: 'Plus' },
    { value: 'Pro', label: 'Pro' },
];

const CarFilter = ({ selectedBranch }) => {
    const navigate = useNavigate();
    const { vehicles: cars, loading, error, refetch } = useVehicles();
    const [type, setType] = useState('');
    const [grade, setGrade] = useState('');
    const [selectedCar, setSelectedCar] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Lọc xe theo chi nhánh, loại và hạng
    const filteredCars = cars.filter(car => {
        // 1. Lọc theo chi nhánh
        const carStationId = String(car.stationId || car.branch || '');
        const selectedStationId = String(selectedBranch || '');
        const branchMatch = !selectedStationId || carStationId === selectedStationId;

        // 2. Lọc theo loại xe (4-seater / 7-seater)
        const typeMatch = !type || car.type === type;

        // 3. Lọc theo hạng xe (Air / Plus / Pro)
        // - Nếu chọn 4-seater: không lọc theo grade (4-seater không có grade)
        // - Nếu chọn 7-seater: lọc theo grade nếu có chọn
        let gradeMatch = true;
        if (type === '7-seater' && grade) {
            // So sánh cả grade và variant
            gradeMatch = car.grade === grade || car.variant === grade;
        }

        // 4. Chỉ hiển thị xe Available (có thể bỏ dòng này nếu muốn hiện tất cả)
        // const statusMatch = car.status === 'Available';

        return branchMatch && typeMatch && gradeMatch; // && statusMatch;
    });

    // Debug log
    useEffect(() => {
        console.log('🔍 [CarFilter] Debug Info:');
        console.log('  📍 Branch:', selectedBranch);
        console.log('  🚗 Type:', type || 'All');
        console.log('  ⭐ Grade:', grade || 'All');
        console.log('  � Total cars:', cars.length);
        console.log('  ✅ Filtered cars:', filteredCars.length);

        if (filteredCars.length === 0 && cars.length > 0) {
            console.warn('  ⚠️ KHÔNG TÌM THẤY XE PHÙ HỢP!');
            console.log('  💡 Gợi ý:');
            console.log('    - Stations available:', [...new Set(cars.map(c => c.stationId))].join(', '));
            console.log('    - Types available:', [...new Set(cars.map(c => c.type))].join(', '));
            if (type === '7-seater') {
                console.log('    - Grades available:', [...new Set(cars.filter(c => c.type === '7-seater').map(c => c.grade || c.variant))].filter(Boolean).join(', '));
            }
        }
    }, [selectedBranch, type, grade, cars.length, filteredCars.length]);

    // Reset grade khi chọn 4-seater
    const handleTypeChange = (value) => {
        setType(value);
        if (value === '4-seater') {
            setGrade('');
        }
    };

    // Mở modal xem chi tiết
    const handleViewDetails = (car) => {
        setSelectedCar(car);
        setShowModal(true);
    };

    // Đóng modal
    const closeModal = () => {
        setShowModal(false);
        setSelectedCar(null);
    };

    // Điều hướng đến trang booking
    const handleRentCar = () => {
        if (selectedCar) {
            const bookingPage = selectedCar.type === '4-seater' ? '/booking-4seater' : '/booking-7seater';
            navigate(bookingPage, { state: { car: selectedCar } });
        }
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Loading state */}
            {loading && (
                <div style={{ textAlign: 'center', padding: 40, fontSize: 18, color: '#888' }}>
                    Đang tải dữ liệu xe...
                </div>
            )}

            {/* Error state */}
            {error && (
                <div style={{ textAlign: 'center', padding: 40 }}>
                    <div style={{ color: '#ef4444', fontSize: 18, marginBottom: 16 }}>
                        Lỗi khi tải dữ liệu: {error}
                    </div>
                    <button
                        onClick={refetch}
                        style={{
                            padding: '10px 20px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer'
                        }}
                    >
                        Thử lại
                    </button>
                </div>
            )}

            {/* Main content - only show when not loading */}
            {!loading && (
                <>
                    {/* Bộ lọc */}
                    <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                        <div>
                            <label style={{ fontWeight: 600, marginRight: 12 }}>Loại xe:</label>
                            <select
                                value={type}
                                onChange={e => handleTypeChange(e.target.value)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: '2px solid #dc2626',
                                    fontSize: 16,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    outline: 'none'
                                }}
                            >
                                {carTypes.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Chỉ hiển thị dropdown Hạng xe khi chọn 7-seater */}
                        {type === '7-seater' && (
                            <div>
                                <label style={{ fontWeight: 600, marginRight: 12 }}>Hạng xe:</label>
                                <select
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 8,
                                        border: '2px solid #dc2626',
                                        fontSize: 16,
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {carGrades.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Danh sách xe - Horizontal Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                        {filteredCars.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: 60,
                                background: '#f9fafb',
                                borderRadius: 16,
                                marginTop: 40,
                                width: '100%',
                                maxWidth: 600
                            }}>
                                <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
                                <div style={{ color: '#6b7280', fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                                    Không tìm thấy xe phù hợp
                                </div>
                                <div style={{ color: '#9ca3af', fontSize: 14 }}>
                                    {selectedBranch && `Chi nhánh: ${selectedBranch} | `}
                                    {type && `Loại: ${type} | `}
                                    {grade && `Hạng: ${grade} | `}
                                    Tổng số xe: {cars.length}
                                </div>
                            </div>
                        ) : (
                            filteredCars.map(car => (
                                <div
                                    key={car.id}
                                    style={{
                                        width: '100%',
                                        maxWidth: 900,
                                        background: '#fff',
                                        borderRadius: 16,
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        padding: 24,
                                        display: 'flex',
                                        gap: 24,
                                        alignItems: 'center',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.transform = 'translateX(8px)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.3)';
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.transform = 'translateX(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }}
                                >
                                    {/* Hình ảnh bên trái */}
                                    <img
                                        src={car.image}
                                        alt={car.name}
                                        style={{
                                            width: 280,
                                            height: 180,
                                            objectFit: 'cover',
                                            borderRadius: 12,
                                            flexShrink: 0
                                        }}
                                    />

                                    {/* Thông tin xe bên phải */}
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                                            {car.vehicle_name}
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Vehicle ID:</strong> {car.vehicle_id}
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Vehicle Name:</strong> {car.vehicle_name}
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Brand:</strong> {car.brand}
                                            </div>
                                            {car.grade && (
                                                <div style={{ fontSize: 15, color: '#374151' }}>
                                                    <strong style={{ color: '#dc2626' }}>Grade:</strong> {car.grade}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Color:</strong> {car.color}
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Seat Count:</strong> {car.seat_count} seats
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Year of Manufacture:</strong> {car.year_of_manufacture}
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Plate Number:</strong> {car.plate_number}
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Status:</strong> <span style={{ color: car.status === 'Available' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{car.status}</span>
                                            </div>
                                            <div style={{ fontSize: 15, color: '#374151', marginTop: 6 }}>
                                                <strong style={{ color: '#dc2626' }}>Description:</strong> {car.description}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleViewDetails(car)}
                                            style={{
                                                marginTop: 20,
                                                padding: '10px 24px',
                                                background: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: 16,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'background 0.3s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Modal xem chi tiết */}
                    {showModal && selectedCar && (
                        <div
                            style={{
                                position: 'fixed',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0,0,0,0.7)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 1000,
                                padding: 20
                            }}
                            onClick={closeModal}
                        >
                            <div
                                style={{
                                    background: 'white',
                                    borderRadius: 16,
                                    padding: 40,
                                    maxWidth: 800,
                                    width: '100%',
                                    maxHeight: '90vh',
                                    overflowY: 'auto',
                                    position: 'relative'
                                }}
                                onClick={e => e.stopPropagation()}
                            >
                                {/* Close button */}
                                <button
                                    onClick={closeModal}
                                    style={{
                                        position: 'absolute',
                                        top: 20,
                                        right: 20,
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: 40,
                                        height: 40,
                                        fontSize: 24,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    ×
                                </button>

                                <h2 style={{ marginTop: 0, marginBottom: 24, color: '#1f2937', fontSize: 28, fontWeight: 700 }}>
                                    Chi tiết xe - {selectedCar.vehicle_name}
                                </h2>

                                <img
                                    src={selectedCar.image}
                                    alt={selectedCar.vehicle_name}
                                    style={{
                                        width: '100%',
                                        height: 300,
                                        objectFit: 'cover',
                                        borderRadius: 12,
                                        marginBottom: 24
                                    }}
                                />

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Vehicle ID:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.vehicle_id}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Vehicle Name:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.vehicle_name}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Brand:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.brand}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Color:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.color}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Seat Count:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.seat_count} seats</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Year of Manufacture:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.year_of_manufacture}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Plate Number:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.plate_number}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Transmission:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.transmission}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Battery Status:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16, color: '#10b981', fontWeight: 600 }}>{selectedCar.battery_status}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Battery Capacity:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.battery_capacity}</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Range:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.range_km} km</p>
                                    </div>
                                    <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                        <strong style={{ color: '#dc2626' }}>Status:</strong>
                                        <p style={{ margin: '8px 0 0', fontSize: 16, color: selectedCar.status === 'Available' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{selectedCar.status}</p>
                                    </div>
                                    {selectedCar.variant && (
                                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                                            <strong style={{ color: '#dc2626' }}>Variant:</strong>
                                            <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.variant}</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginTop: 24, padding: 16, background: '#fef3c7', borderRadius: 8 }}>
                                    <strong style={{ color: '#dc2626' }}>Description:</strong>
                                    <p style={{ margin: '8px 0 0', fontSize: 16 }}>{selectedCar.description}</p>
                                </div>

                                <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                                    <button
                                        onClick={handleRentCar}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            background: '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                                    >
                                        Thuê xe
                                    </button>
                                    <button
                                        onClick={closeModal}
                                        style={{
                                            flex: 1,
                                            padding: '14px',
                                            background: '#dc2626',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: 8,
                                            fontSize: 16,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'background 0.3s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                                        onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CarFilter;
