import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarPeladas } from "../services/game";

export function PeladasPage() {
  const navigate = useNavigate();

  const [peladas, setPeladas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    async function carregarPeladas() {
      try {
        setCarregando(true);
        setMensagemErro("");

        const resposta = await listarPeladas();

        console.log("Resposta das peladas:", resposta);

        if (resposta?.success) {
          setPeladas(resposta.peladas || []);
        } else {
          setMensagemErro("Não foi possível carregar as peladas.");
        }
      } catch (error) {
        console.error("Erro ao carregar peladas:", error);

        setMensagemErro(
          error?.message || "Não foi possível carregar as peladas."
        );

        setPeladas([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarPeladas();
  }, []);

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
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <h2>⏳ Carregando peladas...</h2>
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
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <h1
            style={{
              color: "#38bdf8",
              margin: 0,
              fontSize: "1.8em",
            }}
          >
            ⚽ Peladas disponíveis
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            Escolha uma pelada para ver os detalhes
          </p>
        </div>

        {mensagemErro && (
          <div
            style={{
              backgroundColor: "#ef444422",
              border: "1px solid #ef4444",
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

        {peladas.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {peladas.map((pelada) => (
              <div
                key={pelada.objectId}
                style={{
                  backgroundColor: "#1e293b",
                  padding: "20px",
                  borderRadius: "14px",
                  border: "1px solid #334155",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 12px",
                    color: "#f8fafc",
                    fontSize: "1.2rem",
                  }}
                >
                  ⚽ {pelada.local || "Pelada"}
                </h2>

                <p
                  style={{
                    margin: "8px 0",
                    color: "#cbd5e1",
                  }}
                >
                  📅 {formatarData(pelada.dataHora)}
                </p>

                <p
                  style={{
                    margin: "8px 0",
                    color: "#cbd5e1",
                  }}
                >
                  ⏰ {formatarHora(pelada.dataHora)}
                </p>

                <p
                  style={{
                    margin: "8px 0",
                    color: "#cbd5e1",
                  }}
                >
                  📍 {pelada.local || "Local não informado"}
                </p>

                <p
                  style={{
                    margin: "8px 0",
                    color: "#4ade80",
                    fontWeight: "bold",
                    fontSize: "1.1rem",
                  }}
                >
                  💰 {formatarValor(pelada.valor)}
                </p>

                <p
                  style={{
                    margin: "8px 0 16px",
                    color: "#4ade80",
                    fontWeight: "bold",
                  }}
                >
                  🟢 Pelada ativa
                </p>

                <button
                  onClick={() =>
                    navigate(`/pelada/${pelada.objectId}`)
                  }
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#38bdf8",
                    color: "#0f172a",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Ver pelada
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "45px 20px",
              borderRadius: "16px",
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "3rem",
                marginBottom: "15px",
              }}
            >
              ⚽
            </div>

            <h2
              style={{
                color: "#f8fafc",
                margin: "0 0 10px",
              }}
            >
              Nenhuma pelada encontrada
            </h2>

            <p
              style={{
                color: "#94a3b8",
                margin: 0,
              }}
            >
              Ainda não existem peladas ativas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}