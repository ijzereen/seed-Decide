import React, { useState, useEffect, useCallback, useRef } from 'react';
import './ReignsGame.css';
import useTranslation from '../hooks/useTranslation';

const ReignsGame = ({ nodes, edges, onBackToEditor, gameConfig }) => {
  const { t } = useTranslation();
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [gameStats, setGameStats] = useState(
    gameConfig?.initialStats || {
      health: 50,
      wealth: 50,
      happiness: 50,
      power: 50
    }
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [keyboardSelection, setKeyboardSelection] = useState(null);
  const cardRef = useRef(null);

  // 게임 시작 시 루트 노드 찾기
  useEffect(() => {
    if (nodes.length > 0 && !currentNodeId) {
      const rootNode = nodes.find(node => 
        !edges.some(edge => edge.target === node.id)
      );
      if (rootNode) {
        setCurrentNodeId(rootNode.id);
      } else {
        setCurrentNodeId(nodes[0].id);
      }
    }
  }, [nodes, edges, currentNodeId]);

  // 현재 노드 정보 가져오기
  const getCurrentNode = useCallback(() => {
    return nodes.find(node => node.id === currentNodeId);
  }, [nodes, currentNodeId]);

  // 현재 노드의 선택지(자식 노드들) 가져오기
  const getChoices = useCallback(() => {
    return edges
      .filter(edge => edge.source === currentNodeId)
      .map(edge => nodes.find(node => node.id === edge.target))
      .filter(Boolean);
  }, [edges, nodes, currentNodeId]);

  // 마우스/터치 이벤트 처리
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX, y: clientY });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    
    setCardOffset({ x: deltaX, y: deltaY });
    
    // 스와이프 방향에 따른 선택지 미리보기
    const choices = getChoices();
    if (choices.length >= 2) {
      if (deltaX > 50) {
        setSelectedChoice(choices[1]); // 오른쪽 스와이프 - 두 번째 선택지
      } else if (deltaX < -50) {
        setSelectedChoice(choices[0]); // 왼쪽 스와이프 - 첫 번째 선택지
      } else {
        setSelectedChoice(null);
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    
    const threshold = 100;
    const choices = getChoices();
    
    if (Math.abs(cardOffset.x) > threshold && choices.length > 0) {
      let chosenNode = null;
      if (cardOffset.x > threshold && choices.length >= 2) {
        chosenNode = choices[1]; // 오른쪽 스와이프
      } else if (cardOffset.x < -threshold) {
        chosenNode = choices[0]; // 왼쪽 스와이프
      }
      
      if (chosenNode) {
        handleChoice(chosenNode);
      }
    }
    
    // 리셋
    setIsDragging(false);
    setCardOffset({ x: 0, y: 0 });
    setSelectedChoice(null);
  };

  // 선택지 선택 처리
  const handleChoice = useCallback((choiceNode) => {
    // 스탯 변화 적용 (노드에 설정된 값 또는 랜덤)
    const statChanges = choiceNode.data.statChanges || generateStatChanges();
    setGameStats(prev => ({
      health: Math.max(0, Math.min(100, prev.health + (statChanges.health || 0))),
      wealth: Math.max(0, Math.min(100, prev.wealth + (statChanges.wealth || 0))),
      happiness: Math.max(0, Math.min(100, prev.happiness + (statChanges.happiness || 0))),
      power: Math.max(0, Math.min(100, prev.power + (statChanges.power || 0)))
    }));

    // 다음 노드로 이동
    setCurrentNodeId(choiceNode.id);
  }, []);

  // 스탯 변화 생성 (랜덤)
  const generateStatChanges = () => {
    return {
      health: Math.floor(Math.random() * 21) - 10,
      wealth: Math.floor(Math.random() * 21) - 10,
      happiness: Math.floor(Math.random() * 21) - 10,
      power: Math.floor(Math.random() * 21) - 10
    };
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('Restart button clicked');
    setCurrentNodeId(null);
    setGameStats(gameConfig?.initialStats || {
      health: 50,
      wealth: 50,
      happiness: 50,
      power: 50
    });
  };

  // 에디터로 돌아가기 함수
  const handleBackToEditor = () => {
    console.log('Back to editor button clicked', onBackToEditor);
    if (onBackToEditor) {
      onBackToEditor();
    } else {
      console.error('onBackToEditor function not provided');
    }
  };

  // 게임 오버 체크
  const isGameOver = useCallback(() => {
    return Object.values(gameStats).some(stat => stat <= 0) || 
           Object.values(gameStats).some(stat => stat >= 100);
  }, [gameStats]);

  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      const choices = getChoices();
      if (choices.length === 0) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setKeyboardSelection(choices[0]);
        // 시각적 피드백을 위해 잠시 대기 후 선택 실행
        setTimeout(() => {
          handleChoice(choices[0]);
          setKeyboardSelection(null);
        }, 200);
      } else if (e.key === 'ArrowRight' && choices.length >= 2) {
        e.preventDefault();
        setKeyboardSelection(choices[1]);
        // 시각적 피드백을 위해 잠시 대기 후 선택 실행
        setTimeout(() => {
          handleChoice(choices[1]);
          setKeyboardSelection(null);
        }, 200);
      }
    };

    // 게임이 진행 중일 때만 키보드 이벤트 리스너 추가
    if (currentNodeId && !isGameOver()) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentNodeId, getChoices, handleChoice, isGameOver]);

  const currentNode = getCurrentNode();
  const choices = getChoices();
  const statNames = gameConfig?.statNames || {
    health: t('stat') + ' 1',
    wealth: t('stat') + ' 2', 
    happiness: t('stat') + ' 3',
    power: t('stat') + ' 4'
  };
  
  const statIcons = gameConfig?.statIcons || {
    health: '❤️',
    wealth: '💰',
    happiness: '😊',
    power: '👑'
  };

  if (!currentNode) {
    return (
      <div className="reigns-game-mobile">
        <div className="game-message">
          <h2>{t('cannotStartGame')}</h2>
          <p>{t('noNodesOrConnection')}</p>
          <button onClick={handleBackToEditor} className="back-button">
            {t('backToEditor')}
          </button>
        </div>
      </div>
    );
  }

  if (isGameOver()) {
    return (
      <div className="reigns-game-mobile">
        <div className="game-over">
          <h2>{t('gameOver')}</h2>
          <div className="final-stats">
            {Object.entries(gameStats).map(([key, value]) => (
              <div key={key} className="stat">
                <span>{statNames[key]}: {value}</span>
                <div className="stat-bar">
                  <div 
                    className={`stat-fill ${key}`} 
                    style={{ height: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="game-over-buttons">
            <button onClick={restartGame} className="restart-button">
              {t('restart')}
            </button>
            <button onClick={handleBackToEditor} className="back-button">
              {t('backToEditor')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reigns-game-mobile">
      {/* 상단 스탯 바 */}
      <div className="stats-container-mobile">
        {Object.entries(gameStats).map(([key, value]) => (
          <div key={key} className="stat-mobile">
            <span>{statIcons[key]} {value}</span>
            <div className="stat-bar-mobile">
              <div 
                className={`stat-fill ${key}`} 
                style={{ height: `${value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 메인 카드 영역 */}
      <div className="card-container">
        <div 
          ref={cardRef}
          className={`story-card-mobile ${isDragging ? 'dragging' : ''}`}
          style={{
            transform: `translate(${cardOffset.x}px, ${cardOffset.y}px) rotate(${cardOffset.x * 0.1}deg)`,
            opacity: isDragging ? 0.9 : 1
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          <div className="card-content">
            <h3>{currentNode.data.label}</h3>
            
            {/* 이미지가 있으면 표시 */}
            {currentNode.data.imageUrl && (
              <div className="story-image-container">
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${currentNode.data.imageUrl}`}
                  alt="스토리 이미지"
                  className="story-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="story-text">
              {(currentNode.data.story || `${currentNode.data.label}${t('story')}?`)
                .split('\n')
                .map((line, index) => (
                  <p key={index} className="story-line">
                    {line || '\u00A0'}
                  </p>
                ))}
            </div>
          </div>
        </div>
        
        {/* 스와이프 힌트 - 카드 양옆에 명확하게 표시 */}
        {choices.length > 0 && (
          <div className="swipe-hints-container">
            {choices[0] && (
              <div className={`choice-hint-side left ${selectedChoice?.id === choices[0].id || keyboardSelection?.id === choices[0].id ? 'active' : ''}`}>
                <div className="hint-arrow">←</div>
                <div className="hint-text">{choices[0].data.choice || choices[0].data.label}</div>
              </div>
            )}
            {choices[1] && (
              <div className={`choice-hint-side right ${selectedChoice?.id === choices[1].id || keyboardSelection?.id === choices[1].id ? 'active' : ''}`}>
                <div className="hint-text">{choices[1].data.choice || choices[1].data.label}</div>
                <div className="hint-arrow">→</div>
              </div>
            )}
          </div>
        )}
        
        {/* 드래그 상태 표시 */}
        {isDragging && (
          <div className="drag-indicator">
            <div className={`drag-direction ${cardOffset.x > 50 ? 'right' : cardOffset.x < -50 ? 'left' : 'center'}`}>
              {cardOffset.x > 50 ? t('rightChoice') + ' →' : cardOffset.x < -50 ? '← ' + t('leftChoice') : t('choice')}
            </div>
          </div>
        )}
      </div>

      {/* 선택지 버튼 - 왼쪽/오른쪽 명확히 구분 */}
      {choices.length > 0 && (
        <div className="choice-buttons-mobile">
          {choices[0] && (
            <button
              key={choices[0].id}
              className="choice-button-mobile left-choice"
              onClick={() => handleChoice(choices[0])}
            >
              ← {t('leftChoice')}: {choices[0].data.choice || choices[0].data.label}
            </button>
          )}
          {choices[1] && (
            <button
              key={choices[1].id}
              className="choice-button-mobile right-choice"
              onClick={() => handleChoice(choices[1])}
            >
              {t('rightChoice')}: {choices[1].data.choice || choices[1].data.label} →
            </button>
          )}
        </div>
      )}

      {/* 키보드 안내 */}
      {choices.length > 0 && (
        <div className="keyboard-hint">
          <span>💡 {t('keyboardHint')}</span>
        </div>
      )}

      {/* 하단 컨트롤 */}
      <div className="controls-mobile">
        <button onClick={handleBackToEditor} className="control-button">
          ← {t('backToEditor').split(' ')[0]}
        </button>
        <button onClick={restartGame} className="control-button">
          🔄 {t('restart')}
        </button>
      </div>
    </div>
  );
};

export default ReignsGame;
