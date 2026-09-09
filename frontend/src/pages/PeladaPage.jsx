import React, { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import { buscarPelada } from "../services/game";

export function PeladaPage() {
  const { peladaId } = useParams();

  const navigate = useNavigate();

  const [pelada, setPelada] = useState(null);

  const [carregando, setCarregando] = useState(true);

  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarPelada() {
      try {
        setCarregando(true);

        setMensagemErro("");

        console.log("ID da pelada:", peladaId);

        if (!peladaId) {
          setMensagemErro("ID da pelada não informado.");
          return;
        }

        const resposta = await buscarPelada(peladaId);

        console.log("Resposta da pelada:", resposta);

        if (resposta?.success && resposta?.pelada) {
          setPelada(resposta.pelada);
        } else {
          setMensagemErro("Pelada não encontrada.");
          setPelada(null);
        }
      } catch (error) {
        console.error("Erro ao carregar pelada:", error);

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

  function formatarData(dataHora) {
    if (!dataHora) {
      return "Data não informada";
    }

    return new Date(dataHora).toLocaleDateString("pt-BR");
  }

  function formatarHora(dataHora) {
    if (!dataHora) {
      return "Horário não informado";
    }

    return new Date(dataHora).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarValor(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
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
        <h2>⏳ Carregando pelada...</h2>
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
        fontFamily: "system-ui, -apple-system, sans-serif",
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
          onClick={() => navigate("/peladas")}
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
              border: "1px solid #ef4444",
              color: "#fca5a5",
              padding: "15px",
              borderRadius: "10px",
              textAlign: "center",
            }}
          >
            {mensagemErro}
          </div>
        )}

        {/* DADOS DA PELADA */}
        {pelada && (
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "25px",
              borderRadius: "16px",
              border: "1px solid #334155",
            }}
          >
            <h2
              style={{
                margin: "0 0 25px",
                fontSize: "1.5rem",
              }}
            >
              📍 {pelada.local || "Local não informado"}
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              {/* DATA */}
              <div>
                <strong>📅 Data</strong>

                <p style={{ color: "#cbd5e1" }}>
                  {formatarData(pelada.dataHora)}
                </p>
              </div>

              {/* HORÁRIO */}
              <div>
                <strong>⏰ Horário</strong>

                <p style={{ color: "#cbd5e1" }}>
                  {formatarHora(pelada.dataHora)}
                </p>
              </div>

              {/* LOCAL */}
              <div>
                <strong>📍 Local</strong>

                <p style={{ color: "#cbd5e1" }}>
                  {pelada.local || "Local não informado"}
                </p>
              </div>

              {/* VALOR */}
              <div>
                <strong>💰 Valor</strong>

                <p
                  style={{
                    color: "#4ade80",
                    fontSize: "1.3rem",
                    fontWeight: "bold",
                  }}
                >
                  {formatarValor(pelada.valor)}
                </p>
              </div>

              {/* STATUS */}
              <div>
                <strong>📌 Status</strong>

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
                    navigate(`/pagamento/${peladaId}`)
                  }
                  style={{
                    width: "100%",
                    padding: "14px",
                    marginTop: "5px",
                    border: "none",
                    borderRadius: "10px",
                    backgroundColor: "#22c55e",
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
                  <strong>👤 Criado por</strong>

                  <p style={{ color: "#cbd5e1" }}>
                    {pelada.criadoPor.username ||
                      pelada.criadoPor.email ||
                      "Usuário"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}