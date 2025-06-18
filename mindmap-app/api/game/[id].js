// Vercel Serverless Function - 게임 데이터 불러오기 (URL 디코딩 방식)
// 파일명: api/game/[id].js (동적 라우팅)

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Game ID is required' });
    }

    try {
      // Base64 디코딩
      const base64Data = id
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // 패딩 추가
      const paddedData = base64Data + '='.repeat((4 - base64Data.length % 4) % 4);
      
      const decodedString = Buffer.from(paddedData, 'base64').toString('utf-8');
      const gameData = JSON.parse(decodedString);

      // 기본 검증
      if (!gameData || !gameData.nodes || !gameData.edges || !gameData.gameConfig) {
        throw new Error('Invalid game data structure');
      }

      // 게임 데이터 반환
      res.status(200).json({
        success: true,
        gameData: gameData,
        loadedAt: new Date().toISOString()
      });

    } catch (decodeError) {
      console.error('Decode error:', decodeError);
      return res.status(400).json({ 
        error: 'Invalid game data',
        message: '게임 데이터를 해독할 수 없습니다. 링크가 손상되었을 수 있습니다.'
      });
    }

  } catch (error) {
    console.error('Game load error:', error);
    res.status(500).json({ error: 'Failed to load game' });
  }
}; 