import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';
import { fetchPeladaAtiva, fetchJogadoresConfirmados } from '../services/api';

export function ConfirmadoPage() {
  const [carregando, setCarregando] = useState(true);
  const [peladaAtiva, setPeladaAtiva] = useState(null);
  const [jogadores, setJogadores] = useState([]);
  const navigate = useNavigate();
  const usuarioAtual = Parse.User.current();

  async function carregarDados() {
    try {
      setCarregando(true);
      const pelada = await fetchPeladaAtiva();
      setPeladaAtiva(pelada);

      if (pelada) {
        const lista = await fetchJogadoresConfirmados(pelada);
        setJogadores(lista);
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();

    const interval = setInterval(() => {
      carregarDados();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await Parse.User.logOut();
    navigate('/');
  }

  if (carregando && !peladaAtiva) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2>⏳ Carregando escalação dos confirmados...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Header Superior */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '0.85em', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Atleta Autenticado</span>
            <h3 style={{ margin: 0, color: '#38bdf8', fontSize: '1.2em' }}>
              {usuarioAtual?.get('username') || usuarioAtual?.get('email') || 'Atleta'}
            </h3>
          </div>
          <button
            onClick={handleLogout}
            style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            Sair
          </button>
        </header>

        {/* Card de Boas-Vindas / Status */}
        <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', padding: '24px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)', marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: '3em', marginBottom: '8px' }}>🎟️</div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '1.8em' }}>Presença Confirmada!</h1>
          <p style={{ margin: 0, color: '#dcfce7', fontSize: '1.05em' }}>Seu pagamento via PIX foi validado. Você já está escalado para a partida!</p>
        </div>

        {/* Informações do Jogo */}
        {peladaAtiva && (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', border: '1px solid #334155' }}>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>📍 Local</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1em' }}>{peladaAtiva.get('local') || 'Campo Universitário'}</p>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>📅 Data e Horário</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1em' }}>
                {peladaAtiva.get('dataHora') 
                  ? new Date(peladaAtiva.get('dataHora')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                  : 'A definir'}
              </p>
            </div>
            <div>
              <span style={{ color: '#94a3b8', fontSize: '0.9em' }}>💰 Valor Pago</span>
              <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1em', color: '#4ade80' }}>
                R$ {Number(peladaAtiva.get('valor') || 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {/* Lista Profissional de Confirmados */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '1.4em', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ⚽ Escalação dos Confirmados
            </h2>
            <span style={{ backgroundColor: '#3b82f6', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9em' }}>
              {jogadores.length} Confirmados
            </span>
          </div>

          {jogadores.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>Nenhum outro jogador confirmou ainda.</p>
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {jogadores.map((item, index) => (
                <div
                  key={item.id || index}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', padding: '14px 20px', borderRadius: '10px', border: '1px solid #1e293b' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ backgroundColor: '#334155', color: '#94a3b8', width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '50%', fontWeight: 'bold', fontSize: '0.9em' }}>
                      {index + 1}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Nome retornado diretamente pela API */}
                      <span style={{ fontWeight: '600', fontSize: '1.1em', color: '#f1f5f9' }}>
                        {item.nome}
                      </span>

                      {/* Preparado para número da camisa */}
                      {item.numeroCamisa ? (
                        <span style={{ backgroundColor: '#0284c7', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8em', fontWeight: 'bold' }}>
                          #{item.numeroCamisa}
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#334155', color: '#64748b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75em' }}>
                          Nº --
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{ backgroundColor: '#166534', color: '#4ade80', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8em', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                    PAGO ✓
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}