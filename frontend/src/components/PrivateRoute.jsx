import React from 'react';
import { Navigate } from 'react-router-dom';
import Parse from '../services/parseConfig';

export function PrivateRoute({ children }) {
  const currentUser = Parse.User.current();

  if (!currentUser) {
    
    return <Navigate to="/" replace />;
  }


  return children;
}