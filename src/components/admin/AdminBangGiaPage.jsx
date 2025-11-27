// quản lý bảng giá
// admin xem, thêm, sửa, xóa bảng giá thuê xe và dịch vụ
import React, { useState, useEffect } from "react";
import "./AdminBangGiaPage.css";
// import axios from "axios"; // TODO: Uncomment khi kết nối API

const AdminBangGiaPage = () => {
  // State quản lý bảng giá thuê xe
  // Initial state: Mảng chứa các object với id, type, dailyPrice, lateFee, holidayPrice
  // useState với initial value: React sẽ dùng giá trị này khi component mount lần đầu
  const [rentalPricing, setRentalPricing] = useState([
    { id: 1, type: "B-SUV", dailyPrice: 900000, lateFee: 200000, holidayPrice: 1200000 },
    { id: 2, type: "C-SUV", dailyPrice: 1100000, lateFee: 260000, holidayPrice: 1400000 },
    { id: 3, type: "D-SUV", dailyPrice: 1300000, lateFee: 320000, holidayPrice: 1650000 },
    { id: 4, type: "E-SUV", dailyPrice: 1800000, lateFee: 400000, holidayPrice: 2200000 },
    { id: 5, type: "F-SUV", dailyPrice: 2000000, lateFee: 450000, holidayPrice: 2500000 },
    { id: 6, type: "G-SUV", dailyPrice: 2300000, lateFee: 520000, holidayPrice: 2900000 }
  ]);

  // useEffect: Fetch data từ API khi component mount
  // Dependency array [] rỗng = chỉ chạy 1 lần khi component mount
  useEffect(() => {
    // Hàm async bên trong useEffect
    // Cần wrap trong function vì useEffect không thể nhận async function trực tiếp
    const fetchPricing = async () => {
      try {
        // TODO: Thay bằng API thực tế khi có
        // const res = await axios.get("http://localhost:8080/api/pricing-rules");
        // setRentalPricing(res.data);
      } catch (error) {
        console.error("Lỗi khi tải bảng giá:", error);
      }
    };
    
    // Gọi hàm fetch
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

  // Helper function: Format số tiền theo chuẩn Việt Nam
  // Input: 900000
  // Output: "900.000₫"
  // Intl.NumberFormat: API của JavaScript để format số theo locale
  // "vi-VN": Locale Việt Nam (dùng dấu chấm làm separator hàng nghìn)
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  };

  // ========== BẢNG GIÁ THUÊ XE - CRUD OPERATIONS ==========
  // CRUD = Create, Read, Update, Delete
  
  // Hàm mở modal thêm mới bảng giá thuê xe
  // Reset form về giá trị mặc định và hiển thị modal
  const handleAddRental = () => {
    // Reset form data về giá trị ban đầu
    setNewRentalItem({
      type: "",
      dailyPrice: 0,
      lateFee: 0,
      holidayPrice: 0
    });
    
    // Hiển thị modal thêm mới
    setShowAddRentalModal(true);
  };

  // Hàm tạo mới bảng giá thuê xe
  // async: Vì sẽ gọi API (hiện tại đang dùng mock data)
  const handleCreateRental = async () => {
    // Validation: Kiểm tra tất cả field đã được điền chưa
    // Toán tử !: Phủ định (truthy -> false, falsy -> true)
    // Nếu một trong các field rỗng/0 thì hiển thị alert và dừng lại
    if (!newRentalItem.type || !newRentalItem.dailyPrice || !newRentalItem.lateFee || !newRentalItem.holidayPrice) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return; // Early return: Dừng hàm ngay tại đây
    }

    try {
      // TODO: Uncomment khi có API thực tế
      // await axios.post("http://localhost:8080/api/pricing-rules/create", {
      //   type: newRentalItem.type,
      //   dailyPrice: newRentalItem.dailyPrice,
      //   lateFeePerDay: newRentalItem.lateFee,
      //   holidayPrice: newRentalItem.holidayPrice
      // });

      // Mock: Tạo item mới với ID tự tăng
      // rentalPricing.length + 1: ID mới = số lượng hiện tại + 1
      const newItem = {
        id: rentalPricing.length + 1,
        // Spread operator: Copy tất cả properties từ newRentalItem
        ...newRentalItem
      };
      
      // Cập nhật state: Thêm item mới vào mảng
      // Spread operator [...rentalPricing]: Copy mảng cũ
      // newItem: Thêm phần tử mới vào cuối
      setRentalPricing([...rentalPricing, newItem]);
      
      // Đóng modal
      setShowAddRentalModal(false);
      
      // Hiển thị thông báo thành công
      alert("Thêm bảng giá thuê xe thành công!");
    } catch (error) {
      // Xử lý lỗi
      console.error("Lỗi khi thêm bảng giá:", error);
      alert("Không thể thêm bảng giá. Vui lòng thử lại!");
    }
  };

  // Hàm mở modal sửa bảng giá thuê xe
  // Nhận item cần sửa làm parameter
  const handleEditRental = (item) => {
    // Lưu item đang được sửa vào state
    setEditingRentalItem(item);
    
    // Pre-fill form với dữ liệu hiện tại của item
    // Để user có thể xem và chỉnh sửa
    setEditRentalFormData({
      dailyPrice: item.dailyPrice,
      lateFee: item.lateFee,
      holidayPrice: item.holidayPrice
    });
    
    // Hiển thị modal sửa
    setShowEditRentalModal(true);
  };

  // Hàm cập nhật bảng giá thuê xe
  // async: Vì sẽ gọi API (hiện tại đang dùng mock data)
  const handleUpdateRental = async () => {
    // Validation: Kiểm tra tất cả field đã được điền chưa
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

      // Mock: Cập nhật item trong mảng
      // Array.map(): Tạo mảng mới, thay thế item có id khớp
      setRentalPricing(rentalPricing.map(item => 
        // Ternary operator: Nếu id khớp thì merge với editRentalFormData, không thì giữ nguyên
        item.id === editingRentalItem.id
          ? { ...item, ...editRentalFormData } // Spread: Copy properties cũ và override với data mới
          : item // Giữ nguyên item khác
      ));
      
      // Đóng modal và reset state
      setShowEditRentalModal(false);
      setEditingRentalItem(null);
      
      alert("Cập nhật bảng giá thuê xe thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      alert("Cập nhật thất bại!");
    }
  };

  // Hàm xóa bảng giá thuê xe
  // async: Vì sẽ gọi API (hiện tại đang dùng mock data)
  const handleDeleteRental = async (item) => {
    // Confirmation dialog: Xác nhận trước khi xóa
    // window.confirm(): Hiển thị dialog Yes/No, trả về true/false
    // Template literal: Chèn item.type vào chuỗi thông báo
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bảng giá cho xe ${item.type}?`)) {
      // Early return: Nếu user chọn "Cancel" thì dừng lại
      return;
    }

    try {
      // TODO: Thay bằng API thực tế khi có
      // await axios.delete(`http://localhost:8080/api/pricing-rules/delete/${item.id}`);

      // Mock: Xóa item khỏi mảng
      // Array.filter(): Tạo mảng mới chỉ chứa các phần tử thỏa mãn điều kiện
      // p.id !== item.id: Giữ lại tất cả item có id khác với item cần xóa
      setRentalPricing(rentalPricing.filter(p => p.id !== item.id));
      
      alert("Đã xóa bảng giá thuê xe thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Không thể xóa bảng giá. Vui lòng thử lại!");
    }
  };

  // ========== BẢNG GIÁ DỊCH VỤ - CRUD OPERATIONS ==========
  // Dịch vụ được nhóm theo category (Phí giao thông, Vệ sinh, Bảo trì, Sửa chữa)

  // Hàm mở modal thêm mới dịch vụ
  const handleAddService = () => {
    // Reset form về giá trị mặc định
    setNewServiceItem({
      category: "",
      description: "",
      price: 0
    });
    
    // Hiển thị modal
    setShowAddServiceModal(true);
  };

  // Hàm tạo mới dịch vụ
  // Lưu ý: Không phải async vì đang dùng mock data (không gọi API)
  const handleCreateService = () => {
    // Validation: Kiểm tra tất cả field đã được điền
    // Truthy check: Kiểm tra field có giá trị (không rỗng, không 0)
    if (!newServiceItem.category || !newServiceItem.description || !newServiceItem.price) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Tạo service object mới
    // Date.now(): Lấy timestamp hiện tại làm ID (milliseconds từ 1970)
    // Đảm bảo ID unique
    const newService = {
      id: Date.now(),
      description: newServiceItem.description,
      price: newServiceItem.price
    };

    // Cập nhật state: Thêm service vào category tương ứng
    // Array.map(): Tạo mảng mới với logic update
    setServicePricing(servicePricing.map(cat => 
      // Nếu category khớp thì thêm service mới vào mảng services
      cat.category === newServiceItem.category
        ? { 
            ...cat,  // Copy properties của category
            services: [...cat.services, newService]  // Thêm service mới vào cuối mảng
          }
        : cat  // Giữ nguyên category khác
    ));

    // Kiểm tra nếu category mới (chưa tồn tại trong danh sách)
    // Array.find(): Tìm phần tử đầu tiên thỏa mãn điều kiện
    // Trả về undefined nếu không tìm thấy
    if (!servicePricing.find(cat => cat.category === newServiceItem.category)) {
      // Thêm category mới vào danh sách
      // Spread operator: Copy mảng cũ và thêm object mới
      setServicePricing([...servicePricing, {
        category: newServiceItem.category,
        services: [newService]  // Mảng services chỉ có 1 service mới
      }]);
    }

    // Đóng modal và hiển thị thông báo
    setShowAddServiceModal(false);
    alert("Thêm bảng giá dịch vụ thành công!");
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

