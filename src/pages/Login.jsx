import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';


export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      const snapshot = await getDocs(collection(db, 'clients'));
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  const hasClients = clients.length > 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Ingresa tu nombre');
          setLoading(false);
          return;
        }
        if (hasClients && !clientId) {
          setError('Selecciona una quiniela');
          setLoading(false);
          return;
        }
        const client = clients.find(c => c.id === clientId);
        await signup(email, password, displayName, clientId || '', client?.name || '');
      }
      window.scrollTo(0, 0);
      navigate('/');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Email o contraseña incorrectos');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este email ya está registrado');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else {
        setError('Error al autenticar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950" />
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-green-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fadeInUp">
        <div className="text-center mb-8">
          <img src="/img/logo-md.png" alt="Quiniela 2026" className="w-20 h-20 mx-auto mb-4 object-contain animate-float" />
          <h1 className="text-3xl font-bold text-white">
            Quiniela <span className="text-yellow-300">2026</span>
          </h1>
          <p className="text-white/60 mt-2">Predice los resultados y gana puntos</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white">
          <CardHeader>
            <CardTitle className="text-center text-white">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-white/80">Nombre</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400/50 focus:ring-yellow-400/30"
                    />
                  </div>
                  {hasClients && (
                    <div className="space-y-2">
                      <Label htmlFor="clientId" className="text-white/80">Quiniela</Label>
                      <Select
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      >
                        <option value="" className="text-gray-800">Seleccionar quiniela</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id} className="text-gray-800">{c.name}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400/50 focus:ring-yellow-400/30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-yellow-400/50 focus:ring-yellow-400/30"
                />
              </div>

              {error && (
                <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" variant="gold" disabled={loading}>
                {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-yellow-300 hover:text-yellow-200 hover:underline"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
