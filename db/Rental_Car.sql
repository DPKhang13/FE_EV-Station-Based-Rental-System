------------------------------------------------------------
-- 1. Drop + Create Database (Fix “database in use”)
------------------------------------------------------------
USE master;
IF DB_ID('rental_car') IS NOT NULL
BEGIN
    ALTER DATABASE rental_car SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE rental_car;
END
GO

CREATE DATABASE rental_car;
GO
USE rental_car;
GO

------------------------------------------------------------
-- 2. Create Tables
------------------------------------------------------------

-- rentalstation
CREATE TABLE rentalstation (
    station_id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    city NVARCHAR(100),
    district NVARCHAR(100),
    ward NVARCHAR(100),
    street NVARCHAR(100)
);

-- user
CREATE TABLE [user] (
    user_id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    password NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20),
    email NVARCHAR(100) UNIQUE NOT NULL,
    status NVARCHAR(50) NOT NULL,  -- ACTIVE | NEED_OTP | VERIFIED
    role NVARCHAR(50) NOT NULL,    -- customer | staff | admin
    station_id INT NULL,
    FOREIGN KEY (station_id) REFERENCES rentalstation(station_id)
);

-- vehicle
CREATE TABLE vehicle (
    vehicle_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    station_id INT,
    plate_number NVARCHAR(20) UNIQUE,
    status NVARCHAR(50),
    description NVARCHAR(MAX), -- mô tả chi tiết xe điện
    FOREIGN KEY (station_id) REFERENCES rentalstation(station_id)
);

-- vehicleattribute
CREATE TABLE vehicleattribute (
    attr_id INT IDENTITY(1,1) PRIMARY KEY,
    vehicle_id BIGINT NOT NULL,
    brand NVARCHAR(50),
    color NVARCHAR(50),
    transmission NVARCHAR(50),
    seat_count INT,
    year INT,
    variant NVARCHAR(50),
    battery_status NVARCHAR(50),
    battery_capacity NVARCHAR(50),
    range_km INT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);

-- pricingrule
CREATE TABLE pricingrule (
    pricingrule_id INT IDENTITY(1,1) PRIMARY KEY,
    vehicle_id BIGINT,
    base_hours INT,
    base_hours_price DECIMAL(18,2),
    extra_hour_price DECIMAL(18,2),
    daily_price DECIMAL(18,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);

-- coupon
CREATE TABLE coupon (
    coupon_id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE,
    discount DECIMAL(18,2),
    valid_from DATE,
    valid_to DATE,
    status NVARCHAR(50)
);

-- rentalorder
CREATE TABLE rentalorder (
    order_id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    customer_id UNIQUEIDENTIFIER,
    vehicle_id BIGINT,
    start_time DATETIME,
    end_time DATETIME,
    total_price DECIMAL(18,2),
    status NVARCHAR(50),
    coupon_id INT NULL,
    FOREIGN KEY (customer_id) REFERENCES [user](user_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id),
    FOREIGN KEY (coupon_id) REFERENCES coupon(coupon_id)
);

-- payment
CREATE TABLE payment (
    payment_id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    order_id UNIQUEIDENTIFIER,
    amount DECIMAL(18,2),
    method NVARCHAR(50),
    status NVARCHAR(50),
    FOREIGN KEY (order_id) REFERENCES rentalorder(order_id)
);

-- feedback
CREATE TABLE feedback (
    feedback_id INT IDENTITY(1,1) PRIMARY KEY,
    order_id UNIQUEIDENTIFIER,
    rating INT,
    comment NVARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES rentalorder(order_id)
);

-- maintenance
CREATE TABLE maintenance (
    maintenance_id INT IDENTITY(1,1) PRIMARY KEY,
    vehicle_id BIGINT,
    description NVARCHAR(255),
    date DATE,
    cost DECIMAL(18,2),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);

-- stationinventory
CREATE TABLE stationinventory (
    inventory_id INT IDENTITY(1,1) PRIMARY KEY,
    station_id INT,
    vehicle_id BIGINT,
    quantity INT,
    FOREIGN KEY (station_id) REFERENCES rentalstation(station_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicle(vehicle_id)
);

-- employeeschedule
CREATE TABLE employeeschedule (
    schedule_id INT IDENTITY(1,1) PRIMARY KEY,
    staff_id UNIQUEIDENTIFIER,
    station_id INT,
    shift_date DATE,
    shift_time NVARCHAR(50),
    FOREIGN KEY (staff_id) REFERENCES [user](user_id),
    FOREIGN KEY (station_id) REFERENCES rentalstation(station_id)
);

-- notification
CREATE TABLE notification (
    notification_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id UNIQUEIDENTIFIER,
    message NVARCHAR(255),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);

-- transactionhistory
CREATE TABLE transactionhistory (
    transaction_id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    user_id UNIQUEIDENTIFIER,
    amount DECIMAL(18,2),
    type NVARCHAR(50),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES [user](user_id)
);

------------------------------------------------------------
-- 3. Insert Seed Data
------------------------------------------------------------

-- rentalstation
INSERT INTO rentalstation (name, city, district, ward, street) VALUES
(N'Hanoi EV Station 1','Hanoi','Cau Giay','Dich Vong','123 Nguyen Phong Sac'),
(N'HCM EV Station 1','HCM','District 1','Ben Nghe','789 Le Loi');

-- user
INSERT INTO [user] (user_id, full_name, password, phone, email, status, role, station_id) VALUES
('37382360-9DCD-410F-AFE8-74DB2E116000', N'Nguyen Van A',
 '$2a$12$baGJOft3cW1v83qSqogFU.kcyT2yMmhmTPLpuKPXJ5mWbsElMEgu6',
 '0987654321', 'fptngulonrietquen@gmail.com', 'ACTIVE', 'customer', NULL),
('41830C94-F783-4267-957A-8017B029DF8E', N'Le Van Admin',
 '$2a$12$baGJOft3cW1v83qSqogFU.kcyT2yMmhmTPLpuKPXJ5mWbsElMEgu6',
 '0900000000', 'admin@gmail.com', 'VERIFIED', 'admin', NULL),
('F05B9153-B953-4D43-A813-93E28CEE4454', N'Tran Thi B',
 '$2a$12$baGJOft3cW1v83qSqogFU.kcyT2yMmhmTPLpuKPXJ5mWbsElMEgu6',
 '0912345678', 'testswp39111@gmail.com', 'NEED_OTP', 'staff', 2);

-- vehicle
INSERT INTO vehicle (station_id, plate_number, status, description) VALUES
(1, '30A-11111', 'available',
 N'VinFast VF e34 – xe điện 5 chỗ nhỏ gọn, pin 75kWh, tầm di chuyển 420km.'),
(2, '30A-11112', 'rented',
 N'Tesla Model X – SUV điện 7 chỗ sang trọng, pin 82kWh, tầm hoạt động 500km.'),
(1, '30A-11113', 'available',
 N'Hyundai Ioniq 5 – crossover điện hiện đại, pin 64kWh, quãng đường 450km.'),
(2, '59A-22222', 'available',
 N'VinFast VF 9 – SUV điện cao cấp, pin 87kWh, quãng đường 470km.'),
(2, '59A-22223', 'rented',
 N'BYD eBus – xe điện 16 chỗ, pin 150kWh, tầm hoạt động 280km.'),
(1, '29A-33333', 'maintenance',
 N'Kia EV2 – xe điện mini 2 chỗ, pin 40kWh, quãng đường 320km.');

-- vehicleattribute
INSERT INTO vehicleattribute (vehicle_id, brand, color, transmission, seat_count, year, variant,
    battery_status, battery_capacity, range_km)
VALUES
(1, N'VinFast', N'Red', N'Automatic', 4, 2023, N'Standard', N'100%', N'75 kWh', 420),
(2, N'Tesla', N'Black', N'Automatic', 7, 2022, N'Plus', N'90%', N'82 kWh', 500),
(3, N'Hyundai', N'White', N'Automatic', 4, 2024, N'Standard', N'85%', N'64 kWh', 450),
(4, N'VinFast', N'Blue', N'Automatic', 7, 2024, N'Luxury', N'70%', N'87 kWh', 470),
(5, N'BYD', N'Silver', N'Automatic', 16, 2023, N'Bus', N'60%', N'150 kWh', 280),
(6, N'Kia', N'Yellow', N'Automatic', 2, 2021, N'Mini', N'95%', N'40 kWh', 320);

-- pricingrule
INSERT INTO pricingrule (vehicle_id, base_hours, base_hours_price, extra_hour_price, daily_price) VALUES
(1,3,200000,80000,1000000),
(2,3,250000,100000,1200000),
(3,2,180000,70000,900000),
(4,4,300000,120000,1500000),
(5,3,400000,150000,2000000),
(6,1,100000,50000,500000);

-- coupon
INSERT INTO coupon (code, discount, valid_from, valid_to, status) VALUES
('EV10', 10.00, '2025-10-01', '2025-12-31', 'ACTIVE'),
('EV20', 20.00, '2025-10-01', '2025-11-30', 'ACTIVE'),
('WELCOME5', 5.00, '2025-01-01', '2025-12-31', 'ACTIVE');

-- rentalorder
DECLARE @order1 UNIQUEIDENTIFIER = NEWID(),
        @order2 UNIQUEIDENTIFIER = NEWID();

INSERT INTO rentalorder (order_id, customer_id, vehicle_id, start_time, end_time, total_price, status, coupon_id)
VALUES
(@order1, '37382360-9DCD-410F-AFE8-74DB2E116000', 1, '2025-09-20 09:00', '2025-09-20 12:00', 300000, 'pending', 1),
(@order2, '37382360-9DCD-410F-AFE8-74DB2E116000', 2, '2025-09-21 09:00', '2025-09-21 13:00', 500000, 'active', NULL);

-- payment
INSERT INTO payment (order_id, amount, method, status) VALUES
(@order1,300000,'card','paid'),
(@order2,500000,'cash','pending');

-- feedback
INSERT INTO feedback (order_id, rating, comment) VALUES
(@order1,5,N'Excellent service'),
(@order2,4,N'Good car');

-- maintenance
INSERT INTO maintenance (vehicle_id, description, date, cost) VALUES
(1,N'Battery system check','2025-09-10',500000);

-- stationinventory
INSERT INTO stationinventory (station_id, vehicle_id, quantity) VALUES
(1,1,5),
(2,2,3);

-- employeeschedule
INSERT INTO employeeschedule (staff_id, station_id, shift_date, shift_time) VALUES
('F05B9153-B953-4D43-A813-93E28CEE4454',2,'2025-09-21','Morning');

-- notification
INSERT INTO notification (user_id, message, created_at) VALUES
('37382360-9DCD-410F-AFE8-74DB2E116000',N'Your booking is confirmed','2025-09-20 08:00');

-- transactionhistory
INSERT INTO transactionhistory (user_id, amount, type, created_at) VALUES
('37382360-9DCD-410F-AFE8-74DB2E116000',300000,'payment','2025-09-20 09:30');
GO
