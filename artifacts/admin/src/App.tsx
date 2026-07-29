import { Route, Switch, Redirect } from "wouter";
import { useAuth } from "./contexts/AuthContext";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import HeroSlides from "./pages/HeroSlides";
import PageBanners from "./pages/PageBanners";
import NavItems from "./pages/NavItems";
import PagesList from "./pages/PagesList";
import PageEditor from "./pages/PageEditor";
import Publications from "./pages/Publications";
import Events from "./pages/Events";
import Notices from "./pages/Notices";
import Messages from "./pages/Messages";
import Media from "./pages/Media";
import ContactInfo from "./pages/ContactInfo";
import Footer from "./pages/Footer";
import Donations from "./pages/Donations";
import SettingsPage from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import Services from "./pages/Services";
import Industries from "./pages/Industries";
import Software from "./pages/Software";
import Training from "./pages/Training";
import TrainingPrograms from "./pages/TrainingPrograms";
import Gallery from "./pages/Gallery";
import FacultyAdvisors from "./pages/FacultyAdvisors";
import Backup from "./pages/Backup";
import Careers from "./pages/Careers";


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-surface-alt)]">
        <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Redirect to="/admin/login" />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Switch>
      {/* Public auth routes */}
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/forgot-password" component={ForgotPassword} />
      <Route path="/admin/reset-password" component={ResetPassword} />

      {/* Protected routes */}
      <Route path="/admin">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      <Route path="/admin/hero-slides">
        <ProtectedRoute><HeroSlides /></ProtectedRoute>
      </Route>
      <Route path="/admin/services">
        <ProtectedRoute><Services /></ProtectedRoute>
      </Route>
      <Route path="/admin/industries">
        <ProtectedRoute><Industries /></ProtectedRoute>
      </Route>
      <Route path="/admin/software">
        <ProtectedRoute><Software /></ProtectedRoute>
      </Route>
      <Route path="/admin/training">
        <ProtectedRoute><Training /></ProtectedRoute>
      </Route>
      <Route path="/admin/training-programs">
        <ProtectedRoute><TrainingPrograms /></ProtectedRoute>
      </Route>
      <Route path="/admin/careers">
        <ProtectedRoute><Careers /></ProtectedRoute>
      </Route>
      <Route path="/admin/page-banners">
        <ProtectedRoute><PageBanners /></ProtectedRoute>
      </Route>
      <Route path="/admin/gallery">
        <ProtectedRoute><Gallery /></ProtectedRoute>
      </Route>
      <Route path="/admin/faculty-advisors">
        <ProtectedRoute><FacultyAdvisors /></ProtectedRoute>
      </Route>
      <Route path="/admin/nav-items">
        <ProtectedRoute><NavItems /></ProtectedRoute>
      </Route>
      <Route path="/admin/pages">
        <ProtectedRoute><PagesList /></ProtectedRoute>
      </Route>
      <Route path="/admin/pages/:id">
        {(params) => <ProtectedRoute><PageEditor params={params} /></ProtectedRoute>}
      </Route>
      <Route path="/admin/publications">
        <ProtectedRoute><Publications /></ProtectedRoute>
      </Route>
      <Route path="/admin/events">
        <ProtectedRoute><Events /></ProtectedRoute>
      </Route>
      <Route path="/admin/notices">
        <ProtectedRoute><Notices /></ProtectedRoute>
      </Route>
      <Route path="/admin/messages">
        <ProtectedRoute><Messages /></ProtectedRoute>
      </Route>
      <Route path="/admin/media">
        <ProtectedRoute><Media /></ProtectedRoute>
      </Route>
      <Route path="/admin/contact-info">
        <ProtectedRoute><ContactInfo /></ProtectedRoute>
      </Route>
      <Route path="/admin/footer">
        <ProtectedRoute><Footer /></ProtectedRoute>
      </Route>
      <Route path="/admin/donations">
        <ProtectedRoute><Donations /></ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute><SettingsPage /></ProtectedRoute>
      </Route>
      <Route path="/admin/backup">
        <ProtectedRoute><Backup /></ProtectedRoute>
      </Route>
      <Route path="/admin/change-password">
        <ProtectedRoute><ChangePassword /></ProtectedRoute>
      </Route>

      {/* Fallback */}
      <Route>
        <Redirect to="/admin" />
      </Route>
    </Switch>
  );
}
