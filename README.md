## About
csv-aggregator is a Node.js service that aggregates small compressed CSV files under `./data` </br>
into bigger compressed CSV files (Each file up to 1KB) under `./data/aggregated`
and reduce size by elimination of duplicated lines  </br>
In addition, inserts new data to **SQLite** Database (`./database.sqlite`) using **Sequelize** (a promise-based ORM for Node) 

## First use
Run `npm install && npm start`

## Read from Database
After the first use, the easiest way to read the results inserted to DB will be using the command `npm run read-db [LIMIT_LINES]` </br> 
for example: `npm run read-db 10` will fetch and log the first 10 rows in DB.

## The Implementation
This solution considered high scale and performance, and because of that i decided to use
**Node.js streams**, through all the process - from reading the small csv file until saving the data to disc & DB
