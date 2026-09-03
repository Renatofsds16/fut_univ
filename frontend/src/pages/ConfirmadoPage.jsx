import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';
import { fetchJogadoresConfirmados } from '../services/api';

export function ConfirmadoPage() {
  const [carregando, setCarregando] = useState(true);
  const [jogadores, setJogadores] = useState([]);
  const [carregandoJogadores, setCarregandoJogadores] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const peladaId = location.state?.peladaId;

  useEffect(() => {
    async function inicializar() {
      try {
        setCarregando(true);

        const estaConfirmadoLocal = peladaId 
          ? localStorage.getItem(`pelada_confirmada_${peladaId}`) 
          : null;

        const currentUser = Parse.User.current();

        if (!estaConfirmadoLocal && !currentUser) {
          navigate('/pelada', { replace: true });
          return;
        }

        // Se houver peladaId, carrega os jogadores confirmados do Parse
        if (peladaId) {
          setCarregandoJogadores(true);
          const Pelada = Parse.Object.extend("Pelada");
          const peladaRef = Pelada.createWithoutData(peladaId);
          
          const listaConfirmados = await fetchJogadoresConfirmados(peladaRef);
          setJogadores(listaConfirmados);
        }
      } catch (error) {
        console.error("Erro ao validar ou carregar confirmados:", error);
      } finally {
        setCarregando(false);
        setCarregandoJogadores(false);
      }
    }

    inicializar();
  }, [peladaId, navigate]);

  if (carregando) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff' }}>
        <h2>⏳ Carregando informações...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        
        {/* Banner de Sucesso */}
        <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', marginBottom: '24px' }}>
          <h1 style={{ color: '#4ade80', margin: '0 0 8px 0', fontSize: '1.8em' }}>🎉 Presença Confirmada!</h1>
          <p style={{ color: '#94a3b8', margin: 0 }}>Sua vaga na pelada está garantida e paga.</p>
        </div>

        {/* Lista de Jogadores Confirmados */}
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'left' }}>
          <h3 style={{ color: '#38bdf8', marginTop: 0, marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Jogadores Confirmados</span>
            <span style={{ backgroundColor: '#16a34a', color: '#fff', fontSize: '0.75em', padding: '4px 10px', borderRadius: '12px' }}>
              {jogadores.length} Pagos
            </span>
          </h3>

          {carregandoJogadores ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>Buscando lista de atletas...</p>
          ) : jogadores.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {jogadores.map((item, index) => (
                <div 
                  key={item.id || index}
                  style={{
                    backgroundColor: '#0f172a',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #1e293b'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 'bold', fontSize: '0.9em' }}>
                      #{index + 1}
                    </span>
                    <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>
                      {item.nome}
                    </span>
                    {item.numeroCamisa && (
                      <span style={{ color: '#38bdf8', fontSize: '0.85em' }}>
                        (Camisa {item.numeroCamisa})
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#4ade80', fontSize: '0.85em', fontWeight: 'bold', backgroundColor: '#16a34a22', padding: '4px 8px', borderRadius: '6px' }}>
                    ✅ Pago
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', margin: '16px 0' }}>
              Nenhum jogador confirmado no banco ainda.
            </p>
          )}
        </div>

        {/* Botão de Retorno */}
        <button 
          onClick={() => navigate('/pelada')}
          style={{
            width: '100%',
            backgroundColor: '#38bdf8',
            color: '#0f172a',
            border: 'none',
            padding: '14px',
            borderRadius: '10px',
            fontWeight: 'bold',
            fontSize: '1em',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Voltar para a Lista de Peladas
        </button>

      </div>
    </div>
  );
}