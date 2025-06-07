import React, { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';

import 'reactflow/dist/style.css';
import './App.css';
import { createNewNode } from './components/MindMapUtils';
import ReignsGame from './components/ReignsGame';
import NodeEditor from './components/NodeEditor';
import GameConfig from './components/GameConfig';
import StoryEditor from './components/StoryEditor';
import { createSampleStory, createFantasyAdventureStory } from './components/SampleStories';

const STORAGE_KEY = 'mindmap-data';

// localStorage에서 데이터 로드
const loadFromStorage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      return {
        nodes: data.nodes || [],
        edges: data.edges || [],
        nodeId: data.nodeId || 1,
        gameConfig: data.gameConfig || null
      };
    }
  } catch (error) {
    console.error('저장된 데이터 로드 실패:', error);
  }
  return {
    nodes: [],
    edges: [],
    nodeId: 1,
    gameConfig: null
  };
};

// localStorage에 데이터 저장
const saveToStorage = (nodes, edges, nodeId, gameConfig) => {
  try {
    const data = {
      nodes,
      edges,
      nodeId,
      gameConfig,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('데이터 저장 실패:', error);
  }
};

const savedData = loadFromStorage();
const initialNodes = savedData.nodes;
const initialEdges = savedData.edges;

function MindMapFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeId, setNodeId] = useState(savedData.nodeId);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [gameMode, setGameMode] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [showGameConfig, setShowGameConfig] = useState(false);
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [gameConfig, setGameConfig] = useState(savedData.gameConfig || {
    storyTitle: '나만의 스토리',
    storyDescription: '선택을 통해 이야기를 만들어가세요',
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
  const { project } = useReactFlow();
  const reactFlowWrapper = useRef(null);

  // 데이터 변경 시 자동 저장
  useEffect(() => {
    saveToStorage(nodes, edges, nodeId, gameConfig);
  }, [nodes, edges, nodeId, gameConfig]);

  // 노드 연결 함수
  const onConnect = useCallback(
    (params) => setEdges(
      (eds) => { //params는 연결된 엣지(source to target),  eds는 현재 엣지 상태
        console.log(params, eds); 
        return addEdge(params, eds); // addEdge는 새로운 엣지를 추가하는 함수
      }
  ),
    [setEdges],
  );

  useEffect(() => {
    console.log('노드 상태:', nodes);
    console.log('엣지 상태:', edges);
  }, [nodes, edges]);

  // 빈 공간 더블클릭으로 노드 추가
  const onPaneClick = useCallback(
    (event) => {
      if (event.detail === 2) { // 더블클릭 감지
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode = createNewNode(
          nodeId,
          `노드 ${nodeId}`,
          position
        );

        setNodes((nds) => nds.concat(newNode));
        setNodeId((id) => id + 1);
      }
    },
    [project, nodeId, setNodes],
  );

  // 노드 더블클릭으로 편집
  const onNodeDoubleClick = useCallback(
    (event, node) => {
      event.stopPropagation();
      setEditingNode(node);
    },
    [],
  );

  // 노드 편집 저장
  const handleNodeSave = useCallback(
    (updatedNode) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === updatedNode.id ? updatedNode : node
        )
      );
    },
    [setNodes],
  );

  // 게임 모드 전환
  const toggleGameMode = useCallback(() => {
    if (nodes.length === 0) {
      alert('게임을 시작하려면 최소 하나의 노드가 필요합니다.');
      return;
    }
    setGameMode(!gameMode);
  }, [gameMode, nodes.length]);

  // 노드 선택 변경 처리
  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }) => {
      setSelectedNodes(selectedNodes);
    },
    [],
  );

  // 선택된 노드 삭제
  const deleteSelectedNodes = useCallback(() => {
    if (selectedNodes.length > 0) {
      const selectedNodeIds = selectedNodes.map(node => node.id);
      
      // 선택된 노드들 삭제
      setNodes((nds) => nds.filter((node) => !selectedNodeIds.includes(node.id)));
      
      // 선택된 노드들과 연결된 엣지들 삭제
      setEdges((eds) => eds.filter((edge) => 
        !selectedNodeIds.includes(edge.source) && !selectedNodeIds.includes(edge.target)
      ));
      
      setSelectedNodes([]);
    }
  }, [selectedNodes, setNodes, setEdges]);

  // 키보드 이벤트 처리 (Delete 키로 노드 삭제)
  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedNodes();
      }
    },
    [deleteSelectedNodes],
  );

  // 모든 노드와 엣지 삭제
  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setNodeId(1);
    // localStorage도 초기화
    localStorage.removeItem(STORAGE_KEY);
  }, [setNodes, setEdges]);

  // 수동 저장 함수
  const saveData = useCallback(() => {
    saveToStorage(nodes, edges, nodeId, gameConfig);
    alert('데이터가 저장되었습니다!');
  }, [nodes, edges, nodeId, gameConfig]);

  // 데이터 내보내기 (JSON 파일로 다운로드)
  const exportData = useCallback(() => {
    const data = {
      nodes,
      edges,
      nodeId,
      gameConfig,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindmap-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [nodes, edges, nodeId, gameConfig]);

  // 데이터 가져오기 (JSON 파일에서 로드)
  const importData = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          setNodeId(data.nodeId || data.nodes.length + 1);
          if (data.gameConfig) {
            setGameConfig(data.gameConfig);
          }
          saveToStorage(data.nodes, data.edges, data.nodeId || data.nodes.length + 1, data.gameConfig);
          alert('데이터를 성공적으로 불러왔습니다!');
        } else {
          alert('올바르지 않은 파일 형식입니다.');
        }
      } catch (error) {
        console.error('파일 로드 실패:', error);
        alert('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    // 파일 입력 초기화
    event.target.value = '';
  }, [setNodes, setEdges]);


  // 노드나 엣지가 변경될 때마다 시작 노드 스타일 업데이트
  useEffect(() => {
    if (nodes.length > 0) {
      const startingNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id)
      );
      
      setNodes((nds) =>
        nds.map((node) => {
          const isStartingNode = startingNodes.some(startNode => startNode.id === node.id);
          const currentBorder = node.style?.border || '';
          const shouldHaveGoldBorder = isStartingNode;
          const hasGoldBorder = currentBorder.includes('#ffd700');
          
          // 이미 올바른 상태라면 변경하지 않음
          if (shouldHaveGoldBorder === hasGoldBorder) {
            return node;
          }
          
          return {
            ...node,
            style: {
              ...node.style,
              border: isStartingNode ? '3px solid #ffd700' : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: isStartingNode ? 
                (node.style?.boxShadow?.includes('rgba(255, 215, 0') ? node.style.boxShadow : '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255, 215, 0, 0.5)') : 
                '0 8px 32px rgba(0, 0, 0, 0.2)',
            },
            data: {
              ...node.data,
              isStartingNode
            }
          };
        })
      );
    }
  }, [nodes, edges, setNodes]);

  // 샘플 스토리 로드
  const loadSampleStory = useCallback(() => {
    const { nodes: sampleNodes, edges: sampleEdges } = createSampleStory();
    setNodes(sampleNodes);
    setEdges(sampleEdges);
    setNodeId(sampleNodes.length + 1);
  }, [setNodes, setEdges]);

  // 판타지 모험 스토리 로드
  const loadFantasyStory = useCallback(() => {
    const { nodes: fantasyNodes, edges: fantasyEdges } = createFantasyAdventureStory();
    setNodes(fantasyNodes);
    setEdges(fantasyEdges);
    setNodeId(fantasyNodes.length + 1);
  }, [setNodes, setEdges]);

  // 게임 설정 저장
  const handleGameConfigSave = useCallback((newConfig) => {
    setGameConfig(newConfig);
  }, []);

  // 스토리 생성 함수
  const handleGenerateStory = useCallback(async (context) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentNode: {
            id: context.currentNode.id,
            label: context.currentNode.data.label,
            story: context.currentNode.data.story,
            choice: context.currentNode.data.choice,
            statChanges: context.currentNode.data.statChanges
          },
          parentNodes: context.parentNodes.map(node => ({
            id: node.id,
            label: node.data.label,
            story: node.data.story,
            choice: node.data.choice
          })),
          childNodes: context.childNodes.map(node => ({
            id: node.id,
            label: node.data.label,
            story: node.data.story,
            choice: node.data.choice
          })),
          gameConfig: context.gameConfig,
          allNodes: context.allNodes.map(node => ({
            id: node.id,
            label: node.data.label,
            story: node.data.story,
            choice: node.data.choice
          })),
          allEdges: context.allEdges,
          provider: 'claude' // 기본값으로 Claude 사용
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // 생성된 스토리로 노드 업데이트
      const updatedNode = {
        ...context.currentNode,
        data: {
          ...context.currentNode.data,
          story: result.generatedStory
        }
      };
      
      setNodes((nds) =>
        nds.map((node) =>
          node.id === updatedNode.id ? updatedNode : node
        )
      );

      // 편집 중인 노드도 업데이트
      if (editingNode && editingNode.id === updatedNode.id) {
        setEditingNode(updatedNode);
      }

      alert('스토리가 성공적으로 생성되었습니다!');
      
    } catch (error) {
      console.error('스토리 생성 실패:', error);
      alert('스토리 생성에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
    }
  }, [setNodes, editingNode]);

  // 게임 모드일 때 게임 컴포넌트 렌더링
  if (gameMode) {
    return (
      <ReignsGame 
        nodes={nodes} 
        edges={edges} 
        gameConfig={gameConfig}
        onBackToEditor={() => setGameMode(false)} 
      />
    );
  }

  return (
    <div className="App" style={{ width: '100vw', height: '100vh' }}>
      {/* 상단 툴바 */}
      <div className="toolbar">
        <button onClick={loadSampleStory} className="toolbar-button">
          👑 왕국 스토리
        </button>
        <button onClick={loadFantasyStory} className="toolbar-button">
          🧙‍♂️ 판타지 모험
        </button>
        <div className="toolbar-divider"></div>
        <button onClick={clearAll} className="toolbar-button">
          🗑️ 전체 삭제
        </button>
        <button onClick={deleteSelectedNodes} className="toolbar-button" disabled={selectedNodes.length === 0}>
          ❌ 선택 삭제
        </button>
        <div className="toolbar-divider"></div>
        <button onClick={saveData} className="toolbar-button">
          💾 저장
        </button>
        <button onClick={exportData} className="toolbar-button" disabled={nodes.length === 0}>
          📤 내보내기
        </button>
        <label className="toolbar-button file-input-label">
          📥 가져오기
          <input
            type="file"
            accept=".json"
            onChange={importData}
            style={{ display: 'none' }}
          />
        </label>
        <button onClick={() => setShowGameConfig(true)} className="toolbar-button">
          ⚙️ 게임 설정
        </button>
        <button onClick={() => setShowStoryEditor(true)} className="toolbar-button" disabled={nodes.length === 0}>
          📝 스토리 에디터
        </button>
        <button onClick={toggleGameMode} className="toolbar-button game-button" disabled={nodes.length === 0}>
          🎮 게임 시작
        </button>
        <div className="toolbar-info">
          💡 더블클릭: 노드 추가/편집 | 드래그: 노드 연결 | Delete키: 삭제
        </div>
      </div>

      <div ref={reactFlowWrapper} style={{ width: '100%', height: 'calc(100% - 60px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onSelectionChange={onSelectionChange}
          onKeyDown={onKeyDown}
          fitView
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode={['Meta', 'Ctrl']}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* 노드 편집기 */}
      {editingNode && (
        <NodeEditor
          node={editingNode}
          nodes={nodes}
          edges={edges}
          gameConfig={gameConfig}
          onSave={handleNodeSave}
          onClose={() => setEditingNode(null)}
          onGenerateStory={handleGenerateStory}
        />
      )}

      {/* 게임 설정 */}
      {showGameConfig && (
        <GameConfig
          gameConfig={gameConfig}
          onSave={handleGameConfigSave}
          onClose={() => setShowGameConfig(false)}
        />
      )}

      {/* 스토리 에디터 */}
      {showStoryEditor && (
        <StoryEditor
          nodes={nodes}
          edges={edges}
          gameConfig={gameConfig}
          onNodeUpdate={handleNodeSave}
          onGenerateStory={handleGenerateStory}
          onClose={() => setShowStoryEditor(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <MindMapFlow />
    </ReactFlowProvider>
  );
}

export default App;
