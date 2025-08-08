export default function Home() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#0070f3', marginBottom: '1rem' }}>
        🚨 SentinelX API Backend
      </h1>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
        AI-Powered Disaster Intelligence & Crisis Response System
      </p>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h2 style={{ marginTop: 0, color: '#28a745' }}>✅ Backend Status: Running</h2>
        <p><strong>Version:</strong> 2.0.0</p>
        <p><strong>Backend:</strong> Next.js</p>
        <p><strong>Port:</strong> 9000</p>
        <p><strong>Environment:</strong> Development</p>
      </div>

      <h2 style={{ color: '#333', marginBottom: '1rem' }}>🔗 API Endpoints</h2>
      
      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #ddd', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0070f3' }}>Core Endpoints</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><code>GET /api</code> - System information</li>
            <li><code>GET /api/health</code> - Health check</li>
          </ul>
        </div>

        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #ddd', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0070f3' }}>AI & Analysis</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><code>POST /api/misinformation/analyze</code> - Misinformation detection</li>
            <li><code>POST /api/triage/classify</code> - Emergency triage</li>
            <li><code>POST /api/factcheck</code> - Fact checking</li>
          </ul>
        </div>

        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #ddd', borderRadius: '6px' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#0070f3' }}>Data Services</h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><code>GET /api/network/outages</code> - Network outages</li>
            <li><code>GET /api/navigation/safezones</code> - Safe zones</li>
          </ul>
        </div>
      </div>

      <div style={{ 
        background: '#fff3cd', 
        padding: '1rem', 
        borderRadius: '6px', 
        border: '1px solid #ffeaa7',
        marginBottom: '2rem'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>📝 Quick Test</h3>
        <p style={{ margin: 0, color: '#856404' }}>
          Try: <code>curl http://localhost:9000/api/health</code>
        </p>
      </div>

      <div style={{ 
        background: '#d1ecf1', 
        padding: '1rem', 
        borderRadius: '6px', 
        border: '1px solid #bee5eb'
      }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#0c5460' }}>🔧 Migration Status</h3>
        <p style={{ margin: 0, color: '#0c5460' }}>
          Successfully migrated from Python FastAPI to Next.js backend. 
          Core endpoints are operational and ready for frontend integration.
        </p>
      </div>
    </div>
  )
}
