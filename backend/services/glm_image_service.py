import base64
import logging

import httpx

try:
    from backend.config import GLM_IMAGE_API_URL
except ModuleNotFoundError:
    from config import GLM_IMAGE_API_URL

logger = logging.getLogger("mapic.glm_image")

TIMEOUT_SECONDS = 900  # GLM-Image is slow with CPU offload (~10-15 min)


class GlmImageError(Exception):
    pass


async def generate_image_bytes(prompt: str, images: list[str] | None = None) -> bytes:
    url = GLM_IMAGE_API_URL.rstrip("/")

    if images:
        endpoint = f"{url}/v1/images/edits"
        payload = {"prompt": prompt, "images": images}
    else:
        endpoint = f"{url}/v1/images/generations"
        payload = {"prompt": prompt}

    try:
        async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
            resp = await client.post(endpoint, json=payload)
            resp.raise_for_status()
            data = resp.json()
            b64 = data["data"][0]["b64_json"]
            return base64.b64decode(b64)
    except httpx.HTTPStatusError as exc:
        logger.exception("GLM-Image server returned %s", exc.response.status_code)
        raise GlmImageError(f"GLM-Image error: {exc.response.text}") from exc
    except Exception as exc:
        logger.exception("GLM-Image request failed")
        raise GlmImageError(str(exc)) from exc
