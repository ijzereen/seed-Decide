import React, { useState, useEffect } from 'react';
import './GameConfig.css';

const GameConfig = ({ gameConfig, onSave, onClose }) => {
  const [config, setConfig] = useState({
    storyTitle: '',
    storyDescription: '',
    statNames: {
      health: '체력',
      wealth: '재력',
      happiness: '행복',
      power: '권력'
    },
    initialStats: {
      health: 50,
      wealth: 50,
      happiness: 50,
      power: 50
    }
  });

  useEffect(() => {
    if (gameConfig) {
      setConfig({
        storyTitle: gameConfig.storyTitle || '',
        storyDescription: gameConfig.storyDescription || '',
        statNames: gameConfig.statNames || {
          health: '체력',
          wealth: '재력',
          happiness: '행복',
          power: '권력'
        },
        initialStats: gameConfig.initialStats || {
          health: 50,
          wealth: 50,
          happiness: 50,
          power: 50
        }
      });
    }
  }, [gameConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatNameChange = (statKey, value) => {
    setConfig(prev => ({
      ...prev,
      statNames: {
        ...prev.statNames,
        [statKey]: value
      }
    }));
  };

  const handleInitialStatChange = (statKey, value) => {
    setConfig(prev => ({
      ...prev,
      initialStats: {
        ...prev.initialStats,
        [statKey]: Math.max(0, Math.min(100, parseInt(value) || 0))
      }
    }));
  };

  return (
    <div className="game-config-overlay">
      <div className="game-config">
        <div className="config-header">
          <h3>게임 설정</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="config-content">
          <div className="form-group">
            <label htmlFor="story-title">스토리 제목</label>
            <input
              id="story-title"
              type="text"
              value={config.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder="스토리의 제목을 입력하세요"
            />
          </div>

          <div className="form-group">
            <label htmlFor="story-description">스토리 설명</label>
            <textarea
              id="story-description"
              value={config.storyDescription}
              onChange={(e) => handleInputChange('storyDescription', e.target.value)}
              placeholder="스토리의 배경과 설명을 작성하세요..."
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>스탯 이름 설정</label>
            <div className="stat-names-grid">
              {Object.entries(config.statNames).map(([statKey, name]) => {
                const statIcons = {
                  health: '❤️',
                  wealth: '💰',
                  happiness: '😊',
                  power: '👑'
                };
                return (
                  <div key={statKey} className="stat-name-item">
                    <label>{statIcons[statKey]} {statKey}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleStatNameChange(statKey, e.target.value)}
                      className="stat-name-input"
                      placeholder={`${statKey} 이름`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-group">
            <label>초기 스탯 설정</label>
            <div className="initial-stats-grid">
              {Object.entries(config.initialStats).map(([statKey, value]) => {
                const statIcons = {
                  health: '❤️',
                  wealth: '💰',
                  happiness: '😊',
                  power: '👑'
                };
                return (
                  <div key={statKey} className="initial-stat-item">
                    <label>{statIcons[statKey]} {config.statNames[statKey]}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={value}
                      onChange={(e) => handleInitialStatChange(statKey, e.target.value)}
                      className="initial-stat-input"
                    />
                  </div>
                );
              })}
            </div>
            <div className="stat-help">
              <small>0 ~ 100 범위로 설정 (게임 시작 시 초기값)</small>
            </div>
          </div>

          <div className="config-help">
            <h4>💡 설정 가이드</h4>
            <ul>
              <li><strong>스토리 제목:</strong> 게임의 메인 타이틀</li>
              <li><strong>스토리 설명:</strong> 게임의 배경과 설정</li>
              <li><strong>스탯 이름:</strong> 게임에서 사용할 스탯의 이름 (예: 체력 → 마나)</li>
              <li><strong>초기 스탯:</strong> 게임 시작 시 각 스탯의 초기값</li>
            </ul>
          </div>
        </div>

        <div className="config-actions">
          <button className="cancel-button" onClick={onClose}>
            취소
          </button>
          <button className="save-button" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameConfig;
