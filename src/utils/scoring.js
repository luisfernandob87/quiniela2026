import { collection, getDocs, doc, updateDoc, writeBatch } from 'firebase/firestore';

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

export async function recalculateAllPoints(db) {
  const matchesSnap = await getDocs(collection(db, 'matches'));
  const matches = matchesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  const predictionsSnap = await getDocs(collection(db, 'predictions'));
  const predictions = predictionsSnap.docs.map(d => d.data());
  
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
  for (const [uid, points] of Object.entries(userPoints)) {
    const userRef = doc(db, 'users', uid);
    batch.update(userRef, { points });
  }
  
  await batch.commit();
  return userPoints;
}
