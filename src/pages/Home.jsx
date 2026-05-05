import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Trophy, Calendar, BarChart3, Users } from 'lucide-react';
import { calculatePoints } from '../utils/scoring';

export default function Home() {
  const { currentUser } = useAuth();
  const [livePoints, setLivePoints] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    loadLivePoints();
  }, [currentUser]);

  async function loadLivePoints() {
    try {
      const matchesSnap = await getDocs(collection(db, 'matches'));
      const predictionsSnap = await getDocs(collection(db, 'predictions'));

      const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const predictions = predictionsSnap.docs.map(d => d.data());
      const myPreds = predictions.filter(p => p.userId === currentUser.uid);

      let total = 0;
      for (const pred of myPreds) {
        const match = matches.find(m => m.id === pred.matchId);
        if (match && match.result && match.result.homeScore !== null) {
          total += calculatePoints(pred, match.result);
        }
      }
      setLivePoints(total);
    } catch (error) {
      console.error('Error cargando puntos:', error);
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
        <div className="text-center max-w-2xl">
          <Trophy className="w-20 h-20 mx-auto text-primary mb-6" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Quiniela Mundial 2026</h1>
          <p className="text-xl text-gray-600 mb-8">
            Predice los resultados del Mundial FIFA 2026 y compite con tus amigos
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8">
              Comenzar a jugar
            </Button>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚽</span>
                </div>
                <h3 className="font-semibold mb-2">Predice Resultados</h3>
                <p className="text-sm text-muted-foreground">
                  Adivina el marcador exacto de cada partido
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold mb-2">Gana Puntos</h3>
                <p className="text-sm text-muted-foreground">
                  3 pts resultado exacto, 1 pt ganador correcto
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏆</span>
                </div>
                <h3 className="font-semibold mb-2">Compite</h3>
                <p className="text-sm text-muted-foreground">
                  Sube en el ranking y demuestra quién sabe más
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido, {currentUser.displayName}!</h1>
        <p className="text-muted-foreground">Mundial FIFA 2026 - Estados Unidos, México y Canadá</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link to="/predictions" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Predicciones</h3>
              <p className="text-sm text-muted-foreground">Haz tus pronósticos</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/ranking" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-10 h-10 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">Ranking</h3>
              <p className="text-sm text-muted-foreground">Tabla de posiciones</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-10 h-10 mx-auto mb-3 text-primary" />
            <h3 className="font-semibold mb-1">Tus Puntos</h3>
            <p className="text-3xl font-bold text-primary">{livePoints}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4">Sistema de Puntuación</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="font-medium">3 puntos - Resultado exacto</p>
                <p className="text-sm text-muted-foreground">Aciertas el marcador completo</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-2xl">✓</span>
              <div>
                <p className="font-medium">1 punto - Ganador correcto</p>
                <p className="text-sm text-muted-foreground">Aciertas quién gana o si hay empate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
