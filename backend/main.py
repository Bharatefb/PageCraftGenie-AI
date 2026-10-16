from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

import os
import json
import uuid

from ollama_client import ask_qwen

from generators.word_generator import create_word
from generators.excel_generator import create_excel
from generators.ppt_generator import create_powerpoint
from generators.pdf_generator import create_pdf
from generators.image_generator import create_image


app = FastAPI(
    title="PageGenieCraft AI"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


OUTPUT_DIR = "output"

os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


# ==========================================
# STEP 12
# Request data structure
# ==========================================

class GenerateRequest(BaseModel):

    user_request: str

    output_type: str

    page_title: str = ""

    page_url: str = ""

    page_text: str = ""

    screenshot: str = ""


# ==========================================
# STEP 13
# Build prompt for Qwen
# ==========================================

def build_prompt(request: GenerateRequest):

    page_content = request.page_text[:12000]

    output_type = request.output_type.lower()

    if output_type == "ppt":

        output_instructions = """
Create exactly 5 slides.

Each slide must contain:
- One short title
- 3 to 5 concise bullet points
- Each bullet must be under 20 words

Use only information supported by the webpage content.

Return this exact JSON structure:

{
    "title": "Presentation title",
    "slides": [
        {
            "title": "Slide title",
            "content": [
                "Bullet 1",
                "Bullet 2",
                "Bullet 3"
            ]
        }
    ]
}
"""

    elif output_type in ["word", "pdf"]:

        output_instructions = """
Create a concise document with 4 to 6 sections.

Return this exact JSON structure:

{
    "title": "Document title",
    "content": [
        {
            "heading": "Section heading",
            "text": "Section content"
        }
    ]
}
"""

    elif output_type == "excel":

        output_instructions = """
Create a useful structured table.

Return this exact JSON structure:

{
    "title": "Spreadsheet title",
    "columns": [
        "Column 1",
        "Column 2"
    ],
    "rows": [
        ["Value 1", "Value 2"]
    ]
}
"""

    elif output_type == "image":

        output_instructions = """
Create concise content suitable for an image.

Return this exact JSON structure:

{
    "title": "Image title",
    "content": [
        "Text item 1",
        "Text item 2"
    ]
}
"""

    else:

        output_instructions = """
Return a concise JSON response.
"""

    prompt = f"""
You are PageGenieCraft AI.

Your job is to understand webpage content
and prepare structured information for document generation.

USER REQUEST:
{request.user_request}

OUTPUT TYPE:
{request.output_type}

PAGE TITLE:
{request.page_title}

PAGE URL:
{request.page_url}

PAGE CONTENT:
{page_content}

IMPORTANT RULES:

1. Return ONLY valid JSON.
2. Do not use Markdown.
3. Do not add explanations before or after the JSON.
4. Do not invent facts that are not supported by the webpage.
5. Keep the response concise.
6. Follow the requested JSON structure exactly.

{output_instructions}
"""

    return prompt


# ==========================================
# STEP 14
# Generate file
# ==========================================

@app.post("/generate")
def generate(request: GenerateRequest):

    print("Received request:")
    print(request.output_type)

    # Ask Qwen

    prompt = build_prompt(request)

    try:

        ai_response = ask_qwen(prompt)

        print("Qwen response:")
        print(ai_response)

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Ollama error: {error}"
        )

    # Convert Qwen response to JSON

    try:

        data = json.loads(ai_response)

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Qwen returned invalid JSON: {error}"
        )

    # Unique filename

    file_id = uuid.uuid4().hex

    output_type = request.output_type.lower()


    # ======================================
    # WORD
    # ======================================

    if output_type == "word":

        filename = f"{file_id}.docx"

        path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        create_word(
            data["title"],
            data["content"],
            path
        )


    # ======================================
    # EXCEL
    # ======================================

    elif output_type == "excel":

        filename = f"{file_id}.xlsx"

        path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        create_excel(
            data["title"],
            data["columns"],
            data["rows"],
            path
        )


    # ======================================
    # POWERPOINT
    # ======================================

    elif output_type == "ppt":

        filename = f"{file_id}.pptx"

        path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        create_powerpoint(
            data["title"],
            data["slides"],
            path
        )


    # ======================================
    # PDF
    # ======================================

    elif output_type == "pdf":

        filename = f"{file_id}.pdf"

        path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        create_pdf(
            data["title"],
            data["content"],
            path
        )


    # ======================================
    # IMAGE
    # ======================================

    elif output_type == "image":

        filename = f"{file_id}.png"

        path = os.path.join(
            OUTPUT_DIR,
            filename
        )

        create_image(
            data["title"],
            data["content"],
            path
        )


    else:

        raise HTTPException(
            status_code=400,
            detail="Unsupported output type"
        )


    # Return result

    return {
        "success": True,
        "filename": filename,
        "download_url": f"/download/{filename}"
    }


# ==========================================
# DOWNLOAD FILE
# ==========================================

@app.get("/download/{filename}")
def download(filename: str):

    path = os.path.join(
        OUTPUT_DIR,
        filename
    )

    if not os.path.exists(path):

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return FileResponse(
        path,
        filename=filename
    )
