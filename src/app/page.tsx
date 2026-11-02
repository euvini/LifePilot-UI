import type { Metadata } from "next"

import { WorkspaceClient } from "@/components/workspace/workspace-client"

export const metadata: Metadata = {
  title: "Workspace & Copiloto IA",
}

export default function HomePage() {
  return <WorkspaceClient />
}
