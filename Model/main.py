from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from RAG import novelty
from RAG import cost
from RAG import plag
from RAG import rag_chat_guidlines
from RAG import rag_chat_specialist
from RAG import timeline
from RAG import similarity_checker
from live_checker import online_checker
from Json_extraction import extractor
import uvicorn

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(timeline.router)
app.include_router(similarity_checker.router)
app.include_router(rag_chat_guidlines.router)
app.include_router(rag_chat_specialist.router)
app.include_router(extractor.router)
app.include_router(novelty.router)
app.include_router(cost.router)
app.include_router(plag.router)
app.include_router(online_checker.app)
# -----------------------------
# Run FastAPI directly with Python
# -----------------------------
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
