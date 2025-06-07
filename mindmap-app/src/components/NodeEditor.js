import React, { useState, useEffect } from 'react';
import './NodeEditor.css';

const NodeEditor = ({ node, nodes, edges, gameConfig, onSave, onClose, onGenerateStory }) => {
  const [nodeData, setNodeData] = useState({
    label: '',
    story: '',
    choice: '',
    statChanges: {
      health: 0,
      wealth: 0,
      happiness: 0,
      power: 0
    }
  });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (node) {
      setNodeData({
        label: node.data.label || '',
        story: node.data.story || '',
        choice: node.data.choice || '',
        statChanges: node.data.statChanges || {
          health: 0,
          wealth: 0,
          happiness: 0,
          power: 0
        }
      });
    }
  }, [node]); // node가 변경될 때만 업데이트

  const handleSave = () => {
    onSave({
      ...node,
      data: {
        ...node.data,
        label: nodeData.label,
        story: nodeData.story,
        choice: nodeData.choice,
        statChanges: nodeData.statChanges
      }
    });
    onClose();
  };

  const handleInputChange = (field, value) => {
    setNodeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStatChange = (statKey, value) => {
    setNodeData(prev => ({
      ...prev,
      statChanges: {
        ...prev.statChanges,
        [statKey]: value
      }
    }));
  };

  // 노드의 부모와 자식 찾기
  const getNodeRelations = () => {
    const parents = edges
      .filter(edge => edge.target === node.id)
      .map(edge => nodes.find(n => n.id === edge.source))
      .filter(Boolean);
    
    const children = edges
      .filter(edge => edge.source === node.id)
      .map(edge => nodes.find(n => n.id === edge.target))
      .filter(Boolean);

    return { parents, children };
  };

  // AI 스토리 생성
  const handleGenerateStory = async () => {
    if (!onGenerateStory) {
      alert('스토리 생성 기능이 사용할 수 없습니다.');
      return;
    }

    setIsGenerating(true);
    try {
      const { parents, children } = getNodeRelations();
      
      // 현재 노드 데이터를 업데이트된 상태로 생성
      const currentNodeWithUpdatedData = {
        ...node,
        data: {
          ...node.data,
          label: nodeData.label,
          story: nodeData.story,
          choice: nodeData.choice,
          statChanges: nodeData.statChanges
        }
      };

      // App.js의 handleGenerateStory 함수 호출
      await onGenerateStory({
        currentNode: currentNodeWithUpdatedData,
        parentNodes: parents,
        childNodes: children,
        gameConfig: gameConfig,
        allNodes: nodes,
        allEdges: edges
      });

      // 스토리 생성 후 노드 데이터 새로고침
      // App.js에서 노드가 업데이트되면 useEffect를 통해 자동으로 반영됨
      
    } catch (error) {
      console.error('스토리 생성 실패:', error);
      alert('스토리 생성에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!node) return null;

  return (
    <div className="node-editor-overlay">
      <div className="node-editor">
        <div className="editor-header">
          <h3>노드 편집</h3>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="editor-content">
          <div className="form-group">
            <label htmlFor="node-label">노드 제목</label>
            <input
              id="node-label"
              type="text"
              value={nodeData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="노드의 제목을 입력하세요"
            />
          </div>

          <div className="form-group">
            <div className="story-header">
              <label htmlFor="node-story">스토리 내용</label>
              <button 
                className="generate-story-button"
                onClick={handleGenerateStory}
                disabled={isGenerating}
                type="button"
              >
                {isGenerating ? '🔄 생성 중...' : '✨ AI 스토리 생성'}
              </button>
            </div>
            <textarea
              id="node-story"
              value={nodeData.story}
              onChange={(e) => handleInputChange('story', e.target.value)}
              placeholder="이 상황에서 일어나는 스토리를 작성하세요..."
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="node-choice">선택지 텍스트</label>
            <input
              id="node-choice"
              type="text"
              value={nodeData.choice}
              onChange={(e) => handleInputChange('choice', e.target.value)}
              placeholder="이 노드로 이어지는 선택지 텍스트 (선택사항)"
            />
          </div>

          <div className="form-group">
            <label>스탯 변화 설정</label>
            <div className="stat-changes-grid">
              {Object.entries(nodeData.statChanges).map(([statKey, value]) => {
                const statLabels = {
                  health: '❤️ 체력',
                  wealth: '💰 재력',
                  happiness: '😊 행복',
                  power: '👑 권력'
                };
                return (
                  <div key={statKey} className="stat-change-item">
                    <label>{statLabels[statKey]}</label>
                    <input
                      type="number"
                      min="-50"
                      max="50"
                      value={value}
                      onChange={(e) => handleStatChange(statKey, parseInt(e.target.value) || 0)}
                      className="stat-input"
                    />
                  </div>
                );
              })}
            </div>
            <div className="stat-help">
              <small>-50 ~ +50 범위로 설정 (0은 변화 없음)</small>
            </div>
          </div>

          <div className="editor-help">
            <h4>💡 사용 팁</h4>
            <ul>
              <li><strong>노드 제목:</strong> 상황의 간단한 요약</li>
              <li><strong>스토리 내용:</strong> 플레이어에게 보여질 상세한 상황 설명</li>
              <li><strong>선택지 텍스트:</strong> 다른 노드에서 이 노드로 오는 선택지의 텍스트</li>
              <li><strong>스탯 변화:</strong> 이 선택지를 선택했을 때 변화할 스탯 수치</li>
            </ul>
          </div>
        </div>

        <div className="editor-actions">
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

export default NodeEditor;
