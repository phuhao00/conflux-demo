import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import Operations from './pages/Operations';

import Certificates from './pages/Certificates';
import Traceability from './pages/Traceability';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/operations" element={<Operations />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/traceability" element={<Traceability />} />
            {/* Add other routes as needed */}
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
