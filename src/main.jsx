/**
 * main.jsx — Application entry point.
 *
 * PROVIDER ORDER (outermost → innermost):
 *  StrictMode → QueryClientProvider → ThemeProvider → App
 *
 * NOTE — QueryClient scope:
 *   QueryClient is used only for the location mutations in PostcodeInput.tsx.
 *   The main data pipeline (CSV search) uses a custom Web Worker hook, not
 *   React Query. If PostcodeInput is ever refactored to plain async/await, the
 *   QueryClientProvider can be removed entirely.
 *
 * NOTE — ErrorBoundary:
 *   A minimal class-based boundary wraps the app so unhandled render errors
 *   are caught and shown to the user rather than crashing the entire page
 *   silently. In production, hook this up to your error reporting service
 *   (Sentry, Datadog, etc.) inside `componentDidCatch`.
 */

import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import App from "./App";

// ─── QueryClient ──────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
    },
  },
});

// ─── Minimal Error Boundary ───────────────────────────────────────────────────

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // TODO: wire up to Sentry / your error reporting service.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <h1 className="text-2xl font-medium font-heading">
            Something went wrong.
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            {this.state.error?.message ?? "An unexpected error occurred."}
          </p>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Mount ────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);