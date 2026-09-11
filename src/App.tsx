import { FormEvent, useState } from 'react';
import { api, Business, Role, Session } from './api';

type View = 'login' | 'register';
const initialBusiness = { legalName: '', tradeName: '', taxId: '', phone: '', address: '' };

function App() {
  const [session, setSession] = useState<Session | null>(() => { const value = localStorage.getItem('bulkmarket-session'); return value ? JSON.parse(value) : null; });
  const [view, setView] = useState<View>('login');
  const [notice, setNotice] = useState('');

  const saveSession = (next: Session) => { localStorage.setItem('bulkmarket-session', JSON.stringify(next)); setSession(next); };
  const logout = () => { localStorage.removeItem('bulkmarket-session'); setSession(null); setNotice(''); };
  if (session) return <Dashboard session={session} saveSession={saveSession} logout={logout} />;
  return <main className="auth-layout"><section className="hero"><span className="eyebrow">MERCADO MAYORISTA B2B</span><h1>Comprá mejor.<br /><em>Vendé más.</em></h1><p>La plataforma que conecta comercios y marcas independientes para hacer negocios.</p><div className="hero-points"><span>✓ Compradores</span><span>✓ Vendedores</span><span>✓ Hecho para negocios</span></div></section><section className="auth-card"><Brand /><div className="tabs"><button className={view === 'login' ? 'active' : ''} onClick={() => setView('login')}>Ingresar</button><button className={view === 'register' ? 'active' : ''} onClick={() => setView('register')}>Crear cuenta</button></div>{view === 'login' ? <Login onSuccess={saveSession} onRegister={() => setView('register')} /> : <Register onSuccess={saveSession} />}{notice && <p>{notice}</p>}</section></main>;
}

function Brand() { return <div className="brand"><span className="brand-mark">B</span><span>bulk<span>market</span></span></div>; }

function Login({ onSuccess, onRegister }: { onSuccess: (value: Session) => void; onRegister: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); setLoading(true); try { onSuccess(await api.login({ email, password })); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.'); } finally { setLoading(false); } }
  return <form onSubmit={submit}><h2>Bienvenido de nuevo</h2><p className="muted">Ingresá para gestionar tu negocio.</p><Field label="Correo electrónico" type="email" value={email} onChange={setEmail} required /><Field label="Contraseña" type="password" value={password} onChange={setPassword} required /><FormError error={error} /><button className="primary" disabled={loading}>{loading ? 'Ingresando…' : 'Ingresar a mi cuenta'}</button><p className="footnote">¿Todavía no tenés una cuenta? <button type="button" className="link" onClick={onRegister}>Creala ahora</button></p></form>;
}

function Register({ onSuccess }: { onSuccess: (value: Session) => void }) {
  const [role, setRole] = useState<Role>('BUYER'); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [business, setBusiness] = useState(initialBusiness); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const setBusinessField = (key: keyof typeof business) => (value: string) => setBusiness((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); setLoading(true); try { onSuccess(await api.register({ email, password, role, business })); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear la cuenta.'); } finally { setLoading(false); } }
  return <form onSubmit={submit}><h2>Creá tu cuenta</h2><p className="muted">Completá los datos de tu negocio para operar en BulkMarket.</p><div className="role-selector"><button type="button" className={role === 'BUYER' ? 'chosen' : ''} onClick={() => setRole('BUYER')}><b>Quiero comprar</b><small>Comercio minorista</small></button><button type="button" className={role === 'SELLER' ? 'chosen' : ''} onClick={() => setRole('SELLER')}><b>Quiero vender</b><small>Marca o fabricante</small></button></div><div className="form-grid"><Field label="Razón social" value={business.legalName} onChange={setBusinessField('legalName')} required /><Field label="Nombre comercial" value={business.tradeName} onChange={setBusinessField('tradeName')} required /><Field label="Identificación fiscal" value={business.taxId} onChange={setBusinessField('taxId')} placeholder="CUIT sin guiones" required /><Field label="Teléfono" value={business.phone} onChange={setBusinessField('phone')} required /><div className="full"><Field label="Dirección" value={business.address} onChange={setBusinessField('address')} required /></div></div><Field label="Correo electrónico" type="email" value={email} onChange={setEmail} required /><Field label="Contraseña" type="password" value={password} onChange={setPassword} hint="Mínimo 8 caracteres" required /><FormError error={error} /><button className="primary" disabled={loading}>{loading ? 'Creando cuenta…' : 'Crear cuenta gratis'}</button></form>;
}

function Dashboard({ session, saveSession, logout }: { session: Session; saveSession: (session: Session) => void; logout: () => void }) {
  const [business, setBusiness] = useState<Omit<Business, 'id'>>(() => { const { id, ...data } = session.business; return data; }); const [message, setMessage] = useState(''); const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const update = (key: keyof typeof business) => (value: string) => setBusiness((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) { event.preventDefault(); setLoading(true); setError(''); try { const updated = await api.updateBusiness(business, session.accessToken); saveSession({ ...session, business: updated }); setMessage('Los datos del negocio se actualizaron correctamente.'); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron guardar los cambios.'); } finally { setLoading(false); } }
  const role = session.user.role === 'BUYER' ? 'Comprador' : 'Vendedor';
  return <main className="dashboard"><header><Brand /><div><span className="role-badge">{role}</span><button className="logout" onClick={logout}>Cerrar sesión</button></div></header><section className="welcome"><span className="eyebrow">PANEL DE {role.toUpperCase()}</span><h1>Hola, {business.tradeName}</h1><p>Este es el punto de partida de tu negocio en BulkMarket.</p></section><section className="business-panel"><div><h2>Datos del negocio</h2><p className="muted">Mantené actualizada la información comercial y de contacto.</p></div><form onSubmit={submit}><div className="form-grid"><Field label="Razón social" value={business.legalName} onChange={update('legalName')} required /><Field label="Nombre comercial" value={business.tradeName} onChange={update('tradeName')} required /><Field label="Identificación fiscal" value={business.taxId} onChange={update('taxId')} required /><Field label="Teléfono" value={business.phone} onChange={update('phone')} required /><div className="full"><Field label="Dirección" value={business.address} onChange={update('address')} required /></div></div><FormError error={error} />{message && <p className="success">✓ {message}</p>}<button className="primary" disabled={loading}>{loading ? 'Guardando…' : 'Guardar cambios'}</button></form></section></main>;
}

function Field({ label, value, onChange, type = 'text', hint, ...props }: { label: string; value: string; onChange: (value: string) => void; type?: string; hint?: string; placeholder?: string; required?: boolean }) { return <label className="field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} {...props} />{hint && <small>{hint}</small>}</label>; }
function FormError({ error }: { error: string }) { return error ? <p className="error" role="alert">{error}</p> : null; }
export default App;
