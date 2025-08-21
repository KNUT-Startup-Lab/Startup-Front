// src/components/RefrigeratorFrame.jsx
import React, { useState } from 'react';
import './RefrigeratorFrame.css';

const RefrigeratorFrame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({
    name: '',
    room: '',
    storedDate: '',
    expiryDate: '',
  });

  const [foodItems, setFoodItems] = useState([
    {
      name: 'Yogurt',
      room: 'Room 204B • Sarah',
      storedDate: 'Jan 15',
      expiryDate: 'Jan 20',
      status: 'expired',
      statusText: 'Expired',
      statusColor: '#ef4444',
      backgroundColor: '#fef2f2',
      borderColor: '#fecaca',
    },
    {
      name: 'Milk',
      room: 'Room 201A • Mike',
      storedDate: 'Jan 18',
      expiryDate: 'Jan 25',
      status: 'warning',
      statusText: '2 days',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f59e0b',
    },
    {
      name: 'Sandwich',
      room: 'Room 203C • Alex',
      storedDate: 'Jan 22',
      expiryDate: 'Jan 30',
      status: 'fresh',
      statusText: 'Fresh',
      statusColor: '#16a34a',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
    },
    {
      name: 'Leftover Pizza',
      room: 'Room 205A • Emma',
      storedDate: 'Jan 20',
      expiryDate: 'Jan 24',
      status: 'warning',
      statusText: '1 day',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f59e0b',
    },
    {
      name: 'Apple Juice',
      room: 'Room 202B • Lisa',
      storedDate: 'Jan 21',
      expiryDate: 'Feb 5',
      status: 'fresh',
      statusText: 'Fresh',
      statusColor: '#16a34a',
      backgroundColor: '#ffffff',
      borderColor: '#e5e7eb',
    },
    {
      name: 'Cheese',
      room: 'Room 204A • John',
      storedDate: 'Jan 19',
      expiryDate: 'Jan 26',
      status: 'warning',
      statusText: '3 days',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f59e0b',
    },
  ]);

  const getDaysUntilExpiry = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (days) => {
    if (days < 0) return 'expired';
    if (days <= 3) return 'warning';
    return 'fresh';
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'expired':
        return {
          statusText: 'Expired',
          statusColor: '#ef4444',
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
        };
      case 'warning':
        return {
          statusText: `${Math.abs(getDaysUntilExpiry(newFoodItem.expiryDate))} days`,
          statusColor: '#f59e0b',
          backgroundColor: '#ffffff',
          borderColor: '#f59e0b',
        };
      default:
        return {
          statusText: 'Fresh',
          statusColor: '#16a34a',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
        };
    }
  };

  const handleAddFood = () => {
    if (!newFoodItem.name || !newFoodItem.room || !newFoodItem.storedDate || !newFoodItem.expiryDate) {
      alert('모든 필드를 입력해주세요!');
      return;
    }

    const daysUntilExpiry = getDaysUntilExpiry(newFoodItem.expiryDate);
    const status = getExpiryStatus(daysUntilExpiry);
    const statusInfo = getStatusInfo(status);

    const newItem = {
      ...newFoodItem,
      status,
      ...statusInfo,
    };

    setFoodItems([newItem, ...foodItems]);
    setNewFoodItem({ name: '', room: '', storedDate: '', expiryDate: '' });
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setNewFoodItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
    };

  return (
    <div id="refrigerator-frame" className="refrigerator-frame">
      {/* Header */}
      <header className="refrigerator-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">❄️</div>
            <h1 className="header-title">Refrigerator</h1>
          </div>
          <div className="header-right">
            <div className="notification-icon">🔔</div>
            <div className="notification-badge">
              <span>
                {foodItems.filter((item) => item.status === 'expired' || item.status === 'warning').length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="refrigerator-main">
        {/* Alert Card */}
        <div className="alert-card">
          <div className="alert-content">
            <div className="alert-icon">
              <div className="icon-circle">ℹ️</div>
            </div>
            <div className="alert-text">
              <h3 className="alert-title">
                {foodItems.filter((item) => item.status === 'expired' || item.status === 'warning').length} items expiring this week
              </h3>
              <p className="alert-subtitle">Check items below</p>
            </div>
          </div>
        </div>

        {/* Food Items */}
        <div className="food-items">
          {foodItems.map((item, index) => (
            <div
              key={index}
              className="food-card"
              style={{
                backgroundColor: item.backgroundColor,
                borderColor: item.borderColor,
              }}
            >
              <div className="food-content">
                <div className="food-info">
                  <h3 className="food-name">{item.name}</h3>
                  <p className="food-room">{item.room}</p>
                  <div className="food-dates">
                    <span className="stored-date">Stored: {item.storedDate}</span>
                    <span
                      className="expiry-date"
                      style={{ color: item.status === 'expired' ? '#ef4444' : item.statusColor }}
                    >
                      {item.status === 'expired' ? 'Expired' : 'Expires'}: {item.expiryDate}
                    </span>
                  </div>
                </div>
                <div
                  className="status-badge"
                  style={{
                    backgroundColor:
                      item.status === 'expired'
                        ? '#fee2e2'
                        : item.status === 'warning'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : '#dcfce7',
                    borderColor:
                      item.status === 'expired'
                        ? '#e5e7eb'
                        : item.status === 'warning'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : '#e5e7eb',
                  }}
                >
                  <span className="status-text" style={{ color: item.statusColor }}>
                    {item.statusText}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Action Button */}
        <div className="fab-container">
          <button className="fab-button" onClick={() => setIsModalOpen(true)}>
            <div className="fab-icon">+</div>
          </button>
        </div>
      </main>

      {/* Add Food Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">새로운 식품 추가</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="foodName">식품명</label>
                <input
                  type="text"
                  id="foodName"
                  value={newFoodItem.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="예: 우유, 치즈, 요거트..."
                />
              </div>

              <div className="form-group">
                <label htmlFor="roomInfo">방 정보</label>
                <input
                  type="text"
                  id="roomInfo"
                  value={newFoodItem.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  placeholder="예: Room 201A • Mike"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="storedDate">보관 시작일</label>
                  <input
                    type="date"
                    id="storedDate"
                    value={newFoodItem.storedDate}
                    onChange={(e) => handleInputChange('storedDate', e.target.value)}
                    max={getCurrentDate()}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="expiryDate">만료일</label>
                  <input
                    type="date"
                    id="expiryDate"
                    value={newFoodItem.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    min={getCurrentDate()}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn-add" onClick={handleAddFood}>
                추가하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefrigeratorFrame;
