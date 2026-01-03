import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'VolleySimulator - Voleybol Tahmin ve Simülasyon Platformu';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a', // slate-950
          backgroundImage: 'radial-gradient(circle at 25px 25px, #334155 2%, transparent 0%), radial-gradient(circle at 75px 75px, #334155 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: '60px 100px',
            borderRadius: '30px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div
            style={{
              fontSize: 90,
              fontWeight: 900,
              background: 'linear-gradient(to right, #34d399, #22d3ee)', // emerald-400 to cyan-400
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 20,
              letterSpacing: '-0.05em',
              display: 'flex',
            }}
          >
            VolleySimulator
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#e2e8f0', // slate-200
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            Voleybol Tutkunları İçin Yeni Nesil Simülasyon
          </div>
          
          <div
             style={{
               display: 'flex',
               marginTop: 50,
               gap: 24,
             }}
          >
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(220, 38, 38, 0.2)', color: '#f87171', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(220, 38, 38, 0.5)' }}>Sultanlar Ligi</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(217, 119, 6, 0.5)' }}>1. Lig</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(5, 150, 105, 0.2)', color: '#34d399', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(5, 150, 105, 0.5)' }}>2. Lig</div>
             <div style={{ display: 'flex', padding: '12px 24px', backgroundColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', borderRadius: 999, fontSize: 24, fontWeight: 600, border: '1px solid rgba(37, 99, 235, 0.5)' }}>CEV</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
