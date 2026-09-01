import React from 'react';

export function AreaPix({ gerandoPix, dadosPix, setDadosPix, onGerarPix }) {
  const temDadosValidos = dadosPix && (dadosPix.qrcode_url || dadosPix.pix_copia_cola);

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>💳 Confirmar Presença (Pix)</h3>

      {!temDadosValidos ? (
        <form onSubmit={onGerarPix} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="submit"
            disabled={gerandoPix}
            style={{ backgroundColor: '#2e7d32', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {gerandoPix ? 'Gerando Pix...' : 'Gerar QrCode / Copia e Cola'}
          </button>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p>Escaneie o QR Code abaixo para pagar:</p>

          {dadosPix.qrcode_url ? (
            <img 
              src={dadosPix.qrcode_url} 
              alt="QR Code Pix" 
              style={{ width: '220px', height: '220px', margin: '10px auto', display: 'block' }} 
            />
          ) : (
            <p style={{ color: '#d32f2f' }}>Imagem do QR Code não disponível</p>
          )}

          {dadosPix.pix_copia_cola && (
            <div style={{ marginTop: '10px' }}>
              <textarea
                readOnly
                value={dadosPix.pix_copia_cola}
                rows={3}
                style={{ width: '100%', fontSize: '0.8em', background: '#f0f0f0', padding: '8px', borderRadius: '4px', resize: 'none', boxSizing: 'border-box' }}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(dadosPix.pix_copia_cola);
                  alert('Código Pix copiado com sucesso!');
                }}
                style={{ padding: '8px 16px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '8px', fontWeight: 'bold' }}
              >
                📋 Copiar Código Pix
              </button>
            </div>
          )}

          <button
            onClick={() => setDadosPix(null)}
            style={{ marginTop: '15px', backgroundColor: '#666', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancelar / Voltar
          </button>
        </div>
      )}
    </div>
  );
}