import os
from dotenv import load_dotenv

load_dotenv()


def _get_env(name: str, default: str | None = None, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    if value is None:
        return ""
    return value


SUPABASE_URL = _get_env("SUPABASE_URL", required=True)
SUPABASE_SERVICE_ROLE_KEY = _get_env("SUPABASE_SERVICE_ROLE_KEY", required=True)

DEFAULT_OLLAMA_HOST = "http://192.168.2.106:11434"
DEFAULT_MODEL = "x/flux2-klein:4b"

OLLAMA_HOST = _get_env("OLLAMA_HOST", "")
_api_url = _get_env("OLLAMA_API_URL", "")
if not _api_url:
    host = OLLAMA_HOST or DEFAULT_OLLAMA_HOST
    _api_url = host.rstrip("/") + "/api/generate"
OLLAMA_API_URL = _api_url

_image_api_url = _get_env("OLLAMA_IMAGE_API_URL", "")
if not _image_api_url:
    host = OLLAMA_HOST or DEFAULT_OLLAMA_HOST
    _image_api_url = host.rstrip("/") + "/v1/images/generations"
OLLAMA_IMAGE_API_URL = _image_api_url

_env_model = _get_env("MODEL_NAME", _get_env("OLLAMA_MODEL", DEFAULT_MODEL))
MODEL_NAME = _env_model

CORS_ORIGINS = _get_env("CORS_ORIGINS", "http://localhost:5173")
OLLAMA_TIMEOUT_SECONDS = float(_get_env("OLLAMA_TIMEOUT", "120"))
