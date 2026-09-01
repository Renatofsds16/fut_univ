import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FormLogin } from './components/FormLogin';
import { FormCadastro } from './components/FormCadastro';
import { PeladaPage } from './pages/PeladaPage';
import { ConfirmadoPage } from './pages/ConfirmadoPage';
import { PrivateRoute } from './components/PrivateRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<FormLogin />} />
      <Route path="/cadastro" element={<FormCadastro />} />

      <Route
        path="/pelada"
        element={
          <PrivateRoute>
            <PeladaPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/confirmado"
        element={
          <PrivateRoute>
            <ConfirmadoPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;