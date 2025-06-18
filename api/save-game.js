// Vercel Serverless Function - 게임 데이터 저장
import { nanoid } from 'nanoid';

// 메모리 저장소 (실제로는 데이터베이스를 사용해야 하지만, 간단한 구현을 위해)
// Vercel의 경우 메모리는 함수 실행 시마다 초기화되므로, 
// 실제로는 외부 스토리지(KV, Database)를 사용해야 합니다.
const gameStorage = new Map();

export default async function handler(req, res) {
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

    // 짧은 고유 ID 생성 (6자리)
    const gameId = nanoid(6);

    // 게임 데이터 저장 (실제로는 데이터베이스에)
    gameStorage.set(gameId, {
      data: gameData,
      createdAt: new Date().toISOString(),
      // 24시간 후 만료 (간단한 구현)
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

    // 성공 응답
    res.status(200).json({
      success: true,
      gameId: gameId,
      shareUrl: `${req.headers.host}/play/${gameId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error('Game save error:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
} 