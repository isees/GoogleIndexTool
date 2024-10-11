import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from '@/components/Popup';
import '@/styles/globals.css'; // 确保导入全局样式

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);