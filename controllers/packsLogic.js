const crypto = require("crypto");
const connection = require("../config/database");
const User = connection.models.User;
const Card = connection.models.Card;

const rarityChances = [
  { rarity: "Rare Holo", chance: 1 },
  { rarity: "Rare", chance: 9 },
  { rarity: "Uncommon", chance: 30 },
  { rarity: "Common", chance: 60 }
];

function pickRarity() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const entry of rarityChances) {
    sum += entry.chance;
    if (rand < sum) return entry.rarity;
  }
  return "Common";
}

async function packOpening(userId) {
  const user = await User.findById(userId);

  const selectedCards = [];
  const usedCards = new Set();

  for(let i = 0; i < 4; i++) {
    let rarity = pickRarity();
    let uniqueCard = await Card.find({ rarity, id: { $nin: Array.from(usedCards) }});
    if(uniqueCard.length == 0) {
      uniqueCard = await Card.find({ id: { $nin: Array.from(uniqueCard) } });
      if(uniqueCard == 0) break;
    }

    const card = uniqueCard[Math.floor(Math.random() * uniqueCard.length)];
    usedCards.add(card.id);
    selectedCards.push(card);

    const entry = user.cardsCollection.find(c => String(c.card) === String(card.id));
    if(entry) {
      entry.quantity += 1;
    }
    else {
      user.cardsCollection.push({ card: card.id, quantity: 1 });
    }
  }

  await user.save();
  return selectedCards;
}
module.exports.packOpening = packOpening;