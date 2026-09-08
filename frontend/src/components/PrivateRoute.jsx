import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export function PrivateRoute() {
  const location = useLocation();

  const usuarioLogado = !!localStorage.getItem("token");
  console.log("*************************************************")
  console.log(usuarioLogado)
  console.log("*************************************************")

  if (!usuarioLogado) {
    return (
      <Navigate
        to="/"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}