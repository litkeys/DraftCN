import { Sidebar } from "@/components/layout/Sidebar";
import { Canvas } from "@/components/canvas/Canvas";

export default function Home() {
  return (
    <>
      <Sidebar />
      <div className="flex-1 relative overflow-hidden">
        <Canvas />
      </div>
    </>
  );
}
