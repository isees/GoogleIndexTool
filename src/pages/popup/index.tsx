import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from '@/components/Popup';
import '@/styles/globals.css';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <Popup />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Error rendering Popup:', error);
    // 在DOM中显示错误信息
    container.innerHTML = `<div style="color: red; padding: 20px;">
      <h1>Error</h1>
      <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
      <pre>${error instanceof Error && error.stack ? error.stack : ''}</pre>
    </div>`;
  }
} else {
  console.error('Root element not found');
  // 如果找不到root元素，在body中添加错误信息
  document.body.innerHTML = '<div style="color: red; padding: 20px;">Root element not found</div>';
}