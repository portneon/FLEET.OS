import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loguru import logger
import uvicorn

os.environ["TOKENIZERS_PARALLELISM"] = "false"

from services.rag_service import answer_query
from services.ingestion_service import ingest_knowledge_base

app = FastAPI(title="FleetOS RAG Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    query: str


class ChatResponse(BaseModel):
    answer: str


@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        if not request.query:
            raise HTTPException(status_code=400, detail="Query is required")

        answer = answer_query(request.query)
        return ChatResponse(answer=answer)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Error processing chat query: {request.query}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ingest")
async def ingest_endpoint():
    try:
        success = ingest_knowledge_base()
        if success:
            return {"message": "Knowledge base successfully ingested into Vector DB."}
        else:
            raise HTTPException(status_code=500, detail="Ingestion failed. Check logs.")
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error during ingestion")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
