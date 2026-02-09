from uuid import UUID

import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

try:
    from backend.config import CORS_ORIGINS
    from backend.schemas import GenerateRequest, Generation
    from backend.services.ollama_service import OllamaError, generate_image_bytes
    from backend.services.supabase_service import (
        SupabaseError,
        fetch_history,
        insert_generation,
        upload_image,
        delete_generation,
    )
except ModuleNotFoundError:
    from config import CORS_ORIGINS
    from schemas import GenerateRequest, Generation
    from services.ollama_service import OllamaError, generate_image_bytes
    from services.supabase_service import (
        SupabaseError,
        fetch_history,
        insert_generation,
        upload_image,
        delete_generation,
    )

app = FastAPI(title="Mapic API", version="1.0.0")
logger = logging.getLogger("mapic")

origins = [origin.strip() for origin in CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/generate", response_model=Generation)
async def generate(payload: GenerateRequest):
    try:
        image_bytes = await generate_image_bytes(payload.prompt, payload.model)
        image_path, public_url = upload_image(payload.user_id, image_bytes)
        record = insert_generation(payload.user_id, payload.prompt, image_path, public_url)
        return record
    except OllamaError as exc:
        logger.exception("Ollama error during generate")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except SupabaseError as exc:
        logger.exception("Supabase error during generate")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error during generate")
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.get("/api/history/{user_id}", response_model=list[Generation])
async def history(user_id: UUID):
    try:
        return fetch_history(user_id)
    except SupabaseError as exc:
        logger.exception("Supabase error during history")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error during history")
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.delete("/api/history/{id}")
async def delete_history_item(id: UUID):
    try:
        delete_generation(id)
        return {"ok": True}
    except SupabaseError as exc:
        logger.exception("Supabase error during delete")
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Unhandled error during delete")
        raise HTTPException(status_code=500, detail="Internal server error") from exc