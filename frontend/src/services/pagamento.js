import Parse from "./parseConfig";

export async function criarPagamentoPix(peladaId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "criar_pagamento_pix",
    {
      peladaId,
    }
  );

  return resposta;
}

export async function checarStatusPix(txid, peladaId) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "checarStatusPix",
    {
      txid,
      peladaId,
    }
  );

  return resposta;
}

export async function consultarPagamentoPix(txid) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "consultar_pagamento_pix",
    {
      txid,
    }
  );

  return resposta;
}

export async function cancelarPagamentoPix(txid) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "cancelar_pagamento_pix",
    {
      txid,
    }
  );

  return resposta;
}