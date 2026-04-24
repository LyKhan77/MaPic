import base64
import io
import logging
import math
from contextlib import asynccontextmanager

import torch
from diffusers.pipelines.glm_image import GlmImagePipeline
from fastapi import FastAPI
from PIL import Image
from pydantic import BaseModel

logger = logging.getLogger("glm_image_server")
pipe: GlmImagePipeline | None = None

# RTX 4090: 23GB, RTX 5080: 15GB — leave ~2GB headroom each
MAX_MEMORY = {
    0: "21GiB",
    1: "13GiB",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipe
    logger.info("Loading GLM-Image pipeline across GPUs...")
    pipe = GlmImagePipeline.from_pretrained(
        "zai-org/GLM-Image",
        torch_dtype=torch.bfloat16,
        device_map="auto",
        max_memory=MAX_MEMORY,
    )
    logger.info("GLM-Image pipeline loaded (multi-GPU).")
    yield


app = FastAPI(title="GLM-Image Server", lifespan=lifespan)


class T2IRequest(BaseModel):
    prompt: str
    size: str = "1024x1024"
    response_format: str = "b64_json"


class I2IRequest(BaseModel):
    prompt: str
    images: list[str]  # base64 encoded
    size: str = "1024x1024"
    response_format: str = "b64_json"


def _snap_to_32(size: str) -> tuple[int, int]:
    parts = size.lower().split("x")
    w, h = int(parts[0]), int(parts[1])
    return (math.ceil(w / 32) * 32, math.ceil(h / 32) * 32)


@app.post("/v1/images/generations")
async def text_to_image(req: T2IRequest):
    if pipe is None:
        return {"error": "Model not loaded"}

    width, height = _snap_to_32(req.size)
    logger.info("T2I: prompt=%r size=%dx%d", req.prompt[:80], width, height)
    result = pipe(
        prompt=req.prompt,
        width=width,
        height=height,
        num_inference_steps=50,
        guidance_scale=1.5,
    )
    img: Image.Image = result.images[0]
    b64 = _pil_to_b64(img)
    return {"data": [{"b64_json": b64}]}


@app.post("/v1/images/edits")
async def image_to_image(req: I2IRequest):
    if pipe is None:
        return {"error": "Model not loaded"}

    width, height = _snap_to_32(req.size)
    ref_images = [_b64_to_pil(b).convert("RGB") for b in req.images]
    ref_images = [img.resize((width, height), Image.LANCZOS) for img in ref_images]
    logger.info("I2I: prompt=%r refs=%d size=%dx%d", req.prompt[:80], len(ref_images), width, height)
    result = pipe(
        prompt=req.prompt,
        image=ref_images,
        height=height,
        width=width,
        num_inference_steps=50,
        guidance_scale=1.5,
    )
    img: Image.Image = result.images[0]
    b64 = _pil_to_b64(img)
    return {"data": [{"b64_json": b64}]}


def _pil_to_b64(img: Image.Image) -> str:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def _b64_to_pil(b64: str) -> Image.Image:
    data = base64.b64decode(b64)
    return Image.open(io.BytesIO(data))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=30000)
