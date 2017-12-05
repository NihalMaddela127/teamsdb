let fs=require('fs');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');
app.use(bodyParser());
//let ejs = require('ejs');
//app.engine('.ejs', require('ejs').renderFile);
//app.set('view engine','ejs');
app.get('/', function(req, resp){
  resp.sendFile('./views/index.html',{root: './'});
});
let MongoClient = require('mongodb').MongoClient;
let url = 'mongodb://localhost/test';   
app.post('/',function(req, resp){
  let teamSize = req.body.teamsize;
  let fileName = req.body.filename;
   fs.readFile(fileName, "utf8", function(err, contents) {
        if(err) return resp.send("Error: Unable to read file.");        
        let jsonContent = JSON.parse(contents);
        MongoClient.connect(url, function(err, db) {
            if(err){resp.send("Error: Unable to connect to database.")}
            db.collection('aspirants').insertMany(jsonContent, function(err, res) {
                if(err){resp.send("Error: Unable to insert json contents to database.")}
          });
          db.collection('aspirants').find({}).toArray(function(err,aspirants){
            if (err) {
                resp.send("Error: Unable to retreive aspirants data from database.");
            }
        aspirantsCount = aspirants.length;
        console.log("Aspirants Count: "+aspirantsCount);
        app.get('/db', function(req, resp){
        if ( teamSize == parseInt(teamSize,10) && teamSize > 0 && teamSize < aspirantsCount){
            let mod = aspirantsCount % teamSize;
            let team = 1;
            let resultArray = [];
            let temp = teamSize;
            console.log("Teamsize: "+teamSize);
            let count = 0;
            let remList = aspirants;        
            if (mod != 0){
                        while(count < aspirantsCount){
                            if (temp == teamSize){
                                let i = Math.floor(Math.random() * remList.length);
                                let person = remList[i];
                                resultArray.push("<br />"+"Team"+team+"<br />");
                                if( mod != 0 ){
                                    resultArray.push(person)
                                    resultArray.push("<br />");
                                    remList.splice(i, 1);
                                    mod -= 1;
                                    count += 1;
                                }
                                temp = 0;
                                team += 1;
                            }
                            let i = Math.floor(Math.random() * remList.length);
                            let person = remList[i];
                            resultArray.push(person);
                            resultArray.push("<br />");
                            remList.splice(i, 1);                        
                            temp += 1;
                            count += 1;
                        }
                        let resultTeam = JSON.stringify(resultArray);
                        resultTeam = resultTeam.replace(/["'(){}]/g," ");
                        resp.send(resultTeam);
                }
            else{
                while(count < aspirantsCount){
                    let i = Math.floor(Math.random() * remList.length);
                    let person = remList[i];
                    if (temp == teamSize){
                        resultArray.push("<br />"+"Team"+team+"<br />");
                        temp = 0;
                        team += 1;
                    }
                    resultArray.push(person);
                    resultArray.push("<br />");                    
                    temp += 1;
                    count += 1;
                    remList.splice(i, 1);
                }
                let resultTeam = JSON.stringify(resultArray);
                resultTeam = resultTeam.replace(/["'(){}]/g," ");
                resp.send(resultTeam);
            }
        }
        else{
            resp.send("Enter team size between 1 and "+aspirantsCount);       
        }
    });
    let writeStream = fs.createWriteStream('log.txt',{'flags':'a'});
    writeStream.write('We had visit at '+ new Date()+'\n');
    writeStream.end();
});
db.close(); 
});   
});
});
app.listen(3000,function(){
  console.log('Listen 3000');
});
