import browser, { Runtime } from 'webextension-polyfill';

browser.runtime.onMessage.addListener((
  message: any,
  sender: Runtime.MessageSender,
  sendResponse: (response?: any) => void
) => {
  if (message.action === 'submitUrl') {
    console.log('Submitting URL:', message.url);
    setTimeout(() => {
      sendResponse({ success: true });
    }, 1000);
    return true;
  }
});