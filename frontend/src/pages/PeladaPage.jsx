import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';
import { 
  fetchPeladas, 
  verificarUsuarioConfirmado, 
  solicitarPix, 
  verificarStatusPix, 
  salvarConfirmacao,
  criarPelada
} from '../services/api';

export function PeladaPage() {
  const [carregando, setCarregando] = useState(true);
  const [listaPeladas, setListaPeladas] = useState([]);
  const [peladaSelecionada, setPeladaSelecionada] = useState(null);
  
  const [processandoPix, setProcessandoPix] = useState(false);
  const [dadosPix, setDadosPix] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [exibirFormCriar, setExibirFormCriar] = useState(false);
  const [novoLocal, setNovoLocal] = useState('');
  const [novaDataHora, setNovaDataHora] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [salvandoNovaPelada, setSalvandoNovaPelada] = useState(false);

  const navigate = useNavigate();

  async function garantirUsuarioAtivo() {
    let currentUser = Parse.User.current();
    if (!currentUser) {
      try {
        currentUser = await Parse.User.logInAnonymously();
      } catch (err) {
        console.error("Erro ao autenticar usuário anônimo:", err);
      }
    }
    return currentUser;
  }

  const concluirEIrParaConfirmado = useCallback(async (pelada) => {
    try {
      setProcessandoPix(true);
      await garantirUsuarioAtivo();
      
      // Chamada ajustada enviando os identificadores necessários para o Cloud Code
      await salvarConfirmacao({
        peladaId: pelada.id,
        txid: dadosPix?.txid || dadosPix?.id
      });

      localStorage.setItem(`pelada_confirmada_${pelada.id}`, 'true');
    } catch (error) {
      console.error("Erro ao concluir confirmação via Cloud Code:", error);
      localStorage.setItem(`pelada_confirmada_${pelada.id}`, 'true');
    } finally {
      setProcessandoPix(false);
      navigate('/confirmado', { state: { peladaId: pelada.id }, replace: true });
    }
  }, [navigate, dadosPix]);

  async function carregarPeladas() {
    try {
      setCarregando(true);
      const peladas = await fetchPeladas();
      setListaPeladas(peladas || []);
    } catch (error) {
      console.error('Erro ao carregar lista de peladas:', error);
      setMensagemErro('Não foi possível carregar as peladas disponíveis.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPeladas();
  }, []);

  useEffect(() => {
    let intervalId;
    const idPagamento = dadosPix?.txid || dadosPix?.id || dadosPix?.payment_id;

    if (idPagamento && peladaSelecionada) {
      intervalId = setInterval(async () => {
        try {
          const statusRes = await verificarStatusPix({
            txid: idPagamento,
            peladaId: peladaSelecionada.id
          });

          const pago = 
            statusRes?.pago === true || 
            statusRes?.status === 'approved';

          if (pago) {
            clearInterval(intervalId);
            await concluirEIrParaConfirmado(peladaSelecionada);
          }
        } catch (error) {
          console.error('Erro no polling do PIX:', error);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [dadosPix, peladaSelecionada, concluirEIrParaConfirmado]);

  // Handler corrigido: chama a Cloud Function do Back4App para criação
  async function handleCriarPeladaSubmit(e) {
    e.preventDefault();
    if (!novoLocal || !novaDataHora || !novoValor) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      setSalvandoNovaPelada(true);
      await garantirUsuarioAtivo();

      // Envia requisição para a Cloud Function 'criarPelada' no Back4App
      await criarPelada({
        local: novoLocal,
        dataHora: novaDataHora,
        valor: Number(novoValor)
      });
      
      setNovoLocal('');
      setNovaDataHora('');
      setNovoValor('');
      setExibirFormCriar(false);

      await carregarPeladas();
    } catch (error) {
      console.error("Erro ao criar pelada no backend:", error);
      alert("Falha ao criar pelada: " + (error.message || "Erro interno no servidor"));
    } finally {
      setSalvandoNovaPelada(false);
    }
  }

  async function handleSelecionarPelada(pelada) {
    try {
      setCarregando(true);
      await garantirUsuarioAtivo();

      const jaConfirmadoLocal = localStorage.getItem(`pelada_confirmada_${pelada.id}`);
      const jaConfirmadoParse = await verificarUsuarioConfirmado({ peladaId: pelada.id });

      if (jaConfirmadoLocal || jaConfirmadoParse) {
        navigate('/confirmado', { state: { peladaId: pelada.id }, replace: true });
        return;
      }

      setPeladaSelecionada(pelada);
      setDadosPix(null);
      setMensagemErro('');
    } catch (error) {
      console.error('Erro ao verificar confirmação:', error);
    } finally {
      setCarregando(false);
    }
  }

  async function handleGerarPix() {
    if (!peladaSelecionada) return;

    try {
      setProcessandoPix(true);
      setMensagemErro('');

      const usuarioAtual = await garantirUsuarioAtivo();
      const nomeUsuario = usuarioAtual 
        ? (usuarioAtual.get('username') || usuarioAtual.get('email') || 'Atleta') 
        : 'Atleta';

      const valorPelada = typeof peladaSelecionada.get === 'function' 
        ? peladaSelecionada.get('valor') 
        : peladaSelecionada.valor;

      const respostaPix = await solicitarPix({
        peladaId: peladaSelecionada.id,
        valor: valorPelada || 0,
        nomeJogador: nomeUsuario,
        jogadorId: usuarioAtual?.id
      });

      setDadosPix(respostaPix);
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      setMensagemErro(error.message || 'Falha ao gerar o PIX. Tente novamente.');
    } finally {
      setProcessandoPix(false);
    }
  }

  function handleCopiarPix() {
    const code = dadosPix?.pixCopiaECola || dadosPix?.pix_copia_cola || dadosPix?.qr_code;
    if (code) {
      navigator.clipboard.writeText(code);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  }

  if (carregando && !salvandoNovaPelada) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff' }}>
        <h2>⏳ Carregando peladas...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '1.8em' }}>⚽ Peladas Disponíveis</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9em' }}>Selecione uma pelada para garantir sua vaga.</p>
          </div>
          
          <button
            onClick={() => setExibirFormCriar(!exibirFormCriar)}
            style={{ backgroundColor: exibirFormCriar ? '#ef4444' : '#16a34a', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {exibirFormCriar ? '✖ Cancelar' : '➕ Criar Pelada'}
          </button>
        </div>

        {exibirFormCriar && (
          <form onSubmit={handleCriarPeladaSubmit} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #38bdf8', marginBottom: '24px', display: 'grid', gap: '12px' }}>
            <h3 style={{ margin: 0, color: '#38bdf8' }}>➕ Cadastrar Nova Pelada</h3>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>LOCAL</label>
              <input type="text" placeholder="Ex: Arena Gol de Placa" value={novoLocal} onChange={(e) => setNovoLocal(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>DATA E HORÁARIO</label>
              <input type="datetime-local" value={novaDataHora} onChange={(e) => setNovaDataHora(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>VALOR (R$)</label>
              <input type="number" step="0.01" placeholder="25.00" value={novoValor} onChange={(e) => setNovoValor(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }} />
            </div>
            <button type="submit" disabled={salvandoNovaPelada} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: salvandoNovaPelada ? 'not-allowed' : 'pointer' }}>
              {salvandoNovaPelada ? 'Salvando...' : 'Salvar e Publicar Pelada'}
            </button>
          </form>
        )}

        {mensagemErro && (
          <div style={{ backgroundColor: '#ef444422', border: '1px solid #ef4444', color: '#fca5a5', padding: '12px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
            {mensagemErro}
          </div>
        )}

        {peladaSelecionada ? (
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '2px solid #38bdf8', marginBottom: '24px' }}>
            <button onClick={() => { setPeladaSelecionada(null); setDadosPix(null); }} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginBottom: '12px' }}>
              ⬅️ Voltar para a lista
            </button>

            <h2 style={{ color: '#38bdf8', marginTop: 0 }}>
              {typeof peladaSelecionada.get === 'function' ? peladaSelecionada.get('local') : peladaSelecionada.local}
            </h2>

            {!dadosPix ? (
              <button onClick={handleGerarPix} disabled={processandoPix} style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', cursor: processandoPix ? 'not-allowed' : 'pointer' }}>
                {processandoPix ? '🔄 Gerando QR Code PIX...' : '📲 Gerar QR Code PIX'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <h3 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>Escaneie o QR Code para pagar:</h3>
                {(dadosPix.qrCodeBase64 || dadosPix.qrcode_url || dadosPix.qr_code_base64) && (
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px', display: 'inline-block', margin: '8px 0' }}>
                    <img
                      src={dadosPix.qrCodeBase64 || dadosPix.qrcode_url || dadosPix.qr_code_base64}
                      alt="QR Code PIX"
                      style={{ width: '200px', height: '200px', borderRadius: '8px' }}
                    />
                  </div>
                )}
                <button onClick={handleCopiarPix} style={{ width: '100%', backgroundColor: 'transparent', color: '#38bdf8', border: '1px solid #38bdf8', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '8px' }}>
                  {copiado ? '✅ Código Copiado!' : '📋 Copiar Código PIX'}
                </button>
                <button onClick={() => concluirEIrParaConfirmado(peladaSelecionada)} style={{ marginTop: '16px', backgroundColor: 'transparent', color: '#38bdf8', border: 'none', fontSize: '0.85em', textDecoration: 'underline', cursor: 'pointer' }}>
                  Já fiz o PIX? Clique aqui para confirmar a vaga.
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {listaPeladas.length > 0 ? (
              listaPeladas.map((pelada) => {
                const local = typeof pelada.get === 'function' ? pelada.get('local') : pelada.local;
                const valor = typeof pelada.get === 'function' ? pelada.get('valor') : pelada.valor;
                return (
                  <div key={pelada.id} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>{local || 'Pelada'}</h3>
                      <p style={{ margin: 0, color: '#4ade80', fontWeight: 'bold' }}>R$ {Number(valor || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleSelecionarPelada(pelada)} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirmar Vaga
                    </button>
                  </div>
                );
              })
            ) : (
              <p style={{ color: '#94a3b8', textAlign: 'center' }}>Nenhuma pelada cadastrada ainda.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}