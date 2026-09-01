import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';
import { fetchPeladaAtiva, fetchJogadoresConfirmados, criarPelada, solicitarPix, verificarStatusPix } from '../services/api';

import { CardPelada } from '../components/CardPelada';
import { AreaPix } from '../components/AreaPix';
import { ListaConfirmados } from '../components/ListaConfirmados';
import { FormCriarPelada } from '../components/FormCriarPelada';

export function PeladaPage() {
  const [carregando, setCarregando] = useState(true);
  const [peladaAtiva, setPeladaAtiva] = useState(null);
  const [jogadoresConfirmados, setJogadoresConfirmados] = useState([]);

  const [dataHora, setDataHora] = useState('');
  const [valor, setValor] = useState(12);
  const [local, setLocal] = useState('Campo Universitário');
  const [criando, setCriando] = useState(false);

  const [gerandoPix, setGerandoPix] = useState(false);
  const [dadosPix, setDadosPix] = useState(null);

  const navigate = useNavigate();
  const usuarioAtual = Parse.User.current();

  async function carregarDados(silencioso = false) {
    try {
      if (!silencioso) setCarregando(true);
      const pelada = await fetchPeladaAtiva();
      setPeladaAtiva(pelada || null);

      if (pelada) {
        const lista = await fetchJogadoresConfirmados(pelada);
        setJogadoresConfirmados(lista);

        const usuarioJaConfirmou = lista.some(conf => {
          const jogador = conf.get('jogador');
          return jogador && jogador.id === usuarioAtual?.id;
        });

        if (usuarioJaConfirmou) {
          navigate('/confirmado', { replace: true });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (dadosPix && dadosPix.txid) {
        try {
          const res = await verificarStatusPix(dadosPix.txid);
          if (res.pago) {
            alert('🎉 Pagamento confirmado com sucesso!');
            navigate('/confirmado');
            return;
          }
        } catch (e) {
          console.error("Erro ao checar Pix:", e);
        }
      }

      if (peladaAtiva) {
        carregarDados(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [dadosPix, peladaAtiva, navigate]);

  async function handleLogout() {
    await Parse.User.logOut();
    navigate('/');
  }

  async function handleCriarPelada(e) {
    e.preventDefault();
    if (!dataHora) return alert('Selecione a data e hora!');

    setCriando(true);
    try {
      await criarPelada({ dataHora, valor, local });
      alert('Pelada agendada com sucesso!');
      await carregarDados();
    } catch (error) {
      alert('Erro ao agendar pelada.');
    } finally {
      setCriando(false);
    }
  }

  async function handleGerarPix(e) {
    e.preventDefault();
    const nomeJogador = usuarioAtual?.get('username');

    if (!nomeJogador) {
      return alert('Usuário não autenticado.');
    }

    setGerandoPix(true);
    try {
      const respostaPix = await solicitarPix({
        peladaId: peladaAtiva.id,
        valor: peladaAtiva.get('valor'),
        nomeJogador
      });
      setDadosPix(respostaPix);
    } catch (error) {
      alert(`Erro ao gerar cobrança Pix: ${error.message || 'Tente novamente'}`);
    } finally {
      setGerandoPix(false);
    }
  }

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
        <h2>Carregando informações da pelada...</h2>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', fontFamily: 'sans-serif', padding: '0 20px', maxWidth: '600px', margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <span>Usuário: <strong>{usuarioAtual?.get('username')}</strong></span>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Sair
        </button>
      </div>

      <h1>⚽ Pelada Universitária</h1>

      {peladaAtiva ? (
        <>
          <CardPelada peladaAtiva={peladaAtiva} />
          <AreaPix
            gerandoPix={gerandoPix}
            dadosPix={dadosPix}
            setDadosPix={setDadosPix}
            onGerarPix={handleGerarPix}
          />
          <ListaConfirmados jogadoresConfirmados={jogadoresConfirmados} />
        </>
      ) : (
        <FormCriarPelada
          dataHora={dataHora}
          setDataHora={setDataHora}
          valor={valor}
          setValor={setValor}
          local={local}
          setLocal={setLocal}
          criando={criando}
          onCriarPelada={handleCriarPelada}
        />
      )}
    </div>
  );
}