import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import SplashPage from '@/pages/SplashPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import MarketsPage from '@/pages/MarketsPage';
import AssetDetailPage from '@/pages/AssetDetailPage';
import TradePage from '@/pages/TradePage';
import PortfolioPage from '@/pages/PortfolioPage';
import ProfilePage from '@/pages/ProfilePage';
import AchievementsPage from '@/pages/AchievementsPage';
import ChallengesPage from '@/pages/ChallengesPage';
import EditProfilePage from '@/pages/EditProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import HelpPage from '@/pages/HelpPage';
import LearnPage from '@/pages/LearnPage';
import TopicLessonPage from '@/pages/TopicLessonPage';
import QuizPage from '@/pages/QuizPage';
import { BrandLogo } from '@/components/ui/Brand';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function AuthGuard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Show the splash for at least this long so it never just flashes by,
  // even when auth resolves instantly from a cached session.
  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && minTimeElapsed) {
      if (user) {
        setLocation('/dashboard');
      } else {
        setLocation('/login');
      }
    }
  }, [user, loading, minTimeElapsed, setLocation]);

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center z-10"
      >
        <BrandLogo className="scale-150 mb-6" />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-muted-foreground font-mono text-sm tracking-widest uppercase"
        >
          Master the Market Risk-Free
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12 w-48 h-1 bg-secondary rounded-full overflow-hidden relative"
        >
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-y-0 left-0 w-1/2 bg-primary rounded-full shadow-[0_0_10px_rgba(41,98,255,0.5)]"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

function ProtectedDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <DashboardPage />;
}

function ProtectedMarketsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <MarketsPage />;
}

function ProtectedAssetDetailPage({ params }: { params: { symbol: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <AssetDetailPage symbol={params.symbol} />;
}

function ProtectedTradePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TradePage />;
}

function ProtectedTradeSymbolPage({ params }: { params: { symbol: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TradePage symbol={params.symbol} />;
}

function ProtectedPortfolioPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <PortfolioPage />;
}

function ProtectedProfilePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <ProfilePage />;
}

function ProtectedLearnPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <LearnPage />;
}

function ProtectedAchievementsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <AchievementsPage />;
}

function ProtectedChallengesPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <ChallengesPage />;
}

function ProtectedEditProfilePage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <EditProfilePage />;
}

function ProtectedSettingsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <SettingsPage />;
}

function ProtectedNotificationsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <NotificationsPage />;
}

function ProtectedHelpPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <HelpPage />;
}

function ProtectedTopicLessonPage({ params }: { params: { topicId: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <TopicLessonPage topicId={params.topicId} />;
}

function ProtectedQuizPage({ params }: { params: { topicId: string } }) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation('/login');
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <LoadingScreen />;
  return <QuizPage topicId={params.topicId} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthGuard} />
      <Route path="/splash" component={SplashPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/dashboard" component={ProtectedDashboard} />
      <Route path="/markets" component={ProtectedMarketsPage} />
      <Route path="/markets/:symbol" component={ProtectedAssetDetailPage} />
      <Route path="/trade" component={ProtectedTradePage} />
      <Route path="/trade/:symbol" component={ProtectedTradeSymbolPage} />
      <Route path="/portfolio" component={ProtectedPortfolioPage} />
      <Route path="/profile" component={ProtectedProfilePage} />
      <Route path="/learn" component={ProtectedLearnPage} />
      <Route path="/achievements" component={ProtectedAchievementsPage} />
      <Route path="/challenges" component={ProtectedChallengesPage} />
      <Route path="/edit-profile" component={ProtectedEditProfilePage} />
      <Route path="/settings" component={ProtectedSettingsPage} />
      <Route path="/notifications" component={ProtectedNotificationsPage} />
      <Route path="/help" component={ProtectedHelpPage} />
      <Route path="/learn/:topicId/quiz" component={ProtectedQuizPage} />
      <Route path="/learn/:topicId" component={ProtectedTopicLessonPage} />
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
