import Parse from './parseConfig';

// 1. Solicita a geração do QR Code do PIX
export async function solicitarPix({ peladaId, valor, nomeJogador }) {
  const usuarioAtual = Parse.User.current();

  if (!usuarioAtual) {
    throw new Error('Usuário não autenticado.');
  }

  const idPelada = typeof peladaId === 'object' ? peladaId?.id : peladaId;

  const resposta = await Parse.Cloud.run('gerarCobrancaPix', {
    peladaId: idPelada,
    jogadorId: usuarioAtual.id,
    valor: Number(valor),
    nomeJogador: nomeJogador || usuarioAtual.get("username") || usuarioAtual.get("email") || "Atleta"
  });

  if (!resposta || (!resposta.qrCodeBase64 && !resposta.pixCopiaECola)) {
    throw new Error('A API do Mercado Pago não retornou dados válidos do QR Code.');
  }

  return {
    txid: resposta.txid,
    qrcode_url: resposta.qrCodeBase64,
    pix_copia_cola: resposta.pixCopiaECola
  };
}

// 2. Consulta o status do PIX na Cloud Function
export async function verificarStatusPix(txid, pelada = null) {
  const peladaId = typeof pelada === 'object' ? pelada?.id : pelada;

  return await Parse.Cloud.run('checarStatusPix', { 
    txid: String(txid), 
    peladaId 
  });
}

// 3. Busca a lista de peladas cadastradas
export async function fetchPeladas() {
  try {
    return await Parse.Cloud.run('fetchPeladas');
  } catch (error) {
    console.error("Erro ao buscar peladas no banco:", error);
    return [];
  }
}

// 4. Verifica se o usuário autenticado já está confirmado na pelada
export async function verificarUsuarioConfirmado(pelada) {
  const peladaId = typeof pelada === 'object' ? pelada?.id : pelada;

  if (!peladaId) return false;

  return await Parse.Cloud.run('verificarUsuarioConfirmado', { peladaId });
}

// 5. Busca a lista de jogadores confirmados para a pelada
export async function fetchJogadoresConfirmados(pelada) {
  const peladaId = typeof pelada === 'object' ? pelada?.id : pelada;

  if (!peladaId) return [];

  try {
    return await Parse.Cloud.run('getJogadoresConfirmados', { peladaId });
  } catch (error) {
    console.error("Erro ao buscar jogadores confirmados:", error);
    return [];
  }
}

// 6. Cria uma nova pelada chamando o Cloud Code
export async function criarPelada({ dataHora, valor, local }) {
  return await Parse.Cloud.run('criarPelada', {
    dataHora,
    valor: Number(valor),
    local
  });
}

// 7. Salva a confirmação manualmente (se necessário pelo app)
export async function salvarConfirmacao(pelada, txid = null) {
  const peladaId = typeof pelada === 'object' ? pelada?.id : pelada;

  return await Parse.Cloud.run('salvarConfirmacao', {
    peladaId,
    txid: txid ? String(txid) : null
  });
}