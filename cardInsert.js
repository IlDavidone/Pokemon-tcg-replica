import { createRequire } from "module";
const require = createRequire(import.meta.url);

const axios = require('axios');
const connection = require('./config/database');
const Card = connection.models.Card;

async function importBaseSet() {
    try {
        const response = await axios.get('https://api.pokemontcg.io/v2/cards?q=set.id:base1');
        const cardsData = response.data.data;

        const mappedCards = cardsData.map((card) => ( {
            id: card.id,
            name: card.name,
            supertype: card.supertype,
            hp: card.hp,
            types: card.types || [],
            evolvesFrom: card.evolvesFrom,
            evolvesTo: card.evolvesTo || [],
            abilites: Array.isArray(card.abilities) ? card.abilities.map(c => ( {
                name: c.name,
                text: c.text,
                type: c.type
            } )) : [],
            attacks: Array.isArray(card.attacks) ? card.attacks.map(a => ({ 
                cost: a.cost,
                name: a.name,
                damage: a.damage,
                text: a.text,
                convertedEnergyCost: a.convertedEnergyCost
             })) : [],
            weaknesses: Array.isArray(card.weaknesses) ? card.weaknesses.map(w => ({ 
                type: w.type,
                value: w.value
              })) : [],
            resistances: Array.isArray(card.resistances) ? card.resistances.map(r => ({ 
                type: r.type,
                value: r.value
             })) : [],
            rarity: card.rarity,
            lowResImage: card.images.small,
            highResImage: card.images.large
        } ));

        await Card.insertMany(mappedCards);
    }
    catch (err) {
        console.error(err);
    }
}
importBaseSet();
console.log("Done! imported all the cards into the database.")
