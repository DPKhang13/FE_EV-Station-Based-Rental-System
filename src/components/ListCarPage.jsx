import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import CarFilter from './CarFilter';
import { rentalStationService } from '../services';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './ListCarPage.css';

// Custom TimePicker Component với 2 cột riêng biệt
const CustomTimePicker = ({ value, onChange, placeholder = "Chọn giờ" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState(value ? parseInt(value.split(':')[0]) : null);
    const [selectedMinute, setSelectedMinute] = useState(value ? parseInt(value.split(':')[1]) : null);
    const timePickerRef = useRef(null);

    // Tạo danh sách giờ (0-23)
    const hours = Array.from({ length: 24 }, (_, i) => i);
    // Tạo danh sách phút (0, 5, 10, ..., 55)
    const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

    useEffect(() => {
        if (value) {
            const [h, m] = value.split(':');
            setSelectedHour(parseInt(h));
            setSelectedMinute(parseInt(m));
        } else {
            setSelectedHour(null);
            setSelectedMinute(null);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (timePickerRef.current && !timePickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleHourSelect = (hour) => {
        setSelectedHour(hour);
        const minute = selectedMinute !== null ? selectedMinute : 0;
        onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    };

    const handleMinuteSelect = (minute) => {
        setSelectedMinute(minute);
        const hour = selectedHour !== null ? selectedHour : 0;
        onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    };

    const displayValue = value || placeholder;

    return (
        <div className="custom-time-picker" ref={timePickerRef}>
            <button
                type="button"
                className="custom-time-picker-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                {displayValue}
            </button>
            {isOpen && (
                <div className="custom-time-picker-dropdown">
                    <div className="custom-time-picker-header">Giờ</div>
                    <div className="custom-time-picker-columns">
                        <div className="custom-time-picker-column">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className={`custom-time-picker-item ${
                                        selectedHour === hour ? 'selected' : ''
                                    }`}
                                    onClick={() => handleHourSelect(hour)}
                                >
                                    {String(hour).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        <div className="custom-time-picker-column">
                            {minutes.map((minute) => (
                                <div
                                    key={minute}
                                    className={`custom-time-picker-item ${
                                        selectedMinute === minute ? 'selected' : ''
                                    }`}
                                    onClick={() => handleMinuteSelect(minute)}
                                >
                                    {String(minute).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ListCarPage = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const selectedBranch = queryParams.get('branch') || '';
    // Nhận gradeFilter và seatCount từ state (nếu có từ LocationSelect/Offers)
    const { gradeFilter, seatCount } = location.state || {};
    const [branchName, setBranchName] = useState('');
    const [loadingBranch, setLoadingBranch] = useState(true);
    const [loadingVehicles, setLoadingVehicles] = useState(true);
    const [vehicles, setVehicles] = useState([]);
    
    // State cho form tìm kiếm xe
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [searching, setSearching] = useState(false);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, []);

    // ✅ Load vehicles trước (ưu tiên) - branch name có thể load sau hoặc bỏ qua
    useEffect(() => {
        const loadVehicles = async () => {
            if (!selectedBranch) {
                setVehicles([]);
                setLoadingVehicles(false);
                return;
            }

            // Nếu đang search, không load từ station
            if (searching) {
                return;
            }

            try {
                setLoadingVehicles(true);
                const response = await fetch(`http://localhost:8080/api/vehicles/station/${selectedBranch}`);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`❌ API Error [${response.status}]:`, {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                        error: errorText
                    });
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                const vehicleList = Array.isArray(data) ? data : (data.data || []);
                setVehicles(vehicleList);
                console.log(`✅ Loaded ${vehicleList.length} vehicles for station ${selectedBranch}`);
            } catch (error) {
                console.error(` Error loading vehicles for station ${selectedBranch}:`, error);
                if (error.message.includes('500')) {
                    console.error(' Backend server error (500). Please check backend logs.');
                }
                setVehicles([]);
            } finally {
                setLoadingVehicles(false);
            }
        };

        loadVehicles();
    }, [selectedBranch, searching]);

    // ✅ Load branch name sau (không ảnh hưởng đến hiển thị xe) - lazy load
    useEffect(() => {
        const loadBranchName = async () => {
            if (!selectedBranch) {
                setBranchName('Tất cả chi nhánh');
                setLoadingBranch(false);
                return;
            }

            // ✅ Set tên mặc định ngay, load chi tiết sau
            setBranchName(`Chi nhánh ${selectedBranch}`);
            setLoadingBranch(false);

            // ✅ Load chi tiết tên station sau (không block UI)
            try {
                const stations = await rentalStationService.getAll();
                const station = stations.find(s =>
                    String(s.id || '') === String(selectedBranch) ||
                    String(s.stationid || '') === String(selectedBranch)
                );

                if (station?.name) {
                    setBranchName(station.name);
                }
            } catch (error) {
                console.error('❌ Error loading branch name:', error);
                // Giữ tên mặc định nếu lỗi
            }
        };

        // ✅ Delay nhỏ để ưu tiên load vehicles trước
        const timer = setTimeout(loadBranchName, 300);
        return () => clearTimeout(timer);
    }, [selectedBranch]);

    // Format datetime cho API (ISO 8601: yyyy-MM-ddTHH:mm:ss)
    const formatDateTimeForAPI = (date, time) => {
        if (!date || !time) return null;
        const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
        const timeStr = time.length === 5 ? `${time}:00` : time;
        return `${dateStr}T${timeStr}`;
    };

    // Hàm tìm kiếm xe available
    const handleSearchVehicles = async () => {
        if (!startDate || !endDate || !startTime || !endTime) {
            alert('Vui lòng chọn đầy đủ ngày và giờ nhận xe, trả xe');
            return;
        }

        try {
            setSearching(true);
            setLoadingVehicles(true);

            const startDateTime = formatDateTimeForAPI(startDate, startTime);
            const endDateTime = formatDateTimeForAPI(endDate, endTime);

            if (!startDateTime || !endDateTime) {
                alert('Vui lòng chọn đầy đủ ngày và giờ');
                return;
            }

            if (!selectedBranch) {
                alert('Vui lòng chọn trạm trước khi tìm kiếm');
                return;
            }

            const token = localStorage.getItem('accessToken');
            const url = `http://localhost:8080/api/vehicles/available?startTime=${encodeURIComponent(startDateTime)}&endTime=${encodeURIComponent(endDateTime)}&stationId=${selectedBranch}`;
            
            console.log('🔍 Searching available vehicles:', { startDateTime, endDateTime, stationId: selectedBranch });

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const vehicleList = Array.isArray(data) ? data : (data.data || []);
            setVehicles(vehicleList);
            console.log(`✅ Found ${vehicleList.length} available vehicles`);
            
            // Reset searching sau khi tìm xong
            setTimeout(() => setSearching(false), 100);
        } catch (error) {
            console.error('❌ Error searching vehicles:', error);
            alert('Không thể tìm kiếm xe. Vui lòng thử lại.');
            setVehicles([]);
            setSearching(false);
        } finally {
            setLoadingVehicles(false);
        }
    };

    return (
        <div className="listcar-main">
            <div className="listcar-header">
                <h1 className="listcar-title">Danh sách xe</h1>
                {selectedBranch && !loadingBranch && (
                    <p className="branch-name">{branchName}</p>
                )}
            </div>

            {/* Khung lọc tìm kiếm xe */}
            <div className="search-vehicle-form">
                <div className="search-form-row">
                    <div className="search-form-group">
                        <label>Trạm</label>
                        <input
                            type="text"
                            value={branchName || 'Chưa chọn trạm'}
                            readOnly
                            disabled
                            className="station-input"
                        />
                    </div>

                    <div className="search-form-group">
                        <label>Ngày nhận xe</label>
                        <div className="date-time-inputs">
                            <DatePicker
                                selected={startDate ? new Date(startDate) : null}
                                onChange={(date) => setStartDate(date ? date.toISOString().split('T')[0] : '')}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                placeholderText="Chọn ngày"
                                className="date-input"
                                showTimeSelect={false}
                            />
                            <CustomTimePicker
                                value={startTime}
                                onChange={setStartTime}
                                placeholder="Chọn giờ"
                            />
                        </div>
                    </div>

                    <div className="search-form-group">
                        <label>Ngày trả xe</label>
                        <div className="date-time-inputs">
                            <DatePicker
                                selected={endDate ? new Date(endDate) : null}
                                onChange={(date) => setEndDate(date ? date.toISOString().split('T')[0] : '')}
                                dateFormat="dd/MM/yyyy"
                                minDate={startDate ? new Date(startDate) : new Date()}
                                placeholderText="Chọn ngày"
                                className="date-input"
                                showTimeSelect={false}
                            />
                            <CustomTimePicker
                                value={endTime}
                                onChange={setEndTime}
                                placeholder="Chọn giờ"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        className="search-vehicle-btn"
                        onClick={handleSearchVehicles}
                        disabled={searching || loadingVehicles || !selectedBranch}
                    >
                        {searching ? 'Đang tìm...' : 'Tìm kiếm xe'}
                    </button>
                </div>
            </div>

            <CarFilter 
                selectedBranch={selectedBranch} 
                vehicles={vehicles} 
                gradeFilter={gradeFilter}
                seatCount={seatCount}
                loading={loadingVehicles}
                branchName={branchName}
            />
        </div>
    );
};

export default ListCarPage;
