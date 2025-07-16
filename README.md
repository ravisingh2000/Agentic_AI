# 🧠 AgentReach AI

AgentReach AI is an **agentic AI system** designed to automate and streamline cold email outreach for B2B sales teams and founders. Built using **LangGraph**, **Gemini AI**, and **Gmail API**, the system dynamically generates cold emails, listens for replies, and schedules meetings — all with minimal human input.

## 🚀 Features

- 🔎 **Company Intelligence**: Scrapes and summarizes company website and PDF documents
- ✉️ **Cold Email Generation**: Personalized cold emails using Gemini API
- 📬 **Gmail Integration**: Sends emails and polls threads for replies
- ⏸️ **Human-in-the-loop**: Pauses for manual input or reply analysis when needed
- 🤖 **LangGraph Agent Flow**: Modular, stateful agentic AI with resumable graphs
- 📆 **Calendly Integration**: Automatically sends meeting booking links on positive replies
- 📊 **Dashboard UI**: Campaign tracking UI built with Shadcn UI and Tailwind CSS

## 🧱 Tech Stack

- **AI & Agents**: LangGraph, LangChain, Gemini (via Vertex or Gemini Pro API)
- **Backend**: Node.js, Express.js, MongoDB, Redis
- **Frontend**: Next.js 14, Shadcn UI, Tailwind CSS
- **Email & Scheduling**: Gmail API, OAuth2, Calendly
- **Storage**: Multer for PDF uploads, Mongo Checkpointer for graph state

## 🗺️ Agent Flow (LangGraph)

```mermaid
graph TD
  A[Upload Leads] --> B[Summarize Website + PDF]
  B --> C[Generate Cold Email]
  C --> D[Send Email]
  D --> E[Wait for Reply]
  E --> F{Reply Received?}
  F -- No --> G[Generate Follow-up Email]
  G --> D
  F -- Yes --> H[Classify Intent]
  H -- Interested --> I[Send Calendly Link]
  I --> J[Meeting Booked]
  H -- Not Interested --> K[End Flow]
