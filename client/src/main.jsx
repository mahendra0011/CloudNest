import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App.jsx';
import { store } from './store.js';
import { MuiProvider } from './components/MuiProvider.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <MuiProvider>
        <App />
      </MuiProvider>
    </Provider>
  </React.StrictMode>
);
