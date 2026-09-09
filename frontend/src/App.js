import React from "react";
import { Routes, Route } from "react-router-dom";
import { PagamentoPage } from "./pages/PagamentoPage";
import { FormLogin } from "./components/FormLogin";
import { FormCadastro } from "./components/FormCadastro";

import { PeladasPage } from "./pages/PeladasPage";
import { PeladaPage } from "./pages/PeladaPage";

import { ConfirmadoPage } from "./pages/ConfirmadoPage";
import { AdminPeladaPage } from "./pages/AdminPeladaPage";

import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<FormLogin />}
      />

      <Route
        path="/cadastro"
        element={<FormCadastro />}
      />

      {/* Lista todas as peladas */}
      <Route
        path="/peladas"
        element={
          <PrivateRoute>
            <PeladasPage />
          </PrivateRoute>
        }
      />

      {/* Exibe uma única pelada */}
      <Route
        path="/pelada/:peladaId"
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

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPeladaPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pagamento/:peladaId"
        element={
          <PrivateRoute>
            <PagamentoPage />
          </PrivateRoute>
        }
      />

    </Routes>
    
  );
}

export default App;