import React from 'react';
import { Navigate } from 'react-router-dom';
import Parse from '../services/parseConfig'; // Importe sua instância/configuração do Parse

export function PrivateRoute({ children }) {
  // Verifica se existe um usuário logado na sessão atual do Parse
  const currentUser = Parse.User.current();

  if (!currentUser) {
    
    return <Navigate to="/" replace />;
  }


  return children;
}