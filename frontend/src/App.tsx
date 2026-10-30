import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Credits from "./pages/Credits";
import { SiteLayout } from "./components/site";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import ServiceCase from "./pages/ServiceCase";
import Resources from "./pages/Resources";
import ResourceDetail from "./pages/ResourceDetail";
import Login from "./pages/Login";
import AdminResources from "./pages/ResourcesNew";
import AdminUpload from "./pages/AdminUpload";
import TemplateManager from "./pages/TemplateManager";
import AIGenerator from "./pages/AIGenerator";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/kredit" element={<Credits />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceCase />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<ResourceDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
            <Route path="/admin/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />
            <Route path="/admin/templates" element={<AdminRoute><TemplateManager /></AdminRoute>} />
            <Route path="/ai-generator" element={<AdminRoute><AIGenerator /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
