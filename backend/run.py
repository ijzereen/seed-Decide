import uvicorn
import os
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🚀 Starting Story Generator API server...")
    print(f"📍 Server: http://{host}:{port}")
    print(f"📖 API Docs: http://{host}:{port}/docs")
    print(f"🔧 Debug Mode: {debug}")
    
    # API 키 상태 확인
    claude_key = os.getenv("CLAUDE_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")
    
    print(f"🤖 Claude API: {'✅ Configured' if claude_key else '❌ Not configured'}")
    print(f"🤖 Gemini API: {'✅ Configured' if gemini_key else '❌ Not configured'}")
    
    if not claude_key and not gemini_key:
        print("⚠️  Warning: No API keys configured. Please set CLAUDE_API_KEY or GEMINI_API_KEY in .env file")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning"
    )
