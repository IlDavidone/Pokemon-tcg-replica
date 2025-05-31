# Pokémon Fanmade Trading Card Game

## Description

This project is my vision on the Pokémon tcg pocket / og game, where you can collect and trade cards with your friends!

## Features (Day One)

* Account authentication and strong password cryptography

* Scheduled collective energy recovering

* Exciting pack experience, featuring all of the cards present in the day one base set

* High quality card images and descriptions (Thanks to the Pokémon TCG Api)

* Unique collection for all the players

* Friends list and requests

> [!IMPORTANT]
> Trades initialized but to polish, so no possibility to do it for now

> [!WARNING]
> Credits system to be implemented, so not to be expected for now

## Building

Clone this repository by running: 
`https://github.com/IlDavidone/Pokemon-tcg-replica.git`

Navigate and go in the cloned directory and then run: 
`npm i` or `npm install`

Create a file named ".env" and insert these parameters into it:
```
PORT = Desired Port (Integer) (Default: 3000)
DB_ACCESS_STRING = Your assigned string to connect into the MongoDB Server
SECRET = Preferably a random generated string, can be any string anyway
```

Run this command to build card voices in your database (Important and not to skip):
`node .\cardInsert.js`

Finally run this to see your website working in [This link](https://localhost:3000/home).
