import React, { useState, useEffect } from "react";
import "./AdminBangGiaPage.css";
// import axios from "axios"; // TODO: Uncomment khi kết nối API

const AdminBangGiaPage = () => {
  // Dữ liệu bảng giá thuê xe
  const [rentalPricing, setRentalPricing] = useState([
    { id: 1, type: "B-SUV", dailyPrice: 900000, lateFee: 200000, holidayPrice: 1200000 },
    { id: 2, type: "C-SUV", dailyPrice: 1100000, lateFee: 260000, holidayPrice: 1400000 },
    { id: 3, type: "D-SUV", dailyPrice: 1300000, lateFee: 320000, holidayPrice: 1650000 },
    { id: 4, type: "E-SUV", dailyPrice: 1800000, lateFee: 400000, holidayPrice: 2200000 },
    { id: 5, type: "F-SUV", dailyPrice: 2000000, lateFee: 450000, holidayPrice: 2500000 },
    { id: 6, type: "G-SUV", dailyPrice: 2300000, lateFee: 520000, holidayPrice: 2900000 }
  ]);

  // Fetch data từ API (nếu có)
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        // TODO: Thay bằng API thực tế khi có
        // const res = await axios.get("http://localhost:8080/api/pricing-rules");
        // setRentalPricing(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bảng giá:", error);
      }
    };
    fetchPricing();
  }, []);

  // Dữ liệu bảng giá dịch vụ
  const [servicePricing, setServicePricing] = useState([
    {
      category: "Phí giao thông",
      services: [
        { id: 1, description: "Phí giao thông cơ bản", price: 50000 },
        { id: 2, description: "Phí giao thông cơ bản", price: 60000 },
        { id: 3, description: "Phí giao thông giờ cao điểm", price: 70000 },
        { id: 4, description: "Phụ phí điều kiện giao thông đặc biệt", price: 100000 }
      ]
    },
    {
      category: "Vệ sinh",
      services: [
        { id: 5, description: "Vệ sinh nội thất", price: 80000 },
        { id: 6, description: "Vệ sinh toàn bộ xe", price: 100000 },
        { id: 7, description: "Dịch vụ vệ sinh sâu", price: 120000 },
        { id: 8, description: "Vệ sinh nội thất", price: 1110000 }
      ]
    },
    {
      category: "Bảo trì",
      services: [
        { id: 9, description: "Bảo trì thường xuyên", price: 150000 },
        { id: 10, description: "Bảo trì hệ thống điện", price: 200000 },
        { id: 11, description: "Bảo trì toàn diện xe", price: 250000 }
      ]
    },
    {
      category: "Sửa chữa",
      services: [
        { id: 12, description: "Sửa chữa nhỏ", price: 180000 },
        { id: 13, description: "Sửa chữa nhỏ", price: 180000 },
        { id: 14, description: "Sửa chữa tiêu chuẩn", price: 300000 },
        { id: 15, description: "Sửa chữa lớn", price: 500000 }
      ]
    }
  ]);

  // Modal states cho bảng giá thuê xe
  const [showAddRentalModal, setShowAddRentalModal] = useState(false);
  const [showEditRentalModal, setShowEditRentalModal] = useState(false);
  const [editingRentalItem, setEditingRentalItem] = useState(null);
  const [newRentalItem, setNewRentalItem] = useState({
    type: "",
    dailyPrice: 0,
    lateFee: 0,
    holidayPrice: 0
  });
  const [editRentalFormData, setEditRentalFormData] = useState({
    dailyPrice: 0,
    lateFee: 0,
    holidayPrice: 0
  });

  // Modal states cho bảng giá dịch vụ
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showEditServiceModal, setShowEditServiceModal] = useState(false);
  const [editingServiceItem, setEditingServiceItem] = useState(null);
  const [editingServiceCategory, setEditingServiceCategory] = useState("");
  const [newServiceItem, setNewServiceItem] = useState({
    category: "",
    description: "",
    price: 0
  });
  const [editServiceFormData, setEditServiceFormData] = useState({
    description: "",
    price: 0
  });

  // Format số tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // ========== BẢNG GIÁ THUÊ XE - CRUD ==========
  
  // Thêm mới bảng giá thuê xe
  const handleAddRental = () => {
    setNewRentalItem({
      type: "",
      dailyPrice: 0,
      lateFee: 0,
      holidayPrice: 0
    });
    setShowAddRentalModal(true);
  };

  // Tạo mới bảng giá thuê xe
  const handleCreateRental = async () => {
    if (!newRentalItem.type || !newRentalItem.dailyPrice || !newRentalItem.lateFee || !newRentalItem.holidayPrice) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      // TODO: Uncomment axios import và thay bằng API thực tế khi có
      // await axios.post("http://localhost:8080/api/pricing-rules/create", {
      //   type: newRentalItem.type,
      //   dailyPrice: newRentalItem.dailyPrice,
      //   lateFeePerDay: newRentalItem.lateFee,
      //   holidayPrice: newRentalItem.holidayPrice
      // });

      const newItem = {
        id: rentalPricing.length + 1,
        ...newRentalItem
      };
      setRentalPricing([...rentalPricing, newItem]);
      setShowAddRentalModal(false);
      alert("✅ Thêm bảng giá thuê xe thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi thêm bảng giá:", error);
      alert("Không thể thêm bảng giá. Vui lòng thử lại!");
    }
  };

  // Sửa bảng giá thuê xe
  const handleEditRental = (item) => {
    setEditingRentalItem(item);
    setEditRentalFormData({
      dailyPrice: item.dailyPrice,
      lateFee: item.lateFee,
      holidayPrice: item.holidayPrice
    });
    setShowEditRentalModal(true);
  };

  // Cập nhật bảng giá thuê xe
  const handleUpdateRental = async () => {
    if (!editRentalFormData.dailyPrice || !editRentalFormData.lateFee || !editRentalFormData.holidayPrice) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      // TODO: Thay bằng API thực tế khi có
      // await axios.put(`http://localhost:8080/api/pricing-rules/${editingRentalItem.id}`, {
      //   dailyPrice: editRentalFormData.dailyPrice,
      //   lateFeePerDay: editRentalFormData.lateFee,
      //   holidayPrice: editRentalFormData.holidayPrice
      // });

      setRentalPricing(rentalPricing.map(item => 
        item.id === editingRentalItem.id
          ? { ...item, ...editRentalFormData }
          : item
      ));
      setShowEditRentalModal(false);
      setEditingRentalItem(null);
      alert("✅ Cập nhật bảng giá thuê xe thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại!");
    }
  };

  // Xóa bảng giá thuê xe
  const handleDeleteRental = async (item) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bảng giá cho xe ${item.type}?`)) {
      return;
    }

    try {
      // TODO: Thay bằng API thực tế khi có
      // await axios.delete(`http://localhost:8080/api/pricing-rules/delete/${item.id}`);

      setRentalPricing(rentalPricing.filter(p => p.id !== item.id));
      alert("🗑️ Đã xóa bảng giá thuê xe thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi xóa:", error);
      alert("Không thể xóa bảng giá. Vui lòng thử lại!");
    }
  };

  // ========== BẢNG GIÁ DỊCH VỤ - CRUD ==========

  // Thêm mới bảng giá dịch vụ
  const handleAddService = () => {
    setNewServiceItem({
      category: "",
      description: "",
      price: 0
    });
    setShowAddServiceModal(true);
  };

  // Tạo mới bảng giá dịch vụ
  const handleCreateService = () => {
    if (!newServiceItem.category || !newServiceItem.description || !newServiceItem.price) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    const newService = {
      id: Date.now(),
      description: newServiceItem.description,
      price: newServiceItem.price
    };

    setServicePricing(servicePricing.map(cat => 
      cat.category === newServiceItem.category
        ? { ...cat, services: [...cat.services, newService] }
        : cat
    ));

    // Nếu category mới, thêm category mới
    if (!servicePricing.find(cat => cat.category === newServiceItem.category)) {
      setServicePricing([...servicePricing, {
        category: newServiceItem.category,
        services: [newService]
      }]);
    }

    setShowAddServiceModal(false);
    alert("✅ Thêm bảng giá dịch vụ thành công!");
  };

  // Sửa bảng giá dịch vụ
  const handleEditService = (service, category) => {
    setEditingServiceItem(service);
    setEditingServiceCategory(category);
    setEditServiceFormData({
      description: service.description,
      price: service.price
    });
    setShowEditServiceModal(true);
  };

  // Cập nhật bảng giá dịch vụ
  const handleUpdateService = () => {
    if (!editServiceFormData.description || !editServiceFormData.price) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setServicePricing(servicePricing.map(cat => 
      cat.category === editingServiceCategory
        ? {
            ...cat,
            services: cat.services.map(serv =>
              serv.id === editingServiceItem.id
                ? { ...serv, ...editServiceFormData }
                : serv
            )
          }
        : cat
    ));

    setShowEditServiceModal(false);
    setEditingServiceItem(null);
    alert("✅ Cập nhật bảng giá dịch vụ thành công!");
  };

  // Xóa bảng giá dịch vụ
  const handleDeleteService = (service, category) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.description}"?`)) {
      return;
    }

    setServicePricing(servicePricing.map(cat => 
      cat.category === category
        ? { ...cat, services: cat.services.filter(serv => serv.id !== service.id) }
        : cat
    ).filter(cat => cat.services.length > 0)); // Xóa category nếu không còn service

    alert("🗑️ Đã xóa bảng giá dịch vụ thành công!");
  };

  return (
    <div className="admin-banggia-page">
      <div className="banggia-header">
        <h1>BẢNG GIÁ</h1>
      </div>

      {/* Bảng giá thuê xe */}
      <div className="pricing-table-section">
        <div className="section-header">
          <h2 className="section-title">BẢNG GIÁ THUÊ XE</h2>
          <button className="btn-add-new" onClick={handleAddRental}>
            + THÊM MỚI
          </button>
        </div>
        <div className="table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>LOẠI XE</th>
                <th>GIÁ / NGÀY</th>
                <th>PHỤ PHÍ TRẺ / NGÀY</th>
                <th>GIÁ NGÀY LỄ</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {rentalPricing.map((item, index) => (
                <tr key={item.id || index}>
                  <td className="car-type">{item.type}</td>
                  <td className="price">{formatPrice(item.dailyPrice)}</td>
                  <td className="price">{formatPrice(item.lateFee)}</td>
                  <td className="price">{formatPrice(item.holidayPrice)}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEditRental(item)}>
                      SỬA
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteRental(item)}>
                      XÓA
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm mới bảng giá thuê xe */}
      {showAddRentalModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>THÊM MỚI BẢNG GIÁ THUÊ XE</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Loại xe</label>
                <input
                  type="text"
                  placeholder="Nhập loại xe (VD: B-SUV, C-SUV...)"
                  value={newRentalItem.type}
                  onChange={(e) => setNewRentalItem({ ...newRentalItem, type: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="form-group">
                <label>Giá / ngày</label>
                <input
                  type="number"
                  placeholder="Nhập giá / ngày..."
                  value={newRentalItem.dailyPrice === 0 ? "" : newRentalItem.dailyPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewRentalItem({
                      ...newRentalItem,
                      dailyPrice: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Phụ phí trễ / ngày</label>
                <input
                  type="number"
                  placeholder="Nhập phụ phí trễ / ngày..."
                  value={newRentalItem.lateFee === 0 ? "" : newRentalItem.lateFee}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewRentalItem({
                      ...newRentalItem,
                      lateFee: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Giá ngày lễ</label>
                <input
                  type="number"
                  placeholder="Nhập giá ngày lễ..."
                  value={newRentalItem.holidayPrice === 0 ? "" : newRentalItem.holidayPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewRentalItem({
                      ...newRentalItem,
                      holidayPrice: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCreateRental}>
                ĐỒNG Ý THÊM
              </button>
              <button className="btn btn-danger" onClick={() => setShowAddRentalModal(false)}>
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa bảng giá thuê xe */}
      {showEditRentalModal && editingRentalItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>CẬP NHẬT GIÁ THUÊ XE</h2>
            <p><strong>{editingRentalItem.type}</strong></p>
            <div className="modal-form">
              <div className="form-group">
                <label>Giá / ngày</label>
                <input
                  type="number"
                  value={editRentalFormData.dailyPrice === 0 ? "" : editRentalFormData.dailyPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditRentalFormData({
                      ...editRentalFormData,
                      dailyPrice: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Phụ phí trễ / ngày</label>
                <input
                  type="number"
                  value={editRentalFormData.lateFee === 0 ? "" : editRentalFormData.lateFee}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditRentalFormData({
                      ...editRentalFormData,
                      lateFee: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Giá ngày lễ</label>
                <input
                  type="number"
                  value={editRentalFormData.holidayPrice === 0 ? "" : editRentalFormData.holidayPrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditRentalFormData({
                      ...editRentalFormData,
                      holidayPrice: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleUpdateRental}>
                LƯU THAY ĐỔI
              </button>
              <button className="btn btn-danger" onClick={() => {
                setShowEditRentalModal(false);
                setEditingRentalItem(null);
              }}>
                HỦY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng giá dịch vụ */}
      <div className="pricing-table-section">
        <div className="section-header">
          <h2 className="section-title">BẢNG GIÁ DỊCH VỤ</h2>
          <button className="btn-add-new" onClick={handleAddService}>
            + THÊM MỚI
          </button>
        </div>
        <div className="table-container">
          <table className="pricing-table">
            <thead>
              <tr>
                <th>LOẠI DỊCH VỤ</th>
                <th>MÔ TẢ</th>
                <th>GIÁ</th>
                <th>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {servicePricing.map((category, catIndex) =>
                category.services.map((service, servIndex) => (
                  <tr key={service.id || `${catIndex}-${servIndex}`}>
                    <td className="service-type">
                      {servIndex === 0 ? category.category : ""}
                    </td>
                    <td className="description">{service.description}</td>
                    <td className="price">{formatPrice(service.price)}</td>
                    <td className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEditService(service, category.category)}>
                        SỬA
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteService(service, category.category)}>
                        XÓA
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm mới bảng giá dịch vụ */}
      {showAddServiceModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>THÊM MỚI BẢNG GIÁ DỊCH VỤ</h2>
            <div className="modal-form">
              <div className="form-group">
                <label>Loại dịch vụ</label>
                <select
                  value={newServiceItem.category}
                  onChange={(e) => setNewServiceItem({ ...newServiceItem, category: e.target.value })}
                >
                  <option value="">Chọn loại dịch vụ</option>
                  <option value="Phí giao thông">Phí giao thông</option>
                  <option value="Vệ sinh">Vệ sinh</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Sửa chữa">Sửa chữa</option>
                </select>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  placeholder="Nhập mô tả dịch vụ..."
                  value={newServiceItem.description}
                  onChange={(e) => setNewServiceItem({ ...newServiceItem, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Giá</label>
                <input
                  type="number"
                  placeholder="Nhập giá..."
                  value={newServiceItem.price === 0 ? "" : newServiceItem.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewServiceItem({
                      ...newServiceItem,
                      price: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleCreateService}>
                ĐỒNG Ý THÊM
              </button>
              <button className="btn btn-danger" onClick={() => setShowAddServiceModal(false)}>
                ĐÓNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sửa bảng giá dịch vụ */}
      {showEditServiceModal && editingServiceItem && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>CẬP NHẬT GIÁ DỊCH VỤ</h2>
            <p><strong>{editingServiceCategory}</strong> - {editingServiceItem.description}</p>
            <div className="modal-form">
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  value={editServiceFormData.description}
                  onChange={(e) => setEditServiceFormData({ ...editServiceFormData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Giá</label>
                <input
                  type="number"
                  value={editServiceFormData.price === 0 ? "" : editServiceFormData.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditServiceFormData({
                      ...editServiceFormData,
                      price: val === "" ? 0 : Number(val)
                    });
                  }}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={handleUpdateService}>
                LƯU THAY ĐỔI
              </button>
              <button className="btn btn-danger" onClick={() => {
                setShowEditServiceModal(false);
                setEditingServiceItem(null);
              }}>
                HỦY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBangGiaPage;

