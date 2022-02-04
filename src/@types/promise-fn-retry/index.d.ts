export interface RetryOptions {
  times?: number;
  initialDelayTime?: number;
  onRetry?: (error: unknown) => void;
  shouldRetry?: (error: unknown) => void;
}

declare function retry<X>(functionToRetry: () => Promise<X>, options?: RetryOptions): Promise<X>;
export = retry;
