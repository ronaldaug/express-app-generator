
       // Create A Database 
       var db = new Dexie("gen_database");
       db.version(1).stores({
        routes: "id++,route,auth,method",
        opts: "id,optionData",
        libraries: "id,port,cors,mongojs,auth"
        });

        // Add this data at the beginning of app.js
        var introData = `const express = require('express');
        const app = express();
        `;

        var allDefaultLib = `// All default Libraries
        app.use(express.json());
        `;

        // Add this data at the end of app.js
        var endingData = `

        app.get('/*', function(req, res) {
            res.status(404).send('404 not found!', 404);
        });
        app.listen(port, () => console.log('Server is running on localhost:'+port))
        `;
        
        // Add data in database when page load
        const initOpts = {
                id:1,
                optionData:""
                };
        const initLib = {
                id:1,
                appName:'',
                des:'',
                port:'',
                cors:'',
                mongojs:'',
                auth:''
                };
        db.opts.add(initOpts);
        db.libraries.add(initLib);

        // append in textarea on init
        function appendOptsInTextArea(){
            db.opts.toArray().then(e=>{
                if(!e){return}
                document.querySelector('#export-data').value = JSON.parse(e[0].optionData);
                db.routes.toArray().then(res=>{
                    if(!res){return}
                    exportDataInTextarea(res);
                })
            })
        }
        appendOptsInTextArea();


        var routeGenForm = document.querySelector('#routeGenForm');
        var routeInfo = document.querySelector('.routeInfo');
        var ReadMe = document.querySelector('.readme');
        var authCrid = document.querySelector('.auth-crid');
        var readMeSteps = document.querySelector('.readme-steps');
        var expressForm = document.querySelector('#expressForm');
        var resultBox = document.querySelector('.result');

        function backToRoute(){
            routeGenForm.style.display = 'block';
            ReadMe.style.display = 'none';
        }
        function backToApp(){
            routeGenForm.style.display = 'none';
            expressForm.style.display = 'block';
        }

        // append routes in readme
        function appendInfoInReadMe(){
            routeGenForm.style.display = 'none';
            ReadMe.style.display = 'block';
            db.libraries.toArray().then(lib=>{
                db.routes.toArray().then(res=>{
                if(!res){return}
                var appendRM = '';
                res.forEach(e=>{
                    let proTect = e.auth === 'Auth'?` (Protected)`:'';
                    appendRM += `<li>http://localhost:${lib[0].port}/${e.route}${proTect}</li>`;
                })
                if(lib[0].auth === 'y'){
                appendRM += `<li>http://localhost:${lib[0].port}/api/auth <=== register with email & password</li>
                <li>http://localhost:${lib[0].port}/api/login <=== request token here</li>`;
                }
                routeInfo.innerHTML = appendRM;
                })
                if(lib[0].auth === 'y'){
                var readmeSteps = `<ul>
                    <li>1- Download and extract zip file</li> 
                    <li>2- cd into download folder</li> 
                    <li>3- npm install</li> 
                    <li>4- npm update -D</li>
                    <li>5- npm rebuild bcrypt --build-from-source</li>
                    <li>6- npm run start</li>
                </ul>
                `;
                var criden = `<hr>
                    <div class="mongo-setup">
                    <h4>Mogodb set up</h4>
                    <p>Make sure to set up Mongodb in app.js.</p>
                    <p>E.g</p>
                    <p>var db = mongojs('mongodb://username:password@ds434534.mlab.com:34534/databasename', ['users']); // client </p>
                    <p>var ObjectId = db.ObjectId;</p>
                    </div>`;
                    authCrid.innerHTML = criden;
                    readMeSteps.innerHTML = readmeSteps;
                }
            })
        }


   expressForm.addEventListener('submit',(e)=>{
       e.preventDefault();
       let getAppName = document.querySelector('#app-name').value;
       if(getAppName.length > 20){
           alert('App Name length must be less than 20 charactors')
           return;
       }
       let getDes = document.querySelector('#description').value;
       let getPort = document.querySelector('#port-num').value;
       let getCors = document.querySelector('input[name="cors"]:checked').value;
       let getMongoJS = document.querySelector('input[name="mongojs"]:checked').value;
       let getAuth = document.querySelector('input[name="auth-system"]:checked').value;
       
       // Add data on init
       const initLib = {
                appName:getAppName,
                des:getDes,
                port:getPort,
                cors:getCors,
                mongojs:getMongoJS,
                auth:getAuth
                };
        db.libraries.update(1,initLib);

        const authSystemFun = `
        const jwt = require('jsonwebtoken');
        const Joi = require('joi');
        const bcrypt = require('bcrypt');

        const secretKey = 'yoursecretkey';

        function Auth(req, res, next){
        const reqHeader = req.headers['authorization'];
        if (!reqHeader || typeof reqHeader == 'undefined') {
            res.status(401).send('No Authorized!');
            return;
        }
        req.token = reqHeader.split(" ")[1];
        jwt.verify(req.token, secretKey, (err, resData) => {
            if (err) {
                res.status(401).send(err);
                return;
            }
            next();
        })
        }

        function registerUser(req,res){
            db.users.find({email: req.email}, function (err, user) {
                if(user.length !== 0){
                    res.status(400).send({
                        message: req.email + ' is already existed!'
                    })
                }else{
                    bcrypt.hash(req.password,10).then((hashedPass)=> {
                        const newUser = {
                            email: req.email,
                            password: hashedPass,
                            createdAt: Date.now()
                        }
                        db.users.save(newUser);
                        res.status(200).send({
                            message: req.email + ' is successfully registered!'
                        })
                    })
                }
            })
        }
        // Login and Generate Token
        function generateToken(req, res, next){
            jwt.sign(req, secretKey, (err, token) => {
                db.users.find({email: req.email}, function (err, user) {
                    if (user.length === 0){
                        res.status(400).send({
                            message:req.email+' does not exist.'
                        })
                        return;
                    } else {
                        bcrypt.compare(req.password, user[0].password).then((result) => {
                            if (result) {
                                res.status(200).send({
                                    token,
                                    user: {
                                        _id:user[0]._id,
                                        email: user[0].email,
                                        createdAt: user[0].createdAt,
                                    }
                                });
                            }else{
                                res.status(401).send({
                                    message:'Wrong Password!'
                                });
                            }
                        })
                    }
                })
                next();
            })
        }


        function getSingleUser(req, res){
            db.users.find({
                "_id": ObjectId(req.params.id)
            }, (err, user) => {
                if (user.length == 0) {
                    res.status(400).send('No ID exist!');
                    return;
                }
                const reUser = {
                    '_id': user[0]._id,
                    'email': user[0].email,
                    'createdAt': user[0].createdAt
                }
                res.status(200).send(reUser)
            })
        }

        // Input Validations 
        // validate user login
        function validateUser(val, res){
        const schema = {
            email: Joi.string().email({
                minDomainAtoms: 2
            }).required(),
            password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required(),
        }
        const {error, value} = Joi.validate(val, schema);
        if (error) {
            res.status(400).send(error);
            return 'fail';
        }
        }

        // Read Single User
        app.get('/api/users/:id', Auth, (req, res) => {
            getSingleUser(req, res);
        })

        // User Login
        app.post('/api/login', (req, res) => {
        let check = validateUser(req.body, res);
            if (check === 'fail') {
            return
            }
            generateToken(req.body, res);
        })

        // New user registration
        app.post('/api/auth', (req, res) => {
        let check = validateUser(req.body, res);
            if (check === 'fail') {
            return
            }
            registerUser(req.body, res);
        })

        `;

         // App.Requires
        let Rcors = getCors  === 'y'?`const cors = require('cors')`:'';
        const monG = `
        // Mongo JS
        const mongojs = require('mongojs')
        // add mogondb URL here
        // var db = mongojs('mongodb://username:password@ds434534.mlab.com:34534/databasename', ['users']);
        // add this after you added mongodb URL
        // var ObjectId = db.ObjectId;"
        `;
        let mongoDB = getMongoJS  === 'y'?monG:'';
        
        // App.uses
        let port = getPort?`const port=${getPort}`:'';
        let cors = getCors  === 'y'?`app.use(cors())`:'';
        let authSys = getAuth  === 'y'?`${authSystemFun}`:'';
        if(getAuth  === 'n'){
            document.querySelector('.protectRoute').style.opacity = 0;
        }else{
            document.querySelector('.protectRoute').style.opacity = 1;
        }

        expressData = `${introData}
        ${port}
        ${allDefaultLib}
        ${mongoDB}

        // Express libraries
        ${Rcors}

        // App Uses 
        ${cors}
        ${authSys}`;

        db.opts.update(1,{optionData:JSON.stringify(expressData)}).then(function() {
            return db.routes.toArray();
        }).then((res)=>{
         
        }).catch((err)=>{
            console.log(err)
        })
        appendOptsInTextArea();
        expressForm.style.display = 'none';
        routeGenForm.style.display = 'block';
   })
        function appendDataInBody(resData){
            var appendData = '';
            resData.forEach(data=>{
            appendData += `<li id="res-${data.id}">Route = ${data.route} | Method = ${data.method} | Auth = ${data.auth} <a onclick=deleteData(${data.id}) href="#">x</a></li>`;
            })
            resultBox.innerHTML = appendData;
        }
        
        function exportDataInTextarea(resData){
        var routeData = '';
        resData.forEach(data=>{
            var authVal = data.auth === 'Auth'?'Auth,':'';
            var authMsg = data.auth === 'Auth'?`'Successfully authenticated! Welcome to /${data.route} route. You can response JSON API object here!'`:`'Welcome to /${data.route} route.'`;
        routeData += `

        // ${data.route} page
        app.${data.method}('/${data.route}', ${authVal}(req,res)=>{
            res.status(200).send(${authMsg});
        })`;
        })

        db.opts.toArray().then((e)=>{
        var indexRoute = `
        // App Routes
        app.get('/', (req, res)=>{
            res.status(200).send('Welcome to node API page')
        });
        `;        
        const orData = JSON.parse(e[0].optionData);
        const appData = orData + indexRoute + routeData + endingData;
        document.querySelector('#export-data').value = appData;
        })
       }

        routeGenForm.addEventListener('submit', (e)=>{
        e.preventDefault();
        let genData = new FormData(routeGenForm);
        let routeName = genData.get('route-name');
        if(routeName === 'login'){
            alert('Route name "login" is already used in Auth System!')
            return;
        }
        if(routeName === 'logout'){
            alert('Route name "logout" is already used in Auth System!')
            return;
        }
        let routeAuth = genData.get('auth');
        let Method = genData.get('method');
            const objData = {
                route: routeName,
                auth: routeAuth,
                method: Method
            }

        db.routes.add(objData).then(function() {
            return db.routes.toArray();
        }).then(function (res) {
            appendDataInBody(res);
            exportDataInTextarea(res);
        }).catch(function (err) {
            console.log(err)
        });

    })

    db.routes.toArray().then(function (res) {
         appendDataInBody(res);
         exportDataInTextarea(res);
    })
    
    function deleteData(dId){
        document.querySelector('#res-'+dId).style.display= 'none';
        db.routes.delete(dId);
        db.routes.toArray().then(res=>{
        if(!res){return}
        exportDataInTextarea(res);
        })
    }
    
    function downData(){
        const dataToExport = document.querySelector('#export-data').value;
        generateFile(dataToExport)
    }

    function clearDb(){
        db.delete();
        location.reload();
    }

    function generateFile(data) {
            if(!data){
                alert('You cannot export without expressjs data!')
                return;
            }
            db.libraries.toArray().then(lib =>{

let Pcors = lib[0].cors === 'y'? `"cors": "^2.8.5",`:'';
let Pmongojs = lib[0].mongojs === 'y'? `"mongojs": "^2.6.0",`:'';
let Pjsonwebtoken = lib[0].auth === 'y'? `"jsonwebtoken": "^8.5.1",`:'';
let Pjoi = lib[0].auth === 'y'? `"@hapi/joi": "^15.0.3",`:'';
let Pbcrypt = lib[0].auth === 'y'? `"bcrypt": "^3.0.6",`:'';
let applicationName = lib[0].appName.replace(/\s+/g, '-').toLowerCase();


 var packJason = `{
"name": "${applicationName}",
"version": "1.0.0",
"description": "${lib[0].des}",
"main": "app.js",
"scripts": {
"start": "nodemon app.js"
},
"keywords": [],
"author": "",
"license": "ISC",
"dependencies": {
    ${Pcors}
    ${Pmongojs}
    ${Pjoi}
    ${Pjsonwebtoken}
    ${Pbcrypt}
    "express": "^4.17.1",
    "nodemon": "^1.19.1"
    }
}
`;

            var zip = new JSZip();
            zip.file("app.js", data);
            zip.file("package.json", packJason);

            zip.generateAsync({type:"blob"})
            .then(function(content) {
                const timeSt = new Date();
                saveAs(content, `${Date.parse(timeSt)}.zip`);            
        });
    })
}
