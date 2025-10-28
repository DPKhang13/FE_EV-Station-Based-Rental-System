import React, { useState, useEffect } from 'react';

const APIStatusChecker = () => {
    const [status, setStatus] = useState('Đang kiểm tra...');
    const [hasToken, setHasToken] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [backendOnline, setBackendOnline] = useState(null);

    useEffect(() => {
        checkAPIStatus();
    }, []);

    const checkAPIStatus = async () => {
        // Check token
        const token = localStorage.getItem('accessToken');
        setHasToken(!!token);

        // API GET /api/vehicles/get KHÔNG CẦN token theo docs
        // Nên ta test trực tiếp mà không cần check token
        console.log('🔍 [APIStatusChecker] Testing backend connection...');

        // Check backend
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            // Chỉ thêm token nếu có (optional)
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch('http://localhost:8080/api/vehicles/get', {
                method: 'GET',
                headers: headers
            });

            console.log('📡 [APIStatusChecker] Response status:', response.status);
            setBackendOnline(true);

            if (response.ok) {
                const data = await response.json();
                setApiResponse(data);
                setStatus(`✅ KẾT NỐI API THÀNH CÔNG! Nhận được ${data.length} xe từ backend`);
                console.log('✅ [APIStatusChecker] Connected to API! Got', data.length, 'vehicles');
            } else {
                setStatus(`⚠️ Backend trả về lỗi ${response.status} - Dùng fallback data`);
                console.warn('⚠️ [APIStatusChecker] Backend error:', response.status);
            }
        } catch (error) {
            setBackendOnline(false);
            setStatus('❌ Backend OFFLINE hoặc CORS error - Dùng fallback data');
            console.error('❌ [APIStatusChecker] Error:', error);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: status.includes('✅') ? '#10b981' : status.includes('⚠️') ? '#f59e0b' : '#ef4444',
            color: 'white',
            padding: '15px 20px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 9999,
            maxWidth: 400,
            fontSize: 14,
            fontWeight: 600
        }}>
            <div style={{ marginBottom: 10, fontSize: 16 }}>
                🔌 API Connection Status
            </div>

            <div style={{ marginBottom: 8 }}>
                {status}
            </div>

            <div style={{ fontSize: 12, opacity: 0.9, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                <div>🔑 Token: {hasToken ? '✅ Có' : '❌ Không có'}</div>
                <div>🌐 Backend: {backendOnline === null ? '⏳ Đang check...' : backendOnline ? '✅ Online' : '❌ Offline'}</div>
                {apiResponse && (
                    <div>📊 Data count: {apiResponse.length} xe</div>
                )}
            </div>

            <button
                onClick={checkAPIStatus}
                style={{
                    marginTop: 10,
                    padding: '5px 15px',
                    background: 'rgba(255,255,255,0.2)',
                    border: '1px solid white',
                    borderRadius: 4,
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 600
                }}
            >
                🔄 Kiểm tra lại
            </button>

            <div style={{ marginTop: 10, fontSize: 11, opacity: 0.7 }}>
                💡 Tip: Mở Console (F12) để xem log chi tiết
            </div>
        </div>
    );
};

export default APIStatusChecker;
