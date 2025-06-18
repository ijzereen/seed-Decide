import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReignsGame from './ReignsGame';
import './SharedGame.css';
import useTranslation from '../hooks/useTranslation';

const SharedGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        console.log('게임 조회 시작:', gameId);
        const { getGame } = await import('../utils/api');
        const data = await getGame(gameId);
        console.log('게임 데이터 조회 성공:', data);
        setGameData(data);
      } catch (err) {
        console.error('게임 조회 오류:', err);
        if (err.message.includes('404')) {
          setError('게임을 찾을 수 없습니다.');
        } else {
          setError('게임을 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="shared-game-loading">
        <div className="loading-spinner">🎮</div>
        <h2>{t('loading') || '게임을 불러오는 중...'}</h2>
        <p>{t('pleaseWait') || '잠시만 기다려 주세요.'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-game-error">
        <div className="error-icon">😞</div>
        <h2>{t('gameLoadError') || '게임을 불러올 수 없습니다'}</h2>
        <p>{error}</p>
        <button onClick={handleBackToHome} className="back-home-button">
          {t('backToHome') || '홈으로 돌아가기'}
        </button>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="shared-game-error">
        <div className="error-icon">❓</div>
        <h2>{t('noGameData') || '게임 데이터가 없습니다'}</h2>
        <p>{t('gameNotFound') || '요청하신 게임을 찾을 수 없습니다.'}</p>
        <button onClick={handleBackToHome} className="back-home-button">
          {t('backToHome') || '홈으로 돌아가기'}
        </button>
      </div>
    );
  }

  return (
    <div className="shared-game-container">
      <div className="shared-game-header">
        <div className="game-info">
          <h1>{gameData.gameConfig.storyTitle || gameData.title}</h1>
          <p>{gameData.gameConfig.storyDescription || gameData.description}</p>
        </div>
        <button onClick={handleBackToHome} className="home-button">
          {t('home') || '홈으로'}
        </button>
      </div>
      
      <ReignsGame
        nodes={gameData.nodes.map(node => ({
          id: node.id,
          data: {
            label: node.label,
            story: node.story,
            choice: node.choice,
            statChanges: node.statChanges,
            imageUrl: node.imageUrl
          }
        }))}
        edges={gameData.edges}
        gameConfig={gameData.gameConfig}
        onBackToEditor={handleBackToHome}
      />
    </div>
  );
};

export default SharedGame; 