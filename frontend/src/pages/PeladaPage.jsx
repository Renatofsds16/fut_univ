import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { allPeladas } from "../services/game";

export function PeladaPage() {
  // Apesar do nome usuarioId, ele representa o ID da pelada
  const { usuarioId } = useParams();

  const [listaPeladas, setListaPeladas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mensagemErro, setMensagemErro] = useState("");

  async function carregarPeladas() {
    try {
      setCarregando(true);
      setMensagemErro("");

      let resposta;

      // ==========================================
      // TEM ID NA URL
      // /peladas/akfdçafk
      // ==========================================
      if (usuarioId) {
        resposta = await allPeladas(usuarioId);
      }

      // ==========================================
      // NÃO TEM ID NA URL
      // /peladas
      // ==========================================
      else {
        resposta = await allPeladas();
      }

      setListaPeladas(resposta?.peladas || []);
    } catch (error) {
      console.error("Erro ao carregar peladas:", error);

      setMensagemErro(
        error?.message || "Não foi possível carregar as peladas."
      );

      setListaPeladas([]);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPeladas();
  }, [usuarioId]);

  // ==========================================
  // CARREGANDO
  // ==========================================

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

  // ==========================================
  // TELA
  // ==========================================

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
        {/* CABEÇALHO */}

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
            ⚽ {usuarioId ? "Pelada" : "Peladas"}
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "8px",
            }}
          >
            {usuarioId
              ? "Detalhes da pelada"
              : "Todas as peladas disponíveis"}
          </p>
        </div>

        {/* ERRO */}

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

        {/* PELADAS */}

        {listaPeladas.length > 0 ? (
          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {listaPeladas.map((pelada) => {
              const local = pelada.local;
              const valor = pelada.valor;
              const dataHora = pelada.dataHora;

              return (
                <div
                  key={pelada.objectId || pelada.id}
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
                    ⚽ {local || "Pelada"}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0",
                      color: "#cbd5e1",
                    }}
                  >
                    📅{" "}
                    {dataHora
                      ? new Date(dataHora).toLocaleString("pt-BR")
                      : "Data não informada"}
                  </p>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#4ade80",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    💰 R$ {Number(valor || 0).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          /* NENHUMA PELADA */

          <div
            style={{
              backgroundColor: "#1e293b",
              padding: "45px 20px",
              borderRadius: "16px",
              border: "1px solid #334155",
              textAlign: "center",
              margin: "40px auto",
              maxWidth: "450px",
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
              {usuarioId
                ? "A pelada informada não foi encontrada."
                : "Ainda não existem peladas cadastradas."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}