import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * The async context.
 */
export class AsyncContext<T> {
  private readonly store = new AsyncLocalStorage<T>();

  /**
   * Create a new async context.
   */
  public constructor(public readonly defaultValue: T) {}

  /**
   * Read the current value of the context.
   */
  public getValue() {
    return this.store.getStore() ?? this.defaultValue;
  }

  /**
   * Provide a new value to the context.
   */
  public provide<R>(value: T, receiver: (...args: any[]) => R): R {
    return this.store.run(value, receiver);
  }
}

/**
 * Create a new async context. The default value is used when the context is not provided.
 * @param defaultValue The default value of the context
 */
export function createAsyncContext<T = unknown>(
  defaultValue: T
): AsyncContext<T> {
  const ctx = new AsyncContext<T>(defaultValue);
  return ctx;
}

/**
 * Hook to get the current value of the async context.
 * @param context The async context
 */
export function useAsyncContext<T>(context: AsyncContext<T>) {
  return context.getValue();
}
