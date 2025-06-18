// API 유틸리티 함수

const getBackendUrl = () => {
  const url = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  // URL 끝의 슬래시 제거
  return url.replace(/\/$/, '');
};

export const apiCall = async (endpoint, options = {}) => {
  const baseUrl = getBackendUrl();
  // endpoint 시작의 슬래시 확인
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  console.log('API 호출:', url);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
};

export const saveGame = async (gameData) => {
  return apiCall('/api/games', {
    method: 'POST',
    body: JSON.stringify(gameData),
  });
};

export const getGame = async (gameId) => {
  return apiCall(`/api/games/${gameId}`);
};

export const generateStory = async (storyRequest) => {
  return apiCall('/api/generate-story', {
    method: 'POST',
    body: JSON.stringify(storyRequest),
  });
}; 