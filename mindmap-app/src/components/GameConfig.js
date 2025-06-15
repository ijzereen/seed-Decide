import React, { useState } from 'react';
import './GameConfig.css';
import useTranslation from '../hooks/useTranslation';

const GameConfig = ({ gameConfig, onSave, onClose }) => {
  const { t } = useTranslation();
  
  // 사용 가능한 아이콘 목록
  const availableIcons = [
    '❤️', '💰', '😊', '👑', '⚡', '🛡️', '🧠', '💪', '🎯', '⭐', 
    '🔥', '💎', '🏆', '🎨', '🔮', '⚔️', '🌟', '🎭', '🎪', '🎲',
    '📚', '🔧', '🎵', '🌙', '☀️', '🌈', '🎃', '🎄', '🎁', '🎂'
  ];

  const [config, setConfig] = useState(() => ({
    storyTitle: gameConfig?.storyTitle || '',
    storyDescription: gameConfig?.storyDescription || '',
    statNames: gameConfig?.statNames || {
      health: t('stat') + ' 1',
      wealth: t('stat') + ' 2',
      happiness: t('stat') + ' 3',
      power: t('stat') + ' 4'
    },
    statIcons: gameConfig?.statIcons || {
      health: '❤️',
      wealth: '💰',
      happiness: '😊',
      power: '👑'
    },
    initialStats: gameConfig?.initialStats || {
      health: 50,
      wealth: 50,
      happiness: 50,
      power: 50
    }
  }));



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

  const handleStatIconChange = (statKey, icon) => {
    setConfig(prev => ({
      ...prev,
      statIcons: {
        ...prev.statIcons,
        [statKey]: icon
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
          <h3>{t('gameSettings')}</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="config-content">
          <div className="form-group">
            <label htmlFor="story-title">{t('storyTitle')}</label>
            <input
              id="story-title"
              type="text"
              value={config.storyTitle}
              onChange={(e) => handleInputChange('storyTitle', e.target.value)}
              placeholder={t('storyTitle')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="story-description">{t('storyDescription')}</label>
            <textarea
              id="story-description"
              value={config.storyDescription}
              onChange={(e) => handleInputChange('storyDescription', e.target.value)}
              placeholder={t('storyDescription') + '...'}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{t('statNamesAndIcons')}</label>
            <div className="stat-config-grid">
              {Object.entries(config.statNames).map(([statKey, name], index) => (
                <div key={statKey} className="stat-config-item">
                  <div className="stat-header">
                    <span className="stat-label">{t('stat')} {index + 1}</span>
                  </div>
                  <div className="stat-config-row">
                    <div className="icon-selector">
                      <label>{t('icon')}</label>
                      <select
                        value={config.statIcons[statKey]}
                        onChange={(e) => handleStatIconChange(statKey, e.target.value)}
                        className="icon-select"
                      >
                        {availableIcons.map(icon => (
                          <option key={icon} value={icon}>{icon}</option>
                        ))}
                      </select>
                    </div>
                    <div className="name-input">
                      <label>{t('name')}</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleStatNameChange(statKey, e.target.value)}
                        className="stat-name-input"
                        placeholder={t('stat') + ' ' + t('name')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>{t('initialStats')}</label>
            <div className="initial-stats-grid">
              {Object.entries(config.initialStats).map(([statKey, value]) => (
                <div key={statKey} className="initial-stat-item">
                  <label>{config.statIcons[statKey]} {config.statNames[statKey]}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(e) => handleInitialStatChange(statKey, e.target.value)}
                    className="initial-stat-input"
                  />
                </div>
              ))}
            </div>
            <div className="stat-help">
              <small>{t('rangeGuide')}</small>
            </div>
          </div>

          <div className="config-help">
            <h4>💡 {t('configGuide')}</h4>
            <ul>
              <li><strong>{t('storyTitle')}:</strong> {t('configGuideItems.storyTitle')}</li>
              <li><strong>{t('storyDescription')}:</strong> {t('configGuideItems.storyDescription')}</li>
              <li><strong>{t('icon')}:</strong> {t('configGuideItems.statIcon')}</li>
              <li><strong>{t('name')}:</strong> {t('configGuideItems.statName')}</li>
              <li><strong>{t('initialStats')}:</strong> {t('configGuideItems.initialStat')}</li>
            </ul>
          </div>
        </div>

        <div className="config-actions">
          <button className="cancel-button" onClick={onClose}>
            {t('cancel')}
          </button>
          <button className="save-button" onClick={handleSave}>
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameConfig;
