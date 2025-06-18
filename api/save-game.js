// Vercel Serverless Function - 게임 데이터 저장 (URL 압축 방식)

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight request 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const gameData = req.body;

    // 기본 검증
    if (!gameData || !gameData.nodes || !gameData.edges) {
      return res.status(400).json({ error: 'Invalid game data' });
    }

    // 데이터 크기 최적화
    const optimizedData = {
      nodes: gameData.nodes.map(node => ({
        id: node.id,
        data: {
          label: node.data.label,
          story: node.data.story,
          choices: node.data.choices,
          statChanges: node.data.statChanges,
          image: node.data.image ? node.data.image.substring(0, 50000) : null // 이미지 크기 제한
        }
      })),
      edges: gameData.edges,
      gameConfig: gameData.gameConfig
    };

    // Base64 인코딩으로 URL 생성 (간단한 압축)
    const dataString = JSON.stringify(optimizedData);
    const encodedData = Buffer.from(dataString).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // URL이 너무 길면 에러
    if (encodedData.length > 1500) {
      return res.status(413).json({ 
        error: 'Game data too large',
        message: '게임 데이터가 너무 큽니다. 이미지를 줄이거나 텍스트를 단축해주세요.'
      });
    }

    // 성공 응답 (인코딩된 데이터를 ID로 사용)
    res.status(200).json({
      success: true,
      gameId: encodedData,
      shareUrl: `${req.headers.host}/play/${encodedData}`,
      dataSize: encodedData.length
    });

  } catch (error) {
    console.error('Game save error:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
}; 