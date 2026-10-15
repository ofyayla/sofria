"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Beklenmeyen arayüz hatası:", error, info.componentStack);
  }

  override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          className="max-w-sm mx-auto mt-24 p-8 text-center bg-surface rounded-panel shadow-[0_6px_14px_-2px_rgba(62,107,78,0.10)]"
          role="alert"
        >
          <h2 className="font-display font-bold text-[20px] text-ink">Bir şeyler ters gitti</h2>
          <p className="text-[15px] text-ink-secondary mt-2">Sayfa beklenmedik bir hatayla karşılaştı. Yenilemeyi deneyin.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center rounded-button bg-accent hover:bg-accent-hover text-on-accent font-display font-bold text-[16px] px-5 py-2.5"
          >
            Sayfayı yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
