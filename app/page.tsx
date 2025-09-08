import { Sidebar } from "@/components/layout/Sidebar";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 bg-muted/30 relative overflow-auto">
        <div className="h-full w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold text-muted-foreground">
              Canvas Area
            </h2>
            <p className="text-muted-foreground">
              Drag blocks from the sidebar to build your layout
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
