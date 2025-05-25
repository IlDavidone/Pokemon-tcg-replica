const crypto = require("crypto");


const rarityChances = [
  { rarity: "ultra-rare", chance: 1 },
  { rarity: "rare", chance: 9 },
  { rarity: "uncommon", chance: 30 },
  { rarity: "common", chance: 60 }
];

function pickRarity() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const entry of rarityChances) {
    sum += entry.chance;
    if (rand < sum) return entry.rarity;
  }
  return "common";
}