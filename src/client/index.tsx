import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';

const App = () => (
  <div className="container">
    <h1>Hello from React!</h1>
  </div>
);


const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
