import { AppSidebar } from "./AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-60">
        <div className="max-w-[1400px] mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
