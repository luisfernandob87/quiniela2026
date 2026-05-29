import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { LogOut, User, Shield, Trophy, Menu, X } from 'lucide-react';
import { calculatePoints } from '../utils/scoring';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [livePoints, setLivePoints] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    loadLivePoints();
  }, [currentUser]);

  async function loadLivePoints() {
    if (!currentUser?.clientId) return;
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

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  return (
    <nav className="bg-gradient-to-r from-emerald-800 via-green-700 to-emerald-800 text-white shadow-lg border-b border-gold-500/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/img/logo-sm.png" alt="Quiniela 2026" className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110" />
            <span className="font-bold text-xl tracking-tight">
              Quiniela <span className="text-yellow-300">2026</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4">
            {currentUser && (
              <>
                <Link to="/predictions" className="text-white/80 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10">
                  Predicciones
                </Link>
                <Link to="/groups" className="text-white/80 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10">
                  Grupos
                </Link>
                <Link to="/ranking" className="text-white/80 hover:text-white transition-colors text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-white/10">
                  Ranking
                </Link>
                {(currentUser.isAdmin || currentUser.canManageUsers) && (
                  <Link to="/admin" className="text-white/80 hover:text-white transition-colors text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-white/10">
                    <Shield className="w-4 h-4" />
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 text-sm pl-3 border-l border-white/20">
                  <User className="w-4 h-4 text-white/60" />
                  <span className="text-white/90 font-medium">{currentUser.displayName}</span>
                  {currentUser.clientName && (
                    <span className="text-white/50 text-xs hidden lg:inline">
                      {currentUser.clientName}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/30 rounded-full px-3 py-1">
                    <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="font-bold text-yellow-200 text-xs">{livePoints}</span>
                    <span className="text-yellow-300/60 text-[10px] uppercase tracking-wider">pts</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/70 hover:text-white hover:bg-white/10">
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && (
              <>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-400/30 rounded-full px-2.5 py-1">
                  <Trophy className="w-3 h-3 text-yellow-300" />
                  <span className="font-bold text-yellow-200 text-xs">{livePoints}</span>
                  <span className="text-yellow-300/60 text-[9px] uppercase tracking-wider">pts</span>
                </div>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && currentUser && (
          <div className="md:hidden pb-4 pt-2 space-y-1 border-t border-white/10 animate-fadeInUp">
            <Link to="/predictions" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              Predicciones
            </Link>
            <Link to="/groups" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              Grupos
            </Link>
            <Link to="/ranking" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              Ranking
            </Link>
            {(currentUser.isAdmin || currentUser.canManageUsers) && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Shield className="w-4 h-4 inline mr-1" />
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/60">
              <User className="w-4 h-4" />
              <span>{currentUser.displayName}</span>
            </div>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 inline mr-1" />
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
