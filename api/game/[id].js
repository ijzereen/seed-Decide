// Vercel Serverless Function - 게임 데이터 불러오기
// 파일명: api/game/[id].js (동적 라우팅)

// 메모리 저장소 (실제로는 데이터베이스 연결 필요)
const gameStorage = new Map();

export default async function handler(req, res) {
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

    // 게임 데이터 조회
    const gameRecord = gameStorage.get(id);

    if (!gameRecord) {
      return res.status(404).json({ 
        error: 'Game not found',
        message: '게임을 찾을 수 없습니다. 링크가 만료되었거나 잘못된 ID입니다.'
      });
    }

    // 만료 확인
    if (new Date() > new Date(gameRecord.expiresAt)) {
      gameStorage.delete(id);
      return res.status(410).json({ 
        error: 'Game expired',
        message: '게임 링크가 만료되었습니다. (24시간 제한)'
      });
    }

    // 게임 데이터 반환
    res.status(200).json({
      success: true,
      gameData: gameRecord.data,
      createdAt: gameRecord.createdAt,
      expiresAt: gameRecord.expiresAt
    });

  } catch (error) {
    console.error('Game load error:', error);
    res.status(500).json({ error: 'Failed to load game' });
  }
} 