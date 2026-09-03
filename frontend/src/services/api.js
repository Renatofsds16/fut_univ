import Parse from './parseConfig';

export async function solicitarPix({ peladaId, valor, nomeJogador }) {
  const usuarioAtual = Parse.User.current();
  
  if (!usuarioAtual) {
    throw new Error('Usuário não autenticado.');
  }

  const resposta = await Parse.Cloud.run('gerarCobrancaPix', {
    peladaId,
    jogadorId: usuarioAtual.id,
    valor: Number(valor),
    nomeJogador: nomeJogador || usuarioAtual.get("username") || usuarioAtual.get("email") || "Atleta"
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

export async function verificarStatusPix(txid, pelada = null) {
  const resposta = await Parse.Cloud.run('checarStatusPix', { txid });

  // Se o pagamento for aprovado e a pelada for informada, garante o salvamento correto no Parse
  if (pelada && resposta && (resposta.status === 'approved' || resposta.pago === true)) {
    await salvarConfirmacao(pelada, txid);
  }

  return resposta;
}

export async function fetchPeladas() {
  try {
    const Pelada = Parse.Object.extend("Pelada");
    const query = new Parse.Query(Pelada);
    query.descending("createdAt");
    
    const peladas = await query.find();

    console.log(`Foram encontradas ${peladas.length} peladas no Parse.`);
    return peladas;
  } catch (error) {
    console.error("Erro ao buscar peladas no banco:", error);
    return [];
  }
}

export async function verificarUsuarioConfirmado(pelada) {
  const usuario = Parse.User.current();
  if (!usuario || !pelada) return false;

  const Confirmacao = Parse.Object.extend("Confirmacao");
  const query = new Parse.Query(Confirmacao);
  query.equalTo("pelada", pelada);
  query.equalTo("user", usuario);
  query.equalTo("pago", true);

  const confirmacao = await query.first();
  return !!confirmacao;
}

export async function fetchJogadoresConfirmados(pelada) {
  if (!pelada) return [];

  try {
    const Confirmacao = Parse.Object.extend("Confirmacao");
    const query = new Parse.Query(Confirmacao);
    query.equalTo("pelada", pelada);
    query.equalTo("pago", true);
    
    // Traz apenas registros válidos onde 'user' está preenchido
    query.exists("user");
    query.include("user");

    const resultados = await query.find();

    return resultados.map(item => {
      const userObj = item.get("user");

      const nome = userObj 
        ? (userObj.get("username") || userObj.get("nome") || userObj.get("email")) 
        : "Atleta Confirmado";

      const numeroCamisa = userObj?.get("numeroCamisa") || item.get("numeroCamisa") || null;

      return {
        id: item.id,
        nome: nome,
        numeroCamisa: numeroCamisa,
        pago: item.get("pago")
      };
    });
  } catch (error) {
    console.error("Erro ao buscar jogadores confirmados:", error);
    return [];
  }
}

export async function criarPelada({ dataHora, valor, local }) {
  const Pelada = Parse.Object.extend("Pelada");
  const novaPelada = new Pelada();
  novaPelada.set("dataHora", new Date(dataHora));
  novaPelada.set("valor", Number(valor));
  novaPelada.set("local", local);
  novaPelada.set("ativa", true);
  return await novaPelada.save();
}

// FUNÇÃO CORRIGIDA: Atualiza o registro existente ou cria somente um registro completo
export async function salvarConfirmacao(pelada, txid = null) {
  try {
    const user = Parse.User.current();

    if (!user) {
      throw new Error("Usuário não autenticado no Parse.");
    }

    const Confirmacao = Parse.Object.extend("Confirmacao");
    let confirmacao = null;

    // 1. Busca por txid
    if (txid) {
      const queryTxid = new Parse.Query(Confirmacao);
      queryTxid.equalTo("pixTxid", txid);
      confirmacao = await queryTxid.first();
    }

    // 2. Se não encontrou por txid, busca registro do usuário nessa pelada
    if (!confirmacao) {
      const queryUser = new Parse.Query(Confirmacao);
      queryUser.equalTo("pelada", pelada);
      queryUser.equalTo("user", user);
      confirmacao = await queryUser.first();
    }

    // 3. Se ainda assim não encontrar, tenta buscar qualquer registro sem 'user' criado recentemente para esta pelada
    if (!confirmacao) {
      const queryPendente = new Parse.Query(Confirmacao);
      queryPendente.equalTo("pelada", pelada);
      queryPendente.doesNotExist("user");
      confirmacao = await queryPendente.first();
    }

    // 4. Se não existir nenhum registro prévio, cria um novo
    if (!confirmacao) {
      confirmacao = new Confirmacao();
    }

    // 5. Preenche todos os campos corretamente
    confirmacao.set("pelada", pelada);
    confirmacao.set("user", user);
    confirmacao.set("pago", true);
    confirmacao.set("dataConfirmacao", new Date());

    if (txid) {
      confirmacao.set("pixTxid", txid);
    }

    const resultado = await confirmacao.save();
    console.log("✅ Confirmação salva/atualizada com sucesso no Parse:", resultado);
    return resultado;
  } catch (error) {
    console.error("Erro ao salvar confirmação:", error);
    throw error;
  }
}