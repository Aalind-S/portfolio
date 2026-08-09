/**
 * Centralized site configuration and constants.
 * Modify this file to update personal details, links, projects, and skills.
 */

export const SITE_METADATA = {
  title: "Aalind Singh | Portfolio & Blog",
  description: "A portfolio website showcasing projects, software engineering blogs, and professional experience.",
  author: "Aalind Singh",
  email: "singhalind2000@gmail.com",
  phone: "+91 8218578821",
  location: "Noida, India",
  github: "https://github.com/Aalind-S",
  linkedin: "https://linkedin.com/in/-aalind-singh/",
};

// Google Drive link to resume (direct download format)
export const RESUME_GDRIVE_LINK = "https://docs.google.com/uc?export=download&id=1496_5ezL0IS46-ZTlUxlAmjg8VkjjDle";

export interface Project {
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

export const PROJECTS: Project[] = [
  {
    title: "AI Knowledge Assistant (RAG)",
    description: "A Retrieval-Augmented Generation (RAG) platform implementing document ingestion, chunking, embeddings, and vector search to enable context-aware question answering. Designed a scalable retrieval pipeline supporting asynchronous document indexing, metadata filtering, and low-latency semantic search.",
    tags: ["FastAPI", "Python", "PostgreSQL", "Redis", "Celery", "Qdrant", "Docker"],
    githubUrl: "https://github.com/Aalind-S/ai-knowledge-assistant",
    liveUrl: undefined,
    featured: true
  },
  {
    title: "Node.js/Puppeteer Web Scraping Platform",
    description: "A production-scale web scraping engine processing over 200,000 websites monthly. Built as a fault-tolerant service with semantic data extraction, customized pagination, and robust error recovery routines.",
    tags: ["Node.js", "Puppeteer", "JavaScript", "Docker", "Web Scraping"],
    githubUrl: "https://github.com/Aalind-S/puppeteer-scraper",
    liveUrl: undefined,
    featured: true
  },
  {
    title: "Distributed Task Pipeline",
    description: "A Celery and RabbitMQ asynchronous job processor optimized for long-running workflows. Features idempotent step execution, retry safety, and multithreading, reducing task times by 40%.",
    tags: ["Python", "Celery", "RabbitMQ", "Django", "PostgreSQL", "Multithreading"],
    githubUrl: "https://github.com/Aalind-S/task-pipeline",
    liveUrl: undefined,
    featured: true
  }
];

export const SKILLS = {
  languages: ["Python", "Golang", "NodeJS", "OOPS", "DBMS", "SDLC"],
  libraries: ["FastApi", "Gin", "Django", "DRF (Django Rest Framework)", "Selenium", "Celery", "Langchain"],
  databases: ["PostgreSQL", "MySQL", "AWS", "MongoDB", "Redis"],
  tools: ["VSCode", "Git/Github", "PyCharm", "Postman", "Cursor", "Docker", "Linux", "Windows"]
};
