import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { criarPagamentoPix, checarStatusPix } from "../services/pagamento";

export function PagamentoPage() {
  const { peladaId } = useParams();
  const navigate = useNavigate();

  const [pagamento, setPagamento] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [pago, setPago] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const verificandoRef = useRef(false);
  const redirecionandoRef = useRef(false);

  // =====================================================
  // CRIAR PAGAMENTO
  // =====================================================
  useEffect(() => {
    async function criarPagamento() {
      try {
        setCarregando(true);
        setErro("");

        const resposta = await criarPagamentoPix(peladaId);
        console.log("Pagamento criado:", resposta);

        setPagamento(resposta);

        if (resposta?.pago === true) {
          setPago(true);
        }
      } catch (error) {
        console.error("Erro ao criar pagamento:", error);
        setErro(
          error?.message || "Não foi possível criar o pagamento."
        );
      } finally {
        setCarregando(false);
      }
    }

    if (peladaId) {
      criarPagamento();
    }
  }, [peladaId]);

  // =====================================================
  // REDIRECIONAR
  // =====================================================
  useEffect(() => {
    if (!pago || redirecionandoRef.current) return;

    redirecionandoRef.current = true;

    const timeout = setTimeout(() => {
      navigate(`/pelada/${peladaId}`, { replace: true });
    }, 1500);

    return () => clearTimeout(timeout);
  }, [pago, peladaId, navigate]);

  // =====================================================
  // VERIFICAR PAGAMENTO
  // =====================================================
  async function verificarPagamento() {
    if (!pagamento?.txid || verificandoRef.current || pago) return;

    try {
      verificandoRef.current = true;
      setVerificando(true);

      const resposta = await checarStatusPix(pagamento.txid, peladaId);
      console.log("Status Pix:", resposta);

      if (resposta?.pago === true) {
        setPago(true);
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento:", error);
    } finally {
      verificandoRef.current = false;
      setVerificando(false);
    }
  }

  // =====================================================
  // VERIFICAÇÃO AUTOMÁTICA
  // =====================================================
  useEffect(() => {
    if (!pagamento?.txid || pago) return;

    verificarPagamento();

    const intervalo = setInterval(() => {
      verificarPagamento();
    }, 3000);

    return () => clearInterval(intervalo);
  }, [pagamento?.txid, pago, peladaId]);

  const handleCopiarCode = () => {
    if (pagamento?.qrCode) {
      navigator.clipboard.writeText(pagamento.qrCode);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  // ESTILOS COMPARTILHADOS DE CONTAINER
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#0f172a",
    color: "#f8fafc",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const cardStyle = {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    border: "1px solid #334155",
    boxSizing: "border-box",
    textAlign: "center",
  };

  // =====================================================
  // CARREGANDO
  // =====================================================
  if (carregando) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #334155",
              borderTop: "4px solid #38bdf8",
              borderRadius: "50%",
              margin: "0 auto 20px auto",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <h1 style={{ color: "#38bdf8", fontSize: "1.5rem", marginBottom: "10px" }}>
            Gerando Pix
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
            Aguarde enquanto preparamos seu pagamento...
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERRO
  // =====================================================
  if (erro) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "#ef444422",
              border: "1px solid #ef4444",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
              fontWeight: "bold",
              margin: "0 auto 20px auto",
            }}
          >
            !
          </div>
          <h1 style={{ color: "#fca5a5", fontSize: "1.4rem", marginBottom: "10px" }}>
            Não foi possível gerar o Pix
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.95rem", marginBottom: "25px" }}>
            {erro}
          </p>
          <button
            onClick={() => navigate(`/pelada/${peladaId}`)}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#38bdf8",
              color: "#0f172a",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Voltar para pelada
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGAMENTO APROVADO
  // =====================================================
  if (pago) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#22c55e22",
              border: "1px solid #22c55e",
              color: "#4ade80",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 20px auto",
            }}
          >
            ✓
          </div>
          <h1 style={{ color: "#4ade80", fontSize: "1.6rem", marginBottom: "10px" }}>
            Pagamento aprovado!
          </h1>
          <p style={{ color: "#f8fafc", fontSize: "1rem", marginBottom: "5px" }}>
            Seu pagamento foi confirmado com sucesso.
          </p>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "25px" }}>
            Você está confirmado nesta pelada.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              color: "#38bdf8",
              fontSize: "0.9rem",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #334155",
                borderTop: "2px solid #38bdf8",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <span>Redirecionando...</span>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGAMENTO PIX
  // =====================================================
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              backgroundColor: "#38bdf822",
              color: "#38bdf8",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: "bold",
              letterSpacing: "1px",
            }}
          >
            PAGAMENTO
          </span>
          <h1 style={{ color: "#f8fafc", fontSize: "1.6rem", marginTop: "12px", marginBottom: "6px" }}>
            Pague com Pix
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
            Escaneie o QR Code ou use o Pix Copia e Cola.
          </p>
        </div>

        {/* VALOR */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #334155",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Valor da pelada</span>
          <strong style={{ color: "#4ade80", fontSize: "1.3rem" }}>
            R$ {Number(pagamento?.valor || 0).toFixed(2)}
          </strong>
        </div>

        {/* QR CODE */}
        {pagamento?.qrCodeBase64 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                backgroundColor: "#ffffff",
                padding: "12px",
                borderRadius: "12px",
                display: "inline-block",
                marginBottom: "8px",
              }}
            >
              <img
                src={`data:image/png;base64,${pagamento.qrCodeBase64}`}
                alt="QR Code Pix"
                style={{ width: "180px", height: "180px", display: "block" }}
              />
            </div>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
              Aponte a câmera do seu banco para o QR Code.
            </p>
          </div>
        )}

        {/* COPIA E COLA */}
        {pagamento?.qrCode && (
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#f8fafc", fontSize: "0.85rem", marginBottom: "6px" }}>
              Pix Copia e Cola
            </label>
            <textarea
              value={pagamento.qrCode}
              readOnly
              rows="3"
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "#94a3b8",
                fontSize: "0.8rem",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "8px",
              }}
            />
            <button
              onClick={handleCopiarCode}
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid #334155",
                backgroundColor: copiado ? "#22c55e22" : "#334155",
                color: copiado ? "#4ade80" : "#f8fafc",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              {copiado ? "✓ Código Copiado!" : "Copiar código Pix"}
            </button>
          </div>
        )}

        {/* STATUS BAR */}
        <div
          style={{
            backgroundColor: "#0f172a",
            padding: "12px 16px",
            borderRadius: "10px",
            border: "1px solid #334155",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: verificando ? "#eab308" : "#38bdf8",
              boxShadow: verificando ? "0 0 8px #eab308" : "0 0 8px #38bdf8",
              flexShrink: 0,
            }}
          />
          <div>
            <strong style={{ display: "block", color: "#f8fafc", fontSize: "0.85rem" }}>
              {verificando ? "Verificando pagamento..." : "Aguardando pagamento"}
            </strong>
            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
              A confirmação é automática.
            </span>
          </div>
        </div>

        {/* BOTOES DE ACAO */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={verificarPagamento}
            disabled={verificando}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: verificando ? "#0284c7" : "#38bdf8",
              color: "#0f172a",
              fontWeight: "bold",
              fontSize: "0.95rem",
              cursor: verificando ? "not-allowed" : "pointer",
            }}
          >
            {verificando ? "Verificando..." : "Verificar pagamento"}
          </button>

          <button
            onClick={() => navigate(`/pelada/${peladaId}`)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              color: "#94a3b8",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            Voltar para pelada
          </button>
        </div>
      </div>
    </div>
  );
}