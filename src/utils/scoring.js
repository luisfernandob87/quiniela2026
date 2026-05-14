import { collection, getDocs, doc, writeBatch, query, where } from 'firebase/firestore';

export function calculatePoints(prediction, result) {
  if (!prediction || !result) return 0;
  
  const predHome = parseInt(prediction.homeScore);
  const predAway = parseInt(prediction.awayScore);
  const resHome = parseInt(result.homeScore);
  const resAway = parseInt(result.awayScore);
  
  if (isNaN(predHome) || isNaN(predAway) || isNaN(resHome) || isNaN(resAway)) {
    return 0;
  }
  
  if (predHome === resHome && predAway === resAway) {
    return 3;
  }
  
  const predWinner = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const resWinner = resHome > resAway ? 'home' : resHome < resAway ? 'away' : 'draw';
  
  if (predWinner === resWinner) {
    return 1;
  }
  
  return 0;
}

export async function recalculateAllPoints(db, clientId) {
  const matchesQuery = query(collection(db, 'matches'));
  const matchesSnap = await getDocs(matchesQuery);
  const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const predictionsQuery = query(collection(db, 'predictions'), where('clientId', '==', clientId));
  const predictionsSnap = await getDocs(predictionsQuery);
  const predictions = predictionsSnap.docs.map(d => d.data());
  
  const usersQuery = query(collection(db, 'users'), where('clientId', '==', clientId));
  const usersSnap = await getDocs(usersQuery);
  const clientUsers = usersSnap.docs.map(d => d.id);
  
  const userPoints = {};
  
  for (const pred of predictions) {
    const match = matches.find(m => m.id === pred.matchId);
    if (!match || !match.result || match.result.homeScore === null) continue;
    
    const points = calculatePoints(pred, match.result);
    const uid = pred.userId;
    
    if (!userPoints[uid]) userPoints[uid] = 0;
    userPoints[uid] += points;
  }
  
  const batch = writeBatch(db);
  for (const uid of clientUsers) {
    const userRef = doc(db, 'users', uid);
    batch.update(userRef, { points: userPoints[uid] || 0 });
  }
  
  await batch.commit();
  return userPoints;
}
