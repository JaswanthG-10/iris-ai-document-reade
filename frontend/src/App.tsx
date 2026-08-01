import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DocumentLibraryPage } from "./pages/DocumentLibraryPage";
import { DocumentDetailsPage } from "./pages/DocumentDetailsPage";
import { ChatPage } from "./pages/ChatPage";
import { PromptLibraryPage } from "./pages/PromptLibraryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ArchitectureDocsPage } from "./pages/ArchitectureDocsPage";
import { LandingHero } from "./components/landing/LandingHero";
import { Sidebar } from "./components/layout/Sidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { CommandPalette } from "./components/ui/DesignSystem";
import { UploadModal } from "./components/documents/UploadModal";
import { docApi } from "./services/api";
import type { Document, NavigationTab } from "./types";

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>("dashboard");
  const [authView, setAuthView] = useState<"login" | "register">("login");
  const [commandOpen, setCommandOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);
  const [activePrompt, setActivePrompt] = useState<string | undefined>(undefined);

  const fetchDocuments = async () => {
    try {
      const data = await docApi.list();
      setDocuments(data);
    } catch (err) {
      console.error("Failed fetching library documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <span className="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && activeTab !== "landing") {
    return authView === "login" ? (
      <LoginPage onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <RegisterPage onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  const handleSelectDoc = (id: number) => {
    setSelectedDocId(id);
  };

  const handleDeleteDoc = async (id: number) => {
    if (!confirm("Are you sure you want to purge this document and all its vector embeddings?")) return;
    try {
      await docApi.delete(id);
      if (selectedDocId === id) setSelectedDocId(null);
      fetchDocuments();
    } catch (err) {
      alert("Failed deleting document: " + err);
    }
  };

  const handleSelectPrompt = (promptQuery: string) => {
    setActivePrompt(promptQuery);
    setActiveTab("chat");
  };

  const handleCommandAction = (action: string) => {
    if (action === "upload") {
      setUploadOpen(true);
    } else if (["dashboard", "library", "chat", "prompts", "docs", "settings", "landing"].includes(action)) {
      setActiveTab(action as NavigationTab);
      setSelectedDocId(null);
    }
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocId);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedDocId(null);
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          onOpenCommandPalette={() => setCommandOpen(true)}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setSelectedDocId(null);
          }}
        />

        <div className="flex-1 overflow-y-auto">
          {selectedDocument ? (
            <DocumentDetailsPage
              document={selectedDocument}
              onBack={() => setSelectedDocId(null)}
            />
          ) : activeTab === "landing" ? (
            <LandingHero onGetStarted={() => setActiveTab("dashboard")} />
          ) : activeTab === "dashboard" ? (
            <DashboardPage
              onSelectDoc={handleSelectDoc}
              onNavigateToLibrary={() => setActiveTab("library")}
            />
          ) : activeTab === "library" ? (
            <DocumentLibraryPage
              documents={documents}
              loading={loadingDocs}
              onOpenUpload={() => setUploadOpen(true)}
              onSelectDoc={handleSelectDoc}
              onDeleteDoc={handleDeleteDoc}
            />
          ) : activeTab === "chat" ? (
            <ChatPage initialPrompt={activePrompt} />
          ) : activeTab === "prompts" ? (
            <PromptLibraryPage onSelectPrompt={handleSelectPrompt} />
          ) : activeTab === "docs" ? (
            <ArchitectureDocsPage />
          ) : (
            <SettingsPage />
          )}
        </div>
      </div>

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSelectAction={handleCommandAction}
      />

      {uploadOpen && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={() => {
            fetchDocuments();
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
