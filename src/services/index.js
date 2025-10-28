/**
 * Central Export cho tất cả Services
 * Import dễ dàng: import { authService, orderService } from './services'
 */

// Base API
export { default as api, apiFetch } from './api';

// Auth
export { default as authService } from './authService';

// Vehicle
export { default as vehicleService } from './vehicleService';
export {
    getVehicles,
    transformVehicleData,
    fetchAndTransformVehicles
} from './vehicleService';

// Order
export { default as orderService } from './orderService';

// Rental Station
export { default as rentalStationService } from './rentalStationService';

// Pricing Rule
export { default as pricingRuleService } from './pricingRuleService';

// Maintenance
export { default as maintenanceService } from './maintenanceService';

// Feedback
export { default as feedbackService } from './feedbackService';

// Notification
export { default as notificationService } from './notificationService';

// Staff Schedule
export { default as staffScheduleService } from './staffScheduleService';

// Coupon
export { default as couponService } from './couponService';

// Payment
export { default as paymentService } from './paymentService';

// Transaction
export { default as transactionService } from './transactionService';

// Profile
export { default as profileService } from './profileService';
