import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://placeholder-ref.supabase.co")
    SUPABASE_SERVICE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", os.getenv("SUPABASE_ANON_KEY", ""))
    AI_WORKER_SECRET: str = os.getenv("AI_WORKER_SECRET", "tuttominutto_secret")
    DEBUG: bool = True

    class Config:
        env_file = "../../.env"
        extra = "ignore"

settings = Settings()
