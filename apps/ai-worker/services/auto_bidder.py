import json
import logging
from typing import Optional, Dict, Any
from core.config import settings
from prompts.sales_agent import SALES_AGENT_SYSTEM_PROMPT

logger = logging.getLogger(__name__)

async def evaluate_and_generate_bid(
    request_data: Dict[str, Any], 
    business_profile: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Оценивает заказ клиента и генерирует персональный оффер от AI-менеджера бизнеса.
    """
    # Guardrail: Проверка минимального бюджета бизнеса
    budget = request_data.get("budget")
    min_budget = business_profile.get("ai_min_budget", 0.0)
    if budget and min_budget and budget < min_budget:
        logger.info(f"[auto_bidder] Budget {budget} is lower than min budget {min_budget}, skipping.")
        return None

    if not settings.OPENAI_API_KEY:
        # Fallback evaluation for demo/test mode without API key
        company_name = business_profile.get("company_name", "TuttoMinutto Partner")
        district = request_data.get("district", "локации")
        title = request_data.get("title", "услугу")
        proposed_price = request_data.get("budget") or 15.0

        return {
            "can_bid": True,
            "proposed_price": float(proposed_price),
            "comment": (
                f"Здравствуйте! {company_name} с радостью выполнит «{title}» в районе {district}. "
                f"Отличное состояние, прозрачная цена ${proposed_price}. Доставим быстро!"
            ),
            "reasoning": "Автоматическое соответствие критериям и локации клиента."
        }

    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        prompt = SALES_AGENT_SYSTEM_PROMPT.format(
            company_name=business_profile.get("company_name", "Бизнес"),
            hub_name=request_data.get("hub", "phuket"),
            knowledge_base=business_profile.get("knowledge_base_text", "Доступны все популярные модели и услуги."),
            request_title=request_data.get("title", ""),
            request_description=request_data.get("description", ""),
            request_district=request_data.get("district", "Пхукет"),
            request_budget=request_data.get("budget", "Договорная"),
            currency=request_data.get("currency", "USD"),
            category_slug=request_data.get("category_slug", "general"),
        )

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            response_format={"type": "json_object"},
            messages=[{"role": "system", "content": prompt}],
            temperature=0.3,
            max_tokens=512,
            timeout=8.0,
        )

        result = json.loads(response.choices[0].message.content)

        if not result.get("can_bid"):
            logger.info(f"[auto_bidder] AI decided not to bid: {result.get('reasoning')}")
            return None

        return result

    except Exception as e:
        logger.error(f"[auto_bidder] LLM evaluation error: {e}")
        return None
