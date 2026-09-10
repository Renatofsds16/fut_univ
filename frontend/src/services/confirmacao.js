import Parse from "./parseConfig";

export async function listarConfirmados(peladaId) {

  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  await Parse.User.become(token);

  const resposta = await Parse.Cloud.run(
    "listar_confirmados",
    {
      peladaId,
    }
  );

  return resposta;
}