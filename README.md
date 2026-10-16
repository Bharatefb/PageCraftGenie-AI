PageCraftGenie AI: Turn Any Webpage into Documents and Visual Assets with Local AI ✨

This is a submission for the Hacktoberfest Open-Source AI Challenge Week 2: Side Hustle

What I Built

PageCraftGenie AI is an AI-powered browser extension that transforms the content of the current webpage into useful digital documents and visual assets.

Have you ever found a useful webpage and wished you could instantly turn its information into a professional report, spreadsheet, presentation, or image? That's the problem I wanted to solve.

With PageCraftGenie AI, users can open any webpage, capture the page or screen, choose the output they need, and let AI handle the content transformation.

It supports generating:

Word documents for editable notes, summaries, and reports.
Excel spreadsheets for organizing information into structured data.
PowerPoint presentations for turning webpage content into presentation-ready material.
PDF reports for sharing and saving information.
Images and visual assets for creative and visual content generation.

The goal is to reduce the time and effort required to manually copy, organize, format, and transform information from websites.

Who is it for?

PageCraftGenie AI can be useful for students, researchers, developers, content creators, freelancers, and professionals who regularly work with online information.

For example, a student could turn educational content into study notes, a researcher could convert information into a report, or a freelancer could transform webpage content into a client-ready document.

As a potential side hustle, the project could evolve into a productivity tool for individuals and businesses that need faster document creation and content processing.

Demo

![Image description](https://dev-to-uploads.s3.us-east-2.amazonaws.com/uploads/articles/xslnmrrn944od75m8pya.png)
The demo showcases the workflow:

Open a webpage in the browser.
Capture the webpage content or screen.
Select the desired output format.
Let the AI process the content.
Download the generated document or visual asset.
Code

💻 GitHub Repository: https://github.com/Bharatefb/PageCraftGenie-AI

Explore the source code, review the implementation, and contribute ideas or improvements.

The project brings together a browser extension, a backend API, and locally running AI models to make webpage-to-content generation possible.

How I Built It

I built PageCraftGenie AI by combining browser-based content capture, a Python backend, and open-weight language models running locally.

Technology Stack
Browser Extension: Captures webpage content and screen information and lets users select their desired output.
Python and FastAPI: Provides the backend API and handles generation requests.
Ollama: Runs open-weight AI models locally.
Qwen 2.5 1.5B: Used for generating structured content from prompts.
Document and Image Generation: The backend processes the model's output into downloadable files, including PDFs and PNG images, with support for additional document formats.
How it works
Capture: The extension gathers the relevant webpage content or screenshot.
Understand: The backend prepares a prompt containing the user's request and available page information.
Generate: The request is sent to a locally running Ollama model.
Transform: The generated content is processed into the requested document or visual output.
Download: The user receives a generated file through the application.

During development, I tested the backend with Uvicorn and verified requests to the generation API, including successful PDF and PNG downloads.

One of my main goals was to explore how a small, locally running model can power a practical AI productivity tool without depending entirely on paid, hosted model APIs.

Why Does Open Innovation Matter?

Open innovation is essential to a project like PageCraftGenie AI because it makes experimentation with AI more accessible.

By using Ollama and open-weight models, I can experiment with different models, test prompts, adjust the generation workflow, and build around my own requirements.

This approach offers several advantages:

Local inference: Run supported models on your own machine instead of sending every generation request to a hosted AI provider.
Greater control: Choose and switch between available models based on performance, quality, and hardware requirements.
Lower experimentation costs: Avoid per-request charges from hosted model APIs when running models locally, although local hardware and electricity still have costs.
Privacy-conscious design: Local inference can reduce external data sharing, provided the rest of the application also keeps webpage content and generated files local.
Community-driven development: Open-source tools make it easier for developers to inspect the implementation, report issues, contribute improvements, and build new features.

For me, open innovation is not just about using open-source software. It is about making AI capabilities more accessible and giving developers the freedom to build useful products on top of them.

My Agent Session

I would use this section to show how I developed the project, experimented with local AI models, debugged the generation pipeline, and connected the AI backend to the browser extension.

Prize Categories

[Add the applicable partner prize categories from the official challenge page, or remove this section if none apply.]

What's Next?

I want to continue improving PageCraftGenie AI by exploring:

Better extraction of meaningful content from complex webpages.
More reliable document formatting and structured spreadsheet generation.
Improved visual generation workflows.
Support for additional local AI models.
A smoother user experience for switching between output formats.
Better error handling and generation quality.

My long-term vision is to make PageCraftGenie AI a practical AI-powered productivity assistant that helps people transform information they find online into something they can immediately use.

Building this project has been an opportunity to explore the potential of open-weight AI models and turn them into a real-world tool.

I'd love to hear your feedback! What webpage-to-document or webpage-to-visual feature would you find most useful?

Thanks for reading! 🚀