import React, { useState, useCallback, useRef, useEffect } from 'react';
import './StoryEditor.css';

const StoryEditor = ({ 
  nodes, 
  edges, 
  gameConfig, 
  onNodeUpdate, 
  onGenerateStory, 
  onClose 
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'list', 'graph'
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
          <div className="tree-node-title">{node.data.label || `노드 ${node.id}`}</div>
          <div className="tree-node-preview">
            {node.data.story ? 
              node.data.story.substring(0, 50) + (node.data.story.length > 50 ? '...' : '') :
              '스토리 없음'
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
            <h1 className="editor-title">Story Architect</h1>
            <div className="project-info">
              <span className="project-name">{gameConfig?.storyTitle || '제목 없음'}</span>
              <span className="node-count">{nodes.length} nodes</span>
            </div>
          </div>
          <div className="header-right">
            <div className="view-controls">
              <button 
                className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
                onClick={() => setViewMode('tree')}
              >
                🌳 Tree
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 List
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
                  placeholder="Search nodes..."
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
                      <div className="list-node-title">{node.data.label || `노드 ${node.id}`}</div>
                      <div className="list-node-preview">
                        {node.data.story ? 
                          node.data.story.substring(0, 80) + (node.data.story.length > 80 ? '...' : '') :
                          '스토리 없음'
                        }
                      </div>
                      <div className="list-node-meta">
                        {getNodeRelations(node.id).children.length} children
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
                    <span className="path-item">Node {selectedNode.id}</span>
                    <span className="path-separator">•</span>
                    <span className="path-item">{selectedNode.data.label || '제목 없음'}</span>
                  </div>
                  <div className="toolbar-actions">
                    <button 
                      className="generate-btn"
                      onClick={handleGenerateStory}
                      disabled={isGenerating}
                    >
                      {isGenerating ? '🔄 Generating...' : '✨ Generate Story'}
                    </button>
                  </div>
                </div>

                <div className="editor-content">
                  <div className="content-section">
                    <label className="content-label">Node Title</label>
                    <input
                      type="text"
                      value={selectedNode.data.label || ''}
                      onChange={(e) => handleNodeUpdate('label', e.target.value)}
                      className="title-input"
                      placeholder="Enter node title..."
                    />
                  </div>

                  <div className="content-section">
                    <label className="content-label">Story Content</label>
                    <textarea
                      value={selectedNode.data.story || ''}
                      onChange={(e) => handleNodeUpdate('story', e.target.value)}
                      className="story-textarea"
                      placeholder="Write your story here..."
                      rows={12}
                    />
                  </div>

                  <div className="content-section">
                    <label className="content-label">Choice Text</label>
                    <input
                      type="text"
                      value={selectedNode.data.choice || ''}
                      onChange={(e) => handleNodeUpdate('choice', e.target.value)}
                      className="choice-input"
                      placeholder="Text for choice leading to this node..."
                    />
                  </div>

                  {/* 스탯 변화 설정 */}
                  <div className="content-section">
                    <label className="content-label">Stat Changes</label>
                    <div className="stats-grid">
                      {Object.entries(selectedNode.data.statChanges || {}).map(([statKey, value]) => {
                        const statLabels = {
                          health: '❤️ Health',
                          wealth: '💰 Wealth',
                          happiness: '😊 Happiness',
                          power: '👑 Power'
                        };
                        return (
                          <div key={statKey} className="stat-item">
                            <label>{statLabels[statKey]}</label>
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
                      <h4>Parent Nodes</h4>
                      <div className="relation-items">
                        {getNodeRelations(selectedNode.id).parents.map(parent => (
                          <div 
                            key={parent.id} 
                            className="relation-item"
                            onClick={() => setSelectedNodeId(parent.id)}
                          >
                            {parent.data.label || `Node ${parent.id}`}
                          </div>
                        ))}
                        {getNodeRelations(selectedNode.id).parents.length === 0 && (
                          <div className="no-relations">No parent nodes</div>
                        )}
                      </div>
                    </div>
                    <div className="relation-group">
                      <h4>Child Nodes</h4>
                      <div className="relation-items">
                        {getNodeRelations(selectedNode.id).children.map(child => (
                          <div 
                            key={child.id} 
                            className="relation-item"
                            onClick={() => setSelectedNodeId(child.id)}
                          >
                            {child.data.label || `Node ${child.id}`}
                          </div>
                        ))}
                        {getNodeRelations(selectedNode.id).children.length === 0 && (
                          <div className="no-relations">No child nodes</div>
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
                  <h3>Select a node to edit</h3>
                  <p>Choose a node from the sidebar to start editing its story content.</p>
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
