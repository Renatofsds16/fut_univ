import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/auth';

export function FormCadastro() {
  const [nome, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [cadastrando, setCadastrando] = useState(false);

  const navigate = useNavigate();

  async function handleCadastro(e) {
  e.preventDefault();

  setCadastrando(true);

  try {
    const response = await signup(nome, email, senha);

    console.log("Resposta do cadastro:", response);

    if (!response.success) {
      throw new Error("Falha ao realizar cadastro.");
    }

    console.log("Usuário criado:", response.user);

    alert("Cadastro realizado com sucesso!");

    navigate("/pelada");

  } catch (error) {
    console.error("ERRO COMPLETO:", error);

    alert(
      "Erro ao cadastrar: " +
      (error.message || "Tente novamente.")
    );

  } finally {
    setCadastrando(false);
  }
}

  return (
    <div
      style={{
        maxWidth: '350px',
        margin: '80px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        textAlign: 'center'
      }}
    >
      <h2>📝 Cadastro na Pelada</h2>

      <form
        onSubmit={handleCadastro}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left'
        }}
      >

        <div>
          <label>
            <strong>Nome de Usuário:</strong>
          </label>

          <input
            type="text"
            value={nome}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div>
          <label>
            <strong>E-mail:</strong>
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <div>
          <label>
            <strong>Senha:</strong>
          </label>

          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              boxSizing: 'border-box'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={cadastrando}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          {cadastrando ? 'Cadastrando...' : 'Cadastrar'}
        </button>

      </form>

      <p
        style={{
          marginTop: '15px',
          fontSize: '0.9em'
        }}
      >
        Já tem uma conta? <Link to="/">Faça Login</Link>
      </p>

    </div>
  );
}