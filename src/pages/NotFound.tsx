import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <div className="sb-card p-10">
        <p className="text-5xl" aria-hidden>
          🤲
        </p>
        <p className="mt-4 text-sm font-bold uppercase tracking-widest text-brand-600 dark:text-accent-400">
          404
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Page not found</h1>
        <p className="sb-muted mt-3">
          That link does not lead anywhere. Try the dictionary, the learning dashboard or search for
          a sign directly.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="sb-btn-primary">
            Go home
          </Link>
          <Link to="/signs" className="sb-btn-secondary">
            Sign dictionary
          </Link>
          <Link to="/learn" className="sb-btn-ghost">
            Learning dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
