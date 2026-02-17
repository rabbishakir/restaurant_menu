import Link from 'next/link'

export default function Header(){
  return (
    <header className="header container">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link href="/" style={{fontWeight:700,fontSize:18}}>Menu Builder</Link>
        <span style={{color:'var(--muted)'}}>v0.1</span>
      </div>
      <nav className="nav">
        <Link href="/login">Login</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  )
}
