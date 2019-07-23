# PROJECT AEGIS

Automated Education Gamified Instruction System

A project for gamification of education by:
<ul>
<li>[@asumandang](https://github.com/asumandang)</li>
<li>[@crucibles](https://github.com/crucibles)</li>
<li>[@Donex26](https://github.com/Donex26)</li>
</ul>

## Development server

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
MongoDB server should be used and run. MongoServer is at `http://localhost:3000/`. The app will automatically redirect all api request to the mongodb server.


## Build

Run `ng build` to build the project. The build artifacts will be stored in the `public/` directory.


## DTR

Link: https://docs.google.com/spreadsheets/d/1JteO9-EI1kHj9ishR2URVCTScbQUnaJJZ2O_rmc5P40/edit?usp=sharing

## Updating your DB

To delete the old one: 

1. open cmd: admin
2. (cd to Program Files/MongoDb/Server/3.6/bin)
3. run mongo
4. use up-goe-db
5. db.dropDatabase()


To restore the updated:

mongorestore -d up-goe-db "path where you downloaded the db folder"

Sample: mongorestore -d up-goe-db C:/db_backups/up-goe-db

## Mondo Dump to backup your DB to be reflected to git

To back up your current DB and push it to git. (Mongo Dump)

1. open cmd: admin
2. (cd to Program Files/MongoDb/Server/3.6/bin)
3. mongodump -d "database_name" -p "location to save"

Sample: mongodump -d up-goe-db -p C:\Users\cedric\project-aegis\db_backups\up-goe-db


## Deploying the application
Build the angular app, put the dist folder to the server folders.
Set up the server to point to index.html and to that dist/

For Test Deployment:

Pre-requirments:

1. latest version of master
2. npm install -g localtunnel  // reference: https://www.npmjs.com/package/localtunnel


Deploying...

Step 1
Open your latest code.
In the terminal, instead of the usual "npm start" for development, I added a deploy script.


Run "npm run deploy"


Step 2
After a successful run of "npm run deploy"
Proceed to localhost:3000 and test it
If it's okay proceed to Step 3


Step 3
Make your pc as a server using local tunnel

run "lt --port 3000" in another terminal



Step 4
There will be a hostname that will be given, try that hostname accessing in your browser.


Voila!!
