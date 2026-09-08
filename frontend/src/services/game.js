import Parse from "./parseConfig";


export async function allPeladas(
  usuarioId
){
  const resposta = await Parse.Cloud.run("list_peladas", {
    usuarioId
  });
  console.log("***********************Resposta*****************")
  console.log(resposta)
  console.log("*************************************************")
  return resposta;
}
