import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import { criarPelada } from "../services/peladas";

export function CriarPeladaPage() {

  const navigate = useNavigate();

  const [dataHora, setDataHora] = useState("");
  const [valor, setValor] = useState("");
  const [local, setLocal] = useState("");
  const [ativa, setAtiva] = useState(true);

  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  async function handleSubmit(event) {

    event.preventDefault();

    setMensagemErro("");

    if (!dataHora) {
      setMensagemErro("Data e hora são obrigatórias.");
      return;
    }

    if (!local.trim()) {
      setMensagemErro("O local é obrigatório.");
      return;
    }

    if (valor === "" || Number(valor) < 0) {
      setMensagemErro("Informe um valor válido.");
      return;
    }

    try {

      setCarregando(true);

      const data = new Date(dataHora);

      if (isNaN(data.getTime())) {
        setMensagemErro("Data e hora inválidas.");
        return;
      }

      const resposta = await criarPelada(
        data.toISOString(),
        Number(valor),
        local.trim(),
        ativa
      );

      console.log("Pelada criada:", resposta);

      if (
        resposta?.success &&
        resposta?.pelada?.objectId
      ) {

        navigate(
          `/pelada/${resposta.pelada.objectId}`
        );

        return;
      }

      setMensagemErro(
        "Não foi possível criar a pelada."
      );

    } catch (error) {

      console.error(
        "Erro ao criar pelada:",
        error
      );

      setMensagemErro(
        error?.message ||
        "Não foi possível criar a pelada."
      );

    } finally {

      setCarregando(false);

    }

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

        <button
          type="button"
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
            marginBottom: "10px",
          }}
        >
          ⚽ Criar pelada
        </h1>

        <p
          style={{
            color: "#94a3b8",
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          Preencha os dados da nova pelada
        </p>

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

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#1e293b",
            padding: "25px",
            borderRadius: "16px",
            border: "1px solid #334155",
          }}
        >

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              📅 Data e hora
            </label>

            <input
              type="datetime-local"
              value={dataHora}
              onChange={(event) =>
                setDataHora(event.target.value)
              }
              disabled={carregando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
              }}
            />

          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              💰 Valor
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(event) =>
                setValor(event.target.value)
              }
              placeholder="Ex: 20.00"
              disabled={carregando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
              }}
            />

          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >

            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              📍 Local
            </label>

            <input
              type="text"
              value={local}
              onChange={(event) =>
                setLocal(event.target.value)
              }
              placeholder="Ex: Campo do bairro"
              disabled={carregando}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #475569",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
              }}
            />

          </div>

          <div
            style={{
              marginBottom: "25px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <input
              id="ativa"
              type="checkbox"
              checked={ativa}
              onChange={(event) =>
                setAtiva(event.target.checked)
              }
              disabled={carregando}
            />

            <label
              htmlFor="ativa"
              style={{
                cursor: "pointer",
              }}
            >
              Pelada ativa
            </label>

          </div>

          <button
            type="submit"
            disabled={carregando}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: carregando
                ? "#64748b"
                : "#22c55e",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: carregando
                ? "not-allowed"
                : "pointer",
            }}
          >
            {carregando
              ? "Criando pelada..."
              : "Criar pelada"}
          </button>

        </form>

      </div>

    </div>

  );

}