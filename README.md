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

## Few words about the implementation
This solution considered high scale and performance, and because of that i decided to use
**Node.js streams**, through all the process - from reading the small CSV files to saving the data in DISC & DB </br>

The entire streaming process is one CSV line at a time: </br></br>
I'm piping the output of the readable stream (the current file) </br>
↓ </br>
zlib.createGunzip() (unzip the file) </br>
↓ </br>
LineReaderStream (will extract the body lines) </br>
↓ </br>
HashStream (will check if the line is unique) </br>
↓ </br>
CSVStream (The main stream, will write to the disc & DB when the file is almost exceed 1KB)

**Custom transform streams** </br>
* LineReaderStream - responsible for splitting the current file chunk into CSV body lines / CSV header line
* HashStream - responsible for removing not unique lines by using MD5 hashing
* CSVStream - The main stream, responsible for creating 1KB aggregated and compressed CSV files, saving the files to the disc & DB - one file at a time - loads to app memory only 1KB at a time.

**DB**
SQLite Database is dynamically created using the CSV header as table columns, the DB contains only unique lines, the id of each record is the MD5 hashed version of the line.

