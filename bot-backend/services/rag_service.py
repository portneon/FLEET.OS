from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from upstash_vector import Index
from loguru import logger
from core.config import settings


def _format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)


def get_rag_chain():
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=settings.GROQ_API_KEY,
    )

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    index = Index(
        url=settings.UPSTASH_VECTOR_REST_URL,
        token=settings.UPSTASH_VECTOR_REST_TOKEN,
    )
    vectorstore = UpstashVectorStore(embedding=embeddings, index=index)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 3})

    system_prompt = (
        "You are an AI assistant for FleetOS, a next-generation fleet management system.\n"
        "Use the following pieces of retrieved context to answer the user's question.\n"
        "If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n"
        "CRITICAL INSTRUCTION: Always format your answers using Markdown. Use bolding for emphasis, bullet points for lists, and clear short paragraphs for readability. Keep the structure clean, professional, and well-organized.\n\n"
        "Context:\n{context}"
    )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{question}"),
    ])

    # LCEL chain — no deprecated langchain.chains imports
    chain = (
        {"context": retriever | _format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    return chain


def answer_query(query: str) -> str:
    logger.info(f"Received query: {query}")
    chain = get_rag_chain()
    answer = chain.invoke(query)
    logger.info(f"Generated answer: {answer[:100]}...")
    return answer
