import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export function PrivateRoute({ children }) {
  const location = useLocation();

  const usuarioLogado = !!localStorage.getItem("token");

  console.log("=================================");
  console.log("Usuário logado:", usuarioLogado);
  console.log("=================================");

  if (!usuarioLogado) {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  return children;
}