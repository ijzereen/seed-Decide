from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import json
import httpx
from datetime import datetime

app = FastAPI(title="Story Generator API", version="1.0.0")

# CORS 설정
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:3003",  # React 개발 서버
    "https://*.vercel.app",   # Vercel 배포 도메인
    "https://*.vercel.com",   # Vercel 커스텀 도메인
]

# 환경변수에서 추가 허용 도메인 가져오기
additional_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
for origin in additional_origins:
    if origin.strip():
        allowed_origins.append(origin.strip())

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
