import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

import './CarFilter.css';

const CarFilter = ({ selectedBranch }) => {
    const navigate = useNavigate();
    const { vehicles: cars, loading, error, refetch } = useVehicles();
    const [brand, setBrand] = useState('');
    const [grade, setGrade] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);
    const [sortBy, setSortBy] = useState('name-asc');

    // Get unique colors from available cars
    const availableColors = [...new Set(cars
        .filter(car => car.color && car.color !== 'N/A' && car.color !== 'null')
        .map(car => car.color))
    ].sort();

    // Get unique brands from available cars
    // eslint-disable-next-line no-unused-vars
    const availableBrands = [...new Set(cars
        .filter(car => car.brand && car.brand !== 'N/A' && car.brand !== 'null')
        .map(car => car.brand))
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

        // 3. LỌC THEO HÃNG XE (thay vì loại xe)
        if (brand) {
            const carBrand = car.brand || car.manufacturer || '';
            if (!carBrand || String(carBrand).toLowerCase() !== String(brand).toLowerCase()) {
                return false;
            }
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

    // Sort filtered cars
    const sortedCars = [...filteredCars].sort((a, b) => {
        const gradeOrder = { 'Air': 1, 'Plus': 2, 'Pro': 3 };
        
        switch (sortBy) {
            case 'name-asc':
                return (a.vehicle_name || '').localeCompare(b.vehicle_name || '');
            case 'name-desc':
                return (b.vehicle_name || '').localeCompare(a.vehicle_name || '');
            case 'grade-asc':
                return (gradeOrder[a.variant] || 0) - (gradeOrder[b.variant] || 0);
            case 'grade-desc':
                return (gradeOrder[b.variant] || 0) - (gradeOrder[a.variant] || 0);
            default:
                return 0;
        }
    });

    // Debug log
    useEffect(() => {
        console.log(' [CarFilter] Debug Info:');
        console.log('   Branch:', selectedBranch || 'All');
        console.log('   Brand:', brand || 'All');
        console.log('   Grade:', grade || 'All');
        console.log('   Colors:', selectedColors.length > 0 ? selectedColors.join(', ') : 'All');
        console.log('   Total cars:', cars.length);
        console.log('   Filtered cars:', filteredCars.length);
    }, [selectedBranch, brand, grade, selectedColors, sortBy, cars.length, filteredCars.length, cars]);

    // Xử lý khi thay đổi hãng xe
    // const handleBrandChange = (value) => {
    //     setBrand(value);
    // };

    // Xử lý khi thay đổi hạng xe
    // const handleGradeChange = (value) => {
    //     setGrade(value);
    // };

    // Xử lý khi thay đổi sort
    // const handleSortChange = (value) => {
    //     setSortBy(value);
    // };

    // Clear all filters - Reset về trống
    const clearFilters = () => {
        setBrand('');
        setGrade('');
        setSelectedColors([]);
        setSortBy('name-asc');
    };

    // Helper function to get color hex
    const getColorHex = (colorName) => {
        const colorMap = {
            'Black': '#000000',
            'Đen': '#000000',
            'White': '#FFFFFF',
            'Trắng': '#FFFFFF',
            'Red': '#DC0000',
            'Đỏ': '#DC0000',
            'Blue': '#0000FF',
            'Xanh dương': '#0000FF',
            'Silver': '#C0C0C0',
            'Bạc': '#C0C0C0',
            'Gray': '#808080',
            'Xám': '#808080',
        };
        return colorMap[colorName] || '#999999';
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
    };

    return (
        <div className="car-filter-container">
            {/* Loading state */}
            {loading && (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-text">Đang tải dữ liệu xe...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="error-container">
                    <div className="error-title">
                        Lỗi khi tải dữ liệu: {error}
                    </div>
                    <button className="retry-btn" onClick={refetch}>
                        <span>Thử lại</span>
                    </button>
                </div>
            )}

            {/* Main content - only show when not loading */}
            {!loading && (
                <>
                    {/* Filters Compact Box */}
                    <div className="filters-compact-box">
                        {/* Dòng 1: Chọn màu - Click để toggle */}
                        <div>
                            <label className="filter-label" style={{ display: 'block', marginBottom: 12 }}>Chọn Màu</label>
                            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {availableColors.map(color => {
                                    const isSelected = selectedColors.includes(color);
                                    return (
                                        <div
                                            key={color}
                                            onClick={() => {
                                                if (isSelected) {
                                                    // Click lại để bỏ chọn
                                                    setSelectedColors(selectedColors.filter(c => c !== color));
                                                } else {
                                                    // Chọn màu mới
                                                    setSelectedColors([...selectedColors, color]);
                                                }
                                            }}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 8,
                                                cursor: 'pointer',
                                                padding: 8,
                                                borderRadius: 8,
                                                border: isSelected ? '3px solid #DC0000' : '2px solid #E5E5E5',
                                                backgroundColor: isSelected ? '#FFF5F5' : '#FFFFFF',
                                                transition: 'all 0.3s',
                                                minWidth: 80
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    backgroundColor: getColorHex(color),
                                                    borderRadius: 8,
                                                    border: (color === 'White' || color === 'Trắng') ? '2px solid #E5E5E5' : 'none',
                                                    boxShadow: isSelected ? '0 4px 12px rgba(220, 0, 0, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            />
                                            <span style={{
                                                fontSize: 13,
                                                fontWeight: isSelected ? 600 : 500,
                                                color: isSelected ? '#DC0000' : '#333333',
                                                textAlign: 'center'
                                            }}>
                                                {color}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dòng 2: Hãng xe + Hạng xe + Sắp xếp */}
                        <div className="filters-grid" style={{ marginTop: 24 }}>
                            {/* Hãng xe */}
                            <div className="filter-group">
                                <label className="filter-label">Chọn xe</label>
                                <select
                                    className="filter-select"
                                    value={brand}
                                    onChange={e => setBrand(e.target.value)}
                                >
                                    <option value="">-- Chọn một xe --</option>
                                    <option value="BMW">BMW</option>
                                    <option value="Tesla">Tesla</option>
                                    <option value="VinFast">VinFast</option>
                                </select>
                            </div>

                            {/* Hạng xe */}
                            <div className="filter-group">
                                <label className="filter-label">Hạng xe</label>
                                <select
                                    className="filter-select"
                                    value={grade}
                                    onChange={e => setGrade(e.target.value)}
                                >
                                    <option value="">-- Chọn hạng xe --</option>
                                    <option value="Air">Air</option>
                                    <option value="Plus">Plus</option>
                                    <option value="Pro">Pro</option>
                                </select>
                            </div>

                            {/* Sắp xếp */}
                            <div className="filter-group">
                                <label className="filter-label">Sắp xếp</label>
                                <select
                                    className="filter-select"
                                    value={sortBy}
                                    onChange={e => setSortBy(e.target.value)}
                                >
                                    <option value="name-asc">Tên A-Z</option>
                                    <option value="name-desc">Tên Z-A</option>
                                    <option value="grade-asc">Hạng thấp → cao</option>
                                    <option value="grade-desc">Hạng cao → thấp</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid #E5E5E5' }}>
                            <button className="clear-filters-btn" onClick={clearFilters}>
                                <span>Reset bộ lọc</span>
                            </button>
                        </div>
                    </div>

                    {/* Cars Grid */}
                    <div className="cars-grid">
                        {sortedCars.length === 0 ? (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <div className="empty-icon">🚗</div>
                                <h3 className="empty-title">Không tìm thấy xe phù hợp</h3>
                                <p className="empty-message">
                                    {selectedBranch && `Chi nhánh: ${selectedBranch} | `}
                                    {brand && `Hãng xe: ${brand} | `}
                                    {grade && `Hạng: ${grade} | `}
                                    Tổng số xe: {cars.length}
                                    <br /><br />
                                    💡 Gợi ý: Thử chọn hãng xe, hạng xe hoặc màu sắc khác
                                </p>
                            </div>
                        ) : (
                            sortedCars.map(car => (
                                <div key={car.id} className="car-card">
                                    {/* Car Image */}
                                    <div className="car-image-container">
                                        <img
                                            src={car.image}
                                            alt={car.vehicle_name}
                                            className="car-image"
                                        />
                                        <div className="car-status-badge">Available</div>
                                    </div>

                                    {/* Car Info */}
                                    <div className="car-info">
                                        <h3 className="car-name">{car.vehicle_name}</h3>

                                        <div className="car-details">
                                            <div className="car-detail-item">
                                                <span className="car-detail-label">Biển số:</span>
                                                <span>{car.plate_number}</span>
                                            </div>
                                            <div className="car-detail-item">
                                                <span className="car-detail-label">Hạng xe:</span>
                                                <span>{car.variant || car.grade || 'N/A'}</span>
                                            </div>
                                            <div className="car-detail-item">
                                                <span className="car-detail-label">Màu sắc:</span>
                                                <span>
                                                    {car.color || 'N/A'}
                                                    {car.color && car.color !== 'N/A' && (
                                                        <span 
                                                            className="car-color-swatch"
                                                            style={{ backgroundColor: getColorHex(car.color) }}
                                                        ></span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="car-detail-item">
                                                <span className="car-detail-label">Loại xe:</span>
                                                <span>{car.type === '4-seater' ? '4 Chỗ' : '7 Chỗ'}</span>
                                            </div>
                                        </div>

                                        <button className="rent-btn" onClick={() => handleRentCar(car)}>
                                            <span>Thuê xe ngay</span>
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
