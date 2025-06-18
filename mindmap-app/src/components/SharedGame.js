import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReignsGame from './ReignsGame';
import './SharedGame.css';

const SharedGame = () => {
  const { data: gameId } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!gameId) {
      setError('게임 ID가 없습니다.');
      setLoading(false);
      return;
    }

    const loadGame = async () => {
      try {
        // 서버리스 API에서 게임 데이터 가져오기
        const response = await fetch(`/api/game/${gameId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('게임을 찾을 수 없습니다. 링크가 만료되었거나 잘못된 ID입니다.');
          } else if (response.status === 410) {
            throw new Error('게임 링크가 만료되었습니다. (24시간 제한)');
          } else {
            throw new Error(`서버 오류: ${response.status}`);
          }
        }

        const result = await response.json();
        
        if (result.success && result.gameData) {
          // 필수 데이터 검증
          if (!result.gameData.nodes || !result.gameData.edges || !result.gameData.gameConfig) {
            throw new Error('잘못된 게임 데이터');
          }

          setGameData(result.gameData);
          setLoading(false);
        } else {
          throw new Error('게임 데이터 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        console.error('게임 데이터 로드 실패:', err);
        setError(err.message || '게임 데이터를 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="shared-game-loading">
        <div className="loading-spinner">🎮</div>
        <h2>게임을 불러오는 중...</h2>
        <p>잠시만 기다려주세요.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-game-error">
        <div className="error-icon">❌</div>
        <h2>게임을 불러올 수 없습니다</h2>
        <p>{error}</p>
        <button onClick={handleBackToHome} className="back-home-button">
          🏠 홈으로 돌아가기
        </button>
      </div>
    );
  }

  if (!gameData) {
    return null;
  }

  return (
    <div className="shared-game-container">
      <div className="shared-game-header">
        <div className="game-info">
          <h1>{gameData.gameConfig?.storyTitle || 'DecideX 게임'}</h1>
          <p>{gameData.gameConfig?.storyDescription || '공유된 스토리 게임'}</p>
        </div>
        <button onClick={handleBackToHome} className="home-button">
          🏠 홈으로
        </button>
      </div>
      
      <ReignsGame 
        nodes={gameData.nodes} 
        edges={gameData.edges} 
        onBackToEditor={handleBackToHome}
        gameConfig={gameData.gameConfig}
      />
    </div>
  );
};

export default SharedGame; 