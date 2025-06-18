// 다국어 텍스트 정의
const translations = {
  ko: {
    // 앱 전체
    appTitle: 'DecideX - 스토리 메이커',
    
    // 메인 메뉴
    gameMode: '게임 모드',
    editorMode: '에디터 모드',
    storyEditor: '스토리 에디터',
    gameConfig: '게임 설정',
    save: '저장하기',
    export: '내보내기',
    import: '가져오기',
    startGame: '게임 시작',
    backToEditor: '에디터로 돌아가기',
    newStory: '새 스토리',
    loadSample: '샘플 불러오기',
    clearAll: '모두 지우기',
    
    // 노드 관련
    node: '노드',
    nodeEditor: '노드 편집기',
    nodeTitle: '노드 제목',
    choice: '선택지',
    story: '스토리',
    statChanges: '스탯 변화',
    imageUpload: '이미지 업로드',
    generating: '생성 중',
    cancel: '취소',
    delete: '삭제',
    
    // 게임 설정
    gameSettings: '게임 설정',
    storyTitle: '스토리 제목',
    storyDescription: '스토리 설명',
    statNamesAndIcons: '스탯 이름 및 아이콘 설정',
    initialStats: '초기 스탯 설정',
    icon: '아이콘',
    name: '이름',
    stat: '스탯',
    
    // 게임 플레이
    gameOver: '게임 오버!',
    finalStats: '최종 스탯',
    restart: '다시 시작',
    leftChoice: '왼쪽 선택지',
    rightChoice: '오른쪽 선택지',
    keyboardHint: '키보드: 왼쪽 선택지 | 오른쪽 선택지',
    
    // 스토리 에디터
    storyGeneration: '스토리 생성',
    generateStory: '스토리 생성',
    generateImage: '이미지 생성',
    provider: '제공자',
    prompt: '프롬프트',
    
    // 안내 메시지
    noNodesMessage: '게임을 시작하려면 최소 하나의 노드가 필요합니다.',
    cannotStartGame: '게임을 시작할 수 없습니다',
    noNodesOrConnection: '노드가 없거나 연결되지 않았습니다.',
    doubleClickToAdd: '빈 공간을 더블클릭하여 노드를 추가하세요',
    doubleClickToEdit: '노드를 더블클릭하여 편집하세요',
    
    // 샘플 스토리
    sampleStory: '샘플 스토리',
    fantasyAdventure: '판타지 모험',
    
    // 도움말
    configGuide: '설정 가이드',
    configGuideItems: {
      storyTitle: '게임의 메인 타이틀',
      storyDescription: '게임의 배경과 설정',
      statIcon: '각 스탯을 나타낼 아이콘 선택',
      statName: '게임에서 사용할 스탯의 이름',
      initialStat: '게임 시작 시 각 스탯의 초기값'
    },
    
    // 범위 안내
    rangeGuide: '0 ~ 100 범위로 설정 (게임 시작 시 초기값)',
    
    // 언어 설정
    language: '언어',
    korean: '한국어',
    japanese: '日本語',
    english: 'English',
    
    // StoryEditor에서 추가된 번역
    storyArchitect: '스토리 설계자',
    nodes: '노드',
    noTitle: '제목 없음',
    treeView: '트리 보기',
    listView: '리스트 보기',
    searchNodes: '노드 검색',
    noStory: '스토리 없음',
    children: '자식 노드',
    enterNodeTitle: '노드 제목을 입력하세요',
    storyContent: '스토리 내용',
    writeStoryHere: '여기에 스토리를 작성하세요',
    choiceText: '선택지 텍스트',
    choiceTextPlaceholder: '이 노드로 이어지는 선택지 텍스트',
    parentNodes: '부모 노드',
    childNodes: '자식 노드',
    noParentNodes: '부모 노드가 없습니다',
    noChildNodes: '자식 노드가 없습니다',
    selectNodeToEdit: '편집할 노드를 선택하세요',
    chooseNodeFromSidebar: '사이드바에서 노드를 선택하여 스토리 내용을 편집하세요.',
    
    // NodeEditor에서 추가된 번역
    storyGenerationUnavailable: '스토리 생성 기능이 사용할 수 없습니다.',
    storyGenerationFailed: '스토리 생성에 실패했습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
    imageFilesOnly: '이미지 파일만 업로드 가능합니다.',
    fileSizeLimit: '파일 크기는 5MB 이하여야 합니다.',
    imageUploadSuccess: '이미지가 성공적으로 업로드되었습니다.',
    serverConnectionError: '서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.',
    imageUploadError: '이미지 업로드에 실패했습니다',
    choiceTextOptional: '선택지 텍스트 (선택사항)',
    storyImagePreview: '스토리 이미지 미리보기',
    changeImage: '이미지 변경',
    uploading: '업로드 중',
    addImage: '이미지 추가',
    imageHelp: '게임에서 이 노드가 표시될 때 함께 보여질 이미지입니다. (선택사항)',
    imageFormats: 'JPG, PNG, GIF 형식, 최대 5MB',
    statChangeRange: '-50 ~ +50 범위로 설정 (0은 변화 없음)',
    usageTips: '사용 팁',
    usageTipItems: {
      nodeTitle: '상황의 간단한 요약',
      storyContent: '플레이어에게 보여질 상세한 상황 설명',
      choiceText: '다른 노드에서 이 노드로 오는 선택지의 텍스트',
      statChanges: '이 선택지를 선택했을 때 변화할 스탯 수치'
    },
    
    // App.js에서 추가된 번역
    dataSaved: '데이터가 저장되었습니다!',
    dataLoadedSuccessfully: '데이터를 성공적으로 불러왔습니다!',
    invalidFileFormat: '올바르지 않은 파일 형식입니다.',
    fileReadError: '파일을 읽는 중 오류가 발생했습니다.'
  },
  
  ja: {
    // アプリ全体
    appTitle: 'DecideX - ストーリーメーカー',
    
    // メインメニュー
    gameMode: 'ゲームモード',
    editorMode: 'エディターモード',
    storyEditor: 'ストーリーエディター',
    gameConfig: 'ゲーム設定',
    save: '保存',
    export: 'エクスポート',
    import: 'インポート',
    startGame: 'ゲーム開始',
    backToEditor: 'エディターに戻る',
    newStory: '新しいストーリー',
    loadSample: 'サンプル読み込み',
    clearAll: 'すべてクリア',
    
    // ノード関連
    node: 'ノード',
    nodeEditor: 'ノードエディター',
    nodeTitle: 'ノードタイトル',
    choice: '選択肢',
    story: 'ストーリー',
    statChanges: 'ステータス変化',
    imageUpload: '画像アップロード',
    generating: '生成中',
    cancel: 'キャンセル',
    delete: '削除',
    
    // ゲーム設定
    gameSettings: 'ゲーム設定',
    storyTitle: 'ストーリータイトル',
    storyDescription: 'ストーリー説明',
    statNamesAndIcons: 'ステータス名とアイコン設定',
    initialStats: '初期ステータス設定',
    icon: 'アイコン',
    name: '名前',
    stat: 'ステータス',
    
    // ゲームプレイ
    gameOver: 'ゲームオーバー！',
    finalStats: '最終ステータス',
    restart: '再開',
    leftChoice: '左の選択肢',
    rightChoice: '右の選択肢',
    keyboardHint: 'キーボード: 左の選択肢 | 右の選択肢',
    
    // ストーリーエディター
    storyGeneration: 'ストーリー生成',
    generateStory: 'ストーリー生成',
    generateImage: '画像生成',
    provider: 'プロバイダー',
    prompt: 'プロンプト',
    
    // 案内メッセージ
    noNodesMessage: 'ゲームを開始するには最低1つのノードが必要です。',
    cannotStartGame: 'ゲームを開始できません',
    noNodesOrConnection: 'ノードがないか、接続されていません。',
    doubleClickToAdd: '空いている場所をダブルクリックしてノードを追加してください',
    doubleClickToEdit: 'ノードをダブルクリックして編集してください',
    
    // サンプルストーリー
    sampleStory: 'サンプルストーリー',
    fantasyAdventure: 'ファンタジーアドベンチャー',
    
    // ヘルプ
    configGuide: '設定ガイド',
    configGuideItems: {
      storyTitle: 'ゲームのメインタイトル',
      storyDescription: 'ゲームの背景と設定',
      statIcon: '各ステータスを表すアイコンを選択',
      statName: 'ゲームで使用するステータスの名前',
      initialStat: 'ゲーム開始時の各ステータスの初期値'
    },
    
    // 範囲案内
    rangeGuide: '0〜100の範囲で設定（ゲーム開始時の初期値）',
    
    // 言語設定
    language: '言語',
    korean: '한국어',
    japanese: '日本語',
    english: 'English',
    
    // StoryEditorで追加された翻訳
    storyArchitect: 'ストーリー設計者',
    nodes: 'ノード',
    noTitle: 'タイトルなし',
    treeView: 'ツリー表示',
    listView: 'リスト表示',
    searchNodes: 'ノード検索',
    noStory: 'ストーリーなし',
    children: '子ノード',
    enterNodeTitle: 'ノードタイトルを入力してください',
    storyContent: 'ストーリー内容',
    writeStoryHere: 'ここにストーリーを書いてください',
    choiceText: '選択肢テキスト',
    choiceTextPlaceholder: 'このノードにつながる選択肢テキスト',
    parentNodes: '親ノード',
    childNodes: '子ノード',
    noParentNodes: '親ノードがありません',
    noChildNodes: '子ノードがありません',
    selectNodeToEdit: '編集するノードを選択してください',
    chooseNodeFromSidebar: 'サイドバーからノードを選択してストーリー内容を編集してください。',
    
    // NodeEditorで追加された翻訳
    storyGenerationUnavailable: 'ストーリー生成機能が利用できません。',
    storyGenerationFailed: 'ストーリー生成に失敗しました。バックエンドサーバーが実行中か確認してください。',
    imageFilesOnly: '画像ファイルのみアップロード可能です。',
    fileSizeLimit: 'ファイルサイズは5MB以下である必要があります。',
    imageUploadSuccess: '画像が正常にアップロードされました。',
    serverConnectionError: 'サーバーに接続できません。バックエンドサーバーが実行中か確認してください。',
    imageUploadError: '画像アップロードに失敗しました',
    choiceTextOptional: '選択肢テキスト（オプション）',
    storyImagePreview: 'ストーリー画像プレビュー',
    changeImage: '画像変更',
    uploading: 'アップロード中',
    addImage: '画像追加',
    imageHelp: 'ゲームでこのノードが表示される際に一緒に表示される画像です。（オプション）',
    imageFormats: 'JPG、PNG、GIF形式、最大5MB',
    statChangeRange: '-50 ~ +50の範囲で設定（0は変化なし）',
    usageTips: '使用ヒント',
    usageTipItems: {
      nodeTitle: '状況の簡単な要約',
      storyContent: 'プレイヤーに表示される詳細な状況説明',
      choiceText: '他のノードからこのノードへの選択肢テキスト',
      statChanges: 'この選択肢を選んだときに変化するステータス数値'
    },
    
    // App.jsで追加された翻訳
    dataSaved: 'データが保存されました！',
    dataLoadedSuccessfully: 'データの読み込みに成功しました！',
    invalidFileFormat: '正しくないファイル形式です。',
    fileReadError: 'ファイルの読み込み中にエラーが発生しました。'
  },
  
  en: {
    // App-wide
    appTitle: 'DecideX - Story Maker',
    
    // Main menu
    gameMode: 'Game Mode',
    editorMode: 'Editor Mode',
    storyEditor: 'Story Editor',
    gameConfig: 'Game Settings',
    save: 'Save',
    export: 'Export',
    import: 'Import',
    startGame: 'Start Game',
    backToEditor: 'Back to Editor',
    newStory: 'New Story',
    loadSample: 'Load Sample',
    clearAll: 'Clear All',
    
    // Node-related
    node: 'Node',
    nodeEditor: 'Node Editor',
    nodeTitle: 'Node Title',
    choice: 'Choice',
    story: 'Story',
    statChanges: 'Stat Changes',
    imageUpload: 'Image Upload',
    generating: 'Generating',
    cancel: 'Cancel',
    delete: 'Delete',
    
    // Game settings
    gameSettings: 'Game Settings',
    storyTitle: 'Story Title',
    storyDescription: 'Story Description',
    statNamesAndIcons: 'Stat Names and Icons',
    initialStats: 'Initial Stats',
    icon: 'Icon',
    name: 'Name',
    stat: 'Stat',
    
    // Game play
    gameOver: 'Game Over!',
    finalStats: 'Final Stats',
    restart: 'Restart',
    leftChoice: 'Left Choice',
    rightChoice: 'Right Choice',
    keyboardHint: 'Keyboard: Left Choice | Right Choice',
    
    // Story editor
    storyGeneration: 'Story Generation',
    generateStory: 'Generate Story',
    generateImage: 'Generate Image',
    provider: 'Provider',
    prompt: 'Prompt',
    storyArchitect: 'Story Architect',
    nodes: 'nodes',
    noTitle: 'No Title',
    treeView: 'Tree',
    listView: 'List',
    searchNodes: 'Search nodes',
    noStory: 'No story',
    children: 'children',
    enterNodeTitle: 'Enter node title',
    storyContent: 'Story Content',
    writeStoryHere: 'Write your story here',
    choiceText: 'Choice Text',
    choiceTextPlaceholder: 'Text for choice leading to this node',
    parentNodes: 'Parent Nodes',
    childNodes: 'Child Nodes',
    noParentNodes: 'No parent nodes',
    noChildNodes: 'No child nodes',
    selectNodeToEdit: 'Select a node to edit',
    chooseNodeFromSidebar: 'Choose a node from the sidebar to start editing its story content.',
    
    // NodeEditor added translations
    storyGenerationUnavailable: 'Story generation feature is unavailable.',
    storyGenerationFailed: 'Story generation failed. Please check if the backend server is running.',
    imageFilesOnly: 'Only image files can be uploaded.',
    fileSizeLimit: 'File size must be 5MB or less.',
    imageUploadSuccess: 'Image uploaded successfully.',
    serverConnectionError: 'Cannot connect to server. Please check if the backend server is running.',
    imageUploadError: 'Image upload failed',
    choiceTextOptional: 'Choice text (optional)',
    storyImagePreview: 'Story image preview',
    changeImage: 'Change image',
    uploading: 'Uploading',
    addImage: 'Add image',
    imageHelp: 'Image that will be shown along with this node in the game. (Optional)',
    imageFormats: 'JPG, PNG, GIF formats, max 5MB',
    statChangeRange: 'Set within -50 ~ +50 range (0 means no change)',
    usageTips: 'Usage Tips',
    usageTipItems: {
      nodeTitle: 'Brief summary of the situation',
      storyContent: 'Detailed situation description shown to players',
      choiceText: 'Text of choice leading to this node from other nodes',
      statChanges: 'Stat values that change when this choice is selected'
    },
    
    // App.js added translations
    dataSaved: 'Data has been saved!',
    dataLoadedSuccessfully: 'Data loaded successfully!',
    invalidFileFormat: 'Invalid file format.',
    fileReadError: 'An error occurred while reading the file.',
    
    // Guide messages
    noNodesMessage: 'At least one node is required to start the game.',
    cannotStartGame: 'Cannot start game',
    noNodesOrConnection: 'No nodes or no connections.',
    doubleClickToAdd: 'Double-click on empty space to add a node',
    doubleClickToEdit: 'Double-click on a node to edit it',
    
    // Sample stories
    sampleStory: 'Sample Story',
    fantasyAdventure: 'Fantasy Adventure',
    
    // Help
    configGuide: 'Configuration Guide',
    configGuideItems: {
      storyTitle: 'Main title of the game',
      storyDescription: 'Background and setting of the game',
      statIcon: 'Select icon to represent each stat',
      statName: 'Name of stats used in the game',
      initialStat: 'Initial value of each stat at game start'
    },
    
    // Range guide
    rangeGuide: 'Set within 0 ~ 100 range (initial value at game start)',
    
    // Language settings
    language: 'Language',
    korean: '한국어',
    japanese: '日本語',
    english: 'English'
  }
};

// 현재 언어 상태를 관리하는 클래스
class I18n {
  constructor() {
    this.currentLanguage = localStorage.getItem('language') || 'ko';
    this.listeners = [];
  }
  
  // 언어 변경
  setLanguage(language) {
    if (translations[language]) {
      this.currentLanguage = language;
      localStorage.setItem('language', language);
      this.notifyListeners();
    }
  }
  
  // 현재 언어 가져오기
  getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  // 번역 텍스트 가져오기
  t(key) {
    const keys = key.split('.');
    let value = translations[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // 키를 찾을 수 없으면 한국어로 폴백
        value = translations.ko;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            return key; // 한국어에도 없으면 키 자체를 반환
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }
  
  // 언어 변경 리스너 추가
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  // 언어 변경 리스너 제거
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  // 리스너들에게 언어 변경 알림
  notifyListeners() {
    this.listeners.forEach(callback => callback(this.currentLanguage));
  }
}

// 싱글톤 인스턴스 생성
const i18n = new I18n();

export default i18n; 