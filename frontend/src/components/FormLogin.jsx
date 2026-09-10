import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../services/auth';

export function FormLogin() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(e) {
    e.preventDefault();

    setEntrando(true);
    setMensagemErro('');

    try {
      const resposta = await login(username, senha);

      if (!resposta.success) {
        throw new Error('Falha ao realizar login.');
      }

      console.log('Usuário:', resposta.user);

      const destino = location.state?.from?.pathname || "/peladas";
      navigate(destino, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setMensagemErro('Falha ao realizar login: ' + error.message);
      } else {
        setMensagemErro('Falha ao realizar login. Verifique suas credenciais.');
      }
    } finally {
      setEntrando(false);
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
          🔑 Login na Pelada
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
          onSubmit={handleLogin}
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
              Usuário / E-mail
            </label>

            <input
              type="text"
              value={username}
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
              placeholder="Digite seu usuário ou e-mail"
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
              placeholder="Digite sua senha"
              required
            />
          </div>

          <button
            type="submit"
            disabled={entrando}
            style={{
              width: "100%",
              padding: "14px",
              marginTop: "10px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: entrando ? "#15803d" : "#22c55e",
              color: "#ffffff",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: entrando ? "not-allowed" : "pointer",
              transition: "background-color 0.2s",
            }}
          >
            {entrando ? "Entrando..." : "Entrar"}
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
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            style={{
              color: "#38bdf8",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}