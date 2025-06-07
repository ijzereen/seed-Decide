# Story Generator API Backend

FastAPI 기반의 인터랙티브 스토리 생성 백엔드 서버입니다.

## 🚀 기능

- **스토리 생성**: Claude 또는 Gemini API를 사용한 AI 스토리 생성
- **컨텍스트 인식**: 부모/자식 노드와 게임 설정을 고려한 스토리 생성
- **스토리 구조 분석**: 노드 그래프의 일관성과 흐름 분석
- **CORS 지원**: React 프론트엔드와의 원활한 통신

## 📦 설치

1. **Python 가상환경 생성 (권장)**
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **의존성 설치**
```bash
pip install -r requirements.txt
```

3. **환경변수 설정**
```bash
cp .env.example .env
# .env 파일을 편집하여 API 키 설정
```

## 🔑 API 키 설정

`.env` 파일에서 다음 중 하나 이상의 API 키를 설정하세요:

### Claude API (Anthropic)
```env
CLAUDE_API_KEY=your_claude_api_key_here
```
- [Anthropic Console](https://console.anthropic.com/)에서 API 키 발급

### Gemini API (Google)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
- [Google AI Studio](https://makersuite.google.com/app/apikey)에서 API 키 발급

## 🏃‍♂️ 실행

### 개발 모드
```bash
python run.py
```

### 직접 실행
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

서버가 시작되면:
- **API 서버**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📚 API 엔드포인트

### POST `/api/generate-story`
스토리 생성 API

**요청 본문:**
```json
{
  "currentNode": {
    "id": "1",
    "label": "왕국의 시작",
    "story": "기존 스토리 내용...",
    "choice": "선택지 텍스트"
  },
  "parentNodes": [...],
  "childNodes": [...],
  "gameConfig": {
    "storyTitle": "나만의 왕국",
    "storyDescription": "중세 판타지 왕국 이야기",
    "statNames": {
      "health": "체력",
      "wealth": "재력",
      "happiness": "행복",
      "power": "권력"
    }
  },
  "allNodes": [...],
  "allEdges": [...],
  "provider": "claude"  // "claude" 또는 "gemini"
}
```

**응답:**
```json
{
  "generatedStory": "생성된 스토리 내용...",
  "suggestions": {
    "wordCount": 150,
    "provider": "claude"
  },
  "metadata": {
    "nodeId": "1",
    "timestamp": "2024-01-01T00:00:00",
    "parentCount": 1,
    "childCount": 2
  }
}
```

### POST `/api/analyze-story`
스토리 구조 분석 API

**요청 본문:**
```json
{
  "nodes": [...],
  "edges": [...]
}
```

**응답:**
```json
{
  "nodeCount": 10,
  "edgeCount": 12,
  "rootNodes": ["1"],
  "leafNodes": ["8", "9", "10"],
  "orphanNodes": [],
  "maxDepth": 4,
  "branchingFactor": 2.1
}
```

### GET `/health`
서버 상태 확인

**응답:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00",
  "claude_configured": true,
  "gemini_configured": false
}
```

## 🔧 설정

### 환경변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| `CLAUDE_API_KEY` | - | Claude API 키 |
| `GEMINI_API_KEY` | - | Gemini API 키 |
| `HOST` | `0.0.0.0` | 서버 호스트 |
| `PORT` | `8000` | 서버 포트 |
| `DEBUG` | `True` | 디버그 모드 |
| `ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:3003` | CORS 허용 도메인 |

## 🎯 스토리 생성 로직

1. **컨텍스트 수집**: 현재 노드, 부모 노드들, 자식 노드들의 정보 수집
2. **프롬프트 구성**: 게임 설정과 노드 관계를 바탕으로 상세한 프롬프트 생성
3. **AI 호출**: 선택된 제공자(Claude/Gemini)의 API 호출
4. **후처리**: 생성된 스토리 정제 및 메타데이터 추가

## 🚀 배포

### Docker (권장)
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["python", "run.py"]
```

### 클라우드 배포
- **Heroku**: `Procfile` 추가
- **Railway**: 자동 감지
- **Vercel**: `vercel.json` 설정
- **AWS Lambda**: Mangum 어댑터 사용

## 🔍 문제 해결

### API 키 오류
```
HTTPException: Claude API key not configured
```
→ `.env` 파일에 올바른 API 키가 설정되었는지 확인

### CORS 오류
```
Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked
```
→ `ALLOWED_ORIGINS` 환경변수에 프론트엔드 URL 추가

### 포트 충돌
```
OSError: [Errno 48] Address already in use
```
→ `PORT` 환경변수를 다른 포트로 변경

## 📝 라이센스

MIT License
