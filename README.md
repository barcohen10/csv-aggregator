## About
csv-aggregator is a Node.js service that aggregates small compressed CSV files under `./data` </br>
into bigger compressed CSV files (Each file up to 1KB) under `./data/aggregated`
and reduce size by elimination of duplicated lines  </br>
In addition, inserts new data to **SQLite** Database (`./database.sqlite`) using **Sequelize** (a promise-based ORM for Node) 

## First use
Run `npm install && npm start`

## Read from Database
After the aggregation process will finish, the user will be asked if to fetch rows from DB, and if yes, how many rows  </br>
For example: </br>
![Screenshot](assets/screenshot-db.png)

## The Implementation
This solution considered high scale and performance, and because of that i decided to use
**Node.js streams**, through all the process - from reading the small CSV files to saving the data in DISC & DB </br>

The entire streaming process is one CSV line at a time: </br></br>
I'm piping the output of the readable stream (the current file) </br>
↓ </br>
zlib.createGunzip() (unzip the file) </br>
↓ </br>
createLineReaderStream (will extract the body lines) </br>
↓ </br>
HashStream (will check if the line is unique) </br>
↓ </br>
CSVStream (The main stream, will write to the disc & DB when the file is almost exceed 1KB)
