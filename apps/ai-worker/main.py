import os
import logging
from fastapi import FastAPI, BackgroundTasks, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, Any
from core.config import settings
from services.auto_bidder import evaluate_and_generate_bid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai_worker")

app = FastAPI(
    title="TuttoMinutto AI Sales Agent Microservice",
    description="Автономный ИИ-менеджер для генерации откликов на аукционы в курортных хабах",
    version="1.2.0",
)

class WebhookPayload(BaseModel):
    type: str          # "INSERT"
    table: str         # "requests"
    record: Dict[str, Any]

class TestBidRequest(BaseModel):
    company_name: str
    knowledge_base: str
    sample_request_title: str
    sample_request_description: str
    district: str = "Patong"
    budget: Optional[float] = 20.0
    hub: str = "phuket"

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "service": "TuttoMinutto AI Sales Agent",
        "status": "online",
        "slogan": "Here, you choose!",
        "version": "1.2.0",
        "openai_configured": bool(settings.OPENAI_API_KEY),
    }

@app.post("/api/v1/ai/trigger-auction")
async def trigger_auction(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Supabase Database Webhook listener upon INSERT into `requests`.
    Queues AI auto-bidding in background.
    """
    if payload.type != "INSERT" or payload.table != "requests":
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    request_record = payload.record
    logger.info(f"Received new request auction trigger for request ID: {request_record.get('id')}")

    # Process background evaluation
    background_tasks.add_task(process_auction_bids, request_record)

    return {"status": "accepted", "message": "Auction pipeline queued"}

async def process_auction_bids(request_record: Dict[str, Any]):
    """
    Background worker process evaluating eligible business AI agents.
    """
    logger.info(f"Processing background AI bidding for request: {request_record.get('title')}")
    # In production, queries business_profiles with ai_enabled=True from Supabase
    sample_business = {
        "company_name": "Phuket VIP Scooters & Cars",
        "knowledge_base_text": "Honda PCX 150 - $12/день. Yamaha NMAX - $15/день. Доставка по Патонгу и Раваи бесплатна.",
        "ai_min_budget": 5.0,
    }
    bid = await evaluate_and_generate_bid(request_record, sample_business)
    if bid:
        logger.info(f"AI Bid generated successfully: ${bid.get('proposed_price')} - {bid.get('comment')}")

@app.post("/api/v1/ai/test-bid")
async def test_ai_bid(payload: TestBidRequest):
    """
    Endpoint for B2B portal 'Test AI Agent' feature.
    """
    business_profile = {
        "company_name": payload.company_name,
        "knowledge_base_text": payload.knowledge_base,
        "ai_min_budget": 0.0,
    }
    request_data = {
        "title": payload.sample_request_title,
        "description": payload.sample_request_description,
        "district": payload.district,
        "budget": payload.budget,
        "hub": payload.hub,
        "currency": "USD",
    }

    bid = await evaluate_and_generate_bid(request_data, business_profile)
    if not bid:
        return {"can_bid": False, "reason": "No match or budget below threshold"}

    return bid

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
