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
import { Trophy } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Quiniela Mundial 2026</h1>
          <p className="text-gray-600 mt-2">Predice los resultados y gana puntos</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nombre</Label>
                    <Input
                      id="displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  {hasClients && (
                    <div className="space-y-2">
                      <Label htmlFor="clientId">Quiniela</Label>
                      <Select
                        id="clientId"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                      >
                        <option value="">Seleccionar quiniela</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </Select>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
                className="text-sm text-primary hover:underline"
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>3 puntos por resultado exacto</p>
          <p>1 punto por acertar ganador o empate</p>
        </div>
      </div>
    </div>
  );
}
