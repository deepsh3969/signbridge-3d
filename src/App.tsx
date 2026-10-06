import { Component, Suspense, lazy, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import { useApplySettings, usePrefersReducedMotion } from '@/hooks/useAccessibility';

const Landing = lazy(() => import('@/pages/Landing'));
const Learn = lazy(() => import('@/pages/Learn'));
const Signs = lazy(() => import('@/pages/Signs'));
const SignDetails = lazy(() => import('@/pages/SignDetails'));
const Practice = lazy(() => import('@/pages/Practice'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const Progress = lazy(() => import('@/pages/Progress'));
const Communicate = lazy(() => import('@/pages/Communicate'));
const Settings = lazy(() => import('@/pages/Settings'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="sb-card p-8">
            <p className="text-4xl" aria-hidden>
              🤲
            </p>
            <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
            <p className="sb-muted mt-2 text-sm">
              This part of SignBridge could not be displayed. Your progress is saved locally and is
              safe. Try refreshing the page.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" className="sb-btn-primary" onClick={() => window.location.reload()}>
                Reload page
              </button>
              <a href="/" className="sb-btn-secondary">
                Go home
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-3 text-ink-2">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        <span className="text-sm font-medium">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  useApplySettings();
  usePrefersReducedMotion();

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <a href="#main" className="sb-skip">
          Skip to main content
        </a>
        <AppShell>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/signs" element={<Signs />} />
              <Route path="/sign/:id" element={<SignDetails />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/practice/:id" element={<Practice />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/communicate" element={<Communicate />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppShell>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
