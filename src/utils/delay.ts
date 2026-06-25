/**
 * Utility: delay
 * Returns a Promise that resolves after the specified number of milliseconds.
 * Used throughout the service layer to simulate realistic network latency
 * in mock/fallback data paths.
 *
 * @param ms - Number of milliseconds to wait
 */
export const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));
