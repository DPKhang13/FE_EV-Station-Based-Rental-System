import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';

import './CarFilter.css';

const CarFilter = ({ selectedBranch, vehicles: propsVehicles = [], gradeFilter: initialGradeFilter = '', seatCount: initialSeatCount = null, loading: propsLoading = false }) => {
    const navigate = useNavigate();
    
    // ✅ Chỉ auto-load khi KHÔNG có vehicles từ props VÀ không có selectedBranch
    // Nếu có selectedBranch → ListCarPage sẽ load vehicles theo station → không cần load tất cả 120 xe
    // Nếu có propsVehicles → đã có data → không cần load
    const shouldAutoLoad = (!selectedBranch && (!propsVehicles || propsVehicles.length === 0));
    const { vehicles: cars, loading: hookLoading, error, refetch } = useVehicles(shouldAutoLoad);
    
    // Use vehicles from props if available, otherwise use hook data
    const vehicleData = propsVehicles && propsVehicles.length > 0 ? propsVehicles : cars;
    // ✅ Nếu có selectedBranch (từ ListCarPage), sử dụng propsLoading; nếu không, sử dụng hookLoading
    const isLoadingData = selectedBranch ? propsLoading : hookLoading;
    
    const [brand, setBrand] = useState('');
    // ✅ Tự động set grade từ gradeFilter nếu có (từ Offers)
    const [grade, setGrade] = useState(initialGradeFilter || '');
    const [selectedColors, setSelectedColors] = useState([]);
    const [sortBy, setSortBy] = useState('name-asc');
    
    // ✅ Cập nhật grade khi initialGradeFilter thay đổi
    useEffect(() => {
        if (initialGradeFilter) {
            setGrade(initialGradeFilter);
        }
    }, [initialGradeFilter]);

    // Get unique colors from available cars
    const availableColors = [...new Set(vehicleData
        .filter(car => car.color && car.color !== 'N/A' && car.color !== 'null')
        .map(car => car.color))
    ].sort();

    // Get unique brands from available cars
    // eslint-disable-next-line no-unused-vars
    const availableBrands = [...new Set(vehicleData
        .filter(car => car.brand && car.brand !== 'N/A' && car.brand !== 'null')
        .map(car => car.brand))
    ].sort();

    const filteredCars = vehicleData.filter(car => {
        // 1. ✅ HIỂN THỊ TẤT CẢ XE (kể cả BOOKED - vì có thể available ở timeline khác)
        // Chỉ loại bỏ xe MAINTENANCE
        if (car.status === 'Maintenance' || car.status === 'MAINTENANCE') {
            return false;
        }

        // 2. ✅ LỌC THEO SỐ CHỖ (nếu có từ Offers - 4 chỗ hoặc 7 chỗ)
        if (initialSeatCount !== null && initialSeatCount !== undefined) {
            const carSeatCount = car.seatCount || car.seat_count || 0;
            const carType = car.type || '';
            
            // Kiểm tra theo seatCount hoặc type
            const isFourSeater = carSeatCount === 4 || carType === '4-seater' || carType === '4-seat';
            const isSevenSeater = carSeatCount === 7 || carType === '7-seater' || carType === '7-seat';
            
            if (initialSeatCount === 4 && !isFourSeater) {
                return false;
            }
            if (initialSeatCount === 7 && !isSevenSeater) {
                return false;
            }
        }

        // 3. LỌC THEO CHI NHÁNH (nếu có chọn)
        if (selectedBranch) {
            const carStationId = String(car.stationId || car.branch || '');
            const selectedStationId = String(selectedBranch);
            if (carStationId !== selectedStationId) {
                return false;
            }
        }

        // 4. LỌC THEO HÃNG XE (thay vì loại xe)
        if (brand) {
            const carBrand = car.brand || car.manufacturer || '';
            if (!carBrand || String(carBrand).toLowerCase() !== String(brand).toLowerCase()) {
                return false;
            }
        }

        // 5. LỌC THEO HẠNG XE (nếu có chọn)
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

        // 6. LỌC THEO MÀU SẮC (nếu có chọn)
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
        console.log('   SeatCount:', initialSeatCount || 'All');
        console.log('   Brand:', brand || 'All');
        console.log('   Grade:', grade || 'All');
        console.log('   Colors:', selectedColors.length > 0 ? selectedColors.join(', ') : 'All');
        console.log('   Total cars:', cars.length);
        console.log('   Filtered cars:', filteredCars.length);
    }, [selectedBranch, initialSeatCount, brand, grade, selectedColors, sortBy, cars.length, filteredCars.length, cars]);

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

    // Helper function to get car image URL
    const getCarImage = (car) => {
        if (car.image) return car.image;
        
        const brand = (car.brand || '').toLowerCase();
        const seats = car.seatCount || 4;
        const seatStr = seats === 7 ? '7' : '4';
        const color = (car.color || 'red').toLowerCase();
        
        // Map brands to folder names
        const brandFolder = {
            'tesla': `Tes${seatStr}`,
            'bmw': `BMW${seatStr}`,
            'vinfast': `Vin${seatStr}`
        };
        
        // Map colors to image filenames
        const colorMap = {
            'red': 'red.jpg',
            'blue': 'blue.jpg',
            'white': 'white.jpg',
            'black': 'black.jpg',
            'silver': 'silver.jpg',
            'đỏ': 'red.jpg',
            'xanh dương': 'blue.jpg',
            'trắng': 'white.jpg',
            'đen': 'black.jpg',
            'bạc': 'silver.jpg'
        };
        
        const folder = brandFolder[brand] || `Tes${seatStr}`;
        const imageFile = colorMap[color] || 'red.jpg';
        
        return `/src/assets/${folder}/${imageFile}`;
    };

    // Điều hướng đến trang booking - Truyền đầy đủ thông tin xe
    const handleRentCar = (car) => {
    if (!car) return;

    // Xác định trang booking dựa vào seatCount từ API
    const bookingPage =
        car.seatCount === 4
            ? "/booking-4seater"
            : car.seatCount === 7
                ? "/booking-7seater"
                : "/booking-4seater"; // fallback

    navigate(bookingPage, {
        state: {
            car: car,
            vehicleImage: car.image,
            vehicleName: car.vehicleName || car.vehicle_name,
            plateNumber: car.plateNumber || car.plate_number,
            grade: car.grade || car.variant,
            color: car.color
        }
    });
};


    // State cho collapse/expand các filter sections
    const [expandedSections, setExpandedSections] = useState({
        color: true,
        brand: true,
        grade: true,
        sort: true
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const resetFilters = () => {
        setBrand('');
        setGrade('');
        setSelectedColors([]);
        setSortBy('name-asc');
    };

    return (
        <div className="car-filter-container">
            {/* Loading state */}
            {isLoadingData && (
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
            {!isLoadingData && (
                <div className="filter-layout">
                    {/* Left Filter Panel */}
                    <div className="filter-panel">
                        {/* Section: Chọn Màu */}
                        <div className="filter-section">
                            <div className="filter-section-header">
                                <span className="filter-section-title">Màu Sắc</span>
                                {selectedColors.length > 0 && (
                                    <span 
                                        className="filter-section-close"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedColors([]);
                                        }}
                                    >
                                        ×
                                    </span>
                                )}
                                <span className="filter-section-toggle" onClick={() => toggleSection('color')}>
                                    {expandedSections.color ? '−' : '+'}
                                </span>
                            </div>
                            {expandedSections.color && (
                                <div className="filter-section-content">
                                    <div className="color-grid">
                                        {availableColors.map(color => {
                                            const isSelected = selectedColors.includes(color);
                                            return (
                                                <div
                                                    key={color}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedColors(selectedColors.filter(c => c !== color));
                                                        } else {
                                                            setSelectedColors([...selectedColors, color]);
                                                        }
                                                    }}
                                                    className={`color-option ${isSelected ? 'selected' : ''}`}
                                                    title={color}
                                                >
                                                    <div
                                                        className="color-swatch"
                                                        style={{
                                                            backgroundColor: getColorHex(color),
                                                            border: (color === 'White' || color === 'Trắng') ? '2px solid #E5E5E5' : 'none'
                                                        }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section: Chọn Xe */}
                        <div className="filter-section">
                            <div className="filter-section-header" onClick={() => toggleSection('brand')}>
                                <span className="filter-section-title">Chọn Xe</span>
                                <span className="filter-section-toggle">
                                    {expandedSections.brand ? '−' : '+'}
                                </span>
                            </div>
                            {expandedSections.brand && (
                                <div className="filter-section-content">
                                    <select
                                        className="filter-select-panel"
                                        value={brand}
                                        onChange={e => setBrand(e.target.value)}
                                    >
                                        <option value="">-- Chọn một xe --</option>
                                        <option value="BMW">BMW</option>
                                        <option value="Tesla">Tesla</option>
                                        <option value="VinFast">VinFast</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Section: Hãng Xe */}
                        <div className="filter-section">
                            <div className="filter-section-header" onClick={() => toggleSection('grade')}>
                                <span className="filter-section-title">Hãng Xe</span>
                                <span className="filter-section-toggle">
                                    {expandedSections.grade ? '−' : '+'}
                                </span>
                            </div>
                            {expandedSections.grade && (
                                <div className="filter-section-content">
                                    <select
                                        className="filter-select-panel"
                                        value={grade}
                                        onChange={e => setGrade(e.target.value)}
                                    >
                                        <option value="">Tất cả</option>
                                        <option value="Air">Air</option>
                                        <option value="Plus">Plus</option>
                                        <option value="Pro">Pro</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Section: Sắp Xếp */}
                        <div className="filter-section">
                            <div className="filter-section-header" onClick={() => toggleSection('sort')}>
                                <span className="filter-section-title">Sắp Xếp</span>
                                <span className="filter-section-toggle">
                                    {expandedSections.sort ? '−' : '+'}
                                </span>
                            </div>
                            {expandedSections.sort && (
                                <div className="filter-section-content">
                                    <select
                                        className="filter-select-panel"
                                        value={sortBy}
                                        onChange={e => setSortBy(e.target.value)}
                                    >
                                        <option value="name-asc">Tên A-Z</option>
                                        <option value="name-desc">Tên Z-A</option>
                                        <option value="grade-asc">Hạng thấp đến cao</option>
                                        <option value="grade-desc">Hạng cao đến thấp</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Reset Button */}
                        <button className="reset-filters-btn" onClick={resetFilters}>
                            RESET BỘ LỌC
                        </button>
                    </div>

                    {/* Right Content Area - Cars Grid */}
                    <div className="cars-content-area">
                        {/* Cars Grid */}
                        <div className="cars-grid">
                        {isLoadingData ? (
                            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                                <div className="empty-icon">⏳</div>
                                <h3 className="empty-title">Vui lòng chờ trong giây lát</h3>
                                <p className="empty-message">
                                    Đang tải danh sách xe...
                                </p>
                            </div>
                        ) : sortedCars.length === 0 ? (
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
                                <div key={car.vehicleId || car.id} className="car-card">
                                    {/* Car Image */}
                                    <div className="car-image-container">
                                        <img
                                            src={getCarImage(car)}
                                            alt={car.vehicleName || car.vehicle_name}
                                            className="car-image"
                                            onError={(e) => {
                                                e.target.src = '/src/assets/Tes4/red.jpg';
                                            }}
                                        />
                                        <div className="car-status-badge">{car.status || 'Available'}</div>
                                    </div>

                                    {/* Car Info */}
                                    <div className="car-info">
                                        <h3 className="car-name">{car.vehicleName || car.vehicle_name}</h3>

                                        <div className="car-specs-grid">
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                                                    <path d="M12 15l-3-3H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2l-3 3z" />
                                                </svg>
                                                <span className="car-spec-text">{car.plateNumber || car.plate_number || 'N/A'}</span>
                                            </div>
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                                    <circle cx="9" cy="7" r="4" />
                                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                                </svg>
                                                <span className="car-spec-text">{car.seatCount || car.seat_count || 4} chỗ</span>
                                            </div>
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 17h14l-1-7H6l-1 7z" />
                                                    <path d="M7 17v-5" />
                                                    <path d="M17 17v-5" />
                                                    <path d="M5 10h14" />
                                                    <path d="M9 10V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
                                                </svg>
                                                <span className="car-spec-text">{car.carmodel || car.carModel || 'N/A'}</span>
                                            </div>
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="1" y="6" width="18" height="12" rx="2" ry="2" />
                                                    <line x1="23" y1="10" x2="23" y2="14" />
                                                </svg>
                                                <span className="car-spec-text">{car.batteryStatus || car.battery_status || 'N/A'}</span>
                                            </div>
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                                    <path d="M2 17l10 5 10-5" />
                                                    <path d="M2 12l10 5 10-5" />
                                                </svg>
                                                <span className="car-spec-text">{car.variant || car.grade || 'N/A'}</span>
                                            </div>
                                            <div className="car-spec-item">
                                                <svg className="car-spec-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10" />
                                                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                                                </svg>
                                                <span className="car-spec-text">
                                                    {car.color || 'N/A'}
                                                    {car.color && car.color !== 'N/A' && (
                                                        <span 
                                                            className="car-color-swatch-inline"
                                                            style={{ backgroundColor: getColorHex(car.color) }}
                                                        ></span>
                                                    )}
                                                </span>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default CarFilter;
