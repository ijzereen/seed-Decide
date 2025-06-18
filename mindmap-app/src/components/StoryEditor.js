import React, { useState, useCallback, useRef } from 'react';
import './StoryEditor.css';
import useTranslation from '../hooks/useTranslation';

const StoryEditor = ({ 
  nodes, 
  edges, 
  gameConfig, 
  onNodeUpdate, 
  onGenerateStory, 
  onClose 
}) => {
  const { t } = useTranslation();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'list', 'graph'
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const editorRef = useRef(null);

  // 선택된 노드 정보
  const selectedNode = nodes.find(node => node.id === selectedNodeId);

  // 노드의 부모와 자식 찾기
  const getNodeRelations = useCallback((nodeId) => {
    const parents = edges
      .filter(edge => edge.target === nodeId)
      .map(edge => nodes.find(node => node.id === edge.source))
      .filter(Boolean);
    
    const children = edges
      .filter(edge => edge.source === nodeId)
      .map(edge => nodes.find(node => node.id === edge.target))
      .filter(Boolean);

    return { parents, children };
  }, [nodes, edges]);

  // 검색 필터링
  const filteredNodes = nodes.filter(node => 
    node.data.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    node.data.story?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 노드 트리 구조 생성
  const buildNodeTree = useCallback(() => {
    const rootNodes = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
    
    const buildChildren = (nodeId, visited = new Set()) => {
      if (visited.has(nodeId)) return [];
      visited.add(nodeId);
      
      return edges
        .filter(edge => edge.source === nodeId)
        .map(edge => {
          const childNode = nodes.find(node => node.id === edge.target);
          return childNode ? {
            ...childNode,
            children: buildChildren(edge.target, visited)
          } : null;
        })
        .filter(Boolean);
    };

    return rootNodes.map(node => ({
      ...node,
      children: buildChildren(node.id)
    }));
  }, [nodes, edges]);

  // 스토리 생성 요청
  const handleGenerateStory = async () => {
    if (!selectedNode) return;
    
    setIsGenerating(true);
    try {
      const { parents, children } = getNodeRelations(selectedNode.id);
      
      const context = {
        currentNode: selectedNode,
        parentNodes: parents,
        childNodes: children,
        gameConfig: gameConfig,
        allNodes: nodes,
        allEdges: edges
      };
      
      await onGenerateStory(context);
    } catch (error) {
      console.error('스토리 생성 실패:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 노드 업데이트
  const handleNodeUpdate = (field, value) => {
    if (!selectedNode) return;
    
    const updatedNode = {
      ...selectedNode,
      data: {
        ...selectedNode.data,
        [field]: value
      }
    };
    
    onNodeUpdate(updatedNode);
  };

  // 이미지 업로드 처리
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('Image upload started:', file.name, file.type, file.size);

    if (!file.type.startsWith('image/')) {
      alert(t('imageFilesOnly'));
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB로 제한 (Base64로 저장하므로)
    if (file.size > maxSize) {
      alert(t('fileSizeLimit'));
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // FileReader를 사용해 Base64로 변환
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64Data = e.target.result;
        
        // 노드 데이터에 Base64 이미지 저장
        handleNodeUpdate('imageUrl', base64Data);
        setIsUploadingImage(false);
        alert(t('imageUploadSuccess'));
      };
      
      reader.onerror = () => {
        console.error('File reading failed');
        alert(t('imageUploadError'));
        setIsUploadingImage(false);
      };
      
      // Base64로 읽기 시작
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(t('imageUploadError') + `: ${error.message}`);
      setIsUploadingImage(false);
    }
  };

  // 이미지 제거 처리
  const handleImageRemove = () => {
    if (!selectedNode?.data?.imageUrl) return;
    
    // 로컬 저장이므로 단순히 데이터에서 제거
    handleNodeUpdate('imageUrl', '');
  };

  // 트리 노드 렌더링
  const renderTreeNode = (node, level = 0) => (
    <div key={node.id} className="tree-node" style={{ marginLeft: `${level * 20}px` }}>
      <div 
        className={`tree-node-item ${selectedNodeId === node.id ? 'selected' : ''}`}
        onClick={() => setSelectedNodeId(node.id)}
      >
        <div className="tree-node-icon">
          {node.children?.length > 0 ? '📁' : '📄'}
        </div>
        <div className="tree-node-content">
          <div className="tree-node-title">{node.data.label || `${t('node')} ${node.id}`}</div>
          <div className="tree-node-preview">
            {node.data.story ? 
              node.data.story.substring(0, 50) + (node.data.story.length > 50 ? '...' : '') :
              t('noStory')
            }
          </div>
        </div>
      </div>
      {node.children?.map(child => renderTreeNode(child, level + 1))}
    </div>
  );

  return (
    <div className="story-editor-overlay">
      <div className="story-editor" ref={editorRef}>
        {/* 헤더 */}
        <div className="editor-header">
          <div className="header-left">
            <h1 className="editor-title">{t('storyArchitect')}</h1>
            <div className="project-info">
              <span className="project-name">{gameConfig?.storyTitle || t('noTitle')}</span>
              <span className="node-count">{nodes.length} {t('nodes')}</span>
            </div>
          </div>
          <div className="header-right">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode('tree')}
              >
                🌳 {t('treeView')}
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 {t('listView')}
              </button>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="editor-body">
          {/* 사이드바 */}
          <div className="sidebar">
            <div className="search-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={t('searchNodes') + '...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>

            <div className="nodes-section">
              {viewMode === 'tree' ? (
                <div className="tree-view">
                  {buildNodeTree().map(node => renderTreeNode(node))}
                </div>
              ) : (
                <div className="list-view">
                  {filteredNodes.map(node => (
                    <div 
                      key={node.id}
                      className={`list-node-item ${selectedNodeId === node.id ? 'selected' : ''}`}
                      onClick={() => setSelectedNodeId(node.id)}
                    >
                      <div className="list-node-title">{node.data.label || `${t('node')} ${node.id}`}</div>
                      <div className="list-node-preview">
                        {node.data.story ? 
                          node.data.story.substring(0, 80) + (node.data.story.length > 80 ? '...' : '') :
                          t('noStory')
                        }
                      </div>
                      <div className="list-node-meta">
                        {getNodeRelations(node.id).children.length} {t('children')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 메인 에디터 */}
          <div className="main-editor">
            {selectedNode ? (
              <>
                <div className="editor-toolbar">
                  <div className="node-path">
                    <span className="path-item">{t('node')} {selectedNode.id}</span>
                    <span className="path-separator">•</span>
                    <span className="path-item">{selectedNode.data.label || t('noTitle')}</span>
                  </div>
                  <div className="toolbar-actions">
                    <button 
                      className="generate-btn"
                      onClick={handleGenerateStory}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '🔄 ' + t('generating') + '...' : '✨ ' + t('generateStory')}
                    </button>
                  </div>
                </div>

                <div className="editor-content">
                  <div className="content-section">
                    <label className="content-label">{t('nodeTitle')}</label>
                    <input
                      type="text"
                      value={selectedNode.data.label || ''}
                      onChange={(e) => handleNodeUpdate('label', e.target.value)}
                      className="title-input"
                      placeholder={t('enterNodeTitle') + '...'}
                    />
                  </div>

                  <div className="content-section">
                    <label className="content-label">{t('storyContent')}</label>
                    <textarea
                      value={selectedNode.data.story || ''}
                      onChange={(e) => handleNodeUpdate('story', e.target.value)}
                      className="story-textarea"
                      placeholder={t('writeStoryHere') + '...'}
                      rows={12}
                    />
                  </div>

                  <div className="content-section">
                    <label className="content-label">{t('choiceText')}</label>
                    <input
                      type="text"
                      value={selectedNode.data.choice || ''}
                      onChange={(e) => handleNodeUpdate('choice', e.target.value)}
                      className="choice-input"
                      placeholder={t('choiceTextPlaceholder') + '...'}
                    />
                  </div>

                  {/* 이미지 업로드 섹션 */}
                  <div className="content-section">
                    <label className="content-label">{t('storyImage')}</label>
                    
                    {/* 현재 이미지 표시 */}
                    {selectedNode.data.imageUrl && (
                      <div className="current-image">
                        <img
                          src={selectedNode.data.imageUrl}
                          alt={t('storyImage')}
                          className="story-image-preview"
                        />
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="remove-image-btn"
                        >
                          🗑️ {t('removeImage')}
                        </button>
                      </div>
                    )}

                    {/* 이미지 업로드 버튼 */}
                    <div className="image-upload-section">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        id="story-image-upload"
                        style={{ display: 'none' }}
                      />
                      <label
                        htmlFor="story-image-upload"
                        className={`image-upload-btn ${isUploadingImage ? 'uploading' : ''}`}
                      >
                        {isUploadingImage ? (
                          <>🔄 {t('uploading')}...</>
                        ) : selectedNode.data.imageUrl ? (
                          <>📷 {t('changeImage')}</>
                        ) : (
                          <>📷 {t('addImage')}</>
                        )}
                      </label>
                      <div className="image-upload-hint">
                        {t('maxFileSize')}: 2MB
                      </div>
                    </div>
                  </div>

                  {/* 스탯 변화 설정 */}
                  <div className="content-section">
                    <label className="content-label">{t('statChanges')}</label>
                    <div className="stats-grid">
                      {Object.entries(selectedNode.data.statChanges || {}).map(([statKey, value]) => {
                        const statLabels = {
                          health: gameConfig?.statIcons?.health || '❤️',
                          wealth: gameConfig?.statIcons?.wealth || '💰',
                          happiness: gameConfig?.statIcons?.happiness || '😊',
                          power: gameConfig?.statIcons?.power || '👑'
                        };
                        const statNames = {
                          health: gameConfig?.statNames?.health || t('stat') + ' 1',
                          wealth: gameConfig?.statNames?.wealth || t('stat') + ' 2',
                          happiness: gameConfig?.statNames?.happiness || t('stat') + ' 3',
                          power: gameConfig?.statNames?.power || t('stat') + ' 4'
                        };
                        return (
                          <div key={statKey} className="stat-item">
                            <label>{statLabels[statKey]} {statNames[statKey]}</label>
                            <input
                              type="number"
                              min="-50"
                              max="50"
                              value={value || 0}
                              onChange={(e) => {
                                const newStatChanges = {
                                  ...selectedNode.data.statChanges,
                                  [statKey]: parseInt(e.target.value) || 0
                                };
                                handleNodeUpdate('statChanges', newStatChanges);
                              }}
                              className="stat-input"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 관계 정보 */}
                <div className="relations-section">
                  <div className="relations-grid">
                    <div className="relation-group">
                      <h4>{t('parentNodes')}</h4>
                      <div className="relation-items">
                        {getNodeRelations(selectedNode.id).parents.map(parent => (
                          <div 
                            key={parent.id} 
                            className="relation-item"
                            onClick={() => setSelectedNodeId(parent.id)}
                          >
                            {parent.data.label || `${t('node')} ${parent.id}`}
                          </div>
                        ))}
                        {getNodeRelations(selectedNode.id).parents.length === 0 && (
                          <div className="no-relations">{t('noParentNodes')}</div>
                        )}
                      </div>
                    </div>
                    <div className="relation-group">
                      <h4>{t('childNodes')}</h4>
                      <div className="relation-items">
                        {getNodeRelations(selectedNode.id).children.map(child => (
                          <div 
                            key={child.id} 
                            className="relation-item"
                            onClick={() => setSelectedNodeId(child.id)}
                          >
                            {child.data.label || `${t('node')} ${child.id}`}
                          </div>
                        ))}
                        {getNodeRelations(selectedNode.id).children.length === 0 && (
                          <div className="no-relations">{t('noChildNodes')}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <div className="no-selection-content">
                  <div className="no-selection-icon">📝</div>
                  <h3>{t('selectNodeToEdit')}</h3>
                  <p>{t('chooseNodeFromSidebar')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;
