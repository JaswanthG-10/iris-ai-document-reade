import React, { useState } from "react";
import { Users, ChevronDown, Check, Building2 } from "lucide-react";

export interface WorkspaceItem {
  id: number;
  name: string;
  role: "Owner" | "Editor" | "Viewer";
  memberCount: number;
}

interface WorkspaceSelectorProps {
  currentWorkspace?: WorkspaceItem;
  onSelectWorkspace?: (ws: WorkspaceItem) => void;
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  currentWorkspace,
  onSelectWorkspace
}) => {
  const defaultWorkspaces: WorkspaceItem[] = [
    { id: 1, name: "Default Team Workspace", role: "Owner", memberCount: 4 },
    { id: 2, name: "Engineering & Architecture RAG", role: "Editor", memberCount: 8 },
    { id: 3, name: "Executive Strategy & Compliance", role: "Viewer", memberCount: 12 }
  ];

  const [workspaces] = useState<WorkspaceItem[]>(defaultWorkspaces);
  const [selectedWs, setSelectedWs] = useState<WorkspaceItem>(currentWorkspace || defaultWorkspaces[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<"Editor" | "Viewer">("Editor");

  const handleSelect = (ws: WorkspaceItem) => {
    setSelectedWs(ws);
    setIsOpen(false);
    if (onSelectWorkspace) onSelectWorkspace(ws);
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setSelectedWs((prev) => ({ ...prev, memberCount: prev.memberCount + 1 }));
    setMemberEmail("");
    setShowAddMember(false);
    alert(`Member ${memberEmail} invited to ${selectedWs.name} as ${memberRole}`);
  };

  return (
    <div className="relative font-mono text-xs select-none">
      
      {/* Selector Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#12151F] border border-[#232838] hover:border-[#6E6BFF] text-[#EDEFF7] transition-all shadow-sm"
      >
        <Building2 className="w-3.5 h-3.5 text-[#6E6BFF]" />
        <span className="font-bold truncate max-w-[140px]">{selectedWs.name}</span>
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#6E6BFF]/10 text-[#6E6BFF] border border-[#6E6BFF]/20">
          {selectedWs.role}
        </span>
        <ChevronDown size={12} className="text-[#8A90A6]" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#12151F] border border-[#232838] rounded-2xl p-3 shadow-2xl z-40 space-y-2 text-[#EDEFF7]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase text-[#8A90A6] px-2 py-1">
            <span>Shared Workspaces</span>
            <span>{workspaces.length} Available</span>
          </div>

          <div className="space-y-1">
            {workspaces.map((ws) => {
              const isSelected = selectedWs.id === ws.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => handleSelect(ws)}
                  className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between border ${
                    isSelected
                      ? "bg-[#6E6BFF]/15 border-[#6E6BFF]/40 text-white font-bold"
                      : "border-transparent text-[#8A90A6] hover:text-white hover:bg-[#1A1E2B]"
                  }`}
                >
                  <div className="truncate">
                    <p className="truncate text-xs">{ws.name}</p>
                    <p className="text-[10px] text-[#8A90A6]">{ws.memberCount} Team Members</p>
                  </div>

                  {isSelected && <Check size={14} className="text-[#6E6BFF] shrink-0" />}
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#232838]">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowAddMember(true);
              }}
              className="w-full py-2 rounded-xl bg-[#1A1E2B] border border-[#232838] hover:border-[#6E6BFF] text-[#6E6BFF] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Users size={12} /> Invite Member
            </button>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12151F] border border-[#232838] rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6E6BFF]" /> Add Team Member
            </h3>
            <p className="text-xs text-[#8A90A6]">
              Invite a user to access documents, chats, and reports in <strong>{selectedWs.name}</strong>.
            </p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-[#0B0D14] border border-[#232838] focus:border-[#6E6BFF] rounded-xl p-3 text-xs text-white outline-none"
              />

              <select
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value as any)}
                className="w-full bg-[#0B0D14] border border-[#232838] focus:border-[#6E6BFF] rounded-xl p-3 text-xs text-white outline-none"
              >
                <option value="Editor">Editor (Can Upload & Chat)</option>
                <option value="Viewer">Viewer (Read-Only)</option>
              </select>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 py-2 rounded-xl bg-[#1A1E2B] border border-[#232838] text-[#8A90A6] font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl cta-gradient-btn text-white font-bold text-xs shadow-md"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
