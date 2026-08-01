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
import { useEffect } from 'react';
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
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="absolute inset-y-0 w-1/2 bg-primary rounded-full"
          />
        </div>
      </div>
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
