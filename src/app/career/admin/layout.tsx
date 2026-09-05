import { ReactNode } from "react";
import { EdgeStoreProvider } from "@/lib/edgestore-client";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <EdgeStoreProvider>
      <div className="min-h-screen bg-background">{children}</div>
    </EdgeStoreProvider>
  );
}
