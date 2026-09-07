import fs from 'fs';
const players = JSON.parse(fs.readFileSync('src/data/public_players.json', 'utf8'));
const kingdoms = JSON.parse(fs.readFileSync('src/data/kingdoms.json', 'utf8'));

const kd = kingdoms.find(k => k.server === 'K162');
const wocLeader = players.find(p => p.server === kd.server && p.is_woc_leader) || null;

console.log(wocLeader);
