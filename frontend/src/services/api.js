import Parse from './parseConfig';

// Busca a pelada agendada mais recente
export async function fetchPeladaAtiva() {
  const Pelada = Parse.Object.extend('Pelada');
  const query = new Parse.Query(Pelada);
  query.equalTo('status', 'agendada');
  query.descending('createdAt');
  return await query.first();
}

// Busca a lista de jogadores confirmados da pelada
export async function fetchJogadoresConfirmados(peladaObj) {
  if (!peladaObj) return [];
  const Confirmacao = Parse.Object.extend('Confirmacao');
  const query = new Parse.Query(Confirmacao);
  query.equalTo('pelada', peladaObj);
  query.equalTo('pago', true);
  query.include('jogador');
  return await query.find();
}

// Cria uma nova pelada no banco
export async function criarPelada({ dataHora, valor, local }) {
  const Pelada = Parse.Object.extend('Pelada');
  const novaPelada = new Pelada();
  novaPelada.set('dataHora', new Date(dataHora));
  novaPelada.set('valor', Number(valor));
  novaPelada.set('local', local);
  novaPelada.set('status', 'agendada');
  return await novaPelada.save();
}

// Salva o novo jogador e chama a Cloud Function do Pix
export async function solicitarPix({ peladaId, valor, nomeJogador }) {
  const Jogador = Parse.Object.extend('Jogador');
  const novoJogador = new Jogador();
  novoJogador.set('nome', nomeJogador);
  const jogadorSalvo = await novoJogador.save();

  return await Parse.Cloud.run('gerarCobrancaPix', {
    peladaId,
    jogadorId: jogadorSalvo.id,
    valor,
    nomeJogador
  });
}

// Checa o status do Pix via Cloud Function
export async function verificarStatusPix(txid) {
  return await Parse.Cloud.run('checarStatusPix', { txid });
}