# DecideX 배포 가이드 (게임 공유 기능 + 스토리지 모니터링 포함)

## 📋 새로 추가된 기능들

### 🎮 게임 URL 공유
- JSON 파일 기반 게임 저장
- 8자리 게임 ID 생성
- React Router 기반 `/game/{gameId}` URL
- 클립보드 복사 기능

### 📊 스토리지 헬스체크 및 모니터링
- 실시간 디스크 사용량 모니터링
- 게임/이미지 파일 통계
- 자동 경고 시스템 (90% 이상 시 경고)
- 오래된 파일 정리 기능 (dry-run 지원)

---

## 프로젝트 구조

```
DecideX/
├── backend/          # FastAPI 백엔드 (Railway 배포)
│   ├── main.py      # 게임 공유 API + 스토리지 모니터링 API
│   ├── storage_api.py  # 독립 스토리지 모니터링 서버 (선택사항)
│   ├── test_storage.py # 스토리지 기능 테스트 스크립트
│   ├── saved_games/ # 게임 JSON 파일 저장소
│   ├── uploads/     # 업로드된 이미지 저장소
│   ├── requirements.txt
│   ├── Procfile
│   ├── railway.toml
│   ├── nixpacks.toml
│   └── README_RAILWAY.md
└── mindmap-app/      # React 프론트엔드 (Vercel 배포)
    ├── src/
    │   ├── components/
    │   │   ├── SharedGame.js    # 새로 추가
    │   │   ├── ShareModal.js    # 새로 추가
    │   │   └── ShareModal.css   # 새로 추가
    │   └── App.js              # 라우팅 추가됨
    ├── package.json            # react-router-dom 추가됨
    ├── vercel.json
    └── README_VERCEL.md
```

## 배포 아키텍처

- **백엔드**: Railway (FastAPI + Python) + JSON 파일 저장소
- **프론트엔드**: Vercel (React + React Router)
- **데이터베이스**: JSON 파일 (프로덕션에서는 실제 DB 권장)
- **모니터링**: 내장 스토리지 헬스체크 API
- **외부 API**: Claude API, Gemini API

## 📦 새로운 API 엔드포인트

### 게임 공유 API
```
POST /api/games              # 게임 저장 및 ID 생성
GET  /api/games/{id}         # 게임 데이터 조회
GET  /api/games              # 게임 목록 조회 (선택사항)
```

### 스토리지 모니터링 API
```
GET  /api/storage/health     # 스토리지 상태 및 사용량 조회
POST /api/storage/cleanup    # 오래된 파일 정리 (dry-run 지원)
```

## 🚀 배포 순서

### 1단계: 백엔드 배포 (Railway)

1. **환경변수 설정** (기존 + 추가)
   ```env
   # 기존
   CLAUDE_API_KEY=your_actual_claude_api_key
   GEMINI_API_KEY=your_actual_gemini_api_key
   DEBUG=False
   
   # 새로 추가
   GAMES_STORAGE_PATH=/tmp/saved_games
   ```

2. **Railway 볼륨 설정** (선택사항)
   ```bash
   # Railway 대시보드에서 설정
   # Variables > Add Variable
   GAMES_STORAGE_PATH=/app/data
   ```

### 2단계: 프론트엔드 배포 (Vercel)

1. **환경변수 설정** (업데이트됨)
   ```env
   REACT_APP_BACKEND_URL=https://your-railway-domain.railway.app
   REACT_APP_API_URL=https://your-railway-domain.railway.app
   ```

2. **Vercel 라우팅 설정 확인**
   - `vercel.json`이 SPA 라우팅을 지원하는지 확인
   - `/game/*` 경로가 `index.html`로 라우팅되는지 확인

### 3단계: 배포 후 테스트

```bash
# 백엔드 API 테스트
curl https://your-railway-app.railway.app/health

# 게임 저장 테스트
curl -X POST https://your-railway-app.railway.app/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Game","nodes":[],"edges":[],"gameConfig":{}}'

# 스토리지 헬스체크 테스트
curl https://your-railway-app.railway.app/api/storage/health

# 스토리지 정리 테스트 (dry-run)
curl -X POST "https://your-railway-app.railway.app/api/storage/cleanup?days_old=30&dry_run=true"

# 프론트엔드 테스트
# 1. 게임 생성 후 공유 버튼 클릭
# 2. 생성된 URL로 접속하여 게임 플레이 확인
```

## 📊 스토리지 모니터링 사용법

### 1. **헬스체크 API 응답 예시**
```json
{
  "status": "healthy",  // "healthy", "caution", "warning", "error"
  "timestamp": "2025-06-18T23:11:33.079851",
  "games": {
    "total_count": 15,
    "total_size": "12.35 MB",
    "average_size": "823.66 KB",
    "recent_activity": {
      "last_24h": 3,
      "last_7d": 8,
      "last_30d": 15
    }
  },
  "images": {
    "total_count": 25,
    "total_size": "45.2 MB"
  },
  "disk": {
    "total": "10.00 GB",
    "used": "7.50 GB", 
    "free": "2.50 GB",
    "usage_percent": 75.0
  },
  "warnings": []  // 90% 초과시 경고 메시지
}
```

### 2. **자동화된 모니터링**
```bash
# 크론잡으로 주기적 체크 (예: 매일 오전 9시)
0 9 * * * curl -s https://your-app.railway.app/api/storage/health

# 주간 정리 (매주 일요일 새벽 2시)
0 2 * * 0 curl -X POST "https://your-app.railway.app/api/storage/cleanup?days_old=30&dry_run=false"
```

### 3. **Railway 대시보드 통합**
```javascript
// Railway 웹훅을 통한 알림 설정
const response = await fetch('/api/storage/health');
const health = await response.json();

if (health.status === 'warning') {
  // 슬랙/이메일 알림 발송
  sendAlert(`⚠️ 스토리지 사용량: ${health.disk.usage_percent}%`);
}
```

## ⚠️ 프로덕션 고려사항

### 1. **데이터 저장소**
```python
# 현재: JSON 파일 (임시방편)
GAMES_DIR = Path("saved_games")

# 권장: 실제 데이터베이스
# PostgreSQL, MongoDB, Redis 등
```

### 2. **스토리지 용량 관리**
```python
# 권장 용량 제한 설정
MAX_GAMES_COUNT = 1000
MAX_TOTAL_SIZE = 100 * 1024 * 1024  # 100MB

# 자동 정리 정책
AUTO_CLEANUP_DAYS = 30
DISK_WARNING_THRESHOLD = 80  # 80%
DISK_CRITICAL_THRESHOLD = 90  # 90%
```

### 3. **파일 권한 및 보안**
```bash
# Railway의 경우 /tmp 디렉토리 사용
GAMES_STORAGE_PATH=/tmp/saved_games

# 또는 클라우드 스토리지
# AWS S3, Google Cloud Storage 등
```

### 4. **성능 최적화**
```python
# 게임 목록 페이징
@app.get("/api/games")
async def list_games(page: int = 1, limit: int = 20):
    # 페이징 로직

# 스토리지 통계 캐싱
from fastapi_cache import FastAPICache
from fastapi_cache.decorator import cache

@cache(expire=300)  # 5분 캐시
async def storage_health_check():
    # 캐시된 헬스체크
```

## 🔧 배포 후 모니터링

### 1. **스토리지 자동 모니터링**
```bash
# 실시간 헬스체크
curl -s https://your-app.railway.app/api/storage/health | jq '.disk.usage_percent'

# 정리 가능한 파일 확인
curl -X POST "https://your-app.railway.app/api/storage/cleanup?days_old=7&dry_run=true" | jq '.files_found'
```

### 2. **게임 저장소 모니터링**
```bash
# 저장된 게임 수 확인
curl -s https://your-app.railway.app/api/storage/health | jq '.games.total_count'

# 최근 활동 확인
curl -s https://your-app.railway.app/api/storage/health | jq '.games.recent_activity'
```

### 3. **경고 및 알림 시스템**
```python
# 자동 알림 스크립트 예시
import requests
import smtplib

def check_and_alert():
    response = requests.get('https://your-app.railway.app/api/storage/health')
    health = response.json()
    
    if health['status'] in ['warning', 'error']:
        send_email_alert(health)
        
    if health['disk']['usage_percent'] > 90:
        send_slack_alert(health)
```

## 📝 배포 전 체크리스트

### ✅ 백엔드 체크리스트
- [ ] CORS 설정에서 `"*"` 제거됨 (프로덕션 모드)
- [ ] `GAMES_STORAGE_PATH` 환경변수 설정
- [ ] API 키들 올바르게 설정
- [ ] 게임 저장/조회 API 테스트 완료
- [ ] 스토리지 헬스체크 API 작동 확인
- [ ] 스토리지 정리 기능 테스트 완료

### ✅ 프론트엔드 체크리스트
- [ ] `REACT_APP_BACKEND_URL` 올바르게 설정
- [ ] React Router 라우팅 작동 확인
- [ ] 게임 공유 버튼 클릭 시 모달 정상 작동
- [ ] 생성된 URL 접속 시 게임 플레이 가능

### ✅ 통합 테스트
- [ ] 게임 생성 → 공유 → URL 접속 → 플레이 전 과정 테스트
- [ ] 스토리지 헬스체크 → 정리 → 모니터링 전 과정 테스트
- [ ] 모바일 브라우저에서도 정상 작동 확인
- [ ] 다양한 게임 시나리오 테스트

### ✅ 모니터링 설정
- [ ] 스토리지 헬스체크 주기적 실행 설정
- [ ] 디스크 사용량 90% 초과 시 알림 설정
- [ ] 자동 정리 스케줄 설정 (선택사항)
- [ ] Railway 대시보드 모니터링 설정

## 🚨 알려진 제한사항

1. **임시 저장소**: JSON 파일 기반으로 서버 재시작시 데이터 유실 가능
2. **동시성**: 파일 기반이라 대량 동시 접근시 성능 이슈 가능  
3. **보안**: 게임 ID만으로 접근 가능 (인증 없음)
4. **스토리지**: Railway 무료티어 디스크 용량 제한 (1GB)

## 🎯 배포 후 즉시 확인사항

```bash
# 1. 기본 헬스체크
curl https://your-app.railway.app/health

# 2. 스토리지 상태 확인
curl https://your-app.railway.app/api/storage/health

# 3. 테스트 게임 생성
curl -X POST https://your-app.railway.app/api/games \
  -H "Content-Type: application/json" \
  -d '{"title":"배포 테스트","description":"배포 후 첫 게임","nodes":[],"edges":[],"gameConfig":{}}'

# 4. 생성된 게임 조회 (위에서 받은 gameId 사용)
curl https://your-app.railway.app/api/games/{gameId}

# 5. 프론트엔드에서 공유 기능 테스트
# https://your-vercel-app.vercel.app에서 게임 생성 → 공유 → URL 접속 테스트
```

---

## 🎉 **배포 준비 완료!**

✅ **게임 URL 공유 기능**  
✅ **스토리지 헬스체크 및 모니터링**  
✅ **자동 정리 시스템**  
✅ **실시간 디스크 사용량 추적**  

**이제 안전하게 배포하셔도 됩니다!** 🚀
