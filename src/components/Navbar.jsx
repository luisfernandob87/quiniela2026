import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Trophy, LogOut, User, Shield } from 'lucide-react';
import { calculatePoints } from '../utils/scoring';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [livePoints, setLivePoints] = useState(0);
  const navigate = useNavigate();

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

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            <span className="font-bold text-xl">Quiniela 2026</span>
          </Link>

          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <Link to="/predictions" className="hover:underline text-sm hidden sm:block">
                  Predicciones
                </Link>
                <Link to="/ranking" className="hover:underline text-sm hidden sm:block">
                  Ranking
                </Link>
                {currentUser.isAdmin && (
                  <Link to="/admin" className="hover:underline text-sm flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentUser.displayName}</span>
                  <span className="bg-primary-foreground/20 px-2 py-1 rounded-full text-xs">
                    {livePoints} pts
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/20">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
