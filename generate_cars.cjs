// Script to generate all 41 cars data
const fs = require('fs');

// Vehicle data from the provided table
const vehicles = [
    // 4-seater vehicles (IDs 1-60, only available ones)
    { id: 1, station: 1, plate: 'EV-0001', brand: 'VinFast', color: 'Red', seats: 4, year: 2022, variant: null, battery: '100%', capacity: '55 kWh', range: 340 },
    { id: 4, station: 1, plate: 'EV-0004', brand: 'VinFast', color: 'Black', seats: 4, year: 2025, variant: null, battery: '70%', capacity: '70 kWh', range: 420 },
    { id: 7, station: 1, plate: 'EV-0007', brand: 'VinFast', color: 'Blue', seats: 4, year: 2024, variant: null, battery: '90%', capacity: '60 kWh', range: 360 },
    { id: 10, station: 1, plate: 'EV-0010', brand: 'VinFast', color: 'Silver', seats: 4, year: 2023, variant: null, battery: '60%', capacity: '75 kWh', range: 450 },
    { id: 13, station: 1, plate: 'EV-0013', brand: 'VinFast', color: 'White', seats: 4, year: 2022, variant: null, battery: '80%', capacity: '64 kWh', range: 380 },
    { id: 16, station: 1, plate: 'EV-0016', brand: 'VinFast', color: 'Red', seats: 4, year: 2025, variant: null, battery: '100%', capacity: '55 kWh', range: 340 },
    { id: 19, station: 1, plate: 'EV-0019', brand: 'VinFast', color: 'Black', seats: 4, year: 2024, variant: null, battery: '70%', capacity: '70 kWh', range: 420 },
    { id: 22, station: 2, plate: 'EV-0022', brand: 'VinFast', color: 'Blue', seats: 4, year: 2023, variant: null, battery: '90%', capacity: '60 kWh', range: 360 },
    { id: 25, station: 2, plate: 'EV-0025', brand: 'VinFast', color: 'Silver', seats: 4, year: 2022, variant: null, battery: '60%', capacity: '75 kWh', range: 450 },
    { id: 28, station: 2, plate: 'EV-0028', brand: 'VinFast', color: 'White', seats: 4, year: 2025, variant: null, battery: '80%', capacity: '64 kWh', range: 380 },
    { id: 31, station: 2, plate: 'EV-0031', brand: 'VinFast', color: 'Red', seats: 4, year: 2024, variant: null, battery: '100%', capacity: '55 kWh', range: 340 },
    { id: 34, station: 2, plate: 'EV-0034', brand: 'VinFast', color: 'Black', seats: 4, year: 2023, variant: null, battery: '70%', capacity: '70 kWh', range: 420 },
    { id: 37, station: 2, plate: 'EV-0037', brand: 'VinFast', color: 'Blue', seats: 4, year: 2022, variant: null, battery: '90%', capacity: '60 kWh', range: 360 },
    { id: 40, station: 2, plate: 'EV-0040', brand: 'VinFast', color: 'Silver', seats: 4, year: 2025, variant: null, battery: '60%', capacity: '75 kWh', range: 450 },
    { id: 43, station: 3, plate: 'EV-0043', brand: 'VinFast', color: 'White', seats: 4, year: 2024, variant: null, battery: '80%', capacity: '64 kWh', range: 380 },
    { id: 46, station: 3, plate: 'EV-0046', brand: 'VinFast', color: 'Red', seats: 4, year: 2023, variant: null, battery: '100%', capacity: '55 kWh', range: 340 },
    { id: 49, station: 3, plate: 'EV-0049', brand: 'VinFast', color: 'Black', seats: 4, year: 2022, variant: null, battery: '70%', capacity: '70 kWh', range: 420 },
    { id: 52, station: 3, plate: 'EV-0052', brand: 'VinFast', color: 'Blue', seats: 4, year: 2025, variant: null, battery: '90%', capacity: '60 kWh', range: 360 },
    { id: 55, station: 3, plate: 'EV-0055', brand: 'VinFast', color: 'Silver', seats: 4, year: 2024, variant: null, battery: '60%', capacity: '75 kWh', range: 450 },
    { id: 58, station: 3, plate: 'EV-0058', brand: 'VinFast', color: 'White', seats: 4, year: 2023, variant: null, battery: '80%', capacity: '64 kWh', range: 380 },
    // 7-seater vehicles (IDs 61-120, only available ones) - Distributed evenly: Air, Plus, Pro
    { id: 61, station: 1, plate: 'EV-0061', brand: 'VinFast', color: 'Red', seats: 7, year: 2022, variant: 'Air', battery: '100%', capacity: '82 kWh', range: 430 },
    { id: 64, station: 1, plate: 'EV-0064', brand: 'VinFast', color: 'Black', seats: 7, year: 2025, variant: 'Plus', battery: '70%', capacity: '95 kWh', range: 510 },
    { id: 67, station: 1, plate: 'EV-0067', brand: 'VinFast', color: 'Blue', seats: 7, year: 2024, variant: 'Pro', battery: '90%', capacity: '87 kWh', range: 450 },
    { id: 70, station: 1, plate: 'EV-0070', brand: 'VinFast', color: 'Silver', seats: 7, year: 2023, variant: 'Air', battery: '60%', capacity: '100 kWh', range: 540 },
    { id: 73, station: 1, plate: 'EV-0073', brand: 'VinFast', color: 'White', seats: 7, year: 2022, variant: 'Plus', battery: '80%', capacity: '90 kWh', range: 480 },
    { id: 76, station: 1, plate: 'EV-0076', brand: 'VinFast', color: 'Red', seats: 7, year: 2025, variant: 'Pro', battery: '100%', capacity: '82 kWh', range: 430 },
    { id: 79, station: 1, plate: 'EV-0079', brand: 'VinFast', color: 'Black', seats: 7, year: 2024, variant: 'Air', battery: '70%', capacity: '95 kWh', range: 510 },
    { id: 82, station: 2, plate: 'EV-0082', brand: 'VinFast', color: 'Blue', seats: 7, year: 2023, variant: 'Plus', battery: '90%', capacity: '87 kWh', range: 450 },
    { id: 85, station: 2, plate: 'EV-0085', brand: 'VinFast', color: 'Silver', seats: 7, year: 2022, variant: 'Pro', battery: '60%', capacity: '100 kWh', range: 540 },
    { id: 88, station: 2, plate: 'EV-0088', brand: 'VinFast', color: 'White', seats: 7, year: 2025, variant: 'Air', battery: '80%', capacity: '90 kWh', range: 480 },
    { id: 91, station: 2, plate: 'EV-0091', brand: 'VinFast', color: 'Red', seats: 7, year: 2024, variant: 'Plus', battery: '100%', capacity: '82 kWh', range: 430 },
    { id: 94, station: 2, plate: 'EV-0094', brand: 'VinFast', color: 'Black', seats: 7, year: 2023, variant: 'Pro', battery: '70%', capacity: '95 kWh', range: 510 },
    { id: 97, station: 2, plate: 'EV-0097', brand: 'VinFast', color: 'Blue', seats: 7, year: 2022, variant: 'Air', battery: '90%', capacity: '87 kWh', range: 450 },
    { id: 100, station: 2, plate: 'EV-0100', brand: 'VinFast', color: 'Silver', seats: 7, year: 2025, variant: 'Plus', battery: '60%', capacity: '100 kWh', range: 540 },
    { id: 103, station: 3, plate: 'EV-0103', brand: 'VinFast', color: 'White', seats: 7, year: 2024, variant: 'Pro', battery: '80%', capacity: '90 kWh', range: 480 },
    { id: 106, station: 3, plate: 'EV-0106', brand: 'VinFast', color: 'Red', seats: 7, year: 2023, variant: 'Air', battery: '100%', capacity: '82 kWh', range: 430 },
    { id: 109, station: 3, plate: 'EV-0109', brand: 'VinFast', color: 'Black', seats: 7, year: 2022, variant: 'Plus', battery: '70%', capacity: '95 kWh', range: 510 },
    { id: 112, station: 3, plate: 'EV-0112', brand: 'VinFast', color: 'Blue', seats: 7, year: 2025, variant: 'Pro', battery: '90%', capacity: '87 kWh', range: 450 },
    { id: 115, station: 3, plate: 'EV-0115', brand: 'VinFast', color: 'Silver', seats: 7, year: 2024, variant: 'Air', battery: '60%', capacity: '100 kWh', range: 540 },
    { id: 118, station: 3, plate: 'EV-0118', brand: 'VinFast', color: 'White', seats: 7, year: 2023, variant: 'Plus', battery: '80%', capacity: '90 kWh', range: 480 },
];

let output = `// Car data for filtering
import standard4 from '../assets/4standard.jpg';
import standard7 from '../assets/7standard.jpg';

const cars = [
`;

vehicles.forEach((v, index) => {
    const image = v.seats === 4 ? 'standard4' : 'standard7';
    const type = v.seats === 4 ? '4-seater' : '7-seater';
    const vname = v.seats === 4 ? `${v.brand} 4S` : `${v.brand} 7S ${v.variant}`;
    const desc = v.seats === 4 ? `${v.brand} EV 4-seater.` : `${v.brand} EV 7-seater, ${v.variant} variant.`;
    const variantStr = v.variant ? `'${v.variant}'` : 'null';
    const gradeStr = v.seats === 7 && v.variant ? `'${v.variant}'` : 'null';

    output += `    { id: ${v.id}, vehicle_id: '${v.id}', vehicle_name: '${vname}', brand: '${v.brand}', name: '${vname}', image: ${image}, type: '${type}', seat_count: ${v.seats}, grade: ${gradeStr}, color: '${v.color}', year_of_manufacture: ${v.year}, plate_number: '${v.plate}', status: 'Available', description: '${desc}', branch: '${v.station}', transmission: 'Automatic', variant: ${variantStr}, battery_status: '${v.battery}', battery_capacity: '${v.capacity}', range_km: ${v.range} },\n`;
});

output += `];

export default cars;
`;

fs.writeFileSync('src/components/carData.js', output, 'utf8');
console.log('✅ Generated carData.js with 41 vehicles!');
