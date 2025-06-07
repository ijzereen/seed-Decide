# Vercel 배포 가이드

## 1. Vercel 프로젝트 생성

1. [Vercel](https://vercel.com)에 로그인
2. "New Project" 클릭
3. GitHub 저장소 연결
4. `mindmap-app` 폴더를 루트 디렉토리로 설정

## 2. 빌드 설정

Vercel이 자동으로 React 앱을 감지하지만, 수동 설정이 필요한 경우:

### Framework Preset
- **Framework**: Create React App
- **Root Directory**: `mindmap-app`
- **Build Command**: `npm run build`
- **Output Directory**: `build`

## 3. 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정하세요:

### 필수 환경변수
```
REACT_APP_API_URL=https://your-railway-app.railway.app
```

### 설정 방법
1. Vercel 대시보드에서 프로젝트 선택
2. "Settings" 탭으로 이동
3. "Environment Variables" 섹션
4. 변수 추가:
   - **Name**: `REACT_APP_API_URL`
   - **Value**: Railway에서 생성된 백엔드 도메인
   - **Environment**: Production, Preview, Development 모두 선택

## 4. 도메인 설정

### 기본 도메인
Vercel이 자동으로 `your-app-name.vercel.app` 도메인 생성

### 커스텀 도메인 (선택사항)
1. "Settings" > "Domains"
2. 원하는 도메인 추가
3. DNS 설정 완료

## 5. 자동 배포

- `main` 브랜치에 푸시할 때마다 자동 배포
- Pull Request 생성시 Preview 배포 자동 생성

## 6. 성능 최적화

### 빌드 최적화
```json
// package.json에 추가
{
  "scripts": {
    "build": "GENERATE_SOURCEMAP=false react-scripts build"
  }
}
```

### 캐싱 설정
`vercel.json`에서 정적 파일 캐싱 설정됨:
```json
{
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    }
  ]
}
```

## 7. 모니터링

### 배포 상태 확인
- Vercel 대시보드에서 실시간 배포 로그 확인
- 빌드 실패시 상세 에러 메시지 제공

### 성능 모니터링
- Vercel Analytics 활성화 (선택사항)
- Core Web Vitals 자동 측정

## 8. 트러블슈팅

### 빌드 실패
```bash
# 로컬에서 빌드 테스트
cd mindmap-app
npm install
npm run build
```

### 환경변수 문제
- 변수명이 `REACT_APP_`로 시작하는지 확인
- Vercel 대시보드에서 변수가 올바르게 설정되었는지 확인
- 배포 후 재빌드 필요할 수 있음

### API 연결 문제
- Railway 백엔드가 정상 작동하는지 확인
- CORS 설정에 Vercel 도메인이 포함되었는지 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### 라우팅 문제
- SPA 라우팅을 위해 `vercel.json`에 리다이렉트 설정됨
- 모든 경로가 `index.html`로 리다이렉트됨

## 9. 배포 후 확인사항

1. **기본 기능 테스트**
   - 페이지 로딩 확인
   - API 호출 정상 작동 확인
   - 마인드맵 렌더링 확인

2. **성능 확인**
   - 페이지 로드 속도
   - 번들 크기 최적화

3. **모바일 호환성**
   - 반응형 디자인 확인
   - 터치 인터페이스 테스트

## 10. 업데이트 배포

코드 변경 후 배포:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel이 자동으로 새 버전 배포를 시작합니다.
