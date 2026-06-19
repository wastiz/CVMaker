export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border bg-muted/50">
        <div className="p-4">
          <p className="text-sm text-muted-foreground">Sidebar coming soon</p>
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
