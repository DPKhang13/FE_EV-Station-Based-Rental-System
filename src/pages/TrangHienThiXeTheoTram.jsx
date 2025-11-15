import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../components/admin/VehicleManagement.css";

const TrangHienThiXeTheoTram = () => {
  const { station } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Bộ lọc
  const [filters, setFilters] = useState({
    colors: [],
    seatCounts: [],
    statuses: [],
  });

  // Dropdown ngoài click tự đóng
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:8080/api/vehicles/station/${station}`
      );
      setVehicles(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Không thể tải danh sách xe. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [station]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Trạng thái xe
  const getStatusInfo = (status) => {
    const map = {
      AVAILABLE: { text: "Sẵn sàng", class: "AVAILABLE" },
      RENTED: { text: "Đang thuê", class: "IN_USE" },
      MAINTENANCE: { text: "Bảo trì", class: "MAINTENANCE" },
    };
    return map[status?.toUpperCase()] || { text: status, class: "AVAILABLE" };
  };

  // Các bộ lọc duy nhất
  const getUniqueColors = () => [...new Set(vehicles.map((v) => v.color).filter(Boolean))];
  const getUniqueSeatCounts = () =>
    [...new Set(vehicles.map((v) => v.seatCount || v.seat_count).filter(Boolean))].sort(
      (a, b) => a - b
    );
  const getAllStatuses = () => ["Available", "Rented", "Maintenance"];

  // Toggle filter
  const toggleFilter = (type, value) => {
    setFilters((prev) => {
      const updated = prev[type].includes(value)
        ? prev[type].filter((x) => x !== value)
        : [...prev[type], value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () =>
    setFilters({ colors: [], seatCounts: [], statuses: [] });

  // Lọc xe theo search + filter
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      !searchTerm ||
      v.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.color?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesColor =
      filters.colors.length === 0 || filters.colors.includes(v.color);
    const matchesSeat =
      filters.seatCounts.length === 0 ||
      filters.seatCounts.includes(v.seatCount || v.seat_count);
    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(v.status);

    return matchesSearch && matchesColor && matchesSeat && matchesStatus;
  });

  // ================== 3 Hành động ==================
  const handleEdit = (v) => alert(`✏️ Sửa xe: ${v.vehicleName}`);
  const handleHistory = async (v) => {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/order/vehicle/${v.id || v.vehicleId}/history`
      );
      if (!res.data.length) return alert("📭 Xe này chưa có lịch sử thuê.");
      alert(`📋 Xe ${v.plateNumber} có ${res.data.length} đơn thuê.`);
    } catch {
      alert("Không thể tải lịch sử xe.");
    }
  };
  const handleDelete = async (v) => {
    if (!window.confirm(`Xóa xe ${v.vehicleName}?`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/vehicles/${v.id}`);
      fetchVehicles();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  // Render
  return (
    <div className="station-vehicle-page">
      <div className="page-header">
        <h1 className="title">🚗 DANH SÁCH XE TẠI TRẠM #{station}</h1>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm theo tên, biển số, màu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bộ lọc */}
      <div className="filters-section open">
        <div className="filter-header">
          <h3>🔍 Bộ lọc</h3>
          {(filters.colors.length > 0 ||
            filters.seatCounts.length > 0 ||
            filters.statuses.length > 0) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Xóa bộ lọc
            </button>
          )}
        </div>

        <div className="filters-grid">
          {/* Màu sắc */}
          <div className="filter-group">
            <h4>🎨 Màu sắc</h4>
            <div className="filter-options">
              {getUniqueColors().map((color) => (
                <label key={color} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.colors.includes(color)}
                    onChange={() => toggleFilter("colors", color)}
                  />
                  <span>{color}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Số ghế */}
          <div className="filter-group">
            <h4>💺 Số ghế</h4>
            <div className="filter-options">
              {getUniqueSeatCounts().map((seat) => (
                <label key={seat} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.seatCounts.includes(seat)}
                    onChange={() => toggleFilter("seatCounts", seat)}
                  />
                  <span>{seat} chỗ</span>
                </label>
              ))}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="filter-group">
            <h4>📊 Trạng thái</h4>
            <div className="filter-options">
              {getAllStatuses().map((st) => {
                const info = getStatusInfo(st);
                return (
                  <label key={st} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(st)}
                      onChange={() => toggleFilter("statuses", st)}
                    />
                    <span>{info.text}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách xe */}
      {loading ? (
        <div className="loading">⏳ Đang tải danh sách xe...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <table className="vehicle-table">
          <thead>
            <tr>
              <th>Tên xe</th>
              <th>Biển số</th>
              <th>Hãng</th>
              <th>Màu</th>
              <th>Số ghế</th>
              <th>Pin</th>
              <th>Phạm vi</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-state">
                  📭 Không có xe nào phù hợp
                </td>
              </tr>
            ) : (
              filteredVehicles.map((v, i) => {
                const st = getStatusInfo(v.status);
                const rowKey = v.id ?? v.vehicleId ?? v.plateNumber ?? `row-${i}`;
                return (
                  <tr key={rowKey}>
                    <td>
                      <strong>{v.vehicleName}</strong>
                    </td>
                    <td>
                      <span className="plate">{v.plateNumber}</span>
                    </td>
                    <td>{v.brand}</td>
                    <td>{v.color}</td>
                    <td style={{ textAlign: "center" }}>
                      {v.seatCount || v.seat_count}
                    </td>
                    <td style={{ fontWeight: 500 }}>
                      {v.batteryStatus ? `${v.batteryStatus}` : "N/A"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {v.rangeKm || v.range_km
                        ? `${v.rangeKm || v.range_km} km`
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`status-badge ${st.class}`}>
                        {st.text}
                      </span>
                    </td>
                    <td>
                      <div className="action-dropdown" ref={menuRef}>
                        <button
                          className="dropdown-toggle"
                          onClick={() =>
                            setOpenDropdown((prev) =>
                              prev === rowKey ? null : rowKey
                            )
                          }
                          aria-haspopup="menu"
                          aria-expanded={openDropdown === rowKey}
                        >
                          ⋮
                        </button>
                        {openDropdown === rowKey && (
                          <div className="dropdown-menu" role="menu">
                            <button
                              className="dropdown-item btn-edit-item"
                              onClick={() => handleEdit(v)}
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              className="dropdown-item btn-history-item"
                              onClick={() => handleHistory(v)}
                            >
                              📋 Lịch sử
                            </button>
                            <button
                              className="dropdown-item btn-delete-item"
                              onClick={() => handleDelete(v)}
                            >
                              🗑️ Xóa
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TrangHienThiXeTheoTram;
