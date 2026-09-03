import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Parse from '../services/parseConfig';
import { 
  fetchPeladas, 
  verificarUsuarioConfirmado, 
  solicitarPix, 
  verificarStatusPix, 
  salvarConfirmacao 
} from '../services/api';

export function PeladaPage() {
  const [carregando, setCarregando] = useState(true);
  const [listaPeladas, setListaPeladas] = useState([]);
  const [peladaSelecionada, setPeladaSelecionada] = useState(null);
  
  const [processandoPix, setProcessandoPix] = useState(false);
  const [dadosPix, setDadosPix] = useState(null);
  const [copiado, setCopiado] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  // Estados para Modal/Formulário de Criar Pelada
  const [exibirFormCriar, setExibirFormCriar] = useState(false);
  const [novoLocal, setNovoLocal] = useState('');
  const [novaDataHora, setNovaDataHora] = useState('');
  const [novoValor, setNovoValor] = useState('');
  const [salvandoNovaPelada, setSalvandoNovaPelada] = useState(false);

  const navigate = useNavigate();

  // Função para garantir usuário no Parse
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

  // Função centralizada para salvar confirmação e redirecionar direto
  const concluirEIrParaConfirmado = useCallback(async (pelada) => {
    try {
      setProcessandoPix(true);
      await garantirUsuarioAtivo();
      
      // Salva no Parse
      await salvarConfirmacao(pelada);
      
      // Salva no LocalStorage do navegador para garantia
      localStorage.setItem(`pelada_confirmada_${pelada.id}`, 'true');
    } catch (error) {
      console.error("Erro ao concluir confirmação no Parse:", error);
      localStorage.setItem(`pelada_confirmada_${pelada.id}`, 'true');
    } finally {
      setProcessandoPix(false);
      // Navega imediatamente para /confirmado
      navigate('/confirmado', { state: { peladaId: pelada.id }, replace: true });
    }
  }, [navigate]);

  // Carrega a lista de peladas apenas
  async function carregarPeladas() {
    try {
      setCarregando(true);
      const peladas = await fetchPeladas();
      setListaPeladas(peladas);
    } catch (error) {
      console.error('Erro ao carregar lista de peladas:', error);
      setMensagemErro('Não foi possível carregar as peladas disponíveis.');
    } finally {
      setCarregando(false);
    }
  }

  // 1. Carrega lista de peladas apenas uma vez na montagem
  useEffect(() => {
    carregarPeladas();
  }, []);

  // 2. Polling automático: verifica o pagamento PIX a cada 3 segundos
  useEffect(() => {
    let intervalId;
    const idPagamento = dadosPix?.id || dadosPix?.payment_id || dadosPix?.txid;

    if (idPagamento && peladaSelecionada) {
      console.log('🔄 Monitorando pagamento ID:', idPagamento);

      intervalId = setInterval(async () => {
        try {
          const statusRes = await verificarStatusPix(idPagamento);
          console.log('🔎 Status PIX:', statusRes);

          const pago = 
            statusRes?.pago === true || 
            statusRes?.status === 'approved' || 
            statusRes?.status === 'PAGO' ||
            statusRes?.detail?.status === 'approved';

          if (pago) {
            console.log('✅ Pagamento Aprovado!');
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

  // Handler para criar nova pelada
  async function handleCriarPeladaSubmit(e) {
    e.preventDefault();
    if (!novoLocal || !novaDataHora || !novoValor) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      setSalvandoNovaPelada(true);
      await garantirUsuarioAtivo();

      const Pelada = Parse.Object.extend("Pelada");
      const novaPelada = new Pelada();

      novaPelada.set("local", novoLocal);
      novaPelada.set("dataHora", new Date(novaDataHora));
      novaPelada.set("valor", Number(novoValor));

      await novaPelada.save();
      
      setNovoLocal('');
      setNovaDataHora('');
      setNovoValor('');
      setExibirFormCriar(false);

      await carregarPeladas();
    } catch (error) {
      console.error("Erro ao salvar nova pelada:", error);
      alert("Falha ao salvar pelada: " + error.message);
    } finally {
      setSalvandoNovaPelada(false);
    }
  }

  // Ao clicar em uma pelada, verifica se ela já foi confirmada
  async function handleSelecionarPelada(pelada) {
    try {
      setCarregando(true);
      await garantirUsuarioAtivo();

      const jaConfirmadoLocal = localStorage.getItem(`pelada_confirmada_${pelada.id}`);
      const jaConfirmadoParse = await verificarUsuarioConfirmado(pelada);

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

      const respostaPix = await solicitarPix({
        peladaId: peladaSelecionada.id,
        valor: peladaSelecionada.get('valor') || 0,
        nomeJogador: nomeUsuario
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
    if (dadosPix?.pix_copia_cola) {
      navigator.clipboard.writeText(dadosPix.pix_copia_cola);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 3000);
    }
  }

  async function handleForcarConfirmacao() {
    if (peladaSelecionada) {
      await concluirEIrParaConfirmado(peladaSelecionada);
    }
  }

  if (carregando && !salvandoNovaPelada) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0f172a', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2>⏳ Carregando peladas...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif', padding: '20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Cabeçalho */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ color: '#38bdf8', margin: 0, fontSize: '1.8em' }}>⚽ Peladas Disponíveis</h1>
            <p style={{ color: '#94a3b8', margin: '4px 0 0 0', fontSize: '0.9em' }}>Selecione uma pelada para garantir sua vaga.</p>
          </div>
          
          <button
            onClick={() => setExibirFormCriar(!exibirFormCriar)}
            style={{
              backgroundColor: exibirFormCriar ? '#ef4444' : '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.9em'
            }}
          >
            {exibirFormCriar ? '✖ Cancelar' : '➕ Criar Pelada'}
          </button>
        </div>

        {/* Formulário de Criar Pelada */}
        {exibirFormCriar && (
          <form 
            onSubmit={handleCriarPeladaSubmit} 
            style={{ 
              backgroundColor: '#1e293b', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #38bdf8', 
              marginBottom: '24px',
              display: 'grid',
              gap: '12px'
            }}
          >
            <h3 style={{ margin: 0, color: '#38bdf8' }}>➕ Cadastrar Nova Pelada</h3>
            
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>LOCAL</label>
              <input
                type="text"
                placeholder="Ex: Arena Gol de Placa"
                value={novoLocal}
                onChange={(e) => setNovoLocal(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>DATA E HORÁRIO</label>
              <input
                type="datetime-local"
                value={novaDataHora}
                onChange={(e) => setNovaDataHora(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8em', marginBottom: '4px' }}>VALOR (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="25.00"
                value={novoValor}
                onChange={(e) => setNovoValor(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={salvandoNovaPelada}
              style={{
                backgroundColor: '#38bdf8',
                color: '#0f172a',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: salvandoNovaPelada ? 'not-allowed' : 'pointer',
                marginTop: '8px'
              }}
            >
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
            <button 
              onClick={() => { setPeladaSelecionada(null); setDadosPix(null); }}
              style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', marginBottom: '12px' }}
            >
              ⬅️ Voltar para a lista
            </button>

            <h2 style={{ color: '#38bdf8', marginTop: 0 }}>
              {peladaSelecionada.get('local') || peladaSelecionada.get('nome') || 'Pelada'}
            </h2>

            <div style={{ textAlign: 'left', marginBottom: '24px', display: 'grid', gap: '12px' }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8em', fontWeight: 'bold' }}>📅 DATA E HORÁRIO</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.1em' }}>
                  {peladaSelecionada.get('dataHora')
                    ? new Date(peladaSelecionada.get('dataHora')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                    : (peladaSelecionada.get('data') || 'A definir')}
                </p>
              </div>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '0.8em', fontWeight: 'bold' }}>💰 VALOR</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', fontSize: '1.3em', color: '#4ade80' }}>
                  R$ {Number(peladaSelecionada.get('valor') || 0).toFixed(2)}
                </p>
              </div>
            </div>

            {!dadosPix ? (
              <button
                onClick={handleGerarPix}
                disabled={processandoPix}
                style={{
                  width: '100%',
                  backgroundColor: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  fontSize: '1.1em',
                  cursor: processandoPix ? 'not-allowed' : 'pointer',
                  opacity: processandoPix ? 0.7 : 1
                }}
              >
                {processandoPix ? '🔄 Gerando QR Code PIX...' : '📲 Gerar QR Code PIX'}
              </button>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <h3 style={{ color: '#f8fafc', margin: '0 0 12px 0' }}>Escaneie o QR Code para pagar:</h3>

                {(dadosPix.qrcode_url || dadosPix.qr_code_base64) && (
                  <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '12px', display: 'inline-block', margin: '8px 0' }}>
                    <img
                      src={
                        (dadosPix.qrcode_url || dadosPix.qr_code_base64).startsWith('data:') 
                          ? (dadosPix.qrcode_url || dadosPix.qr_code_base64) 
                          : `data:image/png;base64,${dadosPix.qrcode_url || dadosPix.qr_code_base64}`
                      }
                      alt="QR Code PIX"
                      style={{ width: '200px', height: '200px', borderRadius: '8px' }}
                    />
                  </div>
                )}

                <p style={{ color: '#94a3b8', fontSize: '0.9em', marginTop: '12px' }}>Ou utilize o código Copia e Cola:</p>

                <button
                  onClick={handleCopiarPix}
                  style={{
                    width: '100%',
                    backgroundColor: 'transparent',
                    color: '#38bdf8',
                    border: '1px solid #38bdf8',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  {copiado ? '✅ Código Copiado!' : '📋 Copiar Código PIX'}
                </button>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#4ade80' }}>
                  <span style={{ fontSize: '1.2em' }}>🔄</span>
                  <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>Aguardando confirmação automática...</span>
                </div>

                <button
                  onClick={handleForcarConfirmacao}
                  style={{
                    marginTop: '16px',
                    backgroundColor: 'transparent',
                    color: '#38bdf8',
                    border: 'none',
                    fontSize: '0.85em',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Já fiz o PIX? Clique aqui para confirmar a vaga.
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {listaPeladas.length > 0 ? (
              listaPeladas.map((pelada) => (
                <div 
                  key={pelada.id} 
                  style={{ 
                    backgroundColor: '#1e293b', 
                    padding: '20px', 
                    borderRadius: '12px', 
                    border: '1px solid #334155',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc' }}>
                      {pelada.get('local') || pelada.get('nome') || 'Pelada'}
                    </h3>
                    <p style={{ margin: '0 0 4px 0', color: '#94a3b8', fontSize: '0.9em' }}>
                      📅 {pelada.get('dataHora')
                        ? new Date(pelada.get('dataHora')).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                        : (pelada.get('data') || 'Data a definir')}
                    </p>
                    <p style={{ margin: 0, color: '#4ade80', fontWeight: 'bold' }}>
                      R$ {Number(pelada.get('valor') || 0).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelecionarPelada(pelada)}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#fff',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Confirmar Vaga
                  </button>
                </div>
              ))
            ) : (
              <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ color: '#94a3b8', margin: 0 }}>Nenhuma pelada cadastrada ainda.</p>
                <p style={{ color: '#64748b', fontSize: '0.85em', marginTop: '8px' }}>Clique no botão "➕ Criar Pelada" acima para cadastrar a primeira.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}