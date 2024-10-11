import React from 'react';
import ReactDOM from 'react-dom/client';

console.log('popup.tsx is running');

const Popup: React.FC = () => {
  return (
    <div>
      Hello World :)
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);