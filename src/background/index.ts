/// <reference types="chrome"/>

console.log('Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// 在这里添加任何需要在后台运行的代码