import React from 'react';
import './App.css';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './router';

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <div>
                    <AppRoutes />
                </div>
            </div>
        </BrowserRouter>

    );
}

export default App;
