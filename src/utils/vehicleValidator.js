/**
 * Vehicle Validator Utility
 * Validates vehicle data before allowing booking
 */

/**
 * Validate if vehicle has all required data for booking
 * @param {Object} vehicle - Vehicle object from API
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export const validateVehicleForBooking = (vehicle) => {
    const errors = [];

    if (!vehicle) {
        return { valid: false, errors: ['Vehicle not found'] };
    }

    // Check required fields for backend order creation
    // Support both camelCase and snake_case
    const seatCount = vehicle.seatCount || vehicle.seat_count;
    if (!seatCount) {
        errors.push('Xe chưa có thông tin số ghế (seatCount/seat_count)');
    }

    // Variant is required
    if (!vehicle.variant && !vehicle.grade) {
        errors.push('Xe chưa có thông tin loại xe (variant/grade)');
    }

    // ⚠️ IMPORTANT: pricingRuleId can be null in frontend
    // Backend will calculate price based on seatCount + variant
    // So we only warn, not block
    if (!vehicle.pricingRuleId && vehicle.pricingRuleId !== 0) {
        console.warn('⚠️ Vehicle has no pricingRuleId, backend will calculate price');
        // Don't add to errors - let backend handle it
    }

    // ✅ KHÔNG KIỂM TRA STATUS - Cho phép đặt xe dù đang RENTAL/BOOKED/CHECKING
    // Backend sẽ kiểm tra overlap timeline thay vì status
    // const status = vehicle.status?.toUpperCase();
    // if (status !== 'AVAILABLE') {
    //     errors.push(`Xe không sẵn sàng (status: ${vehicle.status})`);
    // }

    // Check vehicle has station
    const stationId = vehicle.stationId || vehicle.station_id || vehicle.station;
    if (!stationId) {
        errors.push('Xe chưa được gán trạm (stationId)');
    }

    return {
        valid: errors.length === 0,
        errors: errors
    };
};

/**
 * Filter valid vehicles from list
 * @param {Array} vehicles - Array of vehicles
 * @returns {Array} - Array of valid vehicles
 */
export const filterValidVehicles = (vehicles) => {
    if (!Array.isArray(vehicles)) return [];

    return vehicles.filter(vehicle => {
        const validation = validateVehicleForBooking(vehicle);
        return validation.valid;
    });
};

/**
 * Get validation error message for display
 * @param {Object} vehicle - Vehicle object
 * @returns {string} - User-friendly error message
 */
export const getVehicleValidationMessage = (vehicle) => {
    const validation = validateVehicleForBooking(vehicle);

    if (validation.valid) {
        return 'Xe hợp lệ để đặt';
    }

    return `Xe không thể đặt:\n${validation.errors.map(e => `• ${e}`).join('\n')}`;
};

/**
 * Check if vehicle can be booked (throws error if not)
 * @param {Object} vehicle - Vehicle object
 * @throws {Error} - If vehicle is invalid
 */
export const assertVehicleValid = (vehicle) => {
    const validation = validateVehicleForBooking(vehicle);

    if (!validation.valid) {
        throw new Error(
            `Xe không hợp lệ:\n${validation.errors.join('\n')}\n\nVui lòng chọn xe khác hoặc liên hệ hỗ trợ.`
        );
    }
};

/**
 * Log vehicle validation details for debugging
 * @param {Object} vehicle - Vehicle object
 */
export const logVehicleValidation = (vehicle) => {
    console.log('🔍 [Vehicle Validation]');
    console.log('  Vehicle ID:', vehicle?.vehicleId);
    console.log('  Name:', vehicle?.vehicleName);
    console.log('  Status:', vehicle?.status);
    console.log('  Seat Count:', vehicle?.seatCount || '❌ MISSING');
    console.log('  Variant:', vehicle?.variant || '❌ MISSING');
    console.log('  Pricing Rule ID:', vehicle?.pricingRuleId || '❌ MISSING');
    console.log('  Station ID:', vehicle?.stationId || vehicle?.station || '❌ MISSING');

    const validation = validateVehicleForBooking(vehicle);
    console.log('  Valid:', validation.valid ? '✅ YES' : '❌ NO');

    if (!validation.valid) {
        console.log('  Errors:', validation.errors);
    }
};

export default {
    validateVehicleForBooking,
    filterValidVehicles,
    getVehicleValidationMessage,
    assertVehicleValid,
    logVehicleValidation
};
