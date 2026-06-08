import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
