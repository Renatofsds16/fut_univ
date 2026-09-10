import Parse from "./parseConfig";

export async function listarPeladas() {
  const resposta = await Parse.Cloud.run("list_peladas");

  return resposta;
}

export async function criarPelada(
  dataHora,
  valor,
  local,
  ativa = true
) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "create_pelada",
    {
      dataHora,
      valor,
      local,
      ativa,
    }
  );

  return resposta;
}