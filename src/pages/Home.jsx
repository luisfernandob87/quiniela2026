import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Trophy, Calendar, BarChart3, Users, Star, Target, Swords } from 'lucide-react';
import { calculatePoints } from '../utils/scoring';

export default function Home() {
  const { currentUser } = useAuth();
  const [livePoints, setLivePoints] = useState(0);

  useEffect(() => {
    if (!currentUser) return;
    loadLivePoints();
  }, [currentUser]);

  async function loadLivePoints() {
    if (!currentUser.clientId) return;
    try {
      const matchesQuery = query(collection(db, 'matches'));
      const matchesSnap = await getDocs(matchesQuery);
      const predictionsQuery = query(collection(db, 'predictions'), where('clientId', '==', currentUser.clientId));
      const predictionsSnap = await getDocs(predictionsQuery);

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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-green-900 to-emerald-950" />
        {/* Decorative circles */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />

        <div className="text-center max-w-2xl relative z-10">
          <div className="mb-8">
            <img src="/img/logo-lg.png" alt="Quiniela 2026" className="w-36 h-36 mx-auto object-contain animate-float drop-shadow-[0_0_25px_rgba(255,215,0,0.4)]" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-3 tracking-tight">
            Quiniela <span className="text-yellow-300">2026</span>
          </h1>
          <p className="text-xl text-yellow-100/80 font-medium mb-2">
            Copa Mundial de Fútbol
          </p>
          <p className="text-lg text-white/60 mb-10 max-w-lg mx-auto">
            Predice los resultados del Mundial y compite con tus amigos
          </p>
          <Link to="/login">
            <Button variant="gold" size="xl" className="animate-pulse-gold shadow-2xl shadow-yellow-500/20">
              <Trophy className="w-5 h-5 mr-2" />
              Comenzar a jugar
            </Button>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Target className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Predice Resultados</h3>
              <p className="text-sm text-white/50">
                Adivina el marcador exacto de cada partido
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Star className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Gana Puntos</h3>
              <p className="text-sm text-white/50">
                3 pts resultado exacto, 1 pt ganador correcto
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-xl group">
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-500/20 transition-colors">
                <Swords className="w-7 h-7 text-yellow-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Compite</h3>
              <p className="text-sm text-white/50">
                Sube en el ranking y demuestra quién sabe más
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeInUp">
      {/* Welcome header */}
      <div className="relative mb-10">
        <div className="absolute -top-6 -left-6 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl" />
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-3 shadow-lg shadow-yellow-500/20">
            <img src="/img/logo-sm.png" alt="Quiniela 2026" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">
              ¡Bienvenido, <span className="text-primary">{currentUser.displayName}</span>!
            </h1>
            <p className="text-muted-foreground mt-1">
              {currentUser.clientName || 'Quiniela'}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <Link to="/predictions" className="block group">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-green-600 to-green-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
            <CardContent className="p-6">
              <Calendar className="w-10 h-10 mb-3 text-yellow-300" />
              <h3 className="font-bold text-lg mb-1">Predicciones</h3>
              <p className="text-white/70 text-sm">Haz tus pronósticos</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/ranking" className="block group">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
            <CardContent className="p-6">
              <BarChart3 className="w-10 h-10 mb-3 text-yellow-300" />
              <h3 className="font-bold text-lg mb-1">Ranking</h3>
              <p className="text-white/70 text-sm">Tabla de posiciones</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-yellow-500 to-yellow-700 text-white shadow-xl">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-full" />
          <CardContent className="p-6">
            <Trophy className="w-10 h-10 mb-3 text-white" />
            <h3 className="font-bold text-lg mb-1">Tus Puntos</h3>
            <p className="text-4xl font-extrabold">{livePoints}</p>
            <p className="text-yellow-100/70 text-sm mt-1">puntos totales</p>
          </CardContent>
        </Card>
      </div>

      {/* Scoring system */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-muted/30">
        <CardContent className="p-6">
          <h2 className="font-bold text-xl mb-5 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Sistema de Puntuación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-500/10 dark:to-yellow-600/5 rounded-xl border border-yellow-200/50 dark:border-yellow-500/20">
              <div className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
                3
              </div>
              <div>
                <p className="font-semibold text-base">Resultado exacto</p>
                <p className="text-sm text-muted-foreground">Aciertas el marcador completo del partido</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-500/10 dark:to-green-600/5 rounded-xl border border-green-200/50 dark:border-green-500/20">
              <div className="w-12 h-12 rounded-full bg-gray-300 text-white flex items-center justify-center text-lg font-bold shrink-0">
                1
              </div>
              <div>
                <p className="font-semibold text-base">Ganador o empate correcto</p>
                <p className="text-sm text-muted-foreground">Aciertas quién gana pero no el marcador exacto</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
