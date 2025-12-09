# Next Hire - AI-Powered Job Application Assistant

Next Hire is a powerful tool designed to streamline the job application process. It combines a Next.js dashboard for managing your professional profile with a Chrome Extension that uses Google Gemini AI to intelligently autofill job applications on third-party sites.

## 🚀 Features

- **Smart Profile Management**: Parse resumes (PDF/DOCX) and manage granular professional details.
- **AI Autofill Extension**: Intelligently fills job application forms, including complex open-ended questions.
- **Context-Aware Generation**: Generates tailored responses (e.g., "Why do you want to work at [Company]?") based on your profile and the specific job description.
- **Real-time Streaming**: Watch the AI type answers into forms in real-time.

---

## 🛠 Tech Stack

### Frontend & Core
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: React 19, Lucide React (Icons)
- **Architecture**: Server Components & Server Actions

### Backend & Database
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: Better-Auth (with Google OAuth)
- **Validation**: Zod

### AI & Processing
- **LLM**: Google Gemini Flash (`@google/generative-ai`)
- **Document Parsing**: `pdf-parse` / `mammoth` (for Resume parsing)
- **Browser Automation**: Puppeteer (server-side utilities)

### Chrome Extension
- **Manifest Version**: V3
- **Communication**: Stream-based messaging between Content Script, Background Service Worker, and Next.js API.

---

## 📂 Key Files & Structure

### `src/` (Web Application)
- **`app/api/`**: Backend logic.
    - `api/user/profile`: CRUD operations for user data.
    - `api/v1/autofill/generate`: Streaming endpoint that connects the Extension to Gemini AI.
- **`app/dashboard/`**: User-facing dashboard to upload resumes and edit profile fields (Education, Experience, etc.).
- **`lib/`**: Shared utilities (Prisma client, Prompt builders).

### `extension/` (Chrome Extension)
- **`manifest.json`**: Configuration file. Defines permissions (`activeTab`, `scripting`, `host_permissions` for localhost/vercel) and background scripts.
- **`scripts/content.js`**: **The Brain**.
    - Injected into job application pages.
    - Scans DOM for inputs (`input`, `textarea`, `select`).
    - Uses heuristic matching (Regex on `name`, `label`, `id`) to fill standard fields (Name, Phone, Links).
    - Queues complex fields (e.g., "Reason for apply", "City/State" extraction) for AI processing.
    - **`autofillForms()`**: Main function that orchestrates the filling.
- **`scripts/background.js`**: **The Bridge**.
    - Handles long-lived connections.
    - Fetches user profile data from the Next.js API.
    - Proxies AI generation requests from `content.js` to the Next.js API to avoid CORS issues and handle streaming responses.

---

## 🧩 Chrome Extension Guide

### 1. Installation (Load Unpacked)
Since this extension interacts with your local or deployed Next.js app, you install it in "Developer Mode".

1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer mode** (toggle in the top right corner).
3.  Click the **Load unpacked** button (top left).
4.  Select the `extension` folder inside this project directory (`next-hire/extension`).
5.  The "Next Hire Autofill" extension should now appear in your list.

> **Note**: Ensure the `API_BASE_URL` in `extension/scripts/background.js` matches your server (e.g., `http://localhost:3000` for local dev, or your Vercel URL for production).

### 2. Usage Guide

1.  **Setup Profile**: Go to your Next Hire Dashboard (e.g., `http://localhost:3000/dashboard`), log in, and ensure your profile is complete (Resume uploaded, Experience added).
2.  **Navigate to Job**: Go to any job application page (e.g., a Greenhouse, Lever, or Workday form).
3.  **Open Extension**: Click the Next Hire icon in your Chrome toolbar.
4.  **Click "Autofill"**:
    - The extension will first fetch your latest profile data.
    - It will scan the page and instantly fill standard fields (Name, Email, Phone).
    - **Green Border**: Indicates a field was successfully filled.
    - **Orange/Yellow Border**: Indicates the field is being processed by AI (e.g., generating a cover letter paragraph).
5.  **Review**: Always review the autofilled data before submitting!

---

## 🔄 Autofill Flow: Under the Hood

1.  **Trigger**: User clicks "Autofill" in Popup.
2.  **Data Fetch**: `popup.js` (or background) calls `api/user/profile` to get the user's full "Knowledge Base" (Resume text, structured experience, etc.).
3.  **DOM Analysis (`content.js`)**:
    - The script iterates through all form inputs.
    - **Step A (Heuristics)**: Checks labels/IDs against a dictionary of keywords (e.g., `first_name` -> `User.firstName`). If matched, fills immediately.
    - **Step B (AI Queue)**: If a field is complex (e.g., "Describe a challenge you faced"), it is added to an `aiQueue`.
4.  **AI Processing**:
    - The `aiQueue` is processed sequentially.
    - A message is sent to `background.js` -> `Next.js API`.
    - The API constructs a prompt with: **User Context** (Resume) + **Page Context** (Job Description/Field Label).
    - Gemini generates a response.
5.  **Streaming Fill**:
    - The response is streamed back chunk-by-chunk.
    - `content.js` simulates typing into the input field for a natural effect and to trigger React/Framework change events.
    - Field turns green upon completion.

---

## ⚡️ Getting Started (Development)

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/nikhildhanda04/next-hire.git
    cd next-hire
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in:
    ```bash
    DATABASE_URL="postgresql://..."
    GOOGLE_GENERATIVE_AI_KEY="gemini-api-key"
    BETTER_AUTH_SECRET="..."
    NEXT_PUBLIC_APP_URL="http://localhost:3000"
    ```

3.  **Database**:
    ```bash
    npx prisma migrate dev
    ```

4.  **Run Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).
