import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import { AuthContext } from '../context/AuthContext';
import './Booking7Seater.css';

const Booking7Seater = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { vehicles: cars, loading } = useVehicles();
    const preSelectedCar = location.state?.car;
    const gradeFilter = location.state?.gradeFilter; // For filtering by grade from Offers

    const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
    const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        startTime: '',
        plannedHours: '',
        couponCode: ''
    });

    // Filter 7-seater available cars, optionally by grade
    const availableCars = cars.filter(car => {
        const isSevenSeater = car.type === '7-seater';
        const isAvailable = car.status === 'Available';
        const matchesGrade = gradeFilter ? car.grade === gradeFilter : true;
        return isSevenSeater && isAvailable && matchesGrade;
    });

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleCarSelect = (e) => {
        const carId = e.target.value;
        setSelectedCarId(carId);
        if (carId) {
            const car = availableCars.find(c => c.id === parseInt(carId));
            setSelectedCar(car);
        } else {
            setSelectedCar(null);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Validate car selection
        if (!selectedCar) {
            alert('Please select a car before confirming booking.');
            return;
        }

        // 2. Validate dates and hours
        if (!formData.startTime) {
            alert('Please select pickup date and time.');
            return;
        }

        if (!formData.plannedHours || formData.plannedHours < 1) {
            alert('Please enter number of hours to rent (minimum 1 hour).');
            return;
        }

        // 3. Validate time logic
        const start = new Date(formData.startTime);
        const now = new Date();

        if (start < now) {
            alert('Pickup time must be in the future!');
            return;
        }

        // 4. Calculate end time from start time + planned hours
        const plannedHours = parseInt(formData.plannedHours);
        const end = new Date(start.getTime() + (plannedHours * 60 * 60 * 1000));

        // 5. Get user ID and token
        const token = localStorage.getItem('accessToken');

        let customerId = user?.userId;

        // Fallback: try to get from localStorage if user context not available
        if (!customerId) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    customerId = parsedUser.userId;
                } catch (e) {
                    console.error('Failed to parse user from localStorage:', e);
                }
            }
        }

        console.log('🔍 [Booking] Checking auth:', {
            hasUser: !!user,
            userId: user?.userId,
            customerId: customerId,
            hasToken: !!token
        });

        if (!customerId || !token) {
            alert('Please login to continue!');
            navigate('/login');
            return;
        }

        // 6. Convert datetime to backend format (add seconds)
        const startTimeFormatted = formData.startTime.length === 16
            ? formData.startTime + ':00'
            : formData.startTime;

        // Format end time (calculated from startTime + plannedHours)
        const endTimeFormatted = end.toISOString().slice(0, 19).replace('T', ' ').replace(' ', 'T');

        // 7. Prepare booking data
        const bookingData = {
            car: selectedCar,
            orderData: {
                customerId: parseInt(customerId),
                vehicleId: selectedCar.id,
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                plannedHours: plannedHours,
                couponCode: formData.couponCode || null,
                actualHours: null
            },
            plannedHours: plannedHours
        };

        console.log('📦 Navigating to confirm page with data:', bookingData);

        // 8. Navigate to Confirm Booking Page
        navigate('/confirm-booking', { state: { bookingData } });
    };

    // Show loading state
    if (loading) {
        return (
            <div className="booking-container">
                <div style={{ textAlign: 'center', padding: 60, fontSize: 18, color: '#888' }}>
                    Đang tải dữ liệu xe...
                </div>
            </div>
        );
    }

    return (
        <div className="booking-container">
            <h1 className="booking-title">Booking 7-Seater Car</h1>

            <div className="booking-content">
                {/* Left side - Booking Form */}
                <div className="booking-form-section">
                    <form onSubmit={handleSubmit} className="booking-form">
                        <div className="form-group">
                            <label htmlFor="carSelect">Select Car *</label>
                            <select
                                id="carSelect"
                                value={selectedCarId}
                                onChange={handleCarSelect}
                                required
                            >
                                <option value="">Choose a car</option>
                                {availableCars.map(car => (
                                    <option key={car.id} value={car.id}>
                                        {car.vehicle_name} - {car.plate_number} ({car.color}) - Grade: {car.grade}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="startTime">Pick-up Date & Time *</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                min={new Date().toISOString().slice(0, 16)}
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Select when you want to pick up the vehicle
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="plannedHours">Number of Hours to Rent *</label>
                            <input
                                type="number"
                                id="plannedHours"
                                name="plannedHours"
                                value={formData.plannedHours}
                                onChange={handleChange}
                                min="1"
                                step="1"
                                placeholder="Enter number of hours (e.g., 24)"
                                required
                            />
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Minimum rental period is 1 hour
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="couponCode">Coupon Code (Optional)</label>
                            <input
                                type="text"
                                id="couponCode"
                                name="couponCode"
                                value={formData.couponCode}
                                onChange={handleChange}
                                placeholder="Enter coupon code if you have one"
                            />
                            <small style={{ color: '#666', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                                Leave blank if you don't have a coupon
                            </small>
                        </div>

                        <button type="submit" className="submit-button">
                            CONFIRM BOOKING
                        </button>
                    </form>
                </div>

                {/* Right side - Selected Car Display */}
                <div className="booking-car-display">
                    <h2 className="car-display-title">Selected Car</h2>

                    {!selectedCar ? (
                        <div className="no-car-selected">
                            <p>Please select a car from the dropdown to view details</p>
                        </div>
                    ) : (
                        <>
                            <img
                                src={selectedCar.image}
                                alt={selectedCar.vehicle_name}
                                className="car-display-image"
                            />

                            <div className="car-display-details">
                                <h3 className="car-name">{selectedCar.vehicle_name}</h3>

                                {selectedCar.grade && (
                                    <div className="car-grade-badge">
                                        Grade: {selectedCar.grade}
                                    </div>
                                )}

                                <div className="car-info-grid">
                                    <div className="car-info-item">
                                        <span className="info-label">Vehicle ID:</span>
                                        <span className="info-value">{selectedCar.vehicle_id}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Brand:</span>
                                        <span className="info-value">{selectedCar.brand}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Color:</span>
                                        <span className="info-value">{selectedCar.color}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Seats:</span>
                                        <span className="info-value">{selectedCar.seat_count} seats</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Year:</span>
                                        <span className="info-value">{selectedCar.year_of_manufacture}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Plate Number:</span>
                                        <span className="info-value">{selectedCar.plate_number}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Transmission:</span>
                                        <span className="info-value">{selectedCar.transmission}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Battery:</span>
                                        <span className="info-value battery">{selectedCar.battery_status}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Capacity:</span>
                                        <span className="info-value">{selectedCar.battery_capacity}</span>
                                    </div>

                                    <div className="car-info-item">
                                        <span className="info-label">Range:</span>
                                        <span className="info-value">{selectedCar.range_km} km</span>
                                    </div>

                                    {selectedCar.variant && (
                                        <div className="car-info-item">
                                            <span className="info-label">Variant:</span>
                                            <span className="info-value">{selectedCar.variant}</span>
                                        </div>
                                    )}

                                    <div className="car-info-item full-width">
                                        <span className="info-label">Status:</span>
                                        <span className={`info-value status ${selectedCar.status === 'Available' ? 'available' : 'unavailable'}`}>
                                            {selectedCar.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="car-description">
                                    <span className="info-label">Description:</span>
                                    <p>{selectedCar.description}</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Booking7Seater;