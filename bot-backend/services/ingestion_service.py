import os
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.upstash import UpstashVectorStore
from loguru import logger
from core.config import settings
from upstash_vector import Index

def ingest_knowledge_base():
    if not os.path.exists(settings.KNOWLEDGE_BASE_PATH):
        logger.error(f"Knowledge base file not found at {settings.KNOWLEDGE_BASE_PATH}")
        return False
        
    logger.info("Loading knowledge base document...")
    loader = TextLoader(settings.KNOWLEDGE_BASE_PATH, encoding="utf-8")
    docs = loader.load()
    
    logger.info("Splitting document into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    
    logger.info("Initializing embeddings model...")
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    if not settings.UPSTASH_VECTOR_REST_URL or not settings.UPSTASH_VECTOR_REST_TOKEN:
        logger.error("Upstash credentials not found in environment variables.")
        return False
        
    logger.info("Initializing Upstash Vector Store...")
    index = Index(url=settings.UPSTASH_VECTOR_REST_URL, token=settings.UPSTASH_VECTOR_REST_TOKEN)
    
    vectorstore = UpstashVectorStore(
        embedding=embeddings,
        index=index
    )
    
    logger.info(f"Ingesting {len(splits)} chunks into Upstash Vector...")
    vectorstore.add_documents(splits)
    
    logger.info("Ingestion complete!")
    return True

if __name__ == "__main__":
    ingest_knowledge_base()
