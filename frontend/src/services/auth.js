import Parse from "./parseConfig";

export async function login(
  email,
  password
) {
  const resposta = await Parse.Cloud.run("login", {
    email,
    password,
  });

  
  if (resposta?.sessionToken) {
    localStorage.setItem("token", resposta.sessionToken);
  }

  if (resposta?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(resposta.user)
    );
  }

  return resposta;
}

export async function signup(
  nome,
  email,
  password
) {
  const resposta = await Parse.Cloud.run("signup", {
    nome,
    email,
    password,
  });

  return resposta;
}