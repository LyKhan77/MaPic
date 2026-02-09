from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=2000)
    user_id: UUID
    model: str | None = None


class Generation(BaseModel):
    id: UUID
    user_id: UUID
    prompt: str
    image_path: str
    public_url: str
    created_at: datetime
