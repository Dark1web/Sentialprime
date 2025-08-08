export default function NotFound() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center',
      lineHeight: '1.6'
    }}>
      <h1 style={{ color: '#dc3545', fontSize: '3rem', marginBottom: '1rem' }}>
        404
      </h1>
      
      <h2 style={{ color: '#333', marginBottom: '1rem' }}>
        Page Not Found
      </h2>
      
      <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
        The page you're looking for doesn't exist.
      </p>

      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px', 
        marginBottom: '2rem',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginTop: 0, color: '#0070f3' }}>Available Routes:</h3>
        <ul style={{ textAlign: 'left', display: 'inline-block' }}>
          <li><a href="/" style={{ color: '#0070f3' }}>Home</a> - Backend information</li>
          <li><a href="/api" style={{ color: '#0070f3' }}>/api</a> - API root endpoint</li>
          <li><a href="/api/health" style={{ color: '#0070f3' }}>/api/health</a> - Health check</li>
        </ul>
      </div>

      <a 
        href="/" 
        style={{ 
          display: 'inline-block',
          padding: '0.75rem 1.5rem',
          background: '#0070f3',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          fontWeight: '500'
        }}
      >
        ← Back to Home
      </a>
    </div>
  )
}
