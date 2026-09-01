import React from 'react';

export function AreaPix({ nomeJogador, setNomeJogador, gerandoPix, dadosPix, setDadosPix, onGerarPix }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', textAlign: 'left', marginBottom: '30px', backgroundColor: '#fafafa' }}>
      <h3 style={{ marginTop: 0 }}>Entrar no Jogo</h3>

      {!dadosPix ? (
        <form onSubmit={onGerarPix} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label><strong>Seu Nome Completo:</strong></label>
            <input
              type="text"
              value={nomeJogador}
              onChange={(e) => setNomeJogador(e.target.value)}
              placeholder="Ex: Renato"
              style={{ width: '100%', padding: '10px', marginTop: '5px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #ccc' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={gerandoPix}
            style={{ backgroundColor: '#0288d1', color: 'white', padding: '12px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}
          >
            {gerandoPix ? 'Gerando QR Code Pix...' : 'Pagar via Pix para Entrar'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#2e7d32', fontWeight: 'bold' }}>QR Code Pix gerado para {nomeJogador}!</p>
          
          {dadosPix.qrCodeBase64 ? (
            <img 
              src={dadosPix.qrCodeBase64.startsWith('data:') ? dadosPix.qrCodeBase64 : `data:image/png;base64,${dadosPix.qrCodeBase64}`} 
              alt="QR Code Pix" 
              style={{ width: '220px', height: '220px', display: 'block', margin: '10px auto', border: '1px solid #ddd', padding: '5px', borderRadius: '4px' }} 
            />
          ) : (
            <div style={{ padding: '20px', background: '#eee', display: 'inline-block' }}>Não foi possível carregar a imagem do QR Code.</div>
          )}

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', fontSize: '0.9em', fontWeight: 'bold' }}>Pix Copia e Cola:</label>
            <input
              type="text"
              readOnly
              value={dadosPix.pixCopiaECola || ''}
              style={{ width: '100%', padding: '8px', textAlign: 'center', marginTop: '5px', boxSizing: 'border-box' }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(dadosPix.pixCopiaECola);
                alert('Código Pix copiado!');
              }}
              style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#555', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Copiar Código Pix
            </button>
          </div>

          <p style={{ fontSize: '0.85em', color: '#d32f2f', marginTop: '15px', fontWeight: 'bold' }}>
            ⏳ Aguardando pagamento... A página atualizará automaticamente assim que for pago.
          </p>

          <button
            onClick={() => setDadosPix(null)}
            style={{ background: 'none', border: 'none', color: '#0288d1', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}
          >
            Gerar novo Pix / Cancelar
          </button>
        </div>
      )}
    </div>
  );
}