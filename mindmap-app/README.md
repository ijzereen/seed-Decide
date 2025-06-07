# React Flow 마인드맵 애플리케이션

React Flow를 사용하여 구현한 인터랙티브 마인드맵 애플리케이션입니다.

## 🚀 기능

- **인터랙티브 노드**: 드래그 앤 드롭으로 노드 이동 가능
- **동적 연결**: 노드 간 새로운 연결 생성 가능
- **줌 및 팬**: 마우스 휠로 줌, 드래그로 화면 이동
- **미니맵**: 전체 마인드맵 구조를 한눈에 확인
- **컨트롤 패널**: 줌 인/아웃, 화면 맞춤 기능
- **반응형 디자인**: 모바일 및 데스크톱 지원

## 🛠️ 설치 및 실행

### 필수 요구사항
- Node.js (14.0.0 이상)
- npm 또는 yarn

### 설치
```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm start
```

애플리케이션이 `http://localhost:3000`에서 실행됩니다.

## 📁 프로젝트 구조

```
mindmap-app/
├── src/
│   ├── components/
│   │   └── MindMapUtils.js    # 유틸리티 함수들
│   ├── App.js                 # 메인 애플리케이션 컴포넌트
│   ├── App.css                # 스타일시트
│   └── index.js               # 애플리케이션 진입점
├── public/
└── package.json
```

## 🎨 사용법

### 기본 조작
- **노드 이동**: 노드를 클릭하고 드래그
- **화면 이동**: 빈 공간을 드래그
- **줌**: 마우스 휠 사용 또는 컨트롤 패널의 +/- 버튼
- **노드 연결**: 노드의 연결점을 다른 노드로 드래그

### 컨트롤 패널 기능
- **+**: 줌 인
- **-**: 줌 아웃
- **⌂**: 전체 화면에 맞춤
- **🔒**: 인터랙션 잠금/해제

### 미니맵
- 우측 하단의 미니맵으로 전체 구조 확인
- 미니맵 클릭으로 해당 영역으로 이동

## 🔧 커스터마이징

### 노드 스타일 변경
`src/App.js`의 `initialNodes` 배열에서 노드 스타일을 수정할 수 있습니다:

```javascript
{
  id: '1',
  data: { label: '노드 텍스트' },
  position: { x: 250, y: 25 },
  style: {
    background: '#6ede87',  // 배경색
    color: 'white',         // 텍스트 색상
    border: '1px solid #222138',
    width: 180,             // 너비
  },
}
```

### 새로운 노드 추가
`initialNodes` 배열에 새로운 객체를 추가하고, `initialEdges`에 연결 정보를 추가합니다.

## 🧰 유틸리티 함수

`src/components/MindMapUtils.js`에서 제공하는 유틸리티 함수들:

- `createNewNode()`: 새로운 노드 생성
- `createNewEdge()`: 새로운 연결 생성
- `calculateNodePosition()`: 자동 노드 배치
- `saveMindMapData()`: 로컬 스토리지에 데이터 저장
- `loadMindMapData()`: 저장된 데이터 로드
- `exportMindMapData()`: JSON 파일로 내보내기
- `searchNodes()`: 노드 검색
- `analyzeNodeHierarchy()`: 계층 구조 분석

## 🎯 확장 아이디어

- [ ] 노드 편집 기능 (더블클릭으로 텍스트 편집)
- [ ] 다양한 노드 타입 (이미지, 링크, 체크박스 등)
- [ ] 테마 변경 기능
- [ ] 실시간 협업 기능
- [ ] 파일 가져오기/내보내기 (JSON, XML, 이미지)
- [ ] 검색 및 필터링 기능
- [ ] 노드 그룹화 기능
- [ ] 애니메이션 효과

## 📚 기술 스택

- **React**: 18.x
- **React Flow**: 11.x
- **CSS3**: 스타일링
- **JavaScript ES6+**: 로직 구현

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🔗 참고 자료

- [React Flow 공식 문서](https://reactflow.dev/)
- [React 공식 문서](https://reactjs.org/)
- [마인드맵 디자인 가이드](https://en.wikipedia.org/wiki/Mind_map)
