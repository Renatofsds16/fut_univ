import React from 'react';

export function ListaConfirmados({ jogadoresConfirmados }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', textAlign: 'left' }}>
      <h3 style={{ marginTop: 0 }}>📋 Lista de Confirmados ({jogadoresConfirmados.length})</h3>

      {jogadoresConfirmados.length === 0 ? (
        <p style={{ color: '#777' }}>Nenhum jogador com pagamento confirmado até o momento.</p>
      ) : (
        <ol style={{ paddingLeft: '20px' }}>
          {jogadoresConfirmados.map((item) => {
            const jogadorObj = item.get('jogador');
            const nome = jogadorObj ? jogadorObj.get('nome') : 'Jogador';
            return (
              <li key={item.id} style={{ marginBottom: '8px' }}>
                <strong>{nome}</strong> <span style={{ color: '#2e7d32', fontSize: '0.85em' }}>[Pago via Banco ✓]</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}