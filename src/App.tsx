import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import DogDetailPage from "./pages/DogDetailPage";
import ShelterProfilePage from "./pages/ShelterProfilePage";
import DashboardPage from "./pages/DashboardPage";
import DonationsPage from "./pages/DonationsPage";
import AboutPage from "./pages/AboutPage";
import AuthPage from "./pages/AuthPage";
import FavoritesPage from "./pages/FavoritesPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import BlogAdminPage from "./pages/BlogAdminPage";
import MessagesPage from "./pages/MessagesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pretraga" element={<SearchPage />} />
              <Route path="/pas/:id" element={<DogDetailPage />} />
              <Route path="/azil/:id" element={<ShelterProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/donacije" element={<DonationsPage />} />
              <Route path="/o-nama" element={<AboutPage />} />
              <Route path="/omiljeni" element={<FavoritesPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/blog/admin" element={<BlogAdminPage />} />
              <Route path="/poruke" element={<MessagesPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
