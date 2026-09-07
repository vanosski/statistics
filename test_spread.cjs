const fs = require('fs');
const playersData = JSON.parse(fs.readFileSync('src/data/players.json'));
const detData = [{ name: '(277)X-', server: 'K27', lethal: 26 }];

const sum = playersData.find(p => p.name === '(277)X-');
const det = detData[0];

const merged = { ...sum, ...det };
console.log(merged.is_woc_leader);
