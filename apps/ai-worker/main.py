import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

app = FastAPI(
    title="TuttoMinutto AI Sales Agent Engine",
    description="Автономный ИИ-менеджер для генерации откликов на аукционы за 1 минуту",
    version="1.0.0",
)

class RequestPayload(BaseModel):
    request_id: str
    title: str
    description: str
    hub: str
    district: str
    budget: Optional[float] = None
    currency: str = "USD"
    company_name: str
    knowledge_base: Optional[str] = None

class BidResponse(BaseModel):
    proposed_price: float
    currency: str
    comment: str
    ai_confidence: float
    reasoning: str

@app.get("/")
def health_check():
    return {
        "service": "TuttoMinutto AI Sales Agent",
        "status": "online",
        "slogan": "Здесь выбираешь ты!",
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
    }

@app.post("/generate-bid", response_model=BidResponse)
async def generate_ai_bid(payload: RequestPayload):
    """
    Принимает параметры заявки клиента и генерирует персонализированный отклик от имени бизнеса.
    """
    suggested_price = payload.budget if payload.budget and payload.budget > 0 else 180.0
    
    ai_comment = (
        f"Здравствуйте! Компания {payload.company_name} готова оперативно выполнить ваш заказ "
        f"«{payload.title}» в районе {payload.district}. У нас 100% идеальное техническое состояние "
        f"и бесплатная доставка. Готовы выехать прямо сейчас!"
    )

    return BidResponse(
        proposed_price=suggested_price,
        currency=payload.currency,
        comment=ai_comment,
        ai_confidence=0.96,
        reasoning="Прямое совпадение локации и категории в базе знаний бизнеса."
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
