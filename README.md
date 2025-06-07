# AI Reigns - Local Development

AI를 활용한 Reigns 스타일 게임 프로젝트입니다.

## 프로젝트 구조

```
ai_reigns_0605/
├── backend/          # Flask 백엔드 서버
│   ├── application.py
│   ├── main.py
│   ├── run.py
│   ├── requirements.txt
│   └── .env.example
└── mindmap-app/      # React 프론트엔드
    ├── src/
    ├── public/
    └── package.json
```

## 로컬 실행 방법

### 백엔드 실행

1. backend 디렉토리로 이동:
```bash
cd backend
```

2. 가상환경 생성 및 활성화:
```bash
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 또는 venv\Scripts\activate  # Windows
```

3. 의존성 설치:
```bash
pip install -r requirements.txt
```

4. 환경변수 설정:
```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 설정 추가
```

5. 서버 실행:
```bash
python run.py
```

백엔드 서버가 http://localhost:5000 에서 실행됩니다.

### 프론트엔드 실행

1. mindmap-app 디렉토리로 이동:
```bash
cd mindmap-app
```

2. 의존성 설치:
```bash
npm install
```

3. 개발 서버 실행:
```bash
npm start
```

프론트엔드가 http://localhost:3000 에서 실행됩니다.

## 개발 환경

- Backend: Python Flask
- Frontend: React
- 로컬 개발용으로 최적화됨
