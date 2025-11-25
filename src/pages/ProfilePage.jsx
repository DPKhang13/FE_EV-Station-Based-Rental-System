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
      navigate('/login');
      return;
    }
    fetchProfileFromDatabase();
  }, [user, navigate]);

  // ✅ Sync formData khi user context thay đổi
  useEffect(() => {
    if (!user) return;
    
    console.log('🔄 User context changed, syncing formData:', user);
    setFormData({
      fullName: user.name || user.fullName || user.username || '',
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth || user.dob || '',
    });
    
    // Sync ảnh nếu có
    const cccdUrl = user.cccdImageUrl || user.idCardUrl || user.cccdUrl;
    const dlUrl = user.driverLicenseImageUrl || user.driverLicenseUrl || user.licenseUrl;
    
    if (cccdUrl) {
      setIdPreview(cccdUrl);
      setIdCardUrl(cccdUrl);
    }
    if (dlUrl) {
      setDlPreview(dlUrl);
      setDriverLicenseUrl(dlUrl);
    }
  }, [user]);

  // Fetch profile từ database
  const fetchProfileFromDatabase = async () => {
    try {
      console.log('🔄 Fetching profile from database...');
      console.log('👤 Current user from context:', user);
      const userId = user?.id || user?.userId || user?.data?.id;
      console.log('🔑 User ID:', userId);
      
      const response = await profileService.getProfile(userId);
      console.log('✅ Profile data from DB:', response);
      
      const profileData = response?.data || response;
      console.log('📋 Parsed profile data:', profileData);
      console.log('📋 All profile keys:', Object.keys(profileData));
      
      // Update form data
      setFormData({
        fullName: profileData.fullName || profileData.name || profileData.username || '',
        email: profileData.email || '',
        phone: profileData.phone || profileData.phoneNumber || '',
        address: profileData.address || '',
        dateOfBirth: profileData.dateOfBirth || profileData.dob || '',
      });
      
      // ✅ Fetch photos riêng từ table photos
      let cccdUrl = null;
      let dlUrl = null;
      
      if (userId) {
        try {
          console.log('🔄 Fetching photos from photos table...');
          const photosData = await photoService.getPhotos(userId);
          console.log('📸 Photos data:', photosData);
          
          if (photosData) {
            // Nếu photosData là array
            if (Array.isArray(photosData)) {
              const cccdPhoto = photosData.find(p => p.type === 'CCCD' || p.type === 'cccd');
              const dlPhoto = photosData.find(p => p.type === 'GPLX' || p.type === 'gplx' || p.type === 'driver_license');
              
              cccdUrl = cccdPhoto?.photo_url || cccdPhoto?.photoUrl || cccdPhoto?.url;
              dlUrl = dlPhoto?.photo_url || dlPhoto?.photoUrl || dlPhoto?.url;
            } else if (photosData.data && Array.isArray(photosData.data)) {
              // Nếu wrapped trong data
              const cccdPhoto = photosData.data.find(p => p.type === 'CCCD' || p.type === 'cccd');
              const dlPhoto = photosData.data.find(p => p.type === 'GPLX' || p.type === 'gplx' || p.type === 'driver_license');
              
              cccdUrl = cccdPhoto?.photo_url || cccdPhoto?.photoUrl || cccdPhoto?.url;
              dlUrl = dlPhoto?.photo_url || dlPhoto?.photoUrl || dlPhoto?.url;
            } else {
              // Nếu là object với cccd và license fields
              cccdUrl = photosData.cccd?.photo_url || photosData.cccd?.url || photosData.cccdUrl;
              dlUrl = photosData.license?.photo_url || photosData.license?.url || photosData.licenseUrl;
            }
          }
        } catch (photoErr) {
          console.warn('⚠️ Could not fetch photos separately:', photoErr);
        }
      }
      
      // Fallback: check trong profile data
      if (!cccdUrl) {
        cccdUrl = profileData.photo_url || profileData.photoUrl || profileData.cccdImageUrl || profileData.idCardUrl || profileData.cccdUrl || null;
      }
      if (!dlUrl) {
        dlUrl = profileData.license_url || profileData.licenseUrl || profileData.driverLicenseImageUrl || profileData.driverLicenseUrl || null;
      }
      
      console.log('📸 CCCD URL from DB:', cccdUrl);
      console.log('📸 Driver License URL from DB:', dlUrl);
      
      // Tìm tất cả fields có chứa 'cccd', 'id', hoặc 'card' để debug
      const cccdFields = Object.keys(profileData).filter(k => 
        k.toLowerCase().includes('cccd') || 
        k.toLowerCase().includes('idcard') || 
        k.toLowerCase().includes('photo') ||
        k.toLowerCase().includes('id_card')
      );
      console.log('🔍 Possible CCCD fields in response:', cccdFields);
      cccdFields.forEach(key => console.log(`  - ${key}:`, profileData[key]));
      
      // Tìm tất cả fields có chứa 'license' hoặc 'driver'
      const dlFields = Object.keys(profileData).filter(k => 
        k.toLowerCase().includes('license') || 
        k.toLowerCase().includes('driver') ||
        k.toLowerCase().includes('gplx') ||
        k.toLowerCase().includes('bang_lai')
      );
      console.log('🔍 Possible Driver License fields in response:', dlFields);
      dlFields.forEach(key => console.log(`  - ${key}:`, profileData[key]));
      
      if (cccdUrl) {
        console.log('✅ Setting CCCD preview:', cccdUrl);
        setIdPreview(cccdUrl);
        setIdCardUrl(cccdUrl);
      } else {
        console.log('⚠️ No CCCD URL found in database');
      }
      
      if (dlUrl) {
        console.log('✅ Setting DL preview:', dlUrl);
        setDlPreview(dlUrl);
        setDriverLicenseUrl(dlUrl);
      } else {
        console.log('⚠️ No Driver License URL found in database');
      }
      
      // Update user in context và localStorage
      updateUser({
        ...profileData,
        name: profileData.fullName || profileData.name,
        cccdImageUrl: cccdUrl,
        idCardUrl: cccdUrl,
        cccdUrl: cccdUrl,
        driverLicenseImageUrl: dlUrl,
        driverLicenseUrl: dlUrl,
        licenseUrl: dlUrl,
      });
      
    } catch (err) {
      console.error('❌ Failed to fetch profile from database:', err);
      console.error('❌ Error details:', err.message);
      // Fallback to localStorage if API fails
      loadUserProfileFromLocalStorage();
    }
  };

  // Fallback: Load từ localStorage
  const loadUserProfileFromLocalStorage = () => {
    console.log('⚠️ Loading profile from localStorage (fallback)');
    if (user) {
      setFormData({
        fullName: user.name || user.fullName || user.username || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || user.dob || '',
      });
      
      const cccd = user.cccdImageUrl || user.idCardUrl || user.cccdUrl || null;
      const dl = user.driverLicenseImageUrl || user.driverLicenseUrl || user.licenseUrl || null;
      
      if (cccd) {
        setIdPreview(cccd);
        setIdCardUrl(cccd);
      }
      if (dl) {
        setDlPreview(dl);
        setDriverLicenseUrl(dl);
      }
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
        
        const cccd = u.cccdImageUrl || u.idCardUrl || u.cccdUrl || null;
        const dl = u.driverLicenseImageUrl || u.driverLicenseUrl || u.licenseUrl || null;
        
        if (cccd) {
          setIdPreview(cccd);
          setIdCardUrl(cccd);
        }
        if (dl) {
          setDlPreview(dl);
          setDriverLicenseUrl(dl);
        }
      } catch (err) {
        console.error('❌ Failed to parse user from localStorage:', err);
      }
    }
  };

  // Dọn objectURL tránh leak
  useEffect(() => {
    return () => {
      if (idPreview?.startsWith('blob:')) URL.revokeObjectURL(idPreview);
      if (dlPreview?.startsWith('blob:')) URL.revokeObjectURL(dlPreview);
    };
  }, [idPreview, dlPreview]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditToggle = () => {
    if (isEditing) {
      // Hủy sửa -> load lại từ database
      fetchProfileFromDatabase();
    }
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
      const userId = user?.id || user?.userId || user?.data?.id;
      console.log('🔑 Sending userId:', userId);
      console.log('👤 Current user:', user);
      
      const payload = {
        ...formData,
        idCardUrl: idCardUrl || undefined,
        driverLicenseUrl: driverLicenseUrl || undefined,
      };
      
      console.log('💾 Saving profile with payload:', payload);
      const res = await profileService.update(payload, userId);
      console.log('✅ Profile saved to database:', res);
      
      // ✅ Cập nhật user context ngay lập tức
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
      
      console.log('🔄 Updating user context with:', updatedUserData);
      updateUser(updatedUserData);
      console.log('✅ User context updated, changes should appear immediately');
      
      alert('Profile updated successfully!');
      setIsEditing(false);
      
      // ✅ Fetch lại profile từ database để đảm bảo sync (second priority)
      console.log('🔄 Fetching latest profile from database...');
      await fetchProfileFromDatabase();
      
    } catch (err) {
      console.error('❌ Error updating profile:', err);
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
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
          <h1>HỒ SƠ CỦA TÔI</h1>
          <p className="subtitle">Quản lý thông tin cá nhân</p>
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
                {isEditing ? '✕ Cancel' : ' Chỉnh sửa hồ sơ'}
              </button>
              <button onClick={handleLogout} className="btn-logout">
                  Đăng xuất
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="profile-form-section">
            <form onSubmit={handleUpdateProfile}>
              {/* GRID INPUTS */}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên</label>
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
                  <label htmlFor="phone">Số điện thoại</label>
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
                  <label htmlFor="dateOfBirth">Ngày tháng năm sinh</label>
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
                  <label htmlFor="address">Địa chỉ</label>
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
                      console.error(' Failed to load CCCD image:', idPreview);
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
                      console.error(' Failed to load Driver License image:', dlPreview);
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
                    {loading ? 'Saving...' : ' Lưu thay đổi'}
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
                <h3>Đơn đặt xe của tôi</h3>
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="btn-view"
                >
                  Xem tất cả đơn đặt xe →
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