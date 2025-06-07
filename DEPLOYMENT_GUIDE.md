# DecideX 배포 가이드

## 프로젝트 구조

```
DecideX/
├── backend/          # FastAPI 백엔드 (Railway 배포)
│   ├── main.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── railway.toml
│   ├── nixpacks.toml
│   └── README_RAILWAY.md
└── mindmap-app/      # React 프론트엔드 (Vercel 배포)
    ├── src/
    ├── package.json
    ├── vercel.json
    └── README_VERCEL.md
```

## 배포 아키텍처

- **백엔드**: Railway (FastAPI + Python)
- **프론트엔드**: Vercel (React)
- **데이터베이스**: 없음 (상태 기반)
- **외부 API**: Claude API, Gemini API

## 배포 순서

### 1단계: 백엔드 배포 (Railway)

1. **Railway 계정 생성 및 프로젝트 설정**
   ```bash
   # Railway CLI 설치 (선택사항)
   npm install -g @railway/cli
   railway login
   ```

2. **GitHub 저장소 연결**
   - Railway 대시보드에서 "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택 후 `backend` 폴더 지정

3. **환경변수 설정**
   ```
   CLAUDE_API_KEY=your_actual_claude_api_key
   GEMINI_API_KEY=your_actual_gemini_api_key
   DEBUG=False
   ```

4. **배포 확인**
   ```bash
   curl https://your-railway-domain.railway.app/health
   ```

### 2단계: 프론트엔드 배포 (Vercel)

1. **Vercel 계정 생성 및 프로젝트 설정**
   ```bash
   # Vercel CLI 설치 (선택사항)
   npm install -g vercel
   vercel login
   ```

2. **GitHub 저장소 연결**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - Root Directory를 `mindmap-app`으로 설정

3. **환경변수 설정**
   ```
   REACT_APP_API_URL=https://your-railway-domain.railway.app
   ```

4. **배포 확인**
   - Vercel이 제공하는 도메인으로 접속
   - API 연결 상태 확인

### 3단계: CORS 설정 업데이트

백엔드의 CORS 설정에 Vercel 도메인 추가:

```bash
# Railway 환경변수에 추가
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:3000
```

## API 키 발급

### Claude API
1. [Anthropic Console](https://console.anthropic.com/) 접속
2. API Keys 섹션에서 새 키 생성
3. Railway 환경변수에 `CLAUDE_API_KEY` 설정

### Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 생성
3. Railway 환경변수에 `GEMINI_API_KEY` 설정

## 환경변수 관리

### Railway (백엔드)
```env
# 필수
CLAUDE_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=AIzaSy...

# 선택사항
DEBUG=False
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
```

### Vercel (프론트엔드)
```env
# 필수
REACT_APP_API_URL=https://your-railway-app.railway.app
```

## 자동 배포 설정

### GitHub Actions (선택사항)
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: echo "Railway auto-deploys on push"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: echo "Vercel auto-deploys on push"
```

## 모니터링 및 로그

### Railway 모니터링
- 대시보드에서 실시간 로그 확인
- 메트릭스 및 성능 모니터링
- 헬스체크: `/health` 엔드포인트

### Vercel 모니터링
- 배포 로그 및 빌드 상태
- Analytics (선택사항)
- Core Web Vitals 측정

## 트러블슈팅

### 일반적인 문제들

1. **CORS 오류**
   ```
   해결: Railway 환경변수에 Vercel 도메인 추가
   ALLOWED_ORIGINS=https://your-app.vercel.app
   ```

2. **API 키 오류**
   ```
   해결: Railway 환경변수에 올바른 API 키 설정
   확인: /health 엔드포인트에서 키 상태 확인
   ```

3. **빌드 실패**
   ```bash
   # 로컬에서 테스트
   cd backend && pip install -r requirements.txt
   cd mindmap-app && npm install && npm run build
   ```

4. **환경변수 미적용**
   ```
   해결: 배포 후 재시작 또는 재배포 필요
   Railway: Settings > Redeploy
   Vercel: Deployments > Redeploy
   ```

## 성능 최적화

### 백엔드 최적화
- Gunicorn 워커 수 조정 (현재 4개)
- API 응답 캐싱 구현
- 데이터베이스 연결 풀링 (필요시)

### 프론트엔드 최적화
- 소스맵 비활성화 (`GENERATE_SOURCEMAP=false`)
- 번들 크기 분석 (`npm run build:analyze`)
- 이미지 최적화 및 lazy loading

## 보안 고려사항

1. **API 키 보안**
   - 환경변수로만 관리
   - 로그에 노출되지 않도록 주의
   - 정기적인 키 로테이션

2. **CORS 설정**
   - 프로덕션에서는 특정 도메인만 허용
   - 와일드카드(*) 사용 금지

3. **HTTPS 강제**
   - Railway와 Vercel 모두 기본적으로 HTTPS 제공
   - HTTP 요청 리다이렉트 설정

## 비용 관리

### Railway
- 무료 티어: 월 $5 크레딧
- 사용량 모니터링 필요
- 슬립 모드 설정으로 비용 절약

### Vercel
- 무료 티어: 개인 프로젝트 충분
- 대역폭 및 빌드 시간 제한 확인
- 커스텀 도메인은 Pro 플랜 필요

## 백업 및 복구

### 코드 백업
- GitHub 저장소가 주 백업
- 정기적인 커밋 및 푸시

### 환경변수 백업
- Railway 및 Vercel 설정 문서화
- `.env.example` 파일 유지

### 데이터 백업
- 현재 상태 기반 앱으로 별도 백업 불필요
- 사용자 데이터는 브라우저 로컬 스토리지

## 업데이트 및 유지보수

### 정기 업데이트
```bash
# 의존성 업데이트
cd backend && pip list --outdated
cd mindmap-app && npm outdated

# 보안 업데이트
npm audit fix
pip-audit
```

### 모니터링 체크리스트
- [ ] API 응답 시간
- [ ] 에러 로그 확인
- [ ] 사용량 모니터링
- [ ] 보안 업데이트 확인

이 가이드를 따라 배포하면 Railway와 Vercel을 통해 안정적이고 확장 가능한 웹 애플리케이션을 운영할 수 있습니다.
