import type { User, Document, Conversation, Message } from "../types";

// Keep browser requests on the same origin. Vite proxies this path during
// development and Nginx proxies it in the production container.
const BASE_URL = "/api/v1";

async function apiRequest<T>(path: string, options: RequestInit = {}, retries = 2, delay = 1000): Promise<T> {
  try {
    const token = localStorage.getItem("documind_token");
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Set content type to JSON if body is a plain object or stringified JSON
    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (response.status === 204) {
      return {} as T;
    }

    let data: any;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text };
    }

    if (!response.ok) {
      // Retry on 5xx Internal Server Errors (transient db locks, etc.)
      if (response.status >= 500 && retries > 0) {
        console.warn(`HTTP ${response.status} server error. Retrying in ${delay}ms... (${retries} left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiRequest<T>(path, options, retries - 1, delay * 2);
      }
      
      let errMsg = "An unknown error occurred.";
      if (data.error) {
        errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
      } else if (typeof data.detail === "string") {
        errMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        // Handle FastAPI validation error array nicely
        errMsg = data.detail.map((d: any) => d.msg || d.type || "Validation error").join("; ");
        if (errMsg.includes("JSON decode error")) {
          errMsg = "Invalid or missing JSON payload in request body.";
        }
      } else if (data.detail) {
        errMsg = JSON.stringify(data.detail);
      } else {
        errMsg = `HTTP error! status: ${response.status}`;
      }

      throw new Error(errMsg);
    }

    return data as T;
  } catch (err: any) {
    // Retry on standard TypeError network connection dropouts
    if (err instanceof TypeError && retries > 0) {
      console.warn(`Connection dropped. Retrying in ${delay}ms... (${retries} left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return apiRequest<T>(path, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

export const authApi = {
  register: (name: string, email: string, password: string) => 
    apiRequest<{ id: number; name: string; email: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),

  login: (email: string, password: string) => {
    return apiRequest<{ access_token: string; token_type: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username: email.trim(),
        password: password
      })
    });
  },

  getMe: () => apiRequest<User>("/auth/me")
};

export const docApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    return apiRequest<Document>("/documents", {
      method: "POST",
      body: formData
    });
  },

  list: (status?: string, type?: string) => {
    let url = "/documents";
    const queries = [];
    if (status) queries.push(`status=${status}`);
    if (type) queries.push(`file_type=${type}`);
    if (queries.length > 0) {
      url += `?${queries.join("&")}`;
    }
    return apiRequest<Document[]>(url);
  },

  getById: (id: number) => apiRequest<Document>(`/documents/${id}`),

  delete: (id: number) => apiRequest<void>(`/documents/${id}`, { method: "DELETE" })
};

export const chatApi = {
  createConversation: (title: string = "New Chat Session") => 
    apiRequest<Conversation>("/chat/conversations", {
      method: "POST",
      body: JSON.stringify({ title: title.trim() || "New Chat Session" })
    }),

  listConversations: () => apiRequest<Conversation[]>("/chat/conversations"),

  renameConversation: (id: number, title: string) => 
    apiRequest<Conversation>(`/chat/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title: title.trim() || "Chat Session" })
    }),

  deleteConversation: (id: number) => 
    apiRequest<void>(`/chat/conversations/${id}`, { method: "DELETE" }),

  listMessages: (convId: number) => apiRequest<Message[]>(`/chat/conversations/${convId}/messages`),

  submitQuestion: (convId: number, content: string, selectedDocIds?: number[]) => 
    apiRequest<Message>(`/chat/conversations/${convId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        content: content.trim() || "Summarize the document",
        selected_document_ids: selectedDocIds && selectedDocIds.length > 0 ? selectedDocIds : null
      })
    })
};
