from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate
from upstash_vector import Index
from core.config import settings

def get_rag_chain():
    # Initialize the LLM
    llm = ChatGroq(
        model="llama3-8b-8192", # Default, adjust as needed
        api_key=settings.GROQ_API_KEY
    )
    
    # Initialize Embeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    # Initialize Vector Store
    index = Index(url=settings.UPSTASH_VECTOR_REST_URL, token=settings.UPSTASH_VECTOR_REST_TOKEN)
    vectorstore = UpstashVectorStore(
        embedding=embeddings,
        index=index
    )
    
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
    
    # Define the system prompt
    system_prompt = (
        "You are an AI assistant for FleetOS, a next-generation fleet management system.\n"
        "Use the following pieces of retrieved context to answer the user's question.\n"
        "If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n"
        "Keep your answer concise and helpful.\n"
        "\n"
        "Context:\n"
        "{context}"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])
    
    # Create the chains
    question_answer_chain = create_stuff_documents_chain(llm, prompt)
    rag_chain = create_retrieval_chain(retriever, question_answer_chain)
    
    return rag_chain

def answer_query(query: str) -> str:
    chain = get_rag_chain()
    response = chain.invoke({"input": query})
    return response["answer"]
