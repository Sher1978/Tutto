import os
import google.generativeai as genai
from typing import List, Dict, Any
from core.config import SUPABASE_URL, SUPABASE_KEY

# Configure Gemini for Embeddings
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    print("[RAG] Warning: GEMINI_API_KEY is not set.")

def generate_embedding(text: str) -> List[float]:
    """
    Generates a 768-dimensional vector embedding for the given text using Gemini.
    Uses 'models/embedding-001' or 'text-embedding-004'.
    """
    try:
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document"
        )
        return result['embedding']
    except Exception as e:
        print(f"[RAG] Error generating embedding: {e}")
        # Return a zero-vector fallback for testing if API fails
        return [0.0] * 768

async def vectorize_provider_knowledge(supabase_client, provider_id: str, raw_text: str):
    """
    Chunks the raw text provided by the Business Profile, 
    generates embeddings, and stores them in pgvector table.
    """
    # Simple chunking by paragraphs
    chunks = [chunk.strip() for chunk in raw_text.split('\n\n') if len(chunk.strip()) > 10]
    
    # 1. Delete old chunks for this provider
    supabase_client.table('provider_knowledge_chunks').delete().eq('provider_id', provider_id).execute()
    
    # 2. Insert new chunks
    records = []
    for chunk in chunks:
        vector = generate_embedding(chunk)
        records.append({
            "provider_id": provider_id,
            "content": chunk,
            "embedding": vector
        })
        
    if records:
        supabase_client.table('provider_knowledge_chunks').insert(records).execute()
        print(f"[RAG] Vectorized {len(records)} chunks for provider {provider_id}")

async def search_knowledge_base(supabase_client, provider_id: str, request_text: str, top_k: int = 3) -> str:
    """
    Searches the pgvector database for the most relevant RAG chunks 
    to answer the client's request.
    Uses Supabase RPC function 'match_provider_knowledge'.
    """
    query_embedding = generate_embedding(request_text)
    
    try:
        response = supabase_client.rpc(
            'match_provider_knowledge', 
            {
                'p_provider_id': provider_id,
                'query_embedding': query_embedding,
                'match_threshold': 0.7,
                'match_count': top_k
            }
        ).execute()
        
        results = response.data
        if not results:
            return "Нет релевантной информации в базе знаний."
            
        context = "\n---\n".join([item['content'] for item in results])
        return context
        
    except Exception as e:
        print(f"[RAG] Error executing pgvector search: {e}")
        return ""
