import '@types/chrome';

declare global {
  interface Window {
    chrome: typeof chrome;
  }
}