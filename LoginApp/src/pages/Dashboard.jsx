import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#F8FBFF 0%,#EFF6FF 100%)',
      fontFamily:'Inter,system-ui,sans-serif', gap:'12px',
    }}>
      <div style={{
        background:'white', borderRadius:16, padding:'40px 48px',
        border:'1px solid #D9E1EF', boxShadow:'0 20px 50px rgba(15,23,42,0.08)',
        textAlign:'center', maxWidth:400, width:'100%',
      }}>
        {/* Logo mark */}
        <div style={{fontSize:40, marginBottom:8}}>🎉</div>
        <h1 style={{fontSize:24, fontWeight:700, color:'#0F172A', marginBottom:6}}>
          Welcome to <span style={{color:'#2563EB'}}>DealFlow360</span>
        </h1>
        <p style={{fontSize:14, color:'#64748B', marginBottom:24, lineHeight:1.6}}>
          You've successfully authenticated. Your dashboard is ready.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            background:'#2563EB', color:'white', border:'none',
            borderRadius:9, padding:'10px 28px',
            fontFamily:'inherit', fontSize:14, fontWeight:600,
            cursor:'pointer', transition:'background 0.2s',
          }}
          onMouseOver={e => e.target.style.background='#1D4ED8'}
          onMouseOut={e => e.target.style.background='#2563EB'}
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
