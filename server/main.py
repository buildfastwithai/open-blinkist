from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from dotenv import load_dotenv
from groq import Groq
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="OpenBlinkist API", description="A Blinkist-like API for extracting book insights and audiobook summaries")

# CORS middleware to allow requests from Next.js frontend
# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,https://open-blinkist.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is required")

# Initialize ChatOpenAI with Groq
llm = ChatOpenAI(
    model="moonshotai/kimi-k2-instruct",
    openai_api_base="https://api.groq.com/openai/v1",
    openai_api_key=GROQ_API_KEY,
    temperature=0.7
)

# Pydantic models for structured responses
class KeyInsight(BaseModel):
    """Individual actionable insight from the book"""
    heading: str = Field(description="The main takeaway or insight title")
    bullet_points: List[str] = Field(
        description="2-3 bullet points explaining this insight in detail",
        min_items=2,
        max_items=3
    )
    application: Optional[str] = Field(
        default=None,
        description="How to apply this insight in practice"
    )

class BookSummary(BaseModel):
    """Structured summary of book insights for a specific role"""
    book_name: str = Field(description="The name of the book")
    author: str = Field(description="The author of the book")
    role: str = Field(description="The role/profession this summary is tailored for")
    key_insights: List[KeyInsight] = Field(
        description="List of key insights from the book",
        min_items=3,
        max_items=5
    )
    key_theme: Optional[str] = Field(
        default=None,
        description="The overarching theme of the book"
    )

class BookRequest(BaseModel):
    book_name: str = Field(description="Name of the book to summarize")
    role: str = Field(default="professional", description="Role/profession to tailor insights for")
    num_insights: int = Field(default=5, ge=3, le=7, description="Number of insights to extract")



# Create parser for structured output
parser = PydanticOutputParser(pydantic_object=BookSummary)

# Book summarization prompt template
book_learn_template = """Extract {num_insights} key insights from the book "{book_name}" that can be applied by a {role}.

Focus on actionable, practical insights that can be immediately implemented. 
Include the book's author information and ensure each insight has clear, specific bullet points.

{format_instructions}

Make sure each insight has:
- A clear, compelling heading
- 2-3 actionable bullet points with specific strategies or techniques
- Practical application advice when relevant

Book: {book_name}
Role: {role}
Number of insights: {num_insights}"""

book_learn_prompt = PromptTemplate(
    template=book_learn_template,
    input_variables=['num_insights', 'book_name', 'role'],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)



# API Routes
@app.get("/")
async def root():
    return {"message": "Book Learning API is running!", "docs": "/docs"}

@app.post("/summarize_book", response_model=BookSummary)
async def summarize_book(request: BookRequest):
    """
    Generate a structured summary of a book with key insights tailored to a specific role.
    """
    try:
        # Create the chain with the parser
        book_chain = book_learn_prompt | llm | parser
        
        # Invoke the chain
        response = book_chain.invoke({
            "num_insights": request.num_insights,
            "book_name": request.book_name,
            "role": request.role
        })
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating book summary: {str(e)}")





@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "groq_configured": bool(GROQ_API_KEY)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
