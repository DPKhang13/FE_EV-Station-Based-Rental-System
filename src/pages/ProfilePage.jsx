// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { profileService } from '../services';
import photoService from '../services/photoService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);

  // Ảnh & preview
  const [idPreview, setIdPreview] = useState('');
  const [dlPreview, setDlPreview] = useState('');
  const [idCardUrl, setIdCardUrl] = useState(null);           // URL thật sau upload
  const [driverLicenseUrl, setDriverLicenseUrl] = useState(null);

  // Thông tin hồ sơ
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });

  // Scroll + check login + load dữ liệu
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!user) {
      alert('Please login to view your profile');
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [user, navigate]);

  // Nạp sẵn URL ảnh nếu có (từ context/localStorage)
  useEffect(() => {
    if (!user) return;
    
    console.log('👤 Loading user photos from:', user);
    
    const cccd =
      user.cccdImageUrl || user.idCardUrl || user.cccdUrl || null;
    const dl =
      user.driverLicenseImageUrl ||
      user.driverLicenseUrl ||
      user.licenseUrl ||
      null;

    console.log('📸 CCCD URL:', cccd);
    console.log('📸 Driver License URL:', dl);

    if (cccd) {
      setIdPreview(cccd);
      setIdCardUrl(cccd);
    }
    if (dl) {
      setDlPreview(dl);
      setDriverLicenseUrl(dl);
    }
  }, [user]);

  // Dọn objectURL tránh leak
  useEffect(() => {
    return () => {
      if (idPreview?.startsWith('blob:')) URL.revokeObjectURL(idPreview);
      if (dlPreview?.startsWith('blob:')) URL.revokeObjectURL(dlPreview);
    };
  }, [idPreview, dlPreview]);

  // Load profile từ context hoặc localStorage
  const loadUserProfile = () => {
    if (user) {
      setFormData({
        fullName: user.name || user.fullName || user.username || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || user.dob || '',
      });
      return;
    }
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setFormData({
          fullName: u.name || u.fullName || u.username || '',
          email: u.email || '',
          phone: u.phone || u.phoneNumber || '',
          address: u.address || '',
          dateOfBirth: u.dateOfBirth || u.dob || '',
        });
      } catch {}
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditToggle = () => {
    if (isEditing) loadUserProfile(); // hủy sửa -> nạp lại
    setIsEditing((v) => !v);
  };

  // Chọn ảnh -> preview ngay -> upload ngay -> thay preview = URL thật
  const handlePickId = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type?.startsWith('image/')) return alert('Please choose an image');
    if (f.size > 5 * 1024 * 1024) return alert('Image > 5MB');

    const tempUrl = URL.createObjectURL(f);
    setIdPreview(tempUrl);

    const userId = user?.id || user?.userId || user?.data?.id;
    if (!userId) {
      console.error('❌ No userId found');
      alert('Upload CCCD thất bại: Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      const res = await photoService.uploadIdCard(f, userId);
      const url =
        typeof res === 'string'
          ? res
          : res?.url ||
            res?.photoUrl ||
            res?.location ||
            res?.imageUrl ||
            res?.path;
      if (url) {
        setIdPreview(url);
        setIdCardUrl(url);
        console.log('✅ Upload CCCD thành công:', url);
      } else {
        throw new Error('Không nhận được URL từ server');
      }
    } catch (err) {
      console.error('❌ Upload CCCD error:', err);
      alert('Upload CCCD thất bại: ' + (err.message || 'Unknown error'));
    }
  };

  const handlePickDL = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type?.startsWith('image/')) return alert('Please choose an image');
    if (f.size > 5 * 1024 * 1024) return alert('Image > 5MB');

    const tempUrl = URL.createObjectURL(f);
    setDlPreview(tempUrl);

    const userId = user?.id || user?.userId || user?.data?.id;
    if (!userId) {
      console.error('❌ No userId found');
      alert('Upload Bằng lái thất bại: Không tìm thấy thông tin người dùng');
      return;
    }

    try {
      const res = await photoService.uploadDriverLicense(f, userId);
      const url =
        typeof res === 'string'
          ? res
          : res?.url ||
            res?.photoUrl ||
            res?.location ||
            res?.imageUrl ||
            res?.path;
      if (url) {
        setDlPreview(url);
        setDriverLicenseUrl(url);
        console.log('✅ Upload Bằng lái thành công:', url);
      } else {
        throw new Error('Không nhận được URL từ server');
      }
    } catch (err) {
      console.error('❌ Upload Bằng lái error:', err);
      alert('Upload bằng lái thất bại: ' + (err.message || 'Unknown error'));
    }
  };

  // Save: chỉ lưu text + URL ảnh đã có
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        idCardUrl: idCardUrl || undefined,
        driverLicenseUrl: driverLicenseUrl || undefined,
      };
      const res = await profileService.update(payload);
      console.log('✅ Profile updated:', res);
      
      // ✅ Cập nhật lại user trong context và localStorage
      const updatedUserData = {
        name: formData.fullName,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        phoneNumber: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        dob: formData.dateOfBirth,
        cccdImageUrl: idCardUrl,
        idCardUrl: idCardUrl,
        cccdUrl: idCardUrl,
        driverLicenseImageUrl: driverLicenseUrl,
        driverLicenseUrl: driverLicenseUrl,
        licenseUrl: driverLicenseUrl,
      };
      
      updateUser(updatedUserData);
      console.log('✅ User profile updated successfully');
      
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="page-header">
          <h1>👤 My Profile</h1>
          <p className="subtitle">Manage your personal information</p>
        </div>

        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {formData.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>

            <div className="profile-info">
              <h2>{formData.fullName || 'User'}</h2>
              <p className="user-email">{formData.email}</p>
            </div>

            <div className="profile-actions">
              <button onClick={handleEditToggle} className="btn-edit">
                {isEditing ? '✕ Cancel' : '✏️ Edit Profile'}
              </button>
              <button onClick={handleLogout} className="btn-logout">
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="profile-form-section">
            <form onSubmit={handleUpdateProfile}>
              {/* GRID INPUTS */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {/* UPLOAD CHỈ KHI ĐANG EDIT */}
              <div className="form-group">
                <label>CCCD (ID Card)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePickId}
                  disabled={!isEditing}
                />
                {idPreview && idPreview.trim() !== '' ? (
                  <img
                    src={idPreview}
                    alt="id"
                    style={{
                      width: 160,
                      height: 110,
                      marginTop: 8,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb',
                    }}
                    onError={(e) => {
                      console.error('❌ Failed to load CCCD image:', idPreview);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 160,
                      height: 110,
                      marginTop: 8,
                      border: '1px dashed #d1d5db',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                    }}
                  >
                    Chưa có ảnh
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Bằng lái (Driver License)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePickDL}
                  disabled={!isEditing}
                />
                {dlPreview && dlPreview.trim() !== '' ? (
                  <img
                    src={dlPreview}
                    alt="dl"
                    style={{
                      width: 160,
                      height: 110,
                      marginTop: 8,
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid #e5e7eb',
                    }}
                    onError={(e) => {
                      console.error('❌ Failed to load Driver License image:', dlPreview);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 160,
                      height: 110,
                      marginTop: 8,
                      border: '1px dashed #d1d5db',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9ca3af',
                    }}
                  >
                    Chưa có ảnh
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? 'Saving...' : '💾 Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Extra: link bookings */}
          <div className="profile-stats">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-info">
                <h3>My Bookings</h3>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="btn-view"
                >
                  View All Bookings →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
