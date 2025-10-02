import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import EditorLayout from "@/components/EditorLayout";
import SceneEditor from "@/pages/SceneEditor";
import Assets from "@/pages/Assets";
import Animations from "@/pages/Animations";
import Scripts from "@/pages/Scripts";
import Export from "@/pages/Export";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { GameEngineProvider } from "@/contexts/GameEngineContext";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameEngineProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/editor" element={<EditorLayout />}>
                <Route index element={<SceneEditor />} />
                <Route path="assets" element={<Assets />} />
                <Route path="animations" element={<Animations />} />
                <Route path="scripts" element={<Scripts />} />
                <Route path="export" element={<Export />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </GameEngineProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;