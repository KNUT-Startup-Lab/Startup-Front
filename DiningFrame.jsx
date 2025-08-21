// src/components/DiningFrame.jsx
import React from 'react';
import './DiningFrame.css';

const DiningFrame = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const breakfastMenu = [
    'Scrambled Eggs & Toast',
    'Greek Yogurt with Berries',
    'Fresh Orange Juice',
  ];

  const lunchMenu = [
    'Grilled Chicken Breast',
    'Quinoa Salad',
    'Steamed Vegetables',
    'Iced Tea',
  ];

  const dinnerMenu = [
    'Beef Stir Fry',
    'Jasmine Rice',
    'Mixed Green Salad',
    'Chocolate Pudding',
  ];

  return (
    <div id="dining-frame" className="dining-frame">
      {/* Header */}
      <header className="dining-header">
        <div className="header-content">
          <h1 className="header-title">Dining Menu</h1>
          <div className="header-actions">
            <button className="action-btn info-btn">
              <i className="icon">ℹ️</i>
            </button>
            <button className="action-btn notification-btn">
              <i className="icon">🔔</i>
            </button>
            <div className="notification-badge">
              <span>3</span>
            </div>
          </div>
        </div>
      </header>

      {/* Date Section */}
      <section className="date-section">
        <div className="date-content">
          <span className="date-label">Today</span>
          <span className="current-date">{formattedDate}</span>
          <button className="change-btn">Change</button>
        </div>
      </section>

      {/* Main Content */}
      <main className="dining-main">
        {/* Dining Hall Status */}
        <div className="status-card">
          <div className="status-header">
            <h2 className="status-title">Dining Hall Status</h2>
            <div className="status-indicator">
              <div className="indicator-dot"></div>
            </div>
          </div>
          <div className="status-content">
            <div className="crowd-status">
              <div className="status-info">
                <div className="status-dot green"></div>
                <span className="status-text">Low crowd</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill green" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div className="waiting-time">
              <span className="waiting-label">Estimated waiting</span>
              <span className="waiting-value">5 min</span>
            </div>
          </div>
        </div>

        {/* Breakfast Menu */}
        <div className="meal-card">
          <div className="meal-header">
            <div className="meal-icon">
              <div className="icon-dot blue"></div>
            </div>
            <h3 className="meal-title">Breakfast</h3>
            <span className="meal-time">7:00 - 10:00 AM</span>
          </div>
          <div className="meal-menu">
            {breakfastMenu.map((item, index) => (
              <div key={index} className="menu-item">
                <div className="item-dot blue"></div>
                <span className="item-name">{item}</span>
              </div>
            ))}
          </div>
          <div className="nutrition-info">
            <div className="nutrition-row">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">420 kcal</span>
            </div>
            <div className="nutrition-row">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">18g</span>
            </div>
          </div>
        </div>

        {/* Lunch Menu */}
        <div className="meal-card">
          <div className="meal-header">
            <div className="meal-icon">
              <div className="icon-dot blue"></div>
            </div>
            <h3 className="meal-title">Lunch</h3>
            <span className="meal-time">11:30 AM - 2:30 PM</span>
          </div>
          <div className="meal-menu">
            {lunchMenu.map((item, index) => (
              <div key={index} className="menu-item">
                <div className="item-dot blue"></div>
                <span className="item-name">{item}</span>
              </div>
            ))}
          </div>
          <div className="nutrition-info">
            <div className="nutrition-row">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">650 kcal</span>
            </div>
            <div className="nutrition-row">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">35g</span>
            </div>
          </div>
        </div>

        {/* Dinner Menu */}
        <div className="meal-card">
          <div className="meal-header">
            <div className="meal-icon">
              <div className="icon-dot blue"></div>
            </div>
            <h3 className="meal-title">Dinner</h3>
            <span className="meal-time">5:00 - 8:00 PM</span>
          </div>
          <div className="meal-menu">
            {dinnerMenu.map((item, index) => (
              <div key={index} className="menu-item">
                <div className="item-dot blue"></div>
                <span className="item-name">{item}</span>
              </div>
            ))}
          </div>
          <div className="nutrition-info">
            <div className="nutrition-row">
              <span className="nutrition-label">Calories</span>
              <span className="nutrition-value">780 kcal</span>
            </div>
            <div className="nutrition-row">
              <span className="nutrition-label">Protein</span>
              <span className="nutrition-value">28g</span>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="nav-content">
          <button className="nav-btn">
            <div className="nav-icon">🏠</div>
            <span className="nav-label">Home</span>
          </button>
          <button className="nav-btn active">
            <div className="nav-icon">📅</div>
            <span className="nav-label">Reservation</span>
          </button>
          <button className="nav-btn">
            <div className="nav-icon">👥</div>
            <span className="nav-label">Community</span>
          </button>
          <button className="nav-btn">
            <div className="nav-icon">👤</div>
            <span className="nav-label">My Page</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DiningFrame;
