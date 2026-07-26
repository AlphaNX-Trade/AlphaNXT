import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashPage from '@/pages/SplashPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import { BrandLogo } from '@/components/ui/Brand';
import { useEffect } from 'react';
import { motion } from 'framer-motion';

const queryClient = new QueryClient();

function AuthGuard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (user) {
        setLocation('/dashboard');
      } else {
        setLocation('/login');
      }
    }
  }, [user, loading, setLocation]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      <div className="flex flex-col items-center gap-4 z-10">
        <BrandLogo />
        <div className="w-32 h-1 bg-secondary rounded-full overflow-hidden relative mt-4">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-y-0 w-1/2 bg-primary rounded-full"
          />
        </div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthGuard} />
      <Route path="/splash" component={SplashPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/dashboard">
        {() => {
          const { user, loading } = useAuth();
          const [, setLocation] = useLocation();
          
          useEffect(() => {
            if (!loading && !user) {
              setLocation('/login');
            }
          }, [user, loading, setLocation]);

          if (loading || !user) {
            return (
              <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
            );
          }
          
          return <DashboardPage />;
        }}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
