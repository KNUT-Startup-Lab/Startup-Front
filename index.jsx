// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App.jsx';
import DiningFrame from './components/DiningFrame.jsx';
import RefrigeratorFrame from './components/RefrigeratorFrame.jsx';
import QAFrame from './components/QAFrame.jsx';
import './index.css';

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/dining', element: <DiningFrame /> },
  { path: '/fridge', element: <RefrigeratorFrame /> },
  { path: '/qa', element: <QAFrame /> },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
