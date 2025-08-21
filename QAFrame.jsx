// src/components/QAFrame.jsx
import React, { useState } from 'react';
import './QAFrame.css';

const QAFrame = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    title: '',
    description: '',
  });

  const [qaItems, setQaItems] = useState([
    {
      id: 1,
      title: 'Air conditioner not working in room 204',
      description:
        'The AC unit has been making strange noises and not cooling properly for the past two days. Could someone please check...',
      status: 'pending',
      statusText: 'Pending',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: 'Submitted today',
    },
    {
      id: 2,
      title: 'WiFi connection issues',
      description:
        "Admin: We've reset the router on your floor. Please try reconnecting and let us know if the issue persists.",
      status: 'answered',
      statusText: 'Answered',
      statusColor: '#14b8a6',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: 'Updated 2 hours ago',
      adminResponse:
        "Admin: We've reset the router on your floor. Please try reconnecting and let us know if the issue persists.",
    },
    {
      id: 3,
      title: 'Laundry machine out of order',
      description:
        'Machine #3 on the 2nd floor is not starting. The display shows an error code...',
      status: 'pending',
      statusText: 'Pending',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: 'Yesterday',
    },
    {
      id: 4,
      title: 'Noise complaint from neighboring room',
      description:
        "Admin: Thank you for reporting this. We've spoken with the residents and the issue has been resolved.",
      status: 'answered',
      statusText: 'Answered',
      statusColor: '#14b8a6',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: '3 days ago',
      adminResponse:
        "Admin: Thank you for reporting this. We've spoken with the residents and the issue has been resolved.",
    },
    {
      id: 5,
      title: 'Request for additional storage',
      description:
        'Is it possible to get an additional wardrobe or storage unit for room 156? The current space is insufficient...',
      status: 'pending',
      statusText: 'Pending',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: '1 week ago',
    },
  ]);

  const handleAddQuestion = () => {
    if (!newQuestion.title || !newQuestion.description) {
      alert('제목과 내용을 모두 입력해주세요!');
      return;
    }

    const newItem = {
      id: qaItems.length + 1,
      title: newQuestion.title,
      description: newQuestion.description,
      status: 'pending',
      statusText: 'Pending',
      statusColor: '#f59e0b',
      backgroundColor: '#ffffff',
      borderColor: '#f3f4f6',
      submittedDate: 'Submitted today',
    };

    setQaItems([newItem, ...qaItems]);
    setNewQuestion({ title: '', description: '' });
    setIsModalOpen(false);
  };

  const handleInputChange = (field, value) => {
    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pendingCount = qaItems.filter((item) => item.status === 'pending').length;

  return (
    <div id="qa-frame" className="qa-frame">
      {/* Header */}
      <header className="qa-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">❓</div>
            <h1 className="header-title">Q&A</h1>
          </div>
          <div className="header-right">
            <div className="notification-badge">
              <span>{pendingCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="qa-main">
        {/* Q&A Items */}
        <div className="qa-items">
          {qaItems.map((item) => (
            <div
              key={item.id}
              className="qa-card"
              style={{
                backgroundColor: item.backgroundColor,
                borderColor: item.borderColor,
              }}
            >
              <div className="qa-content">
                <div className="qa-header-row">
                  <h3 className="qa-title">{item.title}</h3>
                  <div
                    className="status-badge"
                    style={{
                      backgroundColor: item.status === 'pending' ? '#f59e0b' : '#14b8a6',
                      borderColor: item.status === 'pending' ? '#f59e0b' : '#14b8a6',
                    }}
                  >
                    <span className="status-text">{item.statusText}</span>
                  </div>
                </div>

                <div className="qa-description">
                  {item.adminResponse ? (
                    <p className="admin-response">{item.adminResponse}</p>
                  ) : (
                    <p className="question-text">{item.description}</p>
                  )}
                </div>

                <div className="qa-footer">
                  <span className="submitted-date">{item.submittedDate}</span>
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

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">새로운 질문하기</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="questionTitle">제목</label>
                <input
                  type="text"
                  id="questionTitle"
                  value={newQuestion.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="예: 에어컨이 작동하지 않습니다"
                />
              </div>

              <div className="form-group">
                <label htmlFor="questionDescription">상세 내용</label>
                <textarea
                  id="questionDescription"
                  value={newQuestion.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="문제 상황을 자세히 설명해주세요..."
                  rows={4}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                취소
              </button>
              <button className="btn-add" onClick={handleAddQuestion}>
                질문하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAFrame;
