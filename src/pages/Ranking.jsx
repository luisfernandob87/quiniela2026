import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent } from '../components/ui/Card';
import { Trophy, Medal } from 'lucide-react';
import { calculatePoints } from '../utils/scoring';

export default function Ranking() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  async function loadRanking() {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const matchesSnap = await getDocs(collection(db, 'matches'));
      const predictionsSnap = await getDocs(collection(db, 'predictions'));

      const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const predictions = predictionsSnap.docs.map(d => d.data());

      const usersData = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      const calculatedPoints = {};
      for (const pred of predictions) {
        const match = matches.find(m => m.id === pred.matchId);
        if (!match || !match.result || match.result.homeScore === null) continue;

        const points = calculatePoints(pred, match.result);
        if (!calculatedPoints[pred.userId]) calculatedPoints[pred.userId] = 0;
        calculatedPoints[pred.userId] += points;
      }

      const usersWithPoints = usersData.map(u => ({
        ...u,
        points: calculatedPoints[u.id] || u.points || 0
      }));

      usersWithPoints.sort((a, b) => b.points - a.points);

      const ranked = usersWithPoints.map((u, i) => ({ ...u, rank: i + 1 }));
      setUsers(ranked);
    } catch (error) {
      console.error('Error cargando ranking:', error);
    } finally {
      setLoading(false);
    }
  }

  function getMedalIcon(rank) {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400 fill-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600 fill-amber-600" />;
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">Ranking</h1>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <Card
            key={user.id}
            className={`transition-all ${index < 3 ? 'border-2' : ''} ${
              index === 0 ? 'border-yellow-400 bg-yellow-50' :
              index === 1 ? 'border-gray-300 bg-gray-50' :
              index === 2 ? 'border-amber-400 bg-amber-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold">
                    {getMedalIcon(user.rank) || <span>{user.rank}</span>}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-primary">{user.points}</span>
                  <p className="text-sm text-muted-foreground">puntos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No hay usuarios registrados aún
          </div>
        )}
      </div>
    </div>
  );
}
