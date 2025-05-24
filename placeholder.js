import { createRequire } from "module";
const require = createRequire(import.meta.url);

import fetch from "node-fetch";
const connection = require("./config/database");
const Card = connection.models.Card;

const res = await fetch("https://api.pokemontcg.io/v2/cards/mcd19-1", {
  headers: { "X-Api-Key": process.env.API_KEY },
});
const json = await res.json();
const finalResource = JSON.stringify(json);
console.log(json.data.name);
console.log(json.data.attacks);
console.log(json.data.images.small);
console.log(json.data.images.large);
