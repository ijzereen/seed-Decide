# DecideX - AI Interactive Story Generator

AI를 활용한 인터랙티브 스토리 생성기입니다. 마인드맵 인터페이스와 Reigns 스타일 게임을 결합하여 몰입감 있는 스토리텔링 경험을 제공합니다.

## 🚀 배포된 서비스

- **프론트엔드**: Vercel에서 호스팅
- **백엔드**: Railway에서 호스팅
- **AI 엔진**: Claude & Gemini API

## ✨ 주요 기능

- 🤖 AI 기반 스토리 자동 생성 (Claude/Gemini)
- 🗺️ 마인드맵 시각화로 스토리 구조 관리
- 👑 Reigns 스타일 선택 기반 게임플레이
- ⚡ 실시간 스토리 생성 및 편집
- 📊 스토리 구조 분석 및 최적화

## 🏗️ 기술 스택

### 프론트엔드
- **React** 19.1.0 - 사용자 인터페이스
- **ReactFlow** 11.11.4 - 마인드맵 시각화
- **Create React App** - 빌드 도구

### 백엔드
- **FastAPI** 0.104.1 - 웹 프레임워크
- **Python** 3.9+ - 서버 언어
- **Uvicorn** - ASGI 서버
- **Gunicorn** - 프로덕션 서버

### AI & 외부 서비스
- **Anthropic Claude** - 스토리 생성
- **Google Gemini** - 대안 AI 엔진
- **Railway** - 백엔드 배포
- **Vercel** - 프론트엔드 배포

## 📁 프로젝트 구조

```
DecideX/
├── backend/                 # FastAPI 백엔드
│   ├── main.py             # 메인 서버 로직
│   ├── requirements.txt    # Python 의존성
│   ├── Procfile           # Railway 배포 설정
│   ├── railway.toml       # Railway 구성
│   ├── nixpacks.toml      # 빌드 설정
│   └── README_RAILWAY.md  # Railway 배포 가이드
├── mindmap-app/            # React 프론트엔드
│   ├── src/               # 소스 코드
│   ├── public/            # 정적 파일
│   ├── package.json       # Node.js 의존성
│   ├── vercel.json        # Vercel 배포 설정
│   └── README_VERCEL.md   # Vercel 배포 가이드
├── DEPLOYMENT_GUIDE.md     # 전체 배포 가이드
└── README.md              # 이 파일
```

## 🚀 빠른 시작

### 로컬 개발 환경 설정

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd DecideX
   ```

2. **백엔드 설정**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # .env 파일에 API 키 추가
   python run.py
   ```

3. **프론트엔드 설정**
   ```bash
   cd mindmap-app
   npm install
   npm start
   ```

4. **브라우저에서 확인**
   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:8000

### 환경변수 설정

#### 백엔드 (.env)
```env
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000
```

#### 프론트엔드 (.env)
```env
REACT_APP_API_URL=http://localhost:8000
```

## 🌐 배포하기

### Railway + Vercel 배포

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

#### 간단 배포 단계:

1. **백엔드 (Railway)**
   - Railway에 GitHub 저장소 연결
   - `backend` 폴더 선택
   - 환경변수 설정 (API 키)

2. **프론트엔드 (Vercel)**
   - Vercel에 GitHub 저장소 연결
   - `mindmap-app` 폴더 선택
   - 환경변수 설정 (Railway 도메인)

## 🎮 사용법

1. **게임 설정**
   - 스토리 제목과 배경 설정
   - 캐릭터 스탯 정의 (체력, 재력, 행복, 권력 등)

2. **스토리 생성**
   - AI를 통한 자동 스토리 생성
   - 마인드맵에서 노드 편집
   - 선택지와 결과 설정

3. **게임 플레이**
   - Reigns 스타일 카드 인터페이스
   - 선택에 따른 스탯 변화
   - 분기형 스토리 진행

## 🔧 개발 도구

### 유용한 명령어

```bash
# 백엔드 테스트
cd backend && python -m pytest

# 프론트엔드 빌드
cd mindmap-app && npm run build

# 프론트엔드 번들 분석
cd mindmap-app && npm run build:analyze

# 의존성 업데이트 확인
cd backend && pip list --outdated
cd mindmap-app && npm outdated
```

### API 엔드포인트

- `GET /` - API 정보
- `GET /health` - 서버 상태 확인
- `POST /api/generate-story` - 스토리 생성
- `POST /api/analyze-story` - 스토리 구조 분석

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 문제 해결

### 일반적인 문제들

- **CORS 오류**: 백엔드 CORS 설정 확인
- **API 키 오류**: 환경변수 설정 확인
- **빌드 실패**: 의존성 버전 호환성 확인

자세한 트러블슈팅은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#트러블슈팅)를 참조하세요.

## 📞 지원

문제가 있거나 질문이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**DecideX** - AI와 함께 만드는 인터랙티브 스토리의 새로운 경험 🎭✨
