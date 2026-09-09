import Parse from "./parseConfig";

export async function listarPeladas() {
  const resposta = await Parse.Cloud.run("list_peladas");

  return resposta;
}