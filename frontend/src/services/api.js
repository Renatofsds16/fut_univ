import Parse from './parseConfig';

export async function solicitarPix({ peladaId, valor, nomeJogador }) {
  const usuarioAtual = Parse.User.current();
  
  if (!usuarioAtual) {
    throw new Error('Usuário não autenticado.');
  }

  const resposta = await Parse.Cloud.run('gerarCobrancaPix', {
    peladaId,
    jogadorId: usuarioAtual.id,
    valor,
    nomeJogador
  });

  console.log('Resposta da Cloud Function gerarCobrancaPix:', resposta);

  if (!resposta || (!resposta.qrCodeBase64 && !resposta.pixCopiaECola)) {
    throw new Error('A API do Mercado Pago não retornou dados válidos do QR Code.');
  }

  return {
    txid: resposta.txid,
    qrcode_url: resposta.qrCodeBase64,
    pix_copia_cola: resposta.pixCopiaECola
  };
}

export async function verificarStatusPix(txid) {
  return await Parse.Cloud.run('checarStatusPix', { txid });
}

export async function fetchPeladaAtiva() {
  const Pelada = Parse.Object.extend("Pelada");
  const query = new Parse.Query(Pelada);
  query.descending("createdAt");
  return await query.first();
}

export async function fetchJogadoresConfirmados(pelada) {
  if (!pelada || !pelada.id) return [];

  const lista = await Parse.Cloud.run('getJogadoresConfirmados', {
    peladaId: pelada.id
  });

  return lista;
}

export async function criarPelada({ dataHora, valor, local }) {
  const Pelada = Parse.Object.extend("Pelada");
  const novaPelada = new Pelada();
  novaPelada.set("dataHora", new Date(dataHora));
  novaPelada.set("valor", Number(valor));
  novaPelada.set("local", local);
  return await novaPelada.save();
}