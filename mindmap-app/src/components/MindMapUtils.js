// 마인드맵 유틸리티 함수들

// 새로운 노드 생성 함수
export const createNewNode = (id, label, position, type = 'default') => {
  const colors = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#84cc16', // lime
    '#f97316', // orange
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#14b8a6'  // teal
  ];
  
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return {
    id: id.toString(),
    type,
    data: { 
      label,
      statChanges: {
        health: 0,
        wealth: 0,
        happiness: 0,
        power: 0
      }
    },
    position,
    style: {
      background: randomColor,
      color: 'white',
      border: 'none',
      width: 140,
      height: 60,
      borderRadius: '8px',
      fontSize: '12px',
      fontWeight: '500',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '8px',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
  };
};

// 새로운 엣지 생성 함수
export const createNewEdge = (sourceId, targetId) => {
  return {
    id: `e${sourceId}-${targetId}`,
    source: sourceId.toString(),
    target: targetId.toString(),
    type: 'smoothstep',
    animated: false,
  };
};

// 노드 위치 계산 함수 (자동 배치)
export const calculateNodePosition = (parentPosition, childIndex, totalChildren) => {
  const horizontalSpacing = 150;
  const verticalSpacing = 120;
  
  if (totalChildren === 1) {
    return {
      x: parentPosition.x,
      y: parentPosition.y + verticalSpacing,
    };
  }
  
  const startX = parentPosition.x - ((totalChildren - 1) * horizontalSpacing) / 2;
  
  return {
    x: startX + (childIndex * horizontalSpacing),
    y: parentPosition.y + verticalSpacing,
  };
};

// 마인드맵 데이터 저장 함수
export const saveMindMapData = (nodes, edges) => {
  const data = {
    nodes,
    edges,
    timestamp: new Date().toISOString(),
  };
  
  localStorage.setItem('mindmap-data', JSON.stringify(data));
  return data;
};

// 마인드맵 데이터 로드 함수
export const loadMindMapData = () => {
  try {
    const savedData = localStorage.getItem('mindmap-data');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('마인드맵 데이터 로드 실패:', error);
  }
  return null;
};

// 마인드맵 데이터 내보내기 함수
export const exportMindMapData = (nodes, edges, filename = 'mindmap') => {
  const data = {
    nodes,
    edges,
    exportDate: new Date().toISOString(),
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `${filename}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

// 노드 검색 함수
export const searchNodes = (nodes, searchTerm) => {
  if (!searchTerm.trim()) return [];
  
  return nodes.filter(node => 
    node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// 노드 계층 구조 분석 함수
export const analyzeNodeHierarchy = (nodes, edges) => {
  const hierarchy = {};
  
  // 모든 노드를 초기화
  nodes.forEach(node => {
    hierarchy[node.id] = {
      node,
      children: [],
      parent: null,
      level: 0,
    };
  });
  
  // 부모-자식 관계 설정
  edges.forEach(edge => {
    const parent = hierarchy[edge.source];
    const child = hierarchy[edge.target];
    
    if (parent && child) {
      parent.children.push(child);
      child.parent = parent;
      child.level = parent.level + 1;
    }
  });
  
  return hierarchy;
};
