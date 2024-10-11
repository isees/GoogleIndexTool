import React from 'react';
import ReactDOM from 'react-dom/client';
import Popup from '../../components/Popup';

const App: React.FC = () => {
  return (
    <div>
      <h1>Google Index Tool</h1>
      {/* Add your component content here */}
      <Popup />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);