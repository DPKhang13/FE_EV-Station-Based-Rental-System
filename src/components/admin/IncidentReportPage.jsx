// Component quản lý báo cáo sự cố
// File này xử lý hiển thị danh sách sự cố và chi tiết từng sự cố
import React, { useEffect, useState } from "react";
import { incidentReportService } from "../../services/incidentReportService";
import { getVehicles } from "../../services/vehicleService";
import "./IncidentReportPage.css";

const IncidentReportPage = () => {
  // State quản lý danh sách sự cố từ API
  const [incidents, setIncidents] = useState([]);
  
  // State quản lý trạng thái loading (đang tải dữ liệu)
  const [loading, setLoading] = useState(true);
  
  // State lưu sự cố được chọn để hiển thị chi tiết
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // State điều khiển việc hiển thị modal chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State quản lý bộ lọc (hiện tại chỉ có search)
  const [filters, setFilters] = useState({
    search: ""
  });
  
  // Map data structure: Dùng để cache danh sách vehicles
  // Map có ưu điểm: O(1) lookup time, tốt hơn array.find() là O(n)
  // Key: vehicleId (number), Value: vehicle object
  // Mục đích: Tránh gọi API nhiều lần cho cùng một vehicle
  const [vehiclesMap, setVehiclesMap] = useState(new Map());

  // useEffect: Chạy khi component mount (lần đầu render)
  // Dependency array [] rỗng = chỉ chạy 1 lần
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Hàm fetch tất cả vehicles và cache vào Map
  // Tại sao cache? Vì mỗi incident có vehicleId, nếu không cache sẽ phải gọi API nhiều lần
  // Performance optimization: 1 lần gọi API thay vì N lần (N = số incidents)
  const fetchAllVehicles = async () => {
    try {
      // Gọi API service để lấy danh sách tất cả vehicles
      const vehicles = await getVehicles();
      
      // Tạo Map mới để lưu cache
      const map = new Map();
      
      // Duyệt qua mảng vehicles và thêm vào Map
      // forEach: Duyệt qua từng phần tử trong mảng
      vehicles.forEach(vehicle => {
        // Lấy ID của vehicle (có thể có nhiều tên field khác nhau từ API)
        // Fallback chain: Thử vehicleId trước, không có thì id, không có thì vehicle_id
        const id = vehicle.vehicleId || vehicle.id || vehicle.vehicle_id;
        
        // Chỉ thêm vào Map nếu có ID hợp lệ
        if (id) {
          // Number(id): Convert sang number để đảm bảo type consistency
          // map.set(key, value): Thêm key-value pair vào Map
          map.set(Number(id), vehicle);
        }
      });
      
      // Cập nhật state vehiclesMap với Map đã tạo
      setVehiclesMap(map);
      console.log("Cached vehicles:", map.size, "xe");
      
      // Trả về Map để có thể dùng ngay trong fetchIncidents
      return map;
    } catch (error) {
      // Nếu lỗi thì log warning và trả về Map rỗng
      console.warn("Không thể lấy danh sách vehicles:", error);
      return new Map();
    }
  };

  // Hàm fetch danh sách incidents từ API
  const fetchIncidents = async () => {
    try {
      // Bắt đầu loading state
      setLoading(true);
      
      // Fetch và cache vehicles trước khi fetch incidents
      // Tại sao? Để có sẵn vehicle data khi map incidents
      const vehiclesCache = await fetchAllVehicles();
      
      // Gọi API service để lấy danh sách incidents
      const data = await incidentReportService.getAll();
      console.log("Raw data from API:", data);
      
      // Xử lý response: API có thể trả về array trực tiếp hoặc object có property data
      // Array.isArray(): Kiểm tra xem có phải array không
      // Optional chaining ?.: Nếu data không tồn tại thì không lỗi, trả về undefined
      // Nullish coalescing ??: Nếu bên trái null/undefined thì dùng giá trị bên phải
      const incidentsList = Array.isArray(data) ? data : (data?.data || []);
      console.log("Processed incidents list:", incidentsList);
      
      // Map dữ liệu: Transform mỗi incident từ API thành format chuẩn cho UI
      // Array.map(): Tạo mảng mới với mỗi phần tử được transform
      const mappedIncidents = incidentsList.map((incident) => {
        // Lấy vehicleId từ incident
        const vehicleId = incident.vehicleId;
        let vehicleInfo = null;
        
        // Tìm vehicle info từ nhiều nguồn:
        // 1. Nếu API trả về vehicle object kèm theo incident (nested object)
        if (incident.vehicle && typeof incident.vehicle === 'object') {
          vehicleInfo = incident.vehicle;
        } 
        // 2. Nếu không có, tìm trong cache Map bằng vehicleId
        // Map.has(key): Kiểm tra key có tồn tại không
        else if (vehicleId && vehiclesCache.has(Number(vehicleId))) {
          // Map.get(key): Lấy value từ Map
          vehicleInfo = vehiclesCache.get(Number(vehicleId));
        }
        
        // Lấy tên người báo cáo với nhiều fallback options
        // Fallback chain: Thử nhiều field name khác nhau vì API có thể dùng tên khác
        const reporterName = incident.fullName || incident.reportedBy || incident.reportedByName || incident.reporterName || incident.reporter || "N/A";
        
        // Lấy thông tin trạm từ nhiều nguồn với fallback chain
        // Optional chaining ?.: Truy cập property an toàn, không lỗi nếu null/undefined
        // Ví dụ: vehicleInfo?.stationName sẽ trả về undefined nếu vehicleInfo là null
        const stationName = vehicleInfo?.stationName || 
                          vehicleInfo?.rentalStation?.name || 
                          vehicleInfo?.station?.name ||
                          incident.station?.name || 
                          incident.stationName || 
                          null;
        
        // Tương tự cho stationId
        const stationId = vehicleInfo?.stationId || 
                         vehicleInfo?.rentalStation?.stationId ||
                         vehicleInfo?.station?.stationId ||
                         incident.station?.stationId ||
                         incident.stationId ||
                         null;
        
        // Tạo station object từ nhiều nguồn
        // Ternary operator: condition ? trueValue : falseValue
        const station = incident.station || 
                       (stationName ? { name: stationName, stationId: stationId } : {}) ||
                       (vehicleInfo?.rentalStation ? vehicleInfo.rentalStation : {}) ||
                       (vehicleInfo?.station ? vehicleInfo.station : {}) ||
                       {};
        
        // Return object mới với tất cả thông tin đã được normalize
        // Spread operator ...: Copy tất cả properties từ object cũ
        return {
          // Copy tất cả properties từ incident gốc
          ...incident,
          
          // Normalize incidentId: Thử nhiều field name khác nhau
          incidentId: incident.incidentId || incident.id || incident.incidentReportId,
          id: incident.incidentId || incident.id || incident.incidentReportId,
          vehicleId: vehicleId,
          
          // Tạo vehicle object với thông tin đầy đủ
          // Nếu có vehicleInfo thì map các field, không thì tạo object rỗng
          vehicle: vehicleInfo ? {
            // Normalize field names: Hỗ trợ cả camelCase và snake_case
            vehicleName: vehicleInfo.vehicleName || vehicleInfo.name || vehicleInfo.vehicle_name,
            plateNumber: vehicleInfo.plateNumber || vehicleInfo.plate_number,
            carmodel: vehicleInfo.carmodel || vehicleInfo.carModel || vehicleInfo.car_model,
            brand: vehicleInfo.brand,
            vehicleId: vehicleInfo.vehicleId || vehicleInfo.vehicle_id || vehicleId,
            stationId: stationId,
            stationName: stationName
          } : {
            // Fallback: Object rỗng nếu không tìm thấy vehicle
            vehicleId: vehicleId,
            vehicleName: null,
            plateNumber: null,
            carmodel: null,
            brand: null
          },
          
          // Flatten vehicle fields: Thêm trực tiếp vào incident để dễ truy cập
          vehicleName: vehicleInfo?.vehicleName || vehicleInfo?.name || vehicleInfo?.vehicle_name || null,
          plateNumber: vehicleInfo?.plateNumber || vehicleInfo?.plate_number || null,
          carmodel: vehicleInfo?.carmodel || vehicleInfo?.carModel || vehicleInfo?.car_model || null,
          
          // Severity: API không trả về, mặc định là MEDIUM
          severity: incident.severity || incident.severityLevel || "MEDIUM",
          
          // Description: Thử nhiều field name
          description: incident.description || incident.incidentDescription || "",
          
          // Date fields: Normalize tên field và format
          occurredOn: incident.occurredOn || incident.occurredOnDate || incident.occurredAt || incident.createdAt,
          occurredOnDate: incident.occurredOn || incident.occurredOnDate || incident.occurredAt || incident.createdAt,
          
          // Reporter info: Đã lấy ở trên
          reportedBy: reporterName,
          reportedByName: reporterName,
          fullName: reporterName,
          
          // Timestamps
          reportedAt: incident.reportedAt || incident.createdAt,
          createdAt: incident.createdAt || incident.reportedAt,
          
          // Station info
          station: station,
          stationName: stationName,
          stationId: stationId,
          
          // Resolution notes: Ghi chú xử lý sự cố
          resolutionNotes: incident.resolutionNotes || incident.notes || incident.resolution || ""
        };
      });
      
      console.log("Mapped incidents:", mappedIncidents);
      
      // Cập nhật state với dữ liệu đã được map
      setIncidents(mappedIncidents);
    } catch (error) {
      // Xử lý lỗi: Log chi tiết và set incidents thành mảng rỗng
      console.error("Lỗi tải danh sách sự cố:", error);
      console.error("Error details:", error.response?.data || error.message);
      setIncidents([]);
    } finally {
      // finally: Luôn chạy dù có lỗi hay không
      // Tắt loading indicator
      setLoading(false);
    }
  };

  // Helper function: Format date string thành format Việt Nam
  // Input: "2025-11-26T21:16:54" hoặc ISO string
  // Output: "21:16:54 26/11/2025"
  const formatDate = (dateString) => {
    // Early return: Nếu không có dateString thì trả về "N/A"
    if (!dateString) return "N/A";
    
    try {
      // Tạo Date object từ string
      const date = new Date(dateString);
      
      // Format: "HH:mm:ss DD/MM/YYYY"
      // getHours(): Lấy giờ (0-23)
      // String(): Convert sang string
      // padStart(2, '0'): Thêm số 0 phía trước nếu < 10 (ví dụ: 9 -> "09")
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      
      // getDate(): Lấy ngày (1-31)
      const day = String(date.getDate()).padStart(2, '0');
      
      // getMonth(): Lấy tháng (0-11), cần +1 để có tháng đúng (1-12)
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // getFullYear(): Lấy năm đầy đủ (ví dụ: 2025)
      const year = date.getFullYear();
      
      // Template literal: Tạo chuỗi với format mong muốn
      return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    } catch {
      // Nếu parse date lỗi thì trả về nguyên string gốc
      return dateString;
    }
  };

  // Helper function: Chuyển severity code sang text tiếng Việt
  // Input: "MEDIUM" hoặc "medium"
  // Output: "Trung bình"
  const getSeverityLabel = (severity) => {
    // Object map: Key-value pairs để map code -> text
    const map = {
      LOW: "Thấp",
      MEDIUM: "Trung bình",
      HIGH: "Cao",
      CRITICAL: "Nghiêm trọng"
    };
    
    // severity?.toUpperCase(): Optional chaining + uppercase
    // map[...]: Lấy value từ map object
    // || severity || "N/A": Fallback chain
    return map[severity?.toUpperCase()] || severity || "N/A";
  };

  // Helper function: Trả về CSS class cho severity badge
  // Dùng để style badge với màu sắc khác nhau theo mức độ
  const getSeverityClass = (severity) => {
    // Normalize: Convert sang uppercase và xử lý null/undefined
    const s = (severity || "").toUpperCase();
    
    // If-else chain: Kiểm tra từng case và trả về class tương ứng
    if (s === "CRITICAL") return "severity-critical"; // Màu đỏ
    if (s === "HIGH") return "severity-high";         // Màu cam
    if (s === "MEDIUM") return "severity-medium";     // Màu vàng
    return "severity-low";                             // Màu xanh lá
  };

  // Hàm xử lý khi user click "Chi tiết" để xem thông tin đầy đủ của một incident
  // async: Hàm này có thể gọi API nên cần async/await
  const handleViewDetail = async (incident) => {
    try {
      // Strategy: Ưu tiên dùng dữ liệu từ danh sách vì đã được map đầy đủ
      // Chỉ gọi API getById nếu cần thông tin bổ sung (như resolutionNotes)
      
      // Spread operator: Copy tất cả properties từ incident
      // Tại sao copy? Để không mutate state gốc (immutability principle)
      let detailData = { ...incident };
      
      // Lấy incidentId để gọi API chi tiết
      const incidentId = incident.incidentId || incident.id;
      
      // Chỉ gọi API nếu có ID
      if (incidentId) {
        try {
          // Gọi API service để lấy thông tin chi tiết đầy đủ
          // Có thể có thêm resolutionNotes mà không có trong danh sách
          const apiResponse = await incidentReportService.getById(incidentId);
          
          // Xử lý response: Có thể là { data: {...} } hoặc object trực tiếp
          const rawData = apiResponse?.data || apiResponse;
          
          // Kiểm tra vehiclesMap cache
          // Nếu cache trống thì fetch lại để đảm bảo có vehicle data
          let currentVehiclesMap = vehiclesMap;
          if (currentVehiclesMap.size === 0) {
            currentVehiclesMap = await fetchAllVehicles();
          }
          
          // Map lại dữ liệu giống như trong fetchIncidents
          // Để đảm bảo format nhất quán
          const vehicleId = rawData.vehicleId || incident.vehicleId;
          let vehicleInfo = null;
          
          // Tìm vehicle info từ nhiều nguồn (giống logic trong fetchIncidents)
          // 1. Nếu API trả về vehicle object kèm theo
          if (rawData.vehicle && typeof rawData.vehicle === 'object') {
            vehicleInfo = rawData.vehicle;
          } 
          // 2. Tìm trong cache Map
          else if (vehicleId && currentVehiclesMap.has(Number(vehicleId))) {
            vehicleInfo = currentVehiclesMap.get(Number(vehicleId));
          } 
          // 3. Fallback: Dùng vehicle từ incident (đã được map từ danh sách)
          else if (incident.vehicle) {
            vehicleInfo = incident.vehicle;
          }
          
          // Lấy tên người báo cáo từ fullName
          const reporterName = rawData.fullName || rawData.reportedBy || rawData.reportedByName || rawData.reporterName || rawData.reporter || incident.fullName || incident.reportedBy || "N/A";
          
          // Lấy thông tin trạm từ vehicle hoặc từ incident hoặc từ rawData
          const stationName = vehicleInfo?.stationName || 
                              vehicleInfo?.rentalStation?.name || 
                              vehicleInfo?.station?.name ||
                              rawData.station?.name ||
                              rawData.stationName ||
                              incident.stationName ||
                              incident.station?.name ||
                              null;
          
          const stationId = vehicleInfo?.stationId || 
                           vehicleInfo?.rentalStation?.stationId ||
                           vehicleInfo?.station?.stationId ||
                           rawData.station?.stationId ||
                           rawData.stationId ||
                           incident.stationId ||
                           incident.station?.stationId ||
                           null;
          
          const station = rawData.station || 
                         incident.station ||
                         (stationName ? { name: stationName, stationId: stationId } : {}) ||
                         (vehicleInfo?.rentalStation ? vehicleInfo.rentalStation : {}) ||
                         (vehicleInfo?.station ? vehicleInfo.station : {}) ||
                         {};
          
          // Merge dữ liệu: ưu tiên dữ liệu từ danh sách, chỉ override nếu API có thông tin mới
          detailData = {
            ...incident, // Giữ nguyên dữ liệu đã map từ danh sách
            ...rawData,  // Override với dữ liệu từ API nếu có
            incidentId: rawData.incidentId || rawData.id || rawData.incidentReportId || incidentId,
            id: rawData.incidentId || rawData.id || rawData.incidentReportId || incidentId,
            vehicleId: vehicleId || incident.vehicleId,
            vehicle: vehicleInfo ? {
              vehicleName: vehicleInfo.vehicleName || vehicleInfo.name || vehicleInfo.vehicle_name,
              plateNumber: vehicleInfo.plateNumber || vehicleInfo.plate_number,
              carmodel: vehicleInfo.carmodel || vehicleInfo.carModel || vehicleInfo.car_model,
              brand: vehicleInfo.brand,
              vehicleId: vehicleInfo.vehicleId || vehicleInfo.vehicle_id || vehicleId,
              stationId: stationId,
              stationName: stationName
            } : incident.vehicle || {
              vehicleId: vehicleId || incident.vehicleId,
              vehicleName: null,
              plateNumber: null,
              carmodel: null,
              brand: null
            },
            vehicleName: vehicleInfo?.vehicleName || vehicleInfo?.name || vehicleInfo?.vehicle_name || incident.vehicleName || null,
            plateNumber: vehicleInfo?.plateNumber || vehicleInfo?.plate_number || incident.plateNumber || null,
            carmodel: vehicleInfo?.carmodel || vehicleInfo?.carModel || vehicleInfo?.car_model || incident.carmodel || null,
            severity: rawData.severity || rawData.severityLevel || incident.severity || "MEDIUM",
            description: rawData.description || rawData.incidentDescription || incident.description || "",
            occurredOn: rawData.occurredOn || rawData.occurredOnDate || rawData.occurredAt || rawData.createdAt || incident.occurredOn || incident.occurredOnDate || incident.createdAt,
            occurredOnDate: rawData.occurredOn || rawData.occurredOnDate || rawData.occurredAt || rawData.createdAt || incident.occurredOnDate || incident.createdAt,
            reportedBy: reporterName,
            reportedByName: reporterName,
            fullName: reporterName,
            reportedAt: rawData.reportedAt || rawData.createdAt || incident.reportedAt || incident.createdAt,
            createdAt: rawData.createdAt || rawData.reportedAt || incident.createdAt,
            station: station,
            stationName: stationName,
            stationId: stationId,
            resolutionNotes: rawData.resolutionNotes || rawData.notes || rawData.resolution || incident.resolutionNotes || ""
          };
        } catch (apiError) {
          console.warn("⚠️ Không thể lấy chi tiết từ API, dùng dữ liệu từ danh sách:", apiError);
          // Nếu lỗi API, dùng dữ liệu từ danh sách (đã được map đầy đủ)
          detailData = incident;
        }
      }
      
      console.log("📋 Detail data for modal:", detailData);
      setSelectedIncident(detailData);
      setShowDetailModal(true);
    } catch (error) {
      console.error("❌ Lỗi tải chi tiết sự cố:", error);
      // Nếu lỗi, vẫn hiển thị dữ liệu từ danh sách
      setSelectedIncident(incident);
      setShowDetailModal(true);
    }
  };

  // Hàm filter: Lọc danh sách incidents dựa trên search query
  // Array.filter(): Tạo mảng mới chỉ chứa các phần tử thỏa mãn điều kiện
  const filteredIncidents = incidents.filter((incident) => {
    // Nếu có search query thì thực hiện tìm kiếm
    if (filters.search) {
      // Chuyển search query về chữ thường để tìm kiếm không phân biệt hoa thường
      const searchLower = filters.search.toLowerCase();
      
      // Tìm kiếm trong nhiều field:
      // 1. Biển số xe (plateNumber)
      // 2. Tên xe (vehicleName)
      // 3. Mô tả sự cố (description)
      // includes(): Kiểm tra chuỗi có chứa substring không
      // Toán tử ||: Nếu field null/undefined thì dùng chuỗi rỗng ""
      return (
        (incident.vehicle?.plateNumber || "").toLowerCase().includes(searchLower) ||
        (incident.vehicle?.vehicleName || "").toLowerCase().includes(searchLower) ||
        (incident.description || "").toLowerCase().includes(searchLower)
      );
    }
    
    // Nếu không có search query thì trả về tất cả
    return true;
  });

  if (loading) {
    return <div className="incident-loading">Đang tải danh sách sự cố...</div>;
  }

  return (
    <div className="incident-page">
      <div className="incident-header">
        <h1 className="incident-title">BÁO CÁO SỰ CỐ</h1>
      </div>

      {/* Bộ lọc và thống kê */}
      <div className="incident-filters">
        <div className="filter-group stat-box-inline">
          <label className="stat-label">Tổng sự cố</label>
          <span className="stat-value">{incidents.length}</span>
        </div>

        <div className="filter-group filter-search">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Biển số, tên xe, mô tả..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
      </div>

      {/* Bảng danh sách sự cố */}
      <div className="incident-table-container">
        {filteredIncidents.length === 0 ? (
          <div className="incident-empty">
            <p>Không có sự cố nào</p>
          </div>
        ) : (
          <table className="incident-table">
            <thead>
              <tr>
                <th>Mã sự cố</th>
                <th>Xe</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Mô tả</th>
                <th>Thời gian xảy ra</th>
                <th>Người báo cáo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => (
                <tr key={incident.incidentId || incident.id}>
                  <td>#{incident.incidentId || incident.id}</td>
                  <td>{incident.vehicle?.vehicleName || incident.vehicleName || "N/A"}</td>
                  <td>{incident.vehicle?.plateNumber || incident.plateNumber || "N/A"}</td>
                  <td>{incident.vehicle?.carmodel || incident.vehicle?.carModel || "N/A"}</td>
                  <td className="description-cell">
                    {(incident.description || "").substring(0, 50)}
                    {(incident.description || "").length > 50 ? "..." : ""}
                  </td>
                  <td>{formatDate(incident.occurredOn || incident.occurredOnDate)}</td>
                  <td>{incident.fullName || incident.reportedBy || incident.reportedByName || "N/A"}</td>
                  <td>
                    <button
                      className="btn-view-detail"
                      onClick={() => handleViewDetail(incident)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal chi tiết sự cố */}
      {showDetailModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content incident-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Chi tiết sự cố #{selectedIncident.incidentId || selectedIncident.id}</h2>
              <button className="modal-close-btn" onClick={() => setShowDetailModal(false)}>×</button>
            </div>

            <div className="incident-detail-content">
              <div className="detail-section">
                <h3>Thông tin xe</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tên xe:</label>
                    <span>{selectedIncident.vehicle?.vehicleName || selectedIncident.vehicleName || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Biển số:</label>
                    <span>{selectedIncident.vehicle?.plateNumber || selectedIncident.plateNumber || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Loại xe:</label>
                    <span>{selectedIncident.vehicle?.carmodel || selectedIncident.vehicle?.carModel || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Hãng:</label>
                    <span>{selectedIncident.vehicle?.brand || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạm:</label>
                    <span>{selectedIncident.station?.name || selectedIncident.stationName || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Thông tin sự cố</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Mức độ:</label>
                    <span className={`severity-badge ${getSeverityClass(selectedIncident.severity)}`}>
                      {getSeverityLabel(selectedIncident.severity)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian xảy ra:</label>
                    <span>{formatDate(selectedIncident.occurredOn || selectedIncident.occurredOnDate)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Thời gian báo cáo:</label>
                    <span>{formatDate(selectedIncident.reportedAt || selectedIncident.createdAt)}</span>
                  </div>
                  <div className="detail-item">
                    <label>Người báo cáo:</label>
                    <span>
                      {selectedIncident.fullName || selectedIncident.reportedBy || selectedIncident.reportedByName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Mô tả sự cố</h3>
                <div className="description-box">
                  {selectedIncident.description || "Không có mô tả"}
                </div>
              </div>

              {(selectedIncident.resolutionNotes || selectedIncident.notes) && (
                <div className="detail-section">
                  <h3>Ghi chú xử lý</h3>
                  <div className="description-box">
                    {selectedIncident.resolutionNotes || selectedIncident.notes}
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentReportPage;

