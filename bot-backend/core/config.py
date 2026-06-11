import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
        self.UPSTASH_VECTOR_REST_URL = os.getenv("UPSTASH_VECTOR_REST_URL", "")
        self.UPSTASH_VECTOR_REST_TOKEN = os.getenv("UPSTASH_VECTOR_REST_TOKEN", "")
        
        # Path to the knowledge base file
        self.KNOWLEDGE_BASE_PATH = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "../../../documentation/FleetOS_Knowledge_Base.md")
        )
        
settings = Settings()
