# AI Reigns 프로젝트 구조 및 배포 문서

## 1. 프로젝트 구조

### 프론트엔드 (React)
위치: `/mindmap-app`
- **주요 컴포넌트**:
  - `ReignsGame.js`: 메인 게임 로직
  - `GameConfig.js`: 게임 설정
  - `StoryEditor.js`: 스토리 에디터
  - `NodeEditor.js`: 노드 편집
  - `MindMapUtils.js`: 마인드맵 유틸리티

### 백엔드 (Python)
위치: `/backend`
- **주요 파일**:
  - `main.py`: 메인 서버 로직
  - `run.py`: 서버 실행
  - `requirements.txt`: 파이썬 의존성

## 2. API 키 요구사항

필요한 API 키들:
- Anthropic Claude API
- Google Gemini API

## 3. 환경 설정

### 프론트엔드 환경 변수
위치: `/mindmap-app/.env`
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 백엔드 환경 변수
위치: `/backend/.env`
```
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
HOST=0.0.0.0
PORT=8000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3003
```

## 4. 빌드 및 실행 방법

### 프론트엔드
```bash
cd mindmap-app
npm install
npm run build  # 프로덕션 빌드
npm start      # 개발 서버
```

### 백엔드
```bash
cd backend
pip install -r requirements.txt
python run.py
```

## 5. 특이사항

1. 프론트엔드는 React 기반의 마인드맵과 Reigns 스타일 게임 UI를 결합
2. 백엔드는 Claude와 Gemini API를 활용한 스토리 생성 로직 구현
3. CORS 설정이 되어 있어 프론트엔드와 백엔드 도메인이 다를 경우 `ALLOWED_ORIGINS` 수정 필요

## 6. 데이터 흐름

1. 사용자가 게임 설정을 입력
2. 프론트엔드에서 백엔드로 설정 전송
3. 백엔드에서 AI API를 통해 스토리 생성
4. 생성된 스토리를 프론트엔드로 전송하여 렌더링

## 7. 보안 고려사항

1. API 키는 반드시 환경변수로 관리
2. `.env` 파일은 `.gitignore`에 포함되어 있음
3. 프로덕션 배포 시 API 키 노출 주의

## 8. 성능 고려사항

1. AI API 호출은 비동기로 처리
2. 마인드맵 렌더링 최적화 구현
3. 스토리 데이터 캐싱 고려 필요
