from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import os
import google.generativeai as genai
import fitz  # to read PDFs
from fastapi import APIRouter

app = APIRouter()
# Load guidelines PDF once
def load_guidelines(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text")
    return text

GUIDELINES = load_guidelines(r"C:\Users\Shanmuga Shyam. B\OneDrive\Desktop\SIH25180\Model\guidelines\guide.pdf")
# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("Set the GEMINI_API_KEY environment variable")

genai.configure(api_key=GEMINI_API_KEY)
# Choose the model you want (Flash, Pro, etc.)
# Use appropriate model name per your access
MODEL_NAME = "gemini-2.5-flash-lite"  # or a newer model you have access to

class ProposalRequest(BaseModel):
    content: str

class ValidationIssue(BaseModel):
    line: int
    message: str

class ValidationResponse(BaseModel):
    issues: List[ValidationIssue]

proposal_json = """{
    "title": "Concise, descriptive project title (max 15–20 words, highlight innovation & purpose)",
    "author": "Full name(s) of principal investigator(s)",
    "affiliation": "Institution/organization leading the project (include department if academic)",
    "abstract": "A 200–300 word summary capturing problem, research gap, objectives, methodology, and expected impact. Should convince reviewers why this project matters.",
    "keywords": ["3–6 keywords capturing research focus, e.g., Coal Gasification", "Carbon Capture", "Clean Energy"],
    "introduction": "1–2 paragraphs explaining background, why the research is needed, the research gap, and strategic significance. Include data/statistics if possible (like India’s coal dependence, emissions figures, policy targets).",
    "methodology": "Clear step-by-step methods: (1) Coal characterization (techniques used), (2) Reactor design & modeling, (3) Catalyst development, (4) Process optimization approaches, (5) Pilot-scale testing. Use both experimental and computational methods if relevant.",
    "results": "What technical results you expect: reactor design, catalyst systems, CO₂ capture protocols, optimized process guidelines. Frame in measurable terms (efficiency %, emission reduction %, cost impact).",
    "discussion": "Why the results matter — impact on industry, environment, and policy. Discuss possible limitations and how your work will overcome them. Link to India’s climate goals, energy security, and economic benefits.",
    "conclusion": "Wrap up with 3–5 sentences restating importance, feasibility, and long-term potential. End with a vision of scaling up the technology or policy relevance.",
    "references": ["APA/IEEE formatted citations of relevant reports, journals, or policies. E.g., 'International Energy Agency (2023). Coal Report.'", "Govt of India (2021). Net-Zero by 2070 commitment."],
    "timeline": "Divide into phases (with months): Phase 1 – Literature review & design (Months 1–12), Phase 2 – Catalyst & lab testing (Months 13–24), Phase 3 – Pilot & validation (Months 25–36).",
    "research_needs": ["Specific gaps your research addresses: Cost-effective catalyst", "Pilot demonstration", "Process optimization for Indian coal"],
    "funding_sources": ["Potential sponsors: Govt of India Clean Energy Mission", "International Climate Funds (World Bank, UNDP)", "Industry partnerships (Steel, Power sector)"],
    "collaborating_institutions": ["List partners: e.g., IITs, CSIR labs, NTPC, international research collaborators"]
}"""

@app.post("/validateProposal", response_model=ValidationResponse)
async def validate_proposal(request: ProposalRequest):
    content = request.content
    
    # Build prompt
    prompt = f"""
    You are an expert proposal reviewer.

    --- GUIDELINES ---
    {GUIDELINES}

    --- PROPOSAL CONTENT (string) ---
    {content}

    --- TEMPLATE (must be checked) ---
    {proposal_json}

    --- TASK ---
    1. Treat the content as multi-line string input.
    2. Check spelling and grammar.
    3. Check compliance with guidelines.
    4. Check if all required fields from the template exist in the string.
    5. Output ONLY a JSON array.

    Example:
    [
    {{"line": 1, "message": "Abstract too short"}},
    {{"line": 2, "message": "Missing keywords field"}}
    ]
    """

    # Call Gemini
    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(prompt)

    # The response should be JSON text
    text = response.text.strip()
    try:
        issues = eval(text)  # or json.loads if response is valid JSON
        # Validate each object
        clean = []
        for obj in issues:
            if isinstance(obj, dict) and "line" in obj and "message" in obj:
                clean.append(obj)
        issues = clean
    except Exception as e:
        # If parsing fails, no issues or fallback
        issues = []

    return {"issues": issues}
