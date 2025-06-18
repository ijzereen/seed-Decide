#!/usr/bin/env python3
"""
스토리지 모니터링 전용 FastAPI 서버
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import shutil
from pathlib import Path
from datetime import datetime, timedelta

app = FastAPI(title="Storage Health Monitor", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 디렉토리 설정
GAMES_DIR = Path("saved_games")
UPLOAD_DIR = Path("uploads")

def format_bytes(bytes_value):
    """바이트를 읽기 쉬운 형태로 변환"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.2f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.2f} TB"

@app.get("/")
def root():
    return {"message": "Storage Health Monitor API", "endpoints": ["/health", "/storage/health", "/storage/cleanup"]}

@app.get("/health")
def basic_health():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}

@app.get("/storage/health")
def storage_health_check():
    """스토리지 사용량 및 상태 모니터링"""
    try:
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
        
        # 이미지 파일 통계
        image_files = list(UPLOAD_DIR.glob("*"))
        total_images = len([f for f in image_files if f.is_file()])
        total_image_size_bytes = sum(f.stat().st_size for f in image_files if f.is_file())
        
        # 디스크 사용량
        try:
            disk_usage = shutil.disk_usage(GAMES_DIR.parent)
            total_disk = disk_usage.total
            used_disk = disk_usage.used
            free_disk = disk_usage.free
            disk_usage_percent = (used_disk / total_disk) * 100
        except:
            total_disk = used_disk = free_disk = disk_usage_percent = None
        
        # 최근 활동 통계
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
        
        # 결과 구성
        result = {
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
            result["disk"] = {
                "total": format_bytes(total_disk),
                "used": format_bytes(used_disk),
                "free": format_bytes(free_disk),
                "usage_percent": round(disk_usage_percent, 2)
            }
            
            # 경고 시스템
            if disk_usage_percent > 90:
                result["status"] = "warning"
                result["warnings"] = ["⚠️ 디스크 사용량이 90%를 초과했습니다!"]
            elif disk_usage_percent > 80:
                result["status"] = "caution"
                result["warnings"] = ["⚠️ 디스크 사용량이 80%를 초과했습니다."]
        
        # 게임 파일 수 경고
        if total_games > 1000:
            if "warnings" not in result:
                result["warnings"] = []
            result["warnings"].append(f"📁 게임 파일 수가 {total_games}개로 많습니다. 정리를 고려해보세요.")
        
        return result
        
    except Exception as e:
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e),
            "games": {"total_count": 0, "total_size": "0 B"},
            "images": {"total_count": 0, "total_size": "0 B"}
        }

@app.post("/storage/cleanup")
def cleanup_storage(days_old: int = 30, dry_run: bool = True):
    """오래된 게임 파일 정리"""
    try:
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
                    continue
        
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
        raise HTTPException(status_code=500, detail=f"스토리지 정리 중 오류: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 