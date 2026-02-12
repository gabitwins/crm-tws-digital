'use client';
export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', background: '#f0f0f0' }}>
      <h1>🔍 Debug Information</h1>
      <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl || 'NÃO DEFINIDA'}</p>
      <p><strong>Expected:</strong> https://web-production-1d256.up.railway.app/api</p>
      <p><strong>Fallback:</strong> http://localhost:4000/api</p>
      
      <hr />
      
      <button onClick={() => {
        fetch(`${apiUrl || 'http://localhost:4000/api'}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@nexo.com', password: 'admin123' })
        })
          .then(r => r.json())
          .then(d => alert('✅ SUCCESS: ' + JSON.stringify(d)))
          .catch(e => alert('❌ ERROR: ' + e.message));
      }}>
        Testar Login
      </button>
    </div>
  );
}
