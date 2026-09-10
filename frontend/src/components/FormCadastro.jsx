import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/auth';

export function FormCadastro() {
  const [nome, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cadastrando, setCadastrando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const navigate = useNavigate();

  async function handleCadastro(e) {
    e.preventDefault();

    setCadastrando(true);
    setMensagemErro('');

    try {
      const response = await signup(nome, email, senha);

      console.log("Resposta do cadastro:", response);

      if (!response.success) {
        throw new Error("Falha ao realizar cadastro.");
      }

      console.log("Usuário criado:", response.user);

      navigate("/");
    } catch (error) {
      console.error("ERRO COMPLETO:", error);

      setMensagemErro(
        "Erro ao cadastrar: " + (error.message || "Tente novamente.")
      );
    } finally {
      setCadastrando(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        padding: "20px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "#1e293b",
          padding: "30px",
          borderRadius: "16px",
          border: "1px solid #334155",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            color: "#38bdf8",
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "1.8rem",
          }}
        >
          📝 Cadastro na Pelada
        </h1>

        {/* MENSAGEM DE ERRO */}
        {mensagemErro && (
          <div
            style={{
              backgroundColor: "#ef444422",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              padding: "12px",
              borderRadius: "10px",
              textAlign: "center",
              marginBottom: "20px",
              fontSize: "0.9rem",
            }}
          >
            {mensagemErro}
          </div>
        )}

        <form
          onSubmit={handleCadastro}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
                color: "#f8fafc",
              }}
            >
              Nome de Usuário
            </label>

            <input
              type="text"
              value={nome}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
                color: "#f8fafc",
              }}
            >
              E-mail
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="seuemail@exemplo.com"
              required
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
                color: "#f8fafc",
              }}
            >
              Senha
            </label>

            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Crie uma senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={cadastrando}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "10px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: cadastrando ? "#15803d" : "#22c55e",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: cadastrando ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {cadastrando ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <p
          style={{
            marginTop: "20px",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "0.95rem",
          }}
        >
          Já tem uma conta?{" "}
          <Link
            to="/"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Faça Login
          </Link>
        </p>
      </div>
    </div>
  );
}