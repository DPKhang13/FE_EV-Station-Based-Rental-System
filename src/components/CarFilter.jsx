import React, { useState } from 'react';
import cars from './carData';

const carTypes = [
    { value: '', label: 'Chọn loại xe (Select car type)' },
    { value: '4-seater', label: '4-Seater' },
    { value: '7-seater', label: '7-Seater' },
];

const carGrades = [
    { value: '', label: 'Chọn hạng xe (Select grade)' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Air pro', label: 'Air pro' },
    { value: 'Air pro plus', label: 'Air pro plus' },
];

const CarFilter = ({ selectedBranch }) => {
    const [type, setType] = useState('');
    const [grade, setGrade] = useState('');

    // Lọc xe theo chi nhánh, loại và hạng
    const filteredCars = cars.filter(car => {
        return (!selectedBranch || car.branch === selectedBranch) &&
            (!type || car.type === type) &&
            (!grade || car.grade === grade);
    });

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Bộ lọc */}
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
                <div>
                    <label style={{ fontWeight: 600, marginRight: 12 }}>Loại xe:</label>
                    <select
                        value={type}
                        onChange={e => setType(e.target.value)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '2px solid #dc2626',
                            fontSize: 16,
                            fontWeight: 500,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {carTypes.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 600, marginRight: 12 }}>Hạng xe:</label>
                    <select
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 8,
                            border: '2px solid #dc2626',
                            fontSize: 16,
                            fontWeight: 500,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {carGrades.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Danh sách xe - Horizontal Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center' }}>
                {filteredCars.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic', fontSize: 18, marginTop: 40 }}>Không có xe phù hợp.</div>
                ) : (
                    filteredCars.map(car => (
                        <div
                            key={car.id}
                            style={{
                                width: '100%',
                                maxWidth: 900,
                                background: '#fff',
                                borderRadius: 16,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                padding: 24,
                                display: 'flex',
                                gap: 24,
                                alignItems: 'center',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateX(8px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'translateX(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                            }}
                        >
                            {/* Hình ảnh bên trái */}
                            <img
                                src={car.image}
                                alt={car.name}
                                style={{
                                    width: 280,
                                    height: 180,
                                    objectFit: 'cover',
                                    borderRadius: 12,
                                    flexShrink: 0
                                }}
                            />

                            {/* Thông tin xe bên phải */}
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <h3 style={{ margin: '0 0 16px', fontSize: 24, fontWeight: 700, color: '#1f2937' }}>
                                    {car.name}
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ fontSize: 16, color: '#374151' }}>
                                        <strong style={{ color: '#dc2626' }}>Loại xe:</strong> {car.type === '4-seater' ? 'Xe 4 chỗ' : 'Xe 7 chỗ'}
                                    </div>
                                    <div style={{ fontSize: 16, color: '#374151' }}>
                                        <strong style={{ color: '#dc2626' }}>Hạng xe:</strong> {car.grade}
                                    </div>
                                    <div style={{ fontSize: 16, color: '#374151' }}>
                                        <strong style={{ color: '#dc2626' }}>Mô tả:</strong> {car.description || 'Xe điện hiện đại, tiết kiệm năng lượng'}
                                    </div>
                                    <div style={{ fontSize: 16, color: '#374151' }}>
                                        <strong style={{ color: '#dc2626' }}>Màu sắc:</strong> {car.color || 'Đa dạng màu sắc'}
                                    </div>
                                </div>

                                <button
                                    style={{
                                        marginTop: 20,
                                        padding: '10px 24px',
                                        background: '#dc2626',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'background 0.3s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#b91c1c'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#dc2626'}
                                >
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CarFilter;
