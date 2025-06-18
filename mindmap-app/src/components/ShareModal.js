import React from 'react';
import './ShareModal.css';
import useTranslation from '../hooks/useTranslation';

const ShareModal = ({ shareUrl, onClose, onCopy }) => {
  const { t } = useTranslation();

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">
          <h3>{t('shareGame') || '게임 공유하기'}</h3>
          <button className="close-x" onClick={onClose}>×</button>
        </div>
        
        <div className="share-modal-content">
          <p>{t('shareGameDescription') || '아래 링크를 복사해서 다른 사람들과 게임을 공유하세요!'}</p>
          
          <div className="share-url-container">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="share-url-input"
            />
            <button onClick={onCopy} className="copy-button">
              {t('copy') || '복사'}
            </button>
          </div>

          <div className="share-tips">
            <h4>{t('shareTipsTitle') || '💡 공유 팁'}</h4>
            <ul>
              <li>{t('shareTip1') || '링크를 클릭하면 바로 게임을 플레이할 수 있어요'}</li>
              <li>{t('shareTip2') || 'SNS나 메신저로 공유해보세요'}</li>
              <li>{t('shareTip3') || '게임은 영구적으로 저장됩니다'}</li>
            </ul>
          </div>
        </div>

        <div className="share-modal-actions">
          <button onClick={onClose} className="close-button">
            {t('close') || '닫기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal; 