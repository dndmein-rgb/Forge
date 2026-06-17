"use client";
import React, { useCallback, useState } from "react";
import { CodePanel } from "./code-panel";
import { FileData, Message, StatusStep } from "@/types/workspace";
import ChatPanel from "./chat-panel";

interface WorkspaceClientProps {
  initialPrompt: string | null;
  userCredits: number;
  userId: string;
  userPlan: string;
}
const WorkspaceClient = ({
  initialPrompt,
  userCredits,
  userId,
  userPlan,
}: WorkspaceClientProps) => {
  const [workspaceId, setWorkspaceId] = useState<string | null>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [credits, setCredits] = useState(userCredits);

  const [fileData, setFileData] = useState<FileData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusLog, setStatusLog] = useState<StatusStep[]>([]);

  const handleFilePatch = useCallback((patches: FileData) => {
    setFileData(patches);
  }, []);

  const handleGenerate=useCallback(async(prompt:string,imageUrl?:string)=>{

  },[credits,isGenerating,userId])
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#0a0a0a]">
      {/* Chat panel - left */}
      
        <ChatPanel
          credits={userCredits}
          initialPrompt={initialPrompt}
          isGenerating={isGenerating}
          isImproving={false}
          messages={messages}
          onGenerate={handleGenerate}
          statusLog={statusLog}
          userId={userId}
          workspaceId={workspaceId}
          appTitle={"Test Title"}
        />
      

      {/* Code panel - right */}
      <CodePanel
        fileData={fileData}
        isGenerating={isGenerating}
        onFilePatch={handleFilePatch}
        statusLog={statusLog}
      />
    </div>
  );
};

export default WorkspaceClient;
