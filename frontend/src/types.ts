export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export type DocumentStatus = 
  | "Uploaded"
  | "Validating"
  | "Extracting"
  | "Chunking"
  | "Embedding"
  | "Ready"
  | "Failed";

export interface ProcessingJob {
  id: number;
  document_id: number;
  stage: string;
  status: "In Progress" | "Completed" | "Failed";
  started_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface Document {
  id: number;
  user_id: number;
  original_name: string;
  display_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  content_hash: string;
  storage_path: string;
  page_count: number;
  status: DocumentStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  jobs?: ProcessingJob[];
  tags?: string[];
}

export interface MessageSource {
  id: number;
  message_id: number;
  document_id: number | null;
  chunk_id: number | null;
  page_number: number | null;
  relevance_score: number | null;
  supporting_excerpt: string;
  document_name?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  model_name: string | null;
  created_at: string;
  sources?: MessageSource[];
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
}

export type NavigationTab = 
  | "landing"
  | "dashboard" 
  | "library" 
  | "chat" 
  | "prompts" 
  | "settings"
  | "docs";
