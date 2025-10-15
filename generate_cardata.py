# Generate carData.js with all vehicle data

# Vehicle data from the provided table
vehicles_4seater = [
    (1, 1, 'EV-0001', 'VinFast', 'Red', 4, 2022, None, '100%', '55 kWh', 340),
    (4, 1, 'EV-0004', 'VinFast', 'Black', 4, 2025, None, '70%', '70 kWh', 420),
    (7, 1, 'EV-0007', 'VinFast', 'Blue', 4, 2024, None, '90%', '60 kWh', 360),
    (10, 1, 'EV-0010', 'VinFast', 'Silver', 4, 2023, None, '60%', '75 kWh', 450),
    (13, 1, 'EV-0013', 'VinFast', 'White', 4, 2022, None, '80%', '64 kWh', 380),
    (16, 1, 'EV-0016', 'VinFast', 'Red', 4, 2025, None, '100%', '55 kWh', 340),
    (19, 1, 'EV-0019', 'VinFast', 'Black', 4, 2024, None, '70%', '70 kWh', 420),
    (22, 2, 'EV-0022', 'VinFast', 'Blue', 4, 2023, None, '90%', '60 kWh', 360),
    (25, 2, 'EV-0025', 'VinFast', 'Silver', 4, 2022, None, '60%', '75 kWh', 450),
    (28, 2, 'EV-0028', 'VinFast', 'White', 4, 2025, None, '80%', '64 kWh', 380),
    (31, 2, 'EV-0031', 'VinFast', 'Red', 4, 2024, None, '100%', '55 kWh', 340),
    (34, 2, 'EV-0034', 'VinFast', 'Black', 4, 2023, None, '70%', '70 kWh', 420),
    (37, 2, 'EV-0037', 'VinFast', 'Blue', 4, 2022, None, '90%', '60 kWh', 360),
    (40, 2, 'EV-0040', 'VinFast', 'Silver', 4, 2025, None, '60%', '75 kWh', 450),
    (43, 3, 'EV-0043', 'VinFast', 'White', 4, 2024, None, '80%', '64 kWh', 380),
    (46, 3, 'EV-0046', 'VinFast', 'Red', 4, 2023, None, '100%', '55 kWh', 340),
    (49, 3, 'EV-0049', 'VinFast', 'Black', 4, 2022, None, '70%', '70 kWh', 420),
    (52, 3, 'EV-0052', 'VinFast', 'Blue', 4, 2025, None, '90%', '60 kWh', 360),
    (55, 3, 'EV-0055', 'VinFast', 'Silver', 4, 2024, None, '60%', '75 kWh', 450),
    (58, 3, 'EV-0058', 'VinFast', 'White', 4, 2023, None, '80%', '64 kWh', 380),
]

vehicles_7seater = [
    (61, 1, 'EV-0061', 'VinFast', 'Red', 7, 2022, 'Air', '100%', '82 kWh', 430),
    (64, 1, 'EV-0064', 'VinFast', 'Black', 7, 2025, 'Air', '70%', '95 kWh', 510),
    (67, 1, 'EV-0067', 'VinFast', 'Blue', 7, 2024, 'Air', '90%', '87 kWh', 450),
    (70, 1, 'EV-0070', 'VinFast', 'Silver', 7, 2023, 'Air', '60%', '100 kWh', 540),
    (73, 1, 'EV-0073', 'VinFast', 'White', 7, 2022, 'Air', '80%', '90 kWh', 480),
    (76, 1, 'EV-0076', 'VinFast', 'Red', 7, 2025, 'Air', '100%', '82 kWh', 430),
    (79, 1, 'EV-0079', 'VinFast', 'Black', 7, 2024, 'Air', '70%', '95 kWh', 510),
    (82, 2, 'EV-0082', 'VinFast', 'Blue', 7, 2023, 'Air', '90%', '87 kWh', 450),
    (85, 2, 'EV-0085', 'VinFast', 'Silver', 7, 2022, 'Air', '60%', '100 kWh', 540),
    (88, 2, 'EV-0088', 'VinFast', 'White', 7, 2025, 'Air', '80%', '90 kWh', 480),
    (91, 2, 'EV-0091', 'VinFast', 'Red', 7, 2024, 'Air', '100%', '82 kWh', 430),
    (94, 2, 'EV-0094', 'VinFast', 'Black', 7, 2023, 'Air', '70%', '95 kWh', 510),
    (97, 2, 'EV-0097', 'VinFast', 'Blue', 7, 2022, 'Air', '90%', '87 kWh', 450),
    (100, 2, 'EV-0100', 'VinFast', 'Silver', 7, 2025, 'Air', '60%', '100 kWh', 540),
    (103, 3, 'EV-0103', 'VinFast', 'White', 7, 2024, 'Air', '80%', '90 kWh', 480),
    (106, 3, 'EV-0106', 'VinFast', 'Red', 7, 2023, 'Air', '100%', '82 kWh', 430),
    (109, 3, 'EV-0109', 'VinFast', 'Black', 7, 2022, 'Air', '70%', '95 kWh', 510),
    (112, 3, 'EV-0112', 'VinFast', 'Blue', 7, 2025, 'Air', '90%', '87 kWh', 450),
    (115, 3, 'EV-0115', 'VinFast', 'Silver', 7, 2024, 'Air', '60%', '100 kWh', 540),
    (118, 3, 'EV-0118', 'VinFast', 'White', 7, 2023, 'Air', '80%', '90 kWh', 480),
]

output = []
output.append("// Car data for filtering")
output.append("import standard4 from '../assets/4standard.jpg';")
output.append("import pro4 from '../assets/4pro.jpg';")
output.append("import proplus4 from '../assets/4proplus.jpg';")
output.append("import standard7 from '../assets/7standard.jpg';")
output.append("import pro7 from '../assets/7pro.jpg';")
output.append("import proplus7 from '../assets/7proplus.jpg';")
output.append("")
output.append("const cars = [")

# Generate 4-seater entries
for vid, branch, plate, brand, color, seats, year, variant, battery_stat, battery_cap, range_km in vehicles_4seater:
    output.append(f"    {{ id: {vid}, vehicle_id: '{vid}', vehicle_name: '{brand} 4S', brand: '{brand}', name: '{brand} 4S', image: standard4, type: '4-seater', seat_count: {seats}, grade: 'Standard', color: '{color}', year_of_manufacture: {year}, plate_number: '{plate}', status: 'Available', description: '{brand} EV 4-seater.', branch: '{branch}', transmission: 'Automatic', variant: null, battery_status: '{battery_stat}', battery_capacity: '{battery_cap}', range_km: {range_km} }},")

# Generate 7-seater entries  
for vid, branch, plate, brand, color, seats, year, variant, battery_stat, battery_cap, range_km in vehicles_7seater:
    output.append(f"    {{ id: {vid}, vehicle_id: '{vid}', vehicle_name: '{brand} 7S {variant}', brand: '{brand}', name: '{brand} 7S {variant}', image: standard7, type: '7-seater', seat_count: {seats}, grade: 'Standard', color: '{color}', year_of_manufacture: {year}, plate_number: '{plate}', status: 'Available', description: '{brand} EV 7-seater, {variant} variant.', branch: '{branch}', transmission: 'Automatic', variant: '{variant}', battery_status: '{battery_stat}', battery_capacity: '{battery_cap}', range_km: {range_km} }},")

output.append("];")
output.append("")
output.append("export default cars;")

# Write to file
with open('src/components/carData.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output))

print("carData.js generated successfully!")
