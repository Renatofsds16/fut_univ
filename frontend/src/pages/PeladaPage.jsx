import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { buscarPelada } from "../services/game";
import { listarConfirmados } from "../services/confirmacao";

export function PeladaPage() {

  const { peladaId } = useParams();

  const navigate = useNavigate();

  const [pelada, setPelada] = useState(null);

  const [carregando, setCarregando] = useState(true);

  const [mensagemErro, setMensagemErro] = useState("");

  const [jogadoresConfirmados, setJogadoresConfirmados] = useState([]);

  useEffect(() => {

    async function carregarPelada() {

      try {

        setCarregando(true);

        setMensagemErro("");

        console.log("ID da pelada:", peladaId);

        if (!peladaId) {

          setMensagemErro(
            "ID da pelada não informado."
          );

          return;
        }

        const resposta = await buscarPelada(
          peladaId
        );

        console.log(
          "Resposta da pelada:",
          resposta
        );

        if (
          resposta?.success &&
          resposta?.pelada
        ) {

          setPelada(resposta.pelada);

        } else {

          setMensagemErro(
            "Pelada não encontrada."
          );

          setPelada(null);
        }

      } catch (error) {

        console.error(
          "Erro ao carregar pelada:",
          error
        );

        setMensagemErro(
          error?.message ||
            "Não foi possível carregar a pelada."
        );

        setPelada(null);

      } finally {

        setCarregando(false);

      }
    }

    carregarPelada();

  }, [peladaId]);


  /*
   * CARREGAR JOGADORES CONFIRMADOS
   *
   * Busca somente as confirmações da
   * pelada atual que possuem pago = true.
   */
  useEffect(() => {

    async function carregarConfirmados() {

      try {

        if (!peladaId) {
          return;
        }

        const resposta =
          await listarConfirmados(peladaId);

        console.log(
          "Jogadores confirmados:",
          resposta
        );

        if (resposta?.success) {

          setJogadoresConfirmados(
            resposta.jogadores || []
          );

        } else {

          setJogadoresConfirmados([]);

        }

      } catch (error) {

        console.error(
          "Erro ao carregar jogadores confirmados:",
          error
        );

        /*
         * Não alteramos mensagemErro aqui.
         *
         * Assim, se a lista de confirmados
         * tiver algum problema, os detalhes
         * da pelada continuam funcionando.
         */
        setJogadoresConfirmados([]);

      }

    }

    carregarConfirmados();

  }, [peladaId]);


  function formatarData(dataHora) {

    if (!dataHora) {

      return "Data não informada";

    }

    return new Date(
      dataHora
    ).toLocaleDateString("pt-BR");

  }


  function formatarHora(dataHora) {

    if (!dataHora) {

      return "Horário não informado";

    }

    return new Date(
      dataHora
    ).toLocaleTimeString("pt-BR", {

      hour: "2-digit",

      minute: "2-digit",

    });

  }


  function formatarValor(valor) {

    return Number(
      valor || 0
    ).toLocaleString("pt-BR", {

      style: "currency",

      currency: "BRL",

    });

  }


  if (carregando) {

    return (

      <div
        style={{
          minHeight: "100vh",

          backgroundColor: "#0f172a",

          color: "#fff",

          display: "flex",

          justifyContent: "center",

          alignItems: "center",
        }}
      >

        <h2>
          ⏳ Carregando pelada...
        </h2>

      </div>

    );

  }


  return (

    <div
      style={{
        minHeight: "100vh",

        backgroundColor: "#0f172a",

        color: "#f8fafc",

        padding: "20px",

        fontFamily:
          "system-ui, -apple-system, sans-serif",
      }}
    >

      <div
        style={{
          maxWidth: "600px",

          margin: "0 auto",
        }}
      >

        {/* BOTÃO VOLTAR */}

        <button
          onClick={() =>
            navigate("/peladas")
          }
          style={{
            marginBottom: "20px",

            padding: "10px 15px",

            border: "1px solid #334155",

            borderRadius: "8px",

            backgroundColor: "#1e293b",

            color: "#f8fafc",

            cursor: "pointer",
          }}
        >

          ← Voltar

        </button>


        <h1
          style={{
            color: "#38bdf8",

            textAlign: "center",

            marginBottom: "30px",
          }}
        >

          ⚽ Detalhes da pelada

        </h1>


        {/* MENSAGEM DE ERRO */}

        {mensagemErro && (

          <div
            style={{
              backgroundColor: "#ef444422",

              border:
                "1px solid #ef4444",

              color: "#fca5a5",

              padding: "15px",

              borderRadius: "10px",

              textAlign: "center",

              marginBottom: "20px",
            }}
          >

            {mensagemErro}

          </div>

        )}


        {/* DADOS DA PELADA */}

        {pelada && (

          <>

            <div
              style={{
                backgroundColor: "#1e293b",

                padding: "25px",

                borderRadius: "16px",

                border:
                  "1px solid #334155",
              }}
            >

              <h2
                style={{
                  margin: "0 0 25px",

                  fontSize: "1.5rem",
                }}
              >

                📍{" "}
                {pelada.local ||
                  "Local não informado"}

              </h2>


              <div
                style={{
                  display: "grid",

                  gap: "18px",
                }}
              >

                {/* DATA */}

                <div>

                  <strong>
                    📅 Data
                  </strong>

                  <p
                    style={{
                      color: "#cbd5e1",
                    }}
                  >

                    {formatarData(
                      pelada.dataHora
                    )}

                  </p>

                </div>


                {/* HORÁRIO */}

                <div>

                  <strong>
                    ⏰ Horário
                  </strong>

                  <p
                    style={{
                      color: "#cbd5e1",
                    }}
                  >

                    {formatarHora(
                      pelada.dataHora
                    )}

                  </p>

                </div>


                {/* LOCAL */}

                <div>

                  <strong>
                    📍 Local
                  </strong>

                  <p
                    style={{
                      color: "#cbd5e1",
                    }}
                  >

                    {pelada.local ||
                      "Local não informado"}

                  </p>

                </div>


                {/* VALOR */}

                <div>

                  <strong>
                    💰 Valor
                  </strong>

                  <p
                    style={{
                      color: "#4ade80",

                      fontSize: "1.3rem",

                      fontWeight: "bold",
                    }}
                  >

                    {formatarValor(
                      pelada.valor
                    )}

                  </p>

                </div>


                {/* STATUS */}

                <div>

                  <strong>
                    📌 Status
                  </strong>

                  <p
                    style={{
                      color: pelada.ativa
                        ? "#4ade80"
                        : "#f87171",

                      fontWeight: "bold",
                    }}
                  >

                    {pelada.ativa
                      ? "🟢 Pelada ativa"
                      : "🔴 Pelada encerrada"}

                  </p>

                </div>


                {/* BOTÃO PAGAR PIX */}

                {pelada.ativa && (

                  <button
                    onClick={() =>
                      navigate(
                        `/pagamento/${peladaId}`
                      )
                    }
                    style={{
                      width: "100%",

                      padding: "14px",

                      marginTop: "5px",

                      border: "none",

                      borderRadius: "10px",

                      backgroundColor:
                        "#22c55e",

                      color: "#ffffff",

                      fontSize: "1rem",

                      fontWeight: "bold",

                      cursor: "pointer",
                    }}
                  >

                    💳 Pagar Pix

                  </button>

                )}


                {/* CRIADO POR */}

                {pelada.criadoPor && (

                  <div>

                    <strong>
                      👤 Criado por
                    </strong>

                    <p
                      style={{
                        color: "#cbd5e1",
                      }}
                    >

                      {pelada.criadoPor.username ||

                        pelada.criadoPor.email ||

                        "Usuário"}

                    </p>

                  </div>

                )}

              </div>

            </div>


            {/* ================================= */}
            {/* JOGADORES CONFIRMADOS */}
            {/* ================================= */}

            <div
              style={{
                marginTop: "20px",

                backgroundColor: "#1e293b",

                padding: "25px",

                borderRadius: "16px",

                border:
                  "1px solid #334155",
              }}
            >

              <div
                style={{
                  display: "flex",

                  justifyContent:
                    "space-between",

                  alignItems: "center",

                  marginBottom: "20px",
                }}
              >

                <h2
                  style={{
                    margin: 0,

                    fontSize: "1.3rem",
                  }}
                >

                  ⚽ Jogadores confirmados

                </h2>

                <span
                  style={{
                    backgroundColor:
                      "#22c55e",

                    color: "#ffffff",

                    padding:
                      "5px 10px",

                    borderRadius:
                      "20px",

                    fontSize: "0.85rem",

                    fontWeight: "bold",
                  }}
                >

                  {jogadoresConfirmados.length}

                </span>

              </div>


              {jogadoresConfirmados.length ===
              0 ? (

                <p
                  style={{
                    color: "#94a3b8",

                    textAlign: "center",

                    margin: 0,

                    padding: "10px 0",
                  }}
                >

                  Nenhum jogador
                  confirmado ainda.

                </p>

              ) : (

                <div
                  style={{
                    display: "grid",

                    gap: "10px",
                  }}
                >

                  {jogadoresConfirmados.map(
                    (jogador, index) => (

                      <div
                        key={
                          jogador.objectId ||
                          index
                        }
                        style={{
                          display: "flex",

                          alignItems:
                            "center",

                          gap: "12px",

                          padding: "12px",

                          backgroundColor:
                            "#0f172a",

                          borderRadius:
                            "10px",

                          border:
                            "1px solid #334155",
                        }}
                      >

                        <span
                          style={{
                            width: "35px",

                            height: "35px",

                            minWidth: "35px",

                            borderRadius:
                              "50%",

                            backgroundColor:
                              "#22c55e",

                            display: "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            fontWeight:
                              "bold",

                            color: "#fff",
                          }}
                        >

                          ✓

                        </span>


                        <span
                          style={{
                            color:
                              "#f8fafc",

                            fontWeight:
                              "500",
                          }}
                        >

                          {jogador.nome ||
                            "Jogador"}

                        </span>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </>

        )}

      </div>

    </div>

  );

}