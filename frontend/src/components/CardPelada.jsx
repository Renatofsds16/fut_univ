import React from 'react';

export function CardPelada({ peladaAtiva }) {
  if (!peladaAtiva) return null;

  return (
    <div style={{ border: '2px solid #2e7d32', padding: '20px', borderRadius: '8px', backgroundColor: '#f1f8e9', marginBottom: '20px' }}>
      <h2 style={{ color: '#2e7d32', marginTop: 0 }}>Próxima Pelada Agendada!</h2>
      <p><strong>Data/Hora:</strong> {new Date(peladaAtiva.get('dataHora')).toLocaleString()}</p>
      <p><strong>Valor individual:</strong> <span style={{ color: '#d32f2f', fontSize: '1.2em', fontWeight: 'bold' }}>R$ {peladaAtiva.get('valor')},00</span></p>
      <p><strong>Local:</strong> {peladaAtiva.get('local')}</p>
    </div>
  );
}