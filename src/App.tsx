import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Index from '@/pages/Index';
import Tools from '@/pages/Tools';
import ToolDetails from '@/pages/ToolDetails';
import QuickToolDetails from '@/pages/QuickToolDetails';
import CompareTools from '@/pages/CompareTools';

import Resources from '@/pages/Resources';
import UTMTracker from './components/analytics/UTMTracker';
import AddToHomeScreen from './components/mobile/AddToHomeScreen';

// Removed Outcomes import
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import UpdatePassword from '@/pages/UpdatePassword';
import Dashboard from '@/pages/Dashboard';
import Admin from '@/pages/Admin';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiesPolicy from '@/pages/CookiesPolicy';
import Support from '@/pages/Support';
import { ToolsCompareProvider } from './hooks/useToolsCompare';
import { SharedChatProvider } from './contexts/SharedChatContext';
import SharedToolChatModal from './components/tools/SharedToolChatModal';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <BrowserRouter>
        <ToolsCompareProvider>
          <SharedChatProvider>
            <UTMTracker />
            <AddToHomeScreen />
            <SharedToolChatModal />

            <Routes>
              <Route path="/" element={<Tools />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:id" element={<ToolDetails />} />
              <Route path="/quick-tools/:id" element={<QuickToolDetails />} />
              <Route path="/tools/compare/:ids" element={<CompareTools />} />

              <Route path="/resources" element={<Resources />} />

              {/* Removed Outcomes route */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookies-policy" element={<CookiesPolicy />} />
              <Route path="/support" element={<Support />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster richColors position="bottom-right" />
          </SharedChatProvider>
        </ToolsCompareProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
