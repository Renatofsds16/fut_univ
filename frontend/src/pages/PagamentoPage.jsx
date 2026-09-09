import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  criarPagamentoPix,
  checarStatusPix,
} from "../services/pagamento";

import "./PagamentoPage.css";


export function PagamentoPage() {

  const { peladaId } =
    useParams();

  const navigate =
    useNavigate();


  const [pagamento, setPagamento] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [pago, setPago] =
    useState(false);

  const [verificando, setVerificando] =
    useState(false);


  const verificandoRef =
    useRef(false);

  const redirecionandoRef =
    useRef(false);


  // =====================================================
  // CRIAR PAGAMENTO
  // =====================================================

  useEffect(() => {

    async function criarPagamento() {

      try {

        setCarregando(true);
        setErro("");


        const resposta =
          await criarPagamentoPix(
            peladaId
          );


        console.log(
          "Pagamento criado:",
          resposta
        );


        setPagamento(
          resposta
        );


        if (
          resposta?.pago === true
        ) {

          setPago(true);

        }

      } catch (error) {

        console.error(
          "Erro ao criar pagamento:",
          error
        );


        setErro(
          error?.message ||
          "Não foi possível criar o pagamento."
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

    if (!pago) {
      return;
    }


    if (redirecionandoRef.current) {
      return;
    }


    redirecionandoRef.current =
      true;


    const timeout =
      setTimeout(() => {

        navigate(
          `/pelada/${peladaId}`,
          {
            replace: true,
          }
        );

      }, 1500);


    return () => {
      clearTimeout(timeout);
    };

  }, [
    pago,
    peladaId,
    navigate,
  ]);


  // =====================================================
  // VERIFICAR PAGAMENTO
  // =====================================================

  async function verificarPagamento() {

    if (!pagamento?.txid) {
      return;
    }


    if (verificandoRef.current) {
      return;
    }


    if (pago) {
      return;
    }


    try {

      verificandoRef.current =
        true;

      setVerificando(true);


      const resposta =
        await checarStatusPix(
          pagamento.txid,
          peladaId
        );


      console.log(
        "Status Pix:",
        resposta
      );


      if (
        resposta?.pago === true
      ) {

        console.log(
          "================================"
        );

        console.log(
          "PIX APROVADO"
        );

        console.log(
          "CONFIRMAÇÃO REGISTRADA"
        );

        console.log(
          "================================"
        );


        setPago(true);

      }

    } catch (error) {

      console.error(
        "Erro ao verificar pagamento:",
        error
      );

    } finally {

      verificandoRef.current =
        false;

      setVerificando(false);

    }
  }


  // =====================================================
  // VERIFICAÇÃO AUTOMÁTICA
  // =====================================================

  useEffect(() => {

    if (
      !pagamento?.txid ||
      pago
    ) {

      return;

    }


    console.log(
      "Iniciando verificação automática do Pix..."
    );


    verificarPagamento();


    const intervalo =
      setInterval(() => {

        verificarPagamento();

      }, 3000);


    return () => {

      console.log(
        "Parando verificação automática do Pix."
      );

      clearInterval(
        intervalo
      );

    };

  }, [
    pagamento?.txid,
    pago,
    peladaId,
  ]);


  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {

    return (

      <div className="pagamento-page">

        <div className="pagamento-card carregando-card">

          <div className="spinner" />

          <h1>
            Gerando Pix
          </h1>

          <p>
            Aguarde enquanto preparamos
            seu pagamento...
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

      <div className="pagamento-page">

        <div className="pagamento-card erro-card">

          <div className="erro-icon">
            !
          </div>

          <h1>
            Não foi possível gerar o Pix
          </h1>

          <p>
            {erro}
          </p>

          <button
            className="btn btn-primary"
            onClick={() =>
              navigate(
                `/pelada/${peladaId}`
              )
            }
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

      <div className="pagamento-page">

        <div className="pagamento-card aprovado-card">

          <div className="sucesso-icon">
            ✓
          </div>

          <h1>
            Pagamento aprovado!
          </h1>

          <p>
            Seu pagamento foi confirmado
            com sucesso.
          </p>

          <p className="redirect-text">
            Você está confirmado nesta pelada.
          </p>

          <div className="spinner" />

          <span>
            Redirecionando...
          </span>

        </div>

      </div>

    );

  }


  // =====================================================
  // PAGAMENTO PIX
  // =====================================================

  return (

    <div className="pagamento-page">

      <div className="pagamento-card">

        <div className="pagamento-header">

          <span className="pix-label">
            PAGAMENTO
          </span>

          <h1>
            Pague com Pix
          </h1>

          <p>
            Escaneie o QR Code ou use
            o Pix Copia e Cola.
          </p>

        </div>


        <div className="valor-box">

          <span>
            Valor da pelada
          </span>

          <strong>
            R${" "}
            {Number(
              pagamento?.valor || 0
            ).toFixed(2)}
          </strong>

        </div>


        {pagamento?.qrCodeBase64 && (

          <div className="qr-container">

            <div className="qr-box">

              <img
                src={`data:image/png;base64,${pagamento.qrCodeBase64}`}
                alt="QR Code Pix"
              />

            </div>

            <p>
              Aponte a câmera do seu banco
              para o QR Code.
            </p>

          </div>

        )}


        {pagamento?.qrCode && (

          <div className="copia-cola">

            <label>
              Pix Copia e Cola
            </label>

            <textarea
              value={
                pagamento.qrCode
              }
              readOnly
              rows="4"
            />

            <button
              className="btn btn-secondary"
              onClick={() => {

                navigator.clipboard.writeText(
                  pagamento.qrCode
                );

              }}
            >
              Copiar código Pix
            </button>

          </div>

        )}


        <div className="status-box">

          <div className="status-dot" />

          <div>

            <strong>
              {verificando
                ? "Verificando pagamento..."
                : "Aguardando pagamento"}
            </strong>

            <span>
              A confirmação é automática.
            </span>

          </div>

        </div>


        <button
          className="btn btn-primary"
          onClick={
            verificarPagamento
          }
          disabled={
            verificando
          }
        >
          {verificando
            ? "Verificando..."
            : "Verificar pagamento"}
        </button>


        <button
          className="btn btn-link"
          onClick={() =>
            navigate(
              `/pelada/${peladaId}`
            )
          }
        >
          Voltar para pelada
        </button>


      </div>

    </div>

  );
}