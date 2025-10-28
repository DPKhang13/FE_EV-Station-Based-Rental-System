// ============================================
// EXAMPLE: Cách sử dụng Vehicle API trong Components
// ============================================

// --------------------------------------------
// 1. IMPORT HOOK
// --------------------------------------------
import { useVehicles } from '../hooks/useVehicles';

// --------------------------------------------
// 2. SỬ DỤNG TRONG COMPONENT
// --------------------------------------------

function ExampleComponent() {
    // Destructure các values từ hook
    const { vehicles, loading, error, refetch } = useVehicles();

    // --------------------------------------------
    // 3. XỬ LÝ LOADING STATE
    // --------------------------------------------
    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                Đang tải dữ liệu xe...
            </div>
        );
    }

    // --------------------------------------------
    // 4. XỬ LÝ ERROR STATE (Optional)
    // --------------------------------------------
    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: 'red' }}>Lỗi: {error}</p>
                <button onClick={refetch}>Thử lại</button>
            </div>
        );
    }

    // --------------------------------------------
    // 5. LỌC DỮ LIỆU (nếu cần)
    // --------------------------------------------
    const available4Seaters = vehicles.filter(
        car => car.type === '4-seater' && car.status === 'Available'
    );

    const available7Seaters = vehicles.filter(
        car => car.type === '7-seater' && car.status === 'Available'
    );

    // Filter by brand
    const vinFastCars = vehicles.filter(car => car.brand === 'VinFast');

    // Filter by station
    const station1Cars = vehicles.filter(car => car.stationId === 1);

    // Filter by battery level
    const highBatteryCars = vehicles.filter(car => {
        const batteryPercent = parseInt(car.battery_status);
        return batteryPercent >= 80;
    });

    // --------------------------------------------
    // 6. RENDER DỮ LIỆU
    // --------------------------------------------
    return (
        <div>
            <h1>Danh sách xe</h1>

            {/* Refresh button */}
            <button onClick={refetch}>
                Tải lại dữ liệu
            </button>

            {/* Display count */}
            <p>Tổng số xe: {vehicles.length}</p>

            {/* List vehicles */}
            <div>
                {vehicles.map(car => (
                    <div key={car.id}>
                        <h3>{car.vehicle_name}</h3>
                        <p>Biển số: {car.plate_number}</p>
                        <p>Trạm: {car.stationName}</p>
                        <p>Pin: {car.battery_status}</p>
                        <p>Trạng thái: {car.status}</p>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {vehicles.length === 0 && (
                <p>Không có xe nào.</p>
            )}
        </div>
    );
}

// ============================================
// CÁC TRƯỜNG DỮ LIỆU AVAILABLE
// ============================================
/*
Mỗi vehicle object có các field sau:

Frontend fields (tương thích với code cũ):
- id: number
- vehicle_id: string
- vehicle_name: string
- brand: string
- name: string
- image: image import
- type: '4-seater' | '7-seater'
- seat_count: number
- grade: string | null
- color: string
- year_of_manufacture: number
- plate_number: string
- status: 'Available' | 'Rented' | 'Maintenance' | 'Reserved'
- description: string
- branch: string
- transmission: string
- variant: string | null
- battery_status: string (e.g., "100%")
- battery_capacity: string (e.g., "87.7 kWh")
- range_km: number

New fields từ API:
- stationId: number
- stationName: string
- pricingRuleId: number
*/

// ============================================
// PATTERN: FILTER VÀ SEARCH
// ============================================

function FilterExample() {
    const { vehicles, loading } = useVehicles();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('');
    const [selectedBrand, setSelectedBrand] = React.useState('');

    if (loading) return <div>Loading...</div>;

    // Multiple filters
    const filteredVehicles = vehicles.filter(car => {
        const matchSearch = car.vehicle_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.plate_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = !selectedType || car.type === selectedType;
        const matchBrand = !selectedBrand || car.brand === selectedBrand;

        return matchSearch && matchType && matchBrand;
    });

    // Get unique brands for dropdown
    const brands = [...new Set(vehicles.map(car => car.brand))];

    return (
        <div>
            {/* Search input */}
            <input
                type="text"
                placeholder="Tìm theo tên hoặc biển số..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Type filter */}
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="">Tất cả loại xe</option>
                <option value="4-seater">4-Seater</option>
                <option value="7-seater">7-Seater</option>
            </select>

            {/* Brand filter */}
            <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}>
                <option value="">Tất cả hãng</option>
                {brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                ))}
            </select>

            {/* Results */}
            <p>Tìm thấy {filteredVehicles.length} xe</p>

            {filteredVehicles.map(car => (
                <div key={car.id}>{car.vehicle_name}</div>
            ))}
        </div>
    );
}

// ============================================
// PATTERN: SORTING
// ============================================

function SortingExample() {
    const { vehicles, loading } = useVehicles();
    const [sortBy, setSortBy] = React.useState('name');
    const [sortOrder, setSortOrder] = React.useState('asc');

    if (loading) return <div>Loading...</div>;

    const sortedVehicles = [...vehicles].sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case 'name':
                aValue = a.vehicle_name;
                bValue = b.vehicle_name;
                break;
            case 'year':
                aValue = a.year_of_manufacture;
                bValue = b.year_of_manufacture;
                break;
            case 'battery':
                aValue = parseInt(a.battery_status);
                bValue = parseInt(b.battery_status);
                break;
            case 'range':
                aValue = a.range_km;
                bValue = b.range_km;
                break;
            default:
                return 0;
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    return (
        <div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Tên xe</option>
                <option value="year">Năm sản xuất</option>
                <option value="battery">Pin</option>
                <option value="range">Quãng đường</option>
            </select>

            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            {sortedVehicles.map(car => (
                <div key={car.id}>{car.vehicle_name}</div>
            ))}
        </div>
    );
}

// ============================================
// PATTERN: GROUPING
// ============================================

function GroupingExample() {
    const { vehicles, loading } = useVehicles();

    if (loading) return <div>Loading...</div>;

    // Group by station
    const vehiclesByStation = vehicles.reduce((acc, car) => {
        const stationName = car.stationName || 'Unknown';
        if (!acc[stationName]) {
            acc[stationName] = [];
        }
        acc[stationName].push(car);
        return acc;
    }, {});

    // Group by type
    const vehiclesByType = vehicles.reduce((acc, car) => {
        if (!acc[car.type]) {
            acc[car.type] = [];
        }
        acc[car.type].push(car);
        return acc;
    }, {});

    return (
        <div>
            <h2>Xe theo trạm</h2>
            {Object.entries(vehiclesByStation).map(([station, cars]) => (
                <div key={station}>
                    <h3>{station} ({cars.length} xe)</h3>
                    {cars.map(car => (
                        <div key={car.id}>{car.vehicle_name}</div>
                    ))}
                </div>
            ))}

            <h2>Xe theo loại</h2>
            {Object.entries(vehiclesByType).map(([type, cars]) => (
                <div key={type}>
                    <h3>{type} ({cars.length} xe)</h3>
                </div>
            ))}
        </div>
    );
}

// ============================================
// PATTERN: STATS / ANALYTICS
// ============================================

function StatsExample() {
    const { vehicles, loading } = useVehicles();

    if (loading) return <div>Loading...</div>;

    // Calculate stats
    const totalVehicles = vehicles.length;
    const availableVehicles = vehicles.filter(car => car.status === 'Available').length;
    const rentedVehicles = vehicles.filter(car => car.status === 'Rented').length;
    const maintenanceVehicles = vehicles.filter(car => car.status === 'Maintenance').length;

    const avgBattery = vehicles.reduce((sum, car) => {
        return sum + parseInt(car.battery_status || 0);
    }, 0) / vehicles.length;

    const avgRange = vehicles.reduce((sum, car) => {
        return sum + (car.range_km || 0);
    }, 0) / vehicles.length;

    // Group by brand
    const brandCounts = vehicles.reduce((acc, car) => {
        acc[car.brand] = (acc[car.brand] || 0) + 1;
        return acc;
    }, {});

    return (
        <div>
            <h2>Thống kê</h2>
            <p>Tổng số xe: {totalVehicles}</p>
            <p>Xe sẵn sàng: {availableVehicles}</p>
            <p>Xe đang cho thuê: {rentedVehicles}</p>
            <p>Xe đang bảo trì: {maintenanceVehicles}</p>
            <p>Pin trung bình: {avgBattery.toFixed(1)}%</p>
            <p>Quãng đường TB: {avgRange.toFixed(0)} km</p>

            <h3>Theo hãng</h3>
            {Object.entries(brandCounts).map(([brand, count]) => (
                <p key={brand}>{brand}: {count} xe</p>
            ))}
        </div>
    );
}

// ============================================
// PATTERN: SELECTION AND BOOKING
// ============================================

function SelectionExample() {
    const { vehicles, loading } = useVehicles();
    const [selectedVehicle, setSelectedVehicle] = React.useState(null);
    const navigate = useNavigate();

    if (loading) return <div>Loading...</div>;

    const handleSelect = (vehicle) => {
        setSelectedVehicle(vehicle);
    };

    const handleBooking = () => {
        if (selectedVehicle) {
            // Navigate to booking page with vehicle data
            const bookingPage = selectedVehicle.type === '4-seater'
                ? '/booking-4seater'
                : '/booking-7seater';

            navigate(bookingPage, {
                state: { car: selectedVehicle }
            });
        }
    };

    return (
        <div>
            <h2>Chọn xe</h2>

            {/* Vehicle list */}
            <div>
                {vehicles.map(car => (
                    <div
                        key={car.id}
                        onClick={() => handleSelect(car)}
                        style={{
                            border: selectedVehicle?.id === car.id ? '2px solid blue' : '1px solid gray',
                            padding: 10,
                            margin: 5,
                            cursor: 'pointer'
                        }}
                    >
                        <h4>{car.vehicle_name}</h4>
                        <p>{car.plate_number}</p>
                    </div>
                ))}
            </div>

            {/* Selected vehicle detail */}
            {selectedVehicle && (
                <div>
                    <h3>Xe đã chọn</h3>
                    <p>Tên: {selectedVehicle.vehicle_name}</p>
                    <p>Biển số: {selectedVehicle.plate_number}</p>
                    <button onClick={handleBooking}>Đặt xe</button>
                </div>
            )}
        </div>
    );
}

// ============================================
// PATTERN: REFRESH ON DEMAND
// ============================================

function RefreshExample() {
    const { vehicles, loading, refetch } = useVehicles();
    const [lastUpdated, setLastUpdated] = React.useState(new Date());

    const handleRefresh = async () => {
        await refetch();
        setLastUpdated(new Date());
    };

    return (
        <div>
            <p>Cập nhật lần cuối: {lastUpdated.toLocaleTimeString()}</p>
            <button onClick={handleRefresh} disabled={loading}>
                {loading ? 'Đang tải...' : 'Làm mới'}
            </button>

            <div>
                {vehicles.map(car => (
                    <div key={car.id}>{car.vehicle_name}</div>
                ))}
            </div>
        </div>
    );
}

// ============================================
// PATTERN: CONDITIONAL RENDERING
// ============================================

function ConditionalExample() {
    const { vehicles, loading, error } = useVehicles();

    return (
        <div>
            {loading && <div>Đang tải...</div>}

            {error && (
                <div style={{ color: 'red' }}>
                    Có lỗi xảy ra: {error}
                </div>
            )}

            {!loading && !error && vehicles.length === 0 && (
                <div>Không có xe nào.</div>
            )}

            {!loading && !error && vehicles.length > 0 && (
                <div>
                    Có {vehicles.length} xe
                    {vehicles.map(car => (
                        <div key={car.id}>{car.vehicle_name}</div>
                    ))}
                </div>
            )}
        </div>
    );
}

export {
    ExampleComponent,
    FilterExample,
    SortingExample,
    GroupingExample,
    StatsExample,
    SelectionExample,
    RefreshExample,
    ConditionalExample
};
