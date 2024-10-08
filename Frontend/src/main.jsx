import React from 'react'
import axios from 'axios';
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import store, { persistor } from './redux/store'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import "./i18n";

// Redirect to login page on 401 responses
// import { createBrowserHistory } from 'historsfgos';fsefs
// const history = createBrowserHistory();
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // history.push('/users/login');
      window.location = '/users/login';
    }
    if (error.response && error.response.status === 403) {
      // history.push('/forbidden');
      window.location = '/forbidden';
    }
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ReduxProvider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <App />
        </PersistGate>
      </ReduxProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
