# Railway 배포 가이드

## 1. Railway 프로젝트 생성

1. [Railway](https://railway.app)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 이 저장소의 `backend` 폴더 선택

## 2. 환경변수 설정

Railway 대시보드에서 다음 환경변수들을 설정하세요:

### 필수 환경변수
```
CLAUDE_API_KEY=your_actual_claude_api_key
GEMINI_API_KEY=your_actual_gemini_api_key
```

### 선택적 환경변수
```
DEBUG=False
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-custom-domain.com
```

## 3. 배포 설정

Railway는 다음 파일들을 자동으로 감지합니다:
- `requirements.txt` - Python 의존성
- `Procfile` - 서버 실행 명령
- `railway.toml` - Railway 설정
- `runtime.txt` - Python 버전 지정

## 4. 도메인 설정

1. Railway 대시보드에서 "Settings" 탭으로 이동
2. "Domains" 섹션에서 커스텀 도메인 추가 (선택사항)
3. 생성된 Railway 도메인을 프론트엔드 환경변수에 추가

## 5. 헬스체크

배포 후 다음 엔드포인트로 서버 상태 확인:
```
GET https://your-railway-domain.railway.app/health
```

## 6. 로그 확인

Railway 대시보드에서 "Deployments" 탭에서 실시간 로그 확인 가능

## 7. 자동 배포

GitHub에 푸시할 때마다 자동으로 재배포됩니다.

## 트러블슈팅

### 빌드 실패
- `requirements.txt`의 패키지 버전 확인
- Python 버전 호환성 확인 (Python 3.9 사용)

### API 키 오류
- Railway 환경변수에 올바른 API 키가 설정되었는지 확인
- 키에 특수문자나 공백이 없는지 확인

### CORS 오류
- `ALLOWED_ORIGINS`에 프론트엔드 도메인이 포함되었는지 확인
- 프로토콜(https/http)이 정확한지 확인
