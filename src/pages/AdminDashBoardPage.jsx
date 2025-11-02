import React from 'react'
import './AdminDashBoardPage.css'

const AdminDashBoardPage = () => {
  const summary = {
    revenue: '227.600.000 đ',
    totalCars: 160,
    usageRate: '79%',
    activeCars: 127,
  }

  const branches = [
  { 
    name: 'Quận 1',
    today: '2.500.000 đ', growthDay: '+2.3%', 
    week: '16.800.000 đ', growthWeek: '+4.5%', 
    month: '68.500.000 đ', growthMonth: '+12.5%', 
    status: 'up' 
  },
  { 
    name: 'Quận 3',
    today: '1.800.000 đ', growthDay: '+1.2%', 
    week: '12.200.000 đ', growthWeek: '+3.0%', 
    month: '52.300.000 đ', growthMonth: '+8.3%', 
    status: 'up' 
  },
  { 
    name: 'Quận 7',
    today: '2.200.000 đ', growthDay: '+2.8%', 
    week: '14.500.000 đ', growthWeek: '+5.7%', 
    month: '61.200.000 đ', growthMonth: '+15.7%', 
    status: 'up' 
  },
  { 
    name: 'Quận 5',
    today: '1.600.000 đ', growthDay: '-0.5%', 
    week: '10.800.000 đ', growthWeek: '-1.2%', 
    month: '45.600.000 đ', growthMonth: '-2.1%', 
    status: 'down' 
  },
]


  const usage = [
    { name: 'Quận 1', used: 42, total: 50, rate: 84 },
    { name: 'Quận 3', used: 28, total: 35, rate: 80 },
    { name: 'Quận 7', used: 36, total: 45, rate: 80 },
    { name: 'Quận 5', used: 21, total: 30, rate: 70 },
  ]

  const trends = [
    { type: 'Thuê theo giờ', percent: 65, color: 'blue' },
    { type: 'Thuê theo ngày', percent: 25, color: 'green' },
    { type: 'Thuê dài hạn', percent: 10, color: 'purple' },
  ]

  const peakTimes = [
    { branch: 'Quận 1', times: ['7:00 - 9:00', '12:00 - 13:00', '17:00 - 19:00'], efficiency: '84%' },
    { branch: 'Quận 3', times: ['8:00 - 10:00', '18:00 - 20:00'], efficiency: '80%' },
    { branch: 'Quận 7', times: ['7:30 - 9:30', '11:30 - 13:30', '17:30 - 19:30'], efficiency: '79%' },
    { branch: 'Quận 5', times: ['8:00 - 9:00', '17:00 - 18:00'], efficiency: '70%' },
  ]

  return (
    <div className="dashboard-container">
      <h1>Báo cáo & Phân tích</h1>
      <p className="subtitle">Theo dõi hiệu suất kinh doanh và sử dụng xe</p>

      {/* Tổng quan */}
      <div className="summary">
        <div className="card blue">
          <h2>Tổng doanh thu</h2>
          <p className="value">{summary.revenue}</p>
          <span>Theo tháng</span>
        </div>
        <div className="card green">
          <h2>Tổng số xe</h2>
          <p className="value">{summary.totalCars}</p>
          <span>Trên toàn hệ thống</span>
        </div>
        <div className="card purple">
          <h2>Tỷ lệ sử dụng TB</h2>
          <p className="value">{summary.usageRate}</p>
          <span>Hiệu suất hoạt động</span>
        </div>
        <div className="card orange">
          <h2>Xe đang thuê</h2>
          <p className="value">{summary.activeCars}</p>
          <span>Đang hoạt động</span>
        </div>
      </div>

      {/* Phân tích doanh thu */}
      <div className="section">
  <h2>Phân tích doanh thu</h2>
  <table>
    <thead>
      <tr>
        <th>Điểm thuê</th>
        <th>Hôm nay</th>
        <th>Tăng trưởng ngày</th>
        <th>Tuần này</th>
        <th>Tăng trưởng tuần</th>
        <th>Tháng này</th>
        <th>Tăng trưởng tháng</th>
      </tr>
    </thead>
    <tbody>
  {branches.map((b, i) => (
    <tr key={i}>
      <td>{b.name}</td>
      <td>{b.today}</td>
      <td className={parseFloat(b.growthDay.trim()) >= 0 ? 'up' : 'down'}>
        {b.growthDay}
      </td>
      <td>{b.week}</td>
      <td className={parseFloat(b.growthWeek.trim()) >= 0 ? 'up' : 'down'}>
        {b.growthWeek}
      </td>
      <td>{b.month}</td>
      <td className={parseFloat(b.growthMonth.trim()) >= 0 ? 'up' : 'down'}>
        {b.growthMonth}
      </td>
    </tr>
  ))}
</tbody>

  </table>
</div>


      {/* Tỷ lệ sử dụng và xu hướng */}
      <div className="usage-trend">
        <div className="usage">
          <h2>Tỷ lệ sử dụng xe</h2>
          {usage.map((u, i) => (
            <div key={i} className="usage-item">
              <p>{u.name} ({u.used}/{u.total} xe)</p>
              <div className="bar">
                <div className={`fill ${u.rate >= 80 ? 'high' : 'medium'}`} style={{ width: `${u.rate}%` }}></div>
              </div>
              <span>{u.rate}%</span>
            </div>
          ))}
        </div>

        <div className="trends">
          <h2>Xu hướng thuê xe</h2>
          <div className="trend-cards">
            {trends.map((t, i) => (
              <div key={i} className={`trend ${t.color}`}>
                <p className="percent">{t.percent}%</p>
                <p>{t.type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⏰ Giờ cao điểm */}
      <div className="peak-time">
        <h2>Phân tích giờ cao điểm</h2>
        <div className="peak-time-container">
          {peakTimes.map((p, i) => (
            <div key={i} className="peak-time-branch">
              <h3>{p.branch}</h3>
              <div className="peak-times">
                {p.times.map((t, idx) => (
                  <span key={idx} className="time-slot">{t}</span>
                ))}
              </div>
              <p className="peak-usage">Hiệu suất trung bình: {p.efficiency}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashBoardPage
