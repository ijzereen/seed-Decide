from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import httpx
import uuid
import shutil
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Story Generator API", version="1.0.0")

# 이미지 업로드 디렉토리 생성
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 게임 저장 디렉토리 생성
# 프로덕션에서는 /tmp나 환경변수로 지정된 경로 사용
GAMES_DIR = Path(os.getenv("GAMES_STORAGE_PATH", "saved_games"))
GAMES_DIR.mkdir(exist_ok=True, parents=True)

# 정적 파일 서빙 설정
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3003",  # React 개발 서버
        "https://decide-x.vercel.app",  # 실제 Vercel 도메인
        "https://*.vercel.app",   # Vercel 배포 도메인
        "https://*.amplifyapp.com",  # Amplify 기본 도메인
        "https://*.amazonaws.com",   # AWS 서비스 도메인
        "https://*.elasticbeanstalk.com",  # Elastic Beanstalk 도메인
        "http://*.elasticbeanstalk.com",   # Elastic Beanstalk HTTP
        "https://*.railway.app",  # Railway 배포 도메인
    ] if os.getenv("DEBUG", "True").lower() == "false" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델 정의
class NodeData(BaseModel):
    id: str
    label: Optional[str] = None
    story: Optional[str] = None
    choice: Optional[str] = None
    statChanges: Optional[Dict[str, int]] = None
    imageUrl: Optional[str] = None  # 이미지 URL 필드 추가

class GameConfig(BaseModel):
    storyTitle: Optional[str] = None
    storyDescription: Optional[str] = None
    statNames: Optional[Dict[str, str]] = None
    initialStats: Optional[Dict[str, int]] = None

class StoryGenerationRequest(BaseModel):
    currentNode: NodeData
    parentNodes: List[NodeData]
    childNodes: List[NodeData]
    gameConfig: GameConfig
    allNodes: List[NodeData]
    allEdges: List[Dict[str, Any]]
    provider: str = "claude"  # "claude" 또는 "gemini"

class StoryGenerationResponse(BaseModel):
    generatedStory: str
    suggestions: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None

class GameData(BaseModel):
    id: Optional[str] = None
    title: str
    description: Optional[str] = None
    nodes: List[NodeData]
    edges: List[Dict[str, Any]]
    gameConfig: GameConfig
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

# API 키 설정 (환경변수에서 가져오기)
CLAUDE_API_KEY = os.getenv("CLAUDE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Claude API 호출 함수
async def generate_story_with_claude(context: StoryGenerationRequest) -> str:
    if not CLAUDE_API_KEY:
        raise HTTPException(status_code=500, detail="Claude API key not configured")
    
    # 컨텍스트 구성
    prompt = build_story_prompt(context)
    
    headers = {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
    }
    
    payload = {
        "model": "claude-3-5-sonnet-20241022",
        "max_tokens": 1000,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers=headers,
            json=payload,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Claude API error: {response.text}"
            )
        
        result = response.json()
        return result["content"][0]["text"]

# Gemini API 호출 함수
async def generate_story_with_gemini(context: StoryGenerationRequest) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key not configured")
    
    prompt = build_story_prompt(context)
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1000,
        }
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            url,
            json=payload,
            timeout=30.0
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Gemini API error: {response.text}"
            )
        
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]

# 스토리 프롬프트 구성 함수
def build_story_prompt(context: StoryGenerationRequest) -> str:
    current_node = context.currentNode
    parent_nodes = context.parentNodes
    child_nodes = context.childNodes
    game_config = context.gameConfig
    
    # 기본 정보
    story_title = game_config.storyTitle or "Interactive Story"
    story_description = game_config.storyDescription or "A branching narrative adventure"
    stat_names = game_config.statNames or {
        "health": "Health",
        "wealth": "Wealth", 
        "happiness": "Happiness",
        "power": "Power"
    }
    
    # 부모 노드 컨텍스트
    parent_context = ""
    if parent_nodes:
        parent_context = "\n\n이전 상황들:\n"
        for i, parent in enumerate(parent_nodes, 1):
            parent_context += f"{i}. {parent.label or f'Node {parent.id}'}: {parent.story or '내용 없음'}\n"
    
    # 자식 노드 컨텍스트 (선택지 힌트)
    child_context = ""
    if child_nodes:
        child_context = "\n\n다음 가능한 선택지들:\n"
        for i, child in enumerate(child_nodes, 1):
            choice_text = child.choice or child.label or f"Node {child.id}"
            child_context += f"{i}. {choice_text}\n"
    
    # 현재 노드 정보
    current_title = current_node.label or f"Node {current_node.id}"
    current_story = current_node.story or ""
    
    prompt = f"""당신은 전문적인 인터랙티브 스토리 작가입니다. 다음 정보를 바탕으로 매력적이고 몰입감 있는 스토리를 작성해주세요.

**게임 설정:**
- 제목: {story_title}
- 배경: {story_description}
- 스탯 시스템: {', '.join([f'{key}({value})' for key, value in stat_names.items()])}

**현재 노드:**
- 제목: {current_title}
- 기존 내용: {current_story or '(비어있음)'}

{parent_context}

{child_context}

**작성 가이드라인:**
1. 기존 스토리가 있다면 그것을 개선하고 확장하세요
2. 이전 상황들과 자연스럽게 연결되도록 작성하세요
3. 다음 선택지들로 이어질 수 있는 상황을 만드세요
4. 플레이어의 감정을 자극하는 생생한 묘사를 포함하세요
5. 3문장 정도의 적절한 길이로 작성하세요
6. 게임의 전체적인 톤과 분위기를 유지하세요

스토리만 작성해주세요 (다른 설명이나 주석 없이):"""

    return prompt

# API 엔드포인트들
@app.get("/")
async def root():
    return {
        "message": "Story Generator API",
        "version": "1.0.0",
        "endpoints": {
            "generate_story": "/api/generate-story",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "claude_configured": bool(CLAUDE_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY)
    }

@app.post("/api/generate-story", response_model=StoryGenerationResponse)
async def generate_story(request: StoryGenerationRequest):
    """
    스토리 생성 API
    
    현재 노드의 컨텍스트를 바탕으로 LLM을 사용해 스토리를 생성합니다.
    """
    try:
        # 제공자에 따라 다른 API 호출
        if request.provider.lower() == "claude":
            generated_story = await generate_story_with_claude(request)
        elif request.provider.lower() == "gemini":
            generated_story = await generate_story_with_gemini(request)
        else:
            raise HTTPException(
                status_code=400,
                detail="Unsupported provider. Use 'claude' or 'gemini'"
            )
        
        # 응답 구성
        response = StoryGenerationResponse(
            generatedStory=generated_story.strip(),
            suggestions={
                "wordCount": len(generated_story.split()),
                "provider": request.provider
            },
            metadata={
                "nodeId": request.currentNode.id,
                "timestamp": datetime.now().isoformat(),
                "parentCount": len(request.parentNodes),
                "childCount": len(request.childNodes)
            }
        )
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Story generation failed: {str(e)}"
        )

@app.post("/api/analyze-story")
async def analyze_story_structure(request: Dict[str, Any]):
    """
    스토리 구조 분석 API
    
    전체 노드 구조를 분석하여 스토리의 일관성과 흐름을 체크합니다.
    """
    try:
        nodes = request.get("nodes", [])
        edges = request.get("edges", [])
        
        # 기본 분석
        analysis = {
            "nodeCount": len(nodes),
            "edgeCount": len(edges),
            "rootNodes": [],
            "leafNodes": [],
            "orphanNodes": [],
            "maxDepth": 0,
            "branchingFactor": 0
        }
        
        # 루트 노드 찾기 (부모가 없는 노드)
        node_ids = {node["id"] for node in nodes}
        target_ids = {edge["target"] for edge in edges}
        source_ids = {edge["source"] for edge in edges}
        
        analysis["rootNodes"] = [
            node["id"] for node in nodes 
            if node["id"] not in target_ids
        ]
        
        # 리프 노드 찾기 (자식이 없는 노드)
        analysis["leafNodes"] = [
            node["id"] for node in nodes 
            if node["id"] not in source_ids
        ]
        
        # 고아 노드 찾기 (연결이 없는 노드)
        connected_nodes = target_ids | source_ids
        analysis["orphanNodes"] = [
            node["id"] for node in nodes 
            if node["id"] not in connected_nodes
        ]
        
        # 평균 분기 계수 계산
        if source_ids:
            branch_counts = {}
            for edge in edges:
                source = edge["source"]
                branch_counts[source] = branch_counts.get(source, 0) + 1
            
            analysis["branchingFactor"] = round(
                sum(branch_counts.values()) / len(branch_counts), 2
            )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

# 이미지 업로드 엔드포인트
@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    try:
        print(f"이미지 업로드 시작: {file.filename}, 타입: {file.content_type}")
        
        # 파일 타입 검증
        if not file.content_type or not file.content_type.startswith('image/'):
            print(f"잘못된 파일 타입: {file.content_type}")
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
        
        # 파일 크기 제한 (5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        content = await file.read()
        print(f"파일 크기: {len(content)} bytes")
        
        if len(content) > max_size:
            print(f"파일 크기 초과: {len(content)} > {max_size}")
            raise HTTPException(status_code=400, detail="파일 크기는 5MB 이하여야 합니다.")
        
        # 고유한 파일명 생성
        if not file.filename or '.' not in file.filename:
            file_extension = 'jpg'  # 기본 확장자
        else:
            file_extension = file.filename.split('.')[-1].lower()
        
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        print(f"파일 저장 경로: {file_path}")
        
        # 파일 저장
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # 파일 URL 반환
        file_url = f"/uploads/{unique_filename}"
        print(f"파일 업로드 성공: {file_url}")
        
        return {"imageUrl": file_url, "filename": unique_filename}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"이미지 업로드 오류: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"이미지 업로드 중 오류가 발생했습니다: {str(e)}")

# 이미지 삭제 엔드포인트
@app.delete("/api/delete-image/{filename}")
async def delete_image(filename: str):
    try:
        print(f"이미지 삭제 요청: {filename}")
        file_path = UPLOAD_DIR / filename
        
        if file_path.exists():
            file_path.unlink()
            print(f"이미지 삭제 성공: {filename}")
            return {"message": "이미지가 삭제되었습니다."}
        else:
            print(f"파일을 찾을 수 없음: {filename}")
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"이미지 삭제 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"이미지 삭제 중 오류가 발생했습니다: {str(e)}")

# 게임 저장 API
@app.post("/api/games", response_model=Dict[str, str])
async def save_game(game_data: GameData):
    """게임 데이터를 JSON 파일로 저장하고 공유 가능한 ID를 반환"""
    try:
        # 8자리 게임 ID 생성
        game_id = str(uuid.uuid4())[:8]
        game_file = GAMES_DIR / f"{game_id}.json"
        
        # 게임 데이터 준비
        game_dict = {
            "id": game_id,
            "title": game_data.title,
            "description": game_data.description,
            "nodes": [node.dict() for node in game_data.nodes],
            "edges": game_data.edges,
            "gameConfig": game_data.gameConfig.dict(),
            "createdAt": datetime.now().isoformat(),
            "updatedAt": datetime.now().isoformat()
        }
        
        # JSON 파일로 저장
        with open(game_file, 'w', encoding='utf-8') as f:
            json.dump(game_dict, f, ensure_ascii=False, indent=2)
        
        print(f"게임 저장 성공: {game_id}")
        return {"gameId": game_id, "shareUrl": f"/game/{game_id}"}
        
    except Exception as e:
        print(f"게임 저장 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"게임 저장 중 오류가 발생했습니다: {str(e)}")

# 게임 조회 API
@app.get("/api/games/{game_id}")
async def get_game(game_id: str):
    """게임 ID로 게임 데이터 조회"""
    try:
        game_file = GAMES_DIR / f"{game_id}.json"
        
        if not game_file.exists():
            print(f"게임을 찾을 수 없음: {game_id}")
            raise HTTPException(status_code=404, detail="게임을 찾을 수 없습니다.")
        
        with open(game_file, 'r', encoding='utf-8') as f:
            game_data = json.load(f)
        
        print(f"게임 조회 성공: {game_id}")
        return game_data
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"게임 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"게임 조회 중 오류가 발생했습니다: {str(e)}")

# 게임 목록 조회 API (옵션)
@app.get("/api/games")
async def list_games():
    """저장된 게임 목록 조회"""
    try:
        games = []
        for game_file in GAMES_DIR.glob("*.json"):
            try:
                with open(game_file, 'r', encoding='utf-8') as f:
                    game_data = json.load(f)
                
                # 요약 정보만 포함
                games.append({
                    "id": game_data.get("id"),
                    "title": game_data.get("title"),
                    "description": game_data.get("description"),
                    "createdAt": game_data.get("createdAt"),
                    "nodeCount": len(game_data.get("nodes", [])),
                    "edgeCount": len(game_data.get("edges", []))
                })
            except Exception as e:
                print(f"게임 파일 읽기 오류: {game_file.name}, {str(e)}")
                continue
        
        # 생성일시 기준 내림차순 정렬
        games.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        
        return {"games": games, "count": len(games)}
        
    except Exception as e:
        print(f"게임 목록 조회 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"게임 목록 조회 중 오류가 발생했습니다: {str(e)}")

# 스토리지 모니터링 API
@app.get("/api/storage/health")
async def storage_health_check():
    """스토리지 사용량 및 상태 모니터링"""
    try:
        import shutil
        
        # 게임 파일 통계
        game_files = list(GAMES_DIR.glob("*.json"))
        total_games = len(game_files)
        
        # 각 게임 파일 크기 계산
        total_size_bytes = 0
        largest_file_size = 0
        smallest_file_size = float('inf')
        
        for game_file in game_files:
            try:
                size = game_file.stat().st_size
                total_size_bytes += size
                largest_file_size = max(largest_file_size, size)
                smallest_file_size = min(smallest_file_size, size)
            except:
                continue
        
        # 평균 파일 크기
        avg_file_size = total_size_bytes / total_games if total_games > 0 else 0
        
        # 사람이 읽기 쉬운 크기 변환 함수
        def format_bytes(bytes_value):
            for unit in ['B', 'KB', 'MB', 'GB']:
                if bytes_value < 1024.0:
                    return f"{bytes_value:.2f} {unit}"
                bytes_value /= 1024.0
            return f"{bytes_value:.2f} TB"
        
        # 이미지 파일 통계
        image_files = list(UPLOAD_DIR.glob("*"))
        total_images = len([f for f in image_files if f.is_file()])
        total_image_size_bytes = sum(f.stat().st_size for f in image_files if f.is_file())
        
        # 디스크 사용량 (가능한 경우)
        try:
            disk_usage = shutil.disk_usage(GAMES_DIR.parent)
            total_disk = disk_usage.total
            used_disk = disk_usage.used
            free_disk = disk_usage.free
            disk_usage_percent = (used_disk / total_disk) * 100
        except:
            total_disk = used_disk = free_disk = disk_usage_percent = None
        
        # 게임 생성 시간별 통계
        from datetime import datetime, timedelta
        
        now = datetime.now()
        games_24h = games_7d = games_30d = 0
        
        for game_file in game_files:
            try:
                with open(game_file, 'r', encoding='utf-8') as f:
                    game_data = json.load(f)
                created_at_str = game_data.get('createdAt', '')
                if created_at_str:
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    
                    if now - created_at <= timedelta(hours=24):
                        games_24h += 1
                    if now - created_at <= timedelta(days=7):
                        games_7d += 1
                    if now - created_at <= timedelta(days=30):
                        games_30d += 1
            except:
                continue
        
        # 응답 데이터 구성
        storage_info = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "games": {
                "total_count": total_games,
                "total_size": format_bytes(total_size_bytes),
                "total_size_bytes": total_size_bytes,
                "average_size": format_bytes(avg_file_size),
                "largest_size": format_bytes(largest_file_size) if total_games > 0 else "0 B",
                "smallest_size": format_bytes(smallest_file_size) if total_games > 0 and smallest_file_size != float('inf') else "0 B",
                "recent_activity": {
                    "last_24h": games_24h,
                    "last_7d": games_7d,
                    "last_30d": games_30d
                }
            },
            "images": {
                "total_count": total_images,
                "total_size": format_bytes(total_image_size_bytes),
                "total_size_bytes": total_image_size_bytes
            },
            "storage_paths": {
                "games_directory": str(GAMES_DIR),
                "images_directory": str(UPLOAD_DIR)
            }
        }
        
        # 디스크 정보 추가
        if disk_usage_percent is not None:
            storage_info["disk"] = {
                "total": format_bytes(total_disk),
                "used": format_bytes(used_disk),
                "free": format_bytes(free_disk),
                "usage_percent": round(disk_usage_percent, 2)
            }
            
            # 경고 시스템
            if disk_usage_percent > 90:
                storage_info["status"] = "warning"
                storage_info["warnings"] = ["⚠️ 디스크 사용량이 90%를 초과했습니다!"]
            elif disk_usage_percent > 80:
                storage_info["status"] = "caution"
                storage_info["warnings"] = ["⚠️ 디스크 사용량이 80%를 초과했습니다."]
        
        # 게임 파일 수 경고
        if total_games > 1000:
            if "warnings" not in storage_info:
                storage_info["warnings"] = []
            storage_info["warnings"].append(f"📁 게임 파일 수가 {total_games}개로 많습니다. 정리를 고려해보세요.")
        
        return storage_info
        
    except Exception as e:
        print(f"스토리지 헬스체크 오류: {str(e)}")
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "games": {"total_count": 0, "total_size": "0 B"},
            "images": {"total_count": 0, "total_size": "0 B"}
        }

# 스토리지 정리 API (관리자용)
@app.post("/api/storage/cleanup")
async def cleanup_storage(days_old: int = 30, dry_run: bool = True):
    """오래된 게임 파일 정리 (기본 30일 이상)"""
    try:
        from datetime import datetime, timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days_old)
        files_to_delete = []
        total_size_to_free = 0
        
        for game_file in GAMES_DIR.glob("*.json"):
            try:
                with open(game_file, 'r', encoding='utf-8') as f:
                    game_data = json.load(f)
                
                created_at_str = game_data.get('createdAt', '')
                if created_at_str:
                    created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                    
                    if created_at < cutoff_date:
                        file_size = game_file.stat().st_size
                        files_to_delete.append({
                            "file": game_file.name,
                            "created_at": created_at.isoformat(),
                            "size_bytes": file_size,
                            "title": game_data.get('title', 'Unknown')
                        })
                        total_size_to_free += file_size
                    
            except Exception as e:
                print(f"파일 분석 오류: {game_file.name}, {str(e)}")
                continue
        
        # dry_run이 False인 경우에만 실제 삭제
        deleted_files = []
        if not dry_run:
            for file_info in files_to_delete:
                try:
                    file_path = GAMES_DIR / file_info["file"]
                    file_path.unlink()
                    deleted_files.append(file_info)
                except Exception as e:
                    print(f"파일 삭제 오류: {file_info['file']}, {str(e)}")
                    continue
        
        def format_bytes(bytes_value):
            for unit in ['B', 'KB', 'MB', 'GB']:
                if bytes_value < 1024.0:
                    return f"{bytes_value:.2f} {unit}"
                bytes_value /= 1024.0
            return f"{bytes_value:.2f} TB"
        
        return {
            "status": "success",
            "dry_run": dry_run,
            "cutoff_date": cutoff_date.isoformat(),
            "days_old": days_old,
            "files_found": len(files_to_delete),
            "files_deleted": len(deleted_files),
            "space_would_free": format_bytes(total_size_to_free),
            "space_freed": format_bytes(sum(f["size_bytes"] for f in deleted_files)),
            "files": files_to_delete if dry_run else deleted_files
        }
        
    except Exception as e:
        print(f"스토리지 정리 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"스토리지 정리 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
