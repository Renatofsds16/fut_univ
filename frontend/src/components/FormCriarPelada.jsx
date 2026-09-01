import React from 'react';

export function FormCriarPelada({ dataHora, setDataHora, valor, setValor, local, setLocal, criando, onCriarPelada }) {
  return (
    <div style={{ border: '2px dashed #ccc', padding: '30px', borderRadius: '8px', display: 'inline-block', maxWidth: '400px', width: '100%' }}>
      <h2>Nenhuma pelada marcada</h2>
      <p style={{ color: '#666' }}>Defina a data, hora e valor para criar a pelada:</p>

      <form onSubmit={onCriarPelada} style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left', marginTop: '20px' }}>
        <div>
          <label><strong>Data e Hora:</strong></label>
          <input
            type="datetime-local"
            value={dataHora}
            onChange={(e) => setDataHora(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label><strong>Valor individual (R$):</strong></label>
          <input
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            min="1"
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label><strong>Local:</strong></label>
          <input
            type="text"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={criando}
          style={{ backgroundColor: '#2e7d32', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}
        >
          {criando ? 'Agendando...' : 'Marcar Pelada'}
        </button>
      </form>
    </div>
  );
}