# IntelliSource 🚀

IntelliSource is a prototype multimodal AI workspace built with Next.js, TypeScript, Tailwind CSS, Gemini, Cloudflare Workers AI, PDF.js, PDFKit, PptxGenJS, Anime.js, and Lucide React.

## ✨ Features

- Natural-language AI chat
- PDF upload and PDF-aware chat
- AI-generated PowerPoint presentations
- AI-generated PDF documents
- AI image generation
- AI infographic generation with topic-dependent visual layouts
- Specialized outputs for LinkedIn, X, and advisory use cases
- Animated workspace interface
- Client-side PDF support with PDF.js

## 🛠️ Tech Stack

- Next.js 16.3.4
- React 19
- TypeScript
- Tailwind CSS 4
- Google Gemini API via `@google/genai`
- Cloudflare Workers AI
- PDF.js
- PDFKit
- PptxGenJS
- Anime.js
- Lucide React

## 📋 Requirements

Install the following before running the project:

- Node.js
- npm
- A Google Gemini API key
- A Cloudflare account with Workers AI access
- A Cloudflare API token with permission to use Workers AI
- Your Cloudflare account ID

## 🔑 API Keys and Environment Variables

Create a `.env` file in the project root.

Required variables:

```env
GEMINI_API_KEY=your_gemini_api_key
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
```

### 🤖 Gemini API Key

Get a Gemini API key from Google AI Studio.

The application uses the Gemini API for:

- General AI responses
- Intent detection
- PDF processing
- PowerPoint content generation
- PDF content generation
- Infographic content and image-prompt generation
- Specialized structured responses

Keep the key server-side. Do not use `NEXT_PUBLIC_GEMINI_API_KEY`.

### ☁️ Cloudflare Credentials

Cloudflare is used for image and infographic generation through Workers AI.

You need:

- Cloudflare Account ID
- Cloudflare API Token

The API token must have the permissions required to invoke Workers AI models.

The current image-generation flow uses the Cloudflare Workers AI FLUX model endpoint.

## 📦 Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/Abhishek-Choudhary7306/xor.git
cd xor
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Add your API keys and Cloudflare credentials to `.env`.

## ▶️ Run the Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🧰 Other Commands

Build the project:

```bash
npm run build
```

Start the production server after building:

```bash
npm start
```

Run ESLint:

```bash
npm run lint
```

## 📖 How to Use IntelliSource

### 1. 💬 General AI Chat

Enter a normal prompt such as:

```text
Explain how neural networks work.
```

IntelliSource detects the request and sends chat requests to Gemini.

### 2. 📊 Generate a PowerPoint

Enter a request such as:

```text
Create a presentation about renewable energy.
```

The application detects the presentation intent and generates a 6-slide PowerPoint file.

### 3. 📄 Generate a PDF

Enter a request such as:

```text
Create a detailed document about the Indus Water Treaty.
```

The application generates a PDF document based on the request.

### 4. 📚 Chat With a PDF

Upload a PDF and enter a question or instruction.

For example:

```text
Summarize this document and list its key points.
```

The uploaded PDF is sent directly to the PDF chat flow.

### 5. 🖼️ Generate an Image

Use the Generate Image action in the prompt interface and provide an image description.

For example:

```text
A cinematic futuristic city at night.
```

Image generation uses Cloudflare Workers AI.

### 6. 📈 Generate an Infographic

Use the Infographic action and provide a topic.

IntelliSource asks Gemini to determine an appropriate visual structure instead of forcing every infographic into the same chart format.

Examples:

- History → timeline
- Process → flow
- Comparison → comparison layout
- Statistics → suitable chart
- Hierarchy → tree or levels
- Cycle → circular process
- Concept → central concept with connections
- Geography → map-style layout
- Benefits or features → icon cards
- General topics → editorial infographic

The generated infographic is then created using Cloudflare FLUX.

### 7. ✍️ Specialized Content

The application also supports specialized structured outputs for:

- LinkedIn posts
- X posts and threads
- Advisory analysis

These actions use their dedicated flow rather than the general intent orchestrator.

## 📁 Project Structure

```text
intellisource/
├── app/
│   ├── api/
│   │   ├── gemini/
│   │   ├── image/
│   │   ├── infographic/
│   │   ├── orchestrate/
│   │   ├── pdf/
│   │   ├── pdf-chat/
│   │   ├── ppt/
│   │   └── specialized/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── OutputPanel.tsx
│   ├── PromptBox.tsx
│   └── Sidebar.tsx
├── lib/
│   ├── agents/
│   │   ├── pdf.ts
│   │   └── ppt.ts
│   ├── gemini.ts
│   └── orchestrator.ts
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
└── tsconfig.json
```

## 🔒 Environment File Safety

Never commit `.env` to Git.

The repository's `.gitignore` excludes environment files.

Use `.env.example` only for variable names and placeholder values. Never put real API keys in it.

If an API key is accidentally committed or exposed, revoke or rotate it immediately.

## ⚠️ Important Notes

This is a prototype application.

The project currently does not require a database or deployment configuration.

Gemini requests are made through server-side API routes so the Gemini API key is not exposed to the browser.

Explicit actions such as image and infographic generation use their dedicated API routes instead of passing through the general intent orchestrator.

The application uses Gemini for text and structured generation and Cloudflare Workers AI for image generation.

## 📜 License

This project is a prototype and does not currently specify a separate open-source license.
