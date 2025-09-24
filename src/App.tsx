import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Flats from "./pages/Flats";
import ListNewFlat from "./pages/ListNewFlat";
import PersonalityTest from "./pages/PersonalityTest";
import MyFavs from "./pages/MyFavs";
import MyFlats from "./pages/MyFlats";
import Notifications from "./pages/Notifications";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/me" element={<Profile />} />
              <Route path="/flats" element={<Flats />} />
              <Route path="/list-new-flat" element={<ListNewFlat />} />
              <Route path="/personality-test" element={<PersonalityTest />} />
              <Route path="/my-favs" element={<MyFavs />} />
              <Route path="/my-flats" element={<MyFlats />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/chat/:flatId" element={<Chat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;