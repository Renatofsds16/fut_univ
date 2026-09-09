import Parse from "./parseConfig";

// Lista todas as peladas ativas
export async function listarPeladas() {
  const resposta = await Parse.Cloud.run("list_peladas");

  return resposta;
}

// Busca uma única pelada pelo ID
export async function buscarPelada(peladaId) {
  const resposta = await Parse.Cloud.run("get_pelada", {
    peladaId,
  });

  return resposta;
}