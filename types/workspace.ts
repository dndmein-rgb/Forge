export type MessageRole = "user" | "assistant";
export interface Message {
  role: MessageRole;
  content: string;
  imageUrl?: string;
}

// Files and dependencies always travels together as one unit
// this is what gets saved on prisma as single json content
export interface FileData {
  files: Record<string, { code: string }>;
  dependencies: Record<string, string>;
  title?: string;
}

export interface StatusStep{
    label:string;
    status:"running" | "done"
}

export interface WorkspaceData{
    id:string;
    title:string|null;
    messages:unknown;
    fileData:unknown
}

export interface WorkspaceUser {
  id: string;
  credits: number;
  plan: string;
}