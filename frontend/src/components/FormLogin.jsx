import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../services/auth';

export function FormLogin() {
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [entrando, setEntrando] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogin(e) {
    e.preventDefault();

    setEntrando(true);

    try {
      const resposta = await login(username, senha);

      if (!resposta.success) {
        throw new Error('Falha ao realizar login.');
      }

      console.log('Usuário:', resposta.user);

      const destino =
        location.state?.from?.pathname || "/peladas";

      navigate(destino, { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        alert(
          'Falha ao realizar login: ' + error.message
        );
      } else {
        alert(
          'Falha ao realizar login. Verifique suas credenciais.'
        );
      }
    } finally {
      setEntrando(false);
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
        textAlign: 'center',
      }}
    >
      <h2>🔑 Login na Pelada</h2>

      <form
        onSubmit={handleLogin}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          textAlign: 'left',
        }}
      >
        <div>
          <label>
            <strong>Usuário / E-mail:</strong>
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              marginTop: '4px',
              boxSizing: 'border-box',
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
              boxSizing: 'border-box',
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={entrando}
          style={{
            backgroundColor: '#2e7d32',
            color: 'white',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: entrando ? 'not-allowed' : 'pointer',
            marginTop: '10px',
          }}
        >
          {entrando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p
        style={{
          marginTop: '15px',
          fontSize: '0.9em',
        }}
      >
        Não tem uma conta?{' '}
        <Link to="/cadastro">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}