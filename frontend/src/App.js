import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormLogin } from './components/FormLogin';
import { PeladaPage } from './pages/PeladaPage';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormLogin />} />
      
      <Route
        path="/pelada"
        element={
          <PrivateRoute>
            <PeladaPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;