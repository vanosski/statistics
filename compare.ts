import { getRankedKingdoms } from './src/utils/kingdomRanking';
import kingdoms from './src/data/kingdoms.json';
import players from './src/data/public_players.json';

const ranked = getRankedKingdoms(kingdoms as any, players as any);
const k43 = ranked.find(k => k.server === 'K43');
const k138 = ranked.find(k => k.server === 'K138');

console.log('K43 Rank:', k43?.rank, 'Power:', k43?.finalKingdomPower);
console.log('K138 Rank:', k138?.rank, 'Power:', k138?.finalKingdomPower);
