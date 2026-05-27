import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { getCountryName, getFlagCode } from '../utils/countries';

function computeStandings(matches) {
  const groupTeams = {};

  function ensureTeam(group, code) {
    if (!groupTeams[group]) groupTeams[group] = {};
    if (!groupTeams[group][code]) {
      groupTeams[group][code] = { code, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
    }
  }

  for (const match of matches) {
    if (!match.group || !match.group.startsWith('Grupo')) continue;
    const group = match.group;
    ensureTeam(group, match.homeTeamCode);
    ensureTeam(group, match.awayTeamCode);

    if (!match.result || match.result.homeScore === null) continue;

    const homeCode = match.homeTeamCode;
    const awayCode = match.awayTeamCode;
    const homeScore = match.result.homeScore;
    const awayScore = match.result.awayScore;

    const home = groupTeams[group][homeCode];
    const away = groupTeams[group][awayCode];

    home.pj++; away.pj++;
    home.gf += homeScore; home.gc += awayScore;
    away.gf += awayScore; away.gc += homeScore;

    if (homeScore > awayScore) {
      home.pg++; home.pts += 3;
      away.pp++;
    } else if (homeScore < awayScore) {
      away.pg++; away.pts += 3;
      home.pp++;
    } else {
      home.pe++; home.pts += 1;
      away.pe++; away.pts += 1;
    }
  }

  for (const group of Object.keys(groupTeams)) {
    groupTeams[group] = Object.values(groupTeams[group]).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      const dgA = a.gf - a.gc;
      const dgB = b.gf - b.gc;
      if (dgB !== dgA) return dgB - dgA;
      return b.gf - a.gf;
    });
  }

  return groupTeams;
}

export default function Groups() {
  const [groups, setGroups] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const matchesSnap = await getDocs(collection(db, 'matches'));
      const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const computed = computeStandings(matches);
      setGroups(computed);
    } catch (error) {
      console.error('Error cargando grupos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const groupKeys = Object.keys(groups).sort();

  if (groupKeys.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-8">
          <img src="/img/logo-sm.png" alt="Quiniela 2026" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-3xl font-bold">Grupos</h1>
            <p className="text-muted-foreground text-sm">Fase de grupos</p>
          </div>
        </div>
        <div className="text-center py-16 text-muted-foreground">
          <p>Aún no hay resultados registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fadeInUp">
      <div className="flex items-center gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Fase de Grupos</h1>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {groupKeys.map(group => (
          <Card key={group} className="@container overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-800 to-green-700 text-white py-3">
              <CardTitle className="text-lg">{group}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                    <th className="text-center py-2.5 pl-4 pr-2 font-medium w-8">#</th>
                    <th className="text-left py-2.5 px-2 font-medium">Equipo</th>
                    <th className="text-center py-2.5 px-1.5 font-medium">PJ</th>
                    <th className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-medium">PG</th>
                    <th className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-medium">PE</th>
                    <th className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-medium">PP</th>
                    <th className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-medium">GF</th>
                    <th className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-medium">GC</th>
                    <th className="text-center py-2.5 px-1.5 font-medium">DG</th>
                    <th className="text-center py-2.5 pr-4 pl-1.5 font-medium">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {groups[group].map((team, i) => {
                    const dg = team.gf - team.gc;
                    return (
                      <tr
                        key={team.code}
                        className={cn(
                          'border-b last:border-0 transition-colors hover:bg-muted/30',
                          i < 4 && 'border-l-2 border-l-emerald-500'
                        )}
                      >
                        <td className="text-center py-2.5 pl-4 pr-2 font-bold text-muted-foreground w-8">{i + 1}</td>
                        <td className="py-2.5 px-2">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://flagcdn.com/w40/${getFlagCode(team.code)}.png`}
                              alt=""
                              className="w-6 h-4 object-cover rounded-sm shadow-sm flex-shrink-0"
                              loading="lazy"
                            />
                            <span className="font-medium truncate">{getCountryName(team.code)}</span>
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-1.5 font-mono">{team.pj}</td>
                        <td className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-mono text-green-600">{team.pg}</td>
                        <td className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-mono text-amber-600">{team.pe}</td>
                        <td className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-mono text-red-600">{team.pp}</td>
                        <td className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-mono">{team.gf}</td>
                        <td className="table-cell @max-[479px]:hidden text-center py-2.5 px-1.5 font-mono">{team.gc}</td>
                        <td className={cn(
                          'text-center py-2.5 px-1.5 font-mono font-bold',
                          dg > 0 ? 'text-green-600' : dg < 0 ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                          {dg > 0 ? `+${dg}` : dg}
                        </td>
                        <td className="text-center py-2.5 pr-4 pl-1.5 font-mono font-bold text-emerald-700">{team.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}