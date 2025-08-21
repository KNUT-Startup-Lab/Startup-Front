// src/App.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Domitory Demo</h1>
      <ul style={{ lineHeight: 2 }}>
        <li><Link to="/dining">DiningFrame</Link></li>
        <li><Link to="/fridge">RefrigeratorFrame</Link></li>
        <li><Link to="/qa">QAFrame</Link></li>
      </ul>
    </div>
  );
}
