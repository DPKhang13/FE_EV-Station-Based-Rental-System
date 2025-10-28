import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVehicles } from '../hooks/useVehicles';
import './Booking7Seater.css';

const Booking7Seater = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { vehicles: cars, loading } = useVehicles();
    const preSelectedCar = location.state?.car;
    const gradeFilter = location.state?.gradeFilter; // For filtering by grade from Offers

    const [selectedCarId, setSelectedCarId] = useState(preSelectedCar?.id || '');
    const [selectedCar, setSelectedCar] = useState(preSelectedCar || null);

    const [formData, setFormData] = useState({
        pickupDate: '',
        returnDate: '',
        pickupLocation: '',
        fullName: '',
        email: '',
        phone: ''
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
        if (!selectedCar) {
            alert('Please select a car before confirming booking.');
            return;
        }
        // Handle booking submission
        console.log('Booking submitted:', { ...formData, car: selectedCar });
        alert('Booking confirmed! We will contact you shortly.');
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
                            <label htmlFor="pickupDate">Pick-up Date *</label>
                            <input
                                type="date"
                                id="pickupDate"
                                name="pickupDate"
                                value={formData.pickupDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="returnDate">Return Date *</label>
                            <input
                                type="date"
                                id="returnDate"
                                name="returnDate"
                                value={formData.returnDate}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pickupLocation">Pick-up Location *</label>
                            <select
                                id="pickupLocation"
                                name="pickupLocation"
                                value={formData.pickupLocation}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select location</option>
                                <option value="1">Chi nhánh Quận 1</option>
                                <option value="2">Chi nhánh Quận 8</option>
                                <option value="3">Chi nhánh Thủ Đức</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="fullName">Full Name *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">Phone Number *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                required
                            />
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