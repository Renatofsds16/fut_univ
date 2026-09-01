import React from 'react';

export function ListaConfirmados({ jogadoresConfirmados }) {
  return (
    <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginTop: '20px', textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#f8fafc' }}>⚽ Lista de Confirmados</h3>
        <span style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.85em', fontWeight: 'bold' }}>
          {jogadoresConfirmados.length} Jogadores
        </span>
      </div>

      {jogadoresConfirmados.length === 0 ? (
        <p style={{ color: '#94a3b8', margin: 0 }}>Nenhum jogador confirmou ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {jogadoresConfirmados.map((item, index) => {
            // Suporta tanto o formato novo (objeto JSON) quanto o legado (Parse.Object)
            const nome = typeof item.get === 'function' 
              ? (item.get('jogador')?.get('username') || item.get('nomeJogador') || 'Jogador')
              : (item.nome || 'Jogador');

            const numeroCamisa = typeof item.get === 'function'
              ? (item.get('numeroCamisa') || item.get('jogador')?.get('numeroCamisa') || null)
              : item.numeroCamisa;

            return (
              <div
                key={item.id || index}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#0f172a',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9em' }}>
                    {index + 1}.
                  </span>
                  <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                    {nome}
                  </span>
                  {numeroCamisa ? (
                    <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75em', fontWeight: 'bold' }}>
                      #{numeroCamisa}
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#334155', color: '#64748b', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7em' }}>
                      Nº --
                    </span>
                  )}
                </div>

                <span style={{ color: '#4ade80', fontWeight: 'bold', fontSize: '0.85em' }}>
                  PAGO ✓
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}