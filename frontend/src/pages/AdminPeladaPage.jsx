import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';

export function AdminPeladaPage() {
  const [local, setLocal] = useState('');
  const [dataHora, setDataHora] = useState('');
  const [valor, setValor] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleCriarPelada(e) {
    e.preventDefault();
    try {
      setCarregando(true);
      const Pelada = Parse.Object.extend("Pelada");
      const pelada = new Pelada();
      
      pelada.set("local", local);
      pelada.set("dataHora", new Date(dataHora));
      pelada.set("valor", Number(valor));

      await pelada.save();
      alert("✅ Pelada cadastrada com sucesso!");
      navigate('/pelada');
    } catch (error) {
      console.error("Erro ao criar pelada:", error);
      alert("❌ Falha ao criar pelada.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>➕ Criar Nova Pelada</h2>
      <form onSubmit={handleCriarPelada} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input
          type="text"
          placeholder="Local da Pelada"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="datetime-local"
          value={dataHora}
          onChange={(e) => setDataHora(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <input
          type="number"
          step="0.01"
          placeholder="Valor (R$)"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
          style={{ padding: '10px' }}
        />
        <button type="submit" disabled={carregando} style={{ padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {carregando ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}