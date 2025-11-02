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
    const [searchColor, setSearchColor] = useState('');

    const filteredCars = cars.filter(car => {
        // Chỉ hiển thị xe Available (có thể thuê)
        const statusMatch = car.status === 'Available';

        const carStationId = String(car.stationId || car.branch || '');
        const selectedStationId = String(selectedBranch || '');
        const branchMatch = !selectedStationId || carStationId === selectedStationId;

        const typeMatch = !type || car.type === type;

        let gradeMatch = true;
        if (grade) {
            gradeMatch = car.grade === grade || car.variant === grade;
        }

        // Tìm kiếm theo màu sắc
        const colorMatch = !searchColor ||
            (car.color && car.color.toLowerCase().includes(searchColor.toLowerCase()));

        return statusMatch && branchMatch && typeMatch && gradeMatch && colorMatch;
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
            if (type) {
                console.log('    - Grades available:', [...new Set(cars.filter(c => c.type === type).map(c => c.grade || c.variant))].filter(Boolean).join(', '));
            }
        }
    }, [selectedBranch, type, grade, cars.length, filteredCars.length]);

    // Xử lý khi thay đổi loại xe
    const handleTypeChange = (value) => {
        setType(value);
        // Reset grade khi thay đổi loại xe để người dùng chọn lại
        setGrade('');
    };

    // Điều hướng đến trang booking - Truyền đầy đủ thông tin xe
    const handleRentCar = (car) => {
        if (car) {
            const bookingPage = car.type === '4-seater' ? '/booking-4seater' : '/booking-7seater';
            // Truyền đầy đủ thông tin xe bao gồm ảnh, tên xe, biển số, grade, màu sắc
            navigate(bookingPage, {
                state: {
                    car: car,
                    vehicleImage: car.image,
                    vehicleName: car.vehicle_name,
                    plateNumber: car.plate_number,
                    grade: car.grade || car.variant,
                    color: car.color
                }
            });
        }
    }; return (
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
                        {/* Tìm kiếm theo màu sắc */}
                        <div>
                            <label style={{ fontWeight: 600, marginRight: 12 }}>Tìm màu:</label>
                            <input
                                type="text"
                                placeholder="VD: Trắng, Đen, Xanh..."
                                value={searchColor}
                                onChange={e => setSearchColor(e.target.value)}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: 8,
                                    border: '2px solid #dc2626',
                                    fontSize: 16,
                                    fontWeight: 500,
                                    outline: 'none',
                                    width: 220
                                }}
                            />
                        </div>

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
                        {/* Hiển thị dropdown Hạng xe khi đã chọn loại xe */}
                        {type && (
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

                                    {/* Thông tin xe bên phải - Chỉ hiển thị: Tên xe, Màu sắc, Biển số, Grade */}
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <h3 style={{ margin: '0 0 20px', fontSize: 28, fontWeight: 700, color: '#1f2937' }}>
                                            {car.vehicle_name}
                                        </h3>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <div style={{ fontSize: 18, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Biển số xe:</strong> {car.plate_number}
                                            </div>
                                            {(car.grade || car.variant) && (
                                                <div style={{ fontSize: 18, color: '#374151' }}>
                                                    <strong style={{ color: '#dc2626' }}>Grade:</strong> {car.grade || car.variant}
                                                </div>
                                            )}
                                            <div style={{ fontSize: 18, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Màu sắc:</strong> {car.color}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleRentCar(car)}
                                            style={{
                                                marginTop: 30,
                                                padding: '12px 32px',
                                                background: '#10b981',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: 8,
                                                fontSize: 18,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'background 0.3s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                                            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
                                        >
                                            Thuê xe ngay
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CarFilter;
