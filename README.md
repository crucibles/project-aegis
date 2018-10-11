# PROJECT AEGIS

Automated Education Gamified Instruction System (correct this if wrong)

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
