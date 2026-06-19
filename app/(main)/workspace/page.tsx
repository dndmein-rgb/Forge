import { getWorkspaceById, getWorkspaceUser } from "@/actions/workspace";
import WorkspaceClient from "@/components/workspace-client";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
interface WorkspacePageProps {
  searchParams: Promise<{
    prompt?: string;
    id?: string;
  }>;
}
const WorkSpacePage = async ({ searchParams }: WorkspacePageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const user=await getWorkspaceUser()

  const { prompt, id } = await searchParams;
  let workspace=null
  if(id){
    workspace=await getWorkspaceById(id,user.id)
  }
  return (
    <div>
      <WorkspaceClient
        initialPrompt={prompt ?? ""}
        userCredits={user.credits}
        userId={userId}
        userPlan={user.plan}
        workspace={workspace}
      />
    </div>
  );
};

export default WorkSpacePage;
