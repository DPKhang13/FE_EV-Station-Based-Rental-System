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
    const [selectedColors, setSelectedColors] = useState([]);

    // Get unique colors from available cars
    const availableColors = [...new Set(cars
        .filter(car => car.color && car.color !== 'N/A' && car.color !== 'null')
        .map(car => car.color))
    ].sort();

    const filteredCars = cars.filter(car => {
        // 1. CHỈ HIỂN THỊ XE AVAILABLE
        if (car.status !== 'Available') {
            return false;
        }

        // 2. LỌC THEO CHI NHÁNH (nếu có chọn)
        if (selectedBranch) {
            const carStationId = String(car.stationId || car.branch || '');
            const selectedStationId = String(selectedBranch);
            if (carStationId !== selectedStationId) {
                return false;
            }
        }

        // 3. LỌC THEO LOẠI XE (nếu có chọn)
        if (type && car.type !== type) {
            return false;
        }

        // 4. LỌC THEO HẠNG XE (nếu có chọn)
        if (grade) {
            // ✅ Lấy variant từ API
            const carVariant = car.variant || car.grade;

            // ✅ Nếu xe KHÔNG CÓ variant → Loại bỏ khỏi kết quả
            if (!carVariant || carVariant === 'null' || carVariant === 'N/A') {
                return false;
            }

            // ✅ So sánh variant (case-insensitive)
            const normalizedCarVariant = String(carVariant).toLowerCase().trim();
            const normalizedFilterGrade = String(grade).toLowerCase().trim();

            if (normalizedCarVariant !== normalizedFilterGrade) {
                return false;
            }
        }

        // 5. LỌC THEO MÀU SẮC (nếu có chọn)
        if (selectedColors.length > 0) {
            if (!car.color || !selectedColors.includes(car.color)) {
                return false;
            }
        }

        return true;
    });

    // Debug log - ✅ Cải thiện để debug vấn đề lọc
    useEffect(() => {
        console.log('🔍 [CarFilter] Debug Info:');
        console.log('  📍 Branch:', selectedBranch || 'All');
        console.log('  🚗 Type:', type || 'All');
        console.log('  ⭐ Grade:', grade || 'All');
        console.log('  🎨 Colors:', selectedColors.length > 0 ? selectedColors.join(', ') : 'All');
        console.log('  📊 Total cars:', cars.length);
        console.log('  ✅ Filtered cars:', filteredCars.length);

        // ✅ Kiểm tra xe có variant null (Backend thiếu VehicleModel)
        const carsWithNullVariant = cars.filter(c => !c.variant || c.variant === 'N/A');
        if (carsWithNullVariant.length > 0) {
            console.warn(`  ⚠️ CÓ ${carsWithNullVariant.length} XE THIẾU VARIANT (Backend thiếu VehicleModel):`);
            console.warn(`     Biển số:`, carsWithNullVariant.map(c => c.plate_number).join(', '));
            console.warn(`     Chi nhánh:`, [...new Set(carsWithNullVariant.map(c => `Station ${c.stationId}`))].join(', '));
            console.warn(`  💡 Giải pháp: Backend cần chạy script SQL để thêm VehicleModel cho các xe này`);
        }

        // ✅ Debug màu sắc từ API
        if (cars.length > 0) {
            const colorsAvailable = [...new Set(cars.map(c => c.color || 'N/A'))];
            console.log('  🎨 Màu sắc có trong API:', colorsAvailable);
            const carsWithoutColor = cars.filter(c => !c.color || c.color === 'null' || c.color === 'undefined');
            if (carsWithoutColor.length > 0) {
                console.warn(`  ⚠️ Có ${carsWithoutColor.length} xe KHÔNG CÓ màu sắc từ API:`,
                    carsWithoutColor.map(c => c.plate_number).join(', '));
            }
        }

        if (filteredCars.length === 0 && cars.length > 0) {
            console.warn('  ⚠️ KHÔNG TÌM THẤY XE PHÙ HỢP!');
            console.log('  💡 Gợi ý:');
            console.log('    - Stations available:', [...new Set(cars.map(c => c.stationId))].join(', '));
            console.log('    - Types available:', [...new Set(cars.map(c => c.type))].join(', '));

            if (type) {
                const carsOfType = cars.filter(c => c.type === type && (selectedBranch ? String(c.stationId) === String(selectedBranch) : true));
                console.log(`    - 🚗 Số xe ${type} ${selectedBranch ? `tại chi nhánh ${selectedBranch}` : '(tất cả chi nhánh)'}: ${carsOfType.length}`);

                if (carsOfType.length > 0) {
                    // ✅ Log chi tiết grades với format gốc từ API
                    console.log('    - ⭐ Grades chi tiết:');
                    const gradeMap = new Map();
                    carsOfType.forEach(c => {
                        const originalGrade = c.grade || c.variant;
                        const lowerGrade = (originalGrade || '').toLowerCase().trim();
                        if (!gradeMap.has(lowerGrade)) {
                            gradeMap.set(lowerGrade, { original: originalGrade, count: 0, cars: [] });
                        }
                        const entry = gradeMap.get(lowerGrade);
                        entry.count++;
                        entry.cars.push(c.plate_number);
                    });

                    gradeMap.forEach((data, lowerGrade) => {
                        console.log(`      • "${data.original}" (lowercase: "${lowerGrade}"): ${data.count} xe`);
                        console.log(`        Biển số: ${data.cars.slice(0, 3).join(', ')}${data.cars.length > 3 ? '...' : ''}`);
                    });

                    if (grade) {
                        console.log(`    - 🔍 Đang tìm grade: "${grade}" (lowercase: "${grade.toLowerCase()}")`);
                        const matchingGrade = Array.from(gradeMap.keys()).find(g => g === grade.toLowerCase());
                        if (matchingGrade) {
                            console.log(`    - ✅ Có ${gradeMap.get(matchingGrade).count} xe grade "${matchingGrade}"`);
                        } else {
                            console.error(`    - ❌ KHÔNG có xe grade "${grade.toLowerCase()}" - Grades có sẵn:`, Array.from(gradeMap.keys()));
                        }
                    }
                }
            }

            if (selectedBranch) {
                const carsInBranch = cars.filter(c => String(c.stationId) === String(selectedBranch));
                console.log(`    - 📍 Chi nhánh ${selectedBranch}: ${carsInBranch.length} xe`);
            }
        }
    }, [selectedBranch, type, grade, selectedColors, cars.length, filteredCars.length, cars]);

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

                    {/* Bộ lọc màu sắc - Checkboxes */}
                    {availableColors.length > 0 && (
                        <div style={{
                            maxWidth: 900,
                            margin: '0 auto 40px',
                            padding: '20px',
                            background: 'white',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}>
                            <label style={{ fontWeight: 600, marginBottom: 12, display: 'block', fontSize: 18, color: '#1f2937' }}>
                                🎨 Lọc theo màu sắc:
                            </label>
                            <select
                                value={selectedColors[0] || ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value) {
                                        setSelectedColors([value]);
                                    } else {
                                        setSelectedColors([]);
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    backgroundColor: 'white',
                                    cursor: 'pointer',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    color: '#1f2937'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#667eea';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            >
                                <option value="">-- Tất cả màu --</option>
                                {availableColors.map(color => {
                                    const colorMap = {
                                        'Black': '⬛',
                                        'White': '⬜',
                                        'Red': '🟥',
                                        'Blue': '🟦',
                                        'Silver': '◽',
                                        'Gray': '◾',
                                        'Yellow': '🟨'
                                    };
                                    const icon = colorMap[color] || '🟩';
                                    return (
                                        <option key={color} value={color}>
                                            {icon} {color}
                                        </option>
                                    );
                                })}
                            </select>
                            {selectedColors.length > 0 && (
                                <div style={{
                                    display: 'flex',
                                    gap: 8,
                                    marginTop: 12,
                                    flexWrap: 'wrap'
                                }}>
                                    {selectedColors.map(color => {
                                        const colorMap = {
                                            'Black': '#000000',
                                            'White': '#FFFFFF',
                                            'Red': '#DC2626',
                                            'Blue': '#2563EB',
                                            'Silver': '#9CA3AF',
                                            'Gray': '#6B7280',
                                            'Yellow': '#EAB308'
                                        };
                                        const bgColor = colorMap[color] || '#6B7280';
                                        return (
                                            <div
                                                key={color}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '6px 12px',
                                                    background: '#f3f4f6',
                                                    borderRadius: 8,
                                                    fontSize: 14,
                                                    fontWeight: 500
                                                }}
                                            >
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    backgroundColor: bgColor,
                                                    borderRadius: 4,
                                                    border: color === 'White' ? '1px solid #e5e7eb' : 'none'
                                                }} />
                                                <span>{color}</span>
                                                <button
                                                    onClick={() => setSelectedColors(selectedColors.filter(c => c !== color))}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: 16,
                                                        color: '#6b7280',
                                                        padding: 0,
                                                        marginLeft: 4
                                                    }}
                                                >✕</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            <div style={{ display: 'none' }}>
                                {availableColors.map(color => (
                                    <label key={color}>
                                        <input
                                            type="checkbox"
                                            checked={selectedColors.includes(color)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedColors([...selectedColors, color]);
                                                } else {
                                                    setSelectedColors(selectedColors.filter(c => c !== color));
                                                }
                                            }}
                                            style={{
                                                width: 18,
                                                height: 18,
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <span>{color}</span>
                                    </label>
                                ))}
                            </div>
                            {selectedColors.length > 0 && (
                                <button
                                    onClick={() => setSelectedColors([])}
                                    style={{
                                        marginTop: 16,
                                        padding: '8px 16px',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'block',
                                        margin: '16px auto 0'
                                    }}
                                >
                                    Xóa bộ lọc màu
                                </button>
                            )}
                        </div>
                    )}

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
                                <div style={{ color: '#9ca3af', fontSize: 14, marginBottom: 16 }}>
                                    {selectedBranch && `Chi nhánh: ${selectedBranch} | `}
                                    {type && `Loại: ${type} | `}
                                    {grade && `Hạng: ${grade} | `}
                                    Tổng số xe: {cars.length}
                                </div>
                                <div style={{ color: '#ef4444', fontSize: 14, fontWeight: 500 }}>
                                    💡 Gợi ý: {grade
                                        ? 'Một số xe có thể thiếu thông tin hạng xe (Backend chưa cập nhật VehicleModel). Thử bỏ bộ lọc hạng xe.'
                                        : 'Thử bỏ bớt bộ lọc hoặc chọn chi nhánh khác'}
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
                                            <div style={{ fontSize: 18, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Grade:</strong>{' '}
                                                <span style={{
                                                    color: (!car.variant && !car.grade) || car.variant === 'N/A' ? '#ef4444' : '#374151',
                                                    fontStyle: (!car.variant && !car.grade) || car.variant === 'N/A' ? 'italic' : 'normal'
                                                }}>
                                                    {(!car.variant && !car.grade) || car.variant === 'N/A'
                                                        ? 'Chưa cập nhật (Backend thiếu VehicleModel)'
                                                        : (car.variant || car.grade)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 18, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Màu sắc:</strong>{' '}
                                                <span style={{
                                                    color: (!car.color || car.color === 'N/A') ? '#ef4444' : '#374151',
                                                    fontStyle: (!car.color || car.color === 'N/A') ? 'italic' : 'normal'
                                                }}>
                                                    {(!car.color || car.color === 'N/A')
                                                        ? 'Chưa cập nhật (Backend thiếu VehicleModel)'
                                                        : car.color}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 18, color: '#374151' }}>
                                                <strong style={{ color: '#dc2626' }}>Loại xe:</strong> {car.type === '4-seater' ? '4 chỗ' : '7 chỗ'}
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
