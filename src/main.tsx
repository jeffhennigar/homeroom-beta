import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StudentView from './components/StudentView';
import './index.css';

// Simple routing based on query params
const params = new URLSearchParams(window.location.search);
const mode = params.get('mode');

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

if (mode === 'student') {
    root.render(
        <React.StrictMode>
            <StudentView />
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
