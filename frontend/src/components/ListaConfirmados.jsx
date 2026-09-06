import React from 'react';

export function ListaConfirmados({ jogadoresConfirmados = [] }) {
  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc' }}>⚽ Lista de Confirmados</h3>
        <span style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85em', fontWeight: 'bold' }}>
          {jogadoresConfirmados.length} Jogadores
        </span>
      </div>

      {jogadoresConfirmados.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center' }}>Nenhum jogador confirmado ainda.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px' }}>
          {jogadoresConfirmados.map((jogador, index) => (
            <li key={jogador.id || index} style={{ backgroundColor: '#0f172a', padding: '10px 14px', borderRadius: '6px', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <span>#{index + 1} {jogador.nome || jogador.username || (typeof jogador.get === 'function' ? jogador.get('nome') : 'Atleta')}</span>
              <span style={{ color: '#4ade80', fontSize: '0.85em' }}>✅ Confirmado</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}