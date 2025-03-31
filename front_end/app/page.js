import Image from "next/image";
import { Dashboard } from "./Dashboard/Dashboard"
import { Sidebar } from "./Sidebar/Sidebar";
import { ViewProvider } from '@/contexts/ViewContext';
export default function Home() {
  return (
    <ViewProvider>
    <main className="grid gap-4 p-4 grid-cols-[200px_1fr]">
      <Sidebar />
      <Dashboard />
    </main>
    </ViewProvider>
  );
}
