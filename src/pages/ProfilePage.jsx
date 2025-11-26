import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { profileService } from '../services';
import photoService from '../services/photoService';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useContext(AuthContext);

  // Ảnh & trạng thái upload
  const [idPreview, setIdPreview] = useState('');
  const [dlPreview, setDlPreview] = useState('');
  const [idCardUrl, setIdCardUrl] = useState(null);
  const [driverLicenseUrl, setDriverLicenseUrl] = useState(null);
  const [idUploading, setIdUploading] = useState(false);
  const [dlUploading, setDlUploading] = useState(false);

  // Trạng thái có/không giấy tờ trong DB
  const [docStatus, setDocStatus] = useState({
    hasIdCard: false,
    hasDriverLicense: false,
  });

  // Form thông tin người dùng
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
  });

  // =========================
  // Helpers
  // =========================
  const getUserId = () => user?.id || user?.userId || user?.data?.id || null;

  const loadUserProfileFromLocalStorage = () => {
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

      setDocStatus({
        hasIdCard: !!cccd,
        hasDriverLicense: !!dl,
      });
      return;
    }

    const saved = localStorage.getItem('user');
    if (!saved) return;

    try {
      const u = JSON.parse(saved);
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

      setDocStatus({
        hasIdCard: !!cccd,
        hasDriverLicense: !!dl,
      });
    } catch {
      /* noop */
    }
  };

  // =========================
  // Effects
  // =========================

  // Scroll + bảo đảm đăng nhập + tải hồ sơ
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfileFromDatabase();
  }, [user, navigate]);

  // Đồng bộ form khi context user đổi
  useEffect(() => {
    if (!user) return;

    setFormData({
      fullName: user.name || user.fullName || user.username || '',
      email: user.email || '',
      phone: user.phone || user.phoneNumber || '',
      address: user.address || '',
      dateOfBirth: user.dateOfBirth || user.dob || '',
    });

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

  // Lấy doc-status thật từ DB (nếu BE có endpoint), fallback theo URL đã có
  useEffect(() => {
    const uid = getUserId();
    if (!uid) return;

    (async () => {
      try {
        const status = await photoService.getDocStatus?.(uid);
        if (status && typeof status === 'object') {
          setDocStatus({
            hasIdCard: !!status.hasIdCard,
            hasDriverLicense: !!status.hasDriverLicense,
          });
          return;
        }
      } catch {
        /* ignore, sẽ fallback */
      }

      setDocStatus({
        hasIdCard: !!(idCardUrl || idPreview),
        hasDriverLicense: !!(driverLicenseUrl || dlPreview),
      });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, idCardUrl, driverLicenseUrl]);

  // Dọn objectURL khi rời trang
  useEffect(() => {
    return () => {
      if (idPreview?.startsWith('blob:')) URL.revokeObjectURL(idPreview);
      if (dlPreview?.startsWith('blob:')) URL.revokeObjectURL(dlPreview);
    };
  }, [idPreview, dlPreview]);

  // =========================
  // Data fetchers
  // =========================
  const fetchProfileFromDatabase = async () => {
    try {
      const uid = getUserId();
      if (!uid) return;

      const response = await profileService.getProfile(uid);
      const profileData = response?.data || response || {};

      // Form
      setFormData({
        fullName: profileData.fullName || profileData.name || profileData.username || '',
        email: profileData.email || '',
        phone: profileData.phone || profileData.phoneNumber || '',
        address: profileData.address || '',
        dateOfBirth: profileData.dateOfBirth || profileData.dob || '',
      });

      // Ảnh từ bảng photos (ưu tiên), sau đó fallback profile fields
      let cccdUrl = null;
      let dlUrl = null;

      try {
        const photos = await photoService.getPhotos(uid);
        if (photos) {
          if (Array.isArray(photos)) {
            const cccd = photos.find(p => (p.type || '').toUpperCase() === 'CCCD');
            const gplx = photos.find(p => ['GPLX', 'DRIVER_LICENSE', 'DRIVERLICENSE', 'LICENSE'].includes((p.type || '').toUpperCase()));
            cccdUrl = cccd?.photo_url || cccd?.photoUrl || cccd?.url || cccd?.imageUrl || null;
            dlUrl = gplx?.photo_url || gplx?.photoUrl || gplx?.url || gplx?.imageUrl || null;
          } else if (photos?.data && Array.isArray(photos.data)) {
            const cccd = photos.data.find(p => (p.type || '').toUpperCase() === 'CCCD');
            const gplx = photos.data.find(p => ['GPLX', 'DRIVER_LICENSE', 'DRIVERLICENSE', 'LICENSE'].includes((p.type || '').toUpperCase()));
            cccdUrl = cccd?.photo_url || cccd?.photoUrl || cccd?.url || cccd?.imageUrl || null;
            dlUrl = gplx?.photo_url || gplx?.photoUrl || gplx?.url || gplx?.imageUrl || null;
          } else {
            cccdUrl = photos?.cccd?.photo_url || photos?.cccd?.url || photos?.cccdUrl || null;
            dlUrl =
              photos?.license?.photo_url ||
              photos?.license?.url ||
              photos?.licenseUrl ||
              photos?.gplx?.photo_url ||
              photos?.gplx?.url ||
              null;
          }
        }
      } catch {
        /* ignore */
      }

      if (!cccdUrl) {
        cccdUrl =
          profileData.photo_url ||
          profileData.photoUrl ||
          profileData.cccdImageUrl ||
          profileData.idCardUrl ||
          profileData.cccdUrl ||
          null;
      }
      if (!dlUrl) {
        dlUrl =
          profileData.license_url ||
          profileData.licenseUrl ||
          profileData.driverLicenseImageUrl ||
          profileData.driverLicenseUrl ||
          null;
      }

      if (cccdUrl) {
        setIdPreview(cccdUrl);
        setIdCardUrl(cccdUrl);
      }
      if (dlUrl) {
        setDlPreview(dlUrl);
        setDriverLicenseUrl(dlUrl);
      }

      // Cập nhật docStatus ngay tại đây (để FE bám vào DB)
      setDocStatus({
        hasIdCard: !!cccdUrl,
        hasDriverLicense: !!dlUrl,
      });

      // Cập nhật user context để các màn khác dùng được ngay
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
      // Fallback localStorage
      loadUserProfileFromLocalStorage();
    }
  };

  // =========================
  // Handlers
  // =========================
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditToggle = () => {
    if (isEditing) fetchProfileFromDatabase(); // hủy sửa -> reset
    setIsEditing(v => !v);
  };

  const handlePickId = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type?.startsWith('image/')) return alert('Vui lòng chọn đúng file ảnh');
    if (f.size > 5 * 1024 * 1024) return alert('Ảnh vượt quá 5MB');

    const blobUrl = URL.createObjectURL(f);
    setIdPreview(blobUrl);

    const uid = getUserId();
    if (!uid) return alert('Không tìm thấy thông tin người dùng');

    try {
      setIdUploading(true);
      const url = await photoService.uploadIdCard(f, uid, { overwrite: true });
      if (!url) throw new Error('Không nhận được URL trả về');

      setIdPreview(url);
      setIdCardUrl(url);
      setDocStatus(s => ({ ...s, hasIdCard: true }));

      updateUser({
        ...user,
        cccdImageUrl: url,
        idCardUrl: url,
        cccdUrl: url,
        photo_url: url,
        photoUrl: url,
      });

      alert('✅ Upload CCCD thành công! Ảnh đã được lưu.');
    } catch (err) {
      alert('Upload CCCD thất bại: ' + (err.message || 'Unknown error'));
    } finally {
      setIdUploading(false);
    }
  };

  const handlePickDL = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type?.startsWith('image/')) return alert('Vui lòng chọn đúng file ảnh');
    if (f.size > 5 * 1024 * 1024) return alert('Ảnh vượt quá 5MB');

    const blobUrl = URL.createObjectURL(f);
    setDlPreview(blobUrl);

    const uid = getUserId();
    if (!uid) return alert('Không tìm thấy thông tin người dùng');

    try {
      setDlUploading(true);
      const url = await photoService.uploadDriverLicense(f, uid, { overwrite: true });
      if (!url) throw new Error('Không nhận được URL trả về');

      setDlPreview(url);
      setDriverLicenseUrl(url);
      setDocStatus(s => ({ ...s, hasDriverLicense: true }));

      updateUser({
        ...user,
        driverLicenseImageUrl: url,
        driverLicenseUrl: url,
        licenseUrl: url,
        license_url: url,
      });

      alert('✅ Upload Bằng lái thành công! Ảnh đã được lưu.');
    } catch (err) {
      alert('Upload bằng lái thất bại: ' + (err.message || 'Unknown error'));
    } finally {
      setDlUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Chặn lưu khi upload chưa xong
    if (idUploading || dlUploading) {
      alert('Vui lòng đợi upload hình hoàn tất rồi mới lưu thay đổi.');
      return;
    }

    setLoading(true);
    try {
      const uid = getUserId();
      if (!uid) throw new Error('Không xác định được người dùng');

      const payload = {
        ...formData,
        idCardUrl: idCardUrl || undefined,
        driverLicenseUrl: driverLicenseUrl || undefined,
      };

      await profileService.update(payload, uid);

      // Đồng bộ context để hiển thị ngay
      updateUser({
        ...user,
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
      });

      alert('Profile updated successfully!');
      setIsEditing(false);

      // Làm “chắc cú” đồng bộ lại từ DB
      await fetchProfileFromDatabase();
    } catch (err) {
      alert('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất?')) {
      logout();
      navigate('/');
    }
  };

  if (!user) return null;

  // =========================
  // Render
  // =========================
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
                {isEditing ? '✕ Hủy' : ' Chỉnh sửa hồ sơ'}
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

              {/* Upload CCCD */}
              <div className="form-group">
                <label>
                  CCCD (ID Card){' '}
                  {docStatus.hasIdCard ? '— ĐÃ TẢI LÊN' : '— CHƯA CÓ'}
                  {idUploading && ' — ĐANG UPLOAD...'}
                </label>
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
                    onError={(e) => (e.target.style.display = 'none')}
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

              {/* Upload GPLX */}
              <div className="form-group">
                <label>
                  Bằng lái (Driver License){' '}
                  {docStatus.hasDriverLicense ? '— ĐÃ TẢI LÊN' : '— CHƯA CÓ'}
                  {dlUploading && ' — ĐANG UPLOAD...'}
                </label>
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
                    onError={(e) => (e.target.style.display = 'none')}
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
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={loading || idUploading || dlUploading}
                  >
                    {loading
                      ? 'Saving...'
                      : idUploading || dlUploading
                      ? 'Đang upload ảnh...'
                      : ' Lưu thay đổi'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Link đặt xe */}
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
