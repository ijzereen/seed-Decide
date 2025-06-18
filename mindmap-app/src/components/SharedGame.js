import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LZString from 'lz-string';
import ReignsGame from './ReignsGame';
import './SharedGame.css';

const SharedGame = () => {
  const { data } = useParams();
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!data) {
      setError('게임 데이터가 없습니다.');
      setLoading(false);
      return;
    }

    try {
      // URL에서 압축된 데이터 해제
      const decompressed = LZString.decompressFromEncodedURIComponent(data);
      if (!decompressed) {
        throw new Error('데이터 압축 해제 실패');
      }

      const parsedData = JSON.parse(decompressed);
      
      // 필수 데이터 검증
      if (!parsedData.nodes || !parsedData.edges || !parsedData.gameConfig) {
        throw new Error('잘못된 게임 데이터');
      }

      setGameData(parsedData);
      setLoading(false);
    } catch (err) {
      console.error('게임 데이터 로드 실패:', err);
      setError('게임 데이터를 불러올 수 없습니다.');
      setLoading(false);
    }
  }, [data]);

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