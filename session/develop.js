
       // Create A Database 
       var db = new Dexie("gen_database");
       db.version(1).stores({
        routes: "id++,route,auth,method",
        opts: "id,optionData",
        libraries: "id,port,mongojs,auth"
        });

       // Declare virables
        const routeGenForm = document.querySelector('#routeGenForm');
        const expressForm = document.querySelector('#expressForm');
        const routeInfo = document.querySelector('.routeInfo');
        const ReadMe = document.querySelector('.readme');
        const authCrid = document.querySelector('.auth-crid');
        const resultBox = document.querySelector('.result');

        const getDes = document.querySelector('#description').value;
        const getPort = document.querySelector('#port-num').value;
        const getMongoJS = document.querySelector('input[name="mongojs"]:checked').value;
        const getAuth = document.querySelector('input[name="auth-system"]:checked').value;
        // var exportData = '';

        function backToRoute(){
            routeGenForm.style.display = 'block';
            ReadMe.style.display = 'none';
        }
        function backToApp(){
            routeGenForm.style.display = 'none';
            expressForm.style.display = 'block';
        }


        // Add this data at the beginning of app.js
        let introData = `const express = require('express');
        const app = express(); `;

        let allDefaultLib = `// All default Libraries
        const path= require('path'); 
        // EJS set up
        const expressLayouts = require('express-ejs-layouts') 
        app.set('views',path.join(__dirname,'views'));
        app.set('view engine', 'ejs');
        app.use(expressLayouts); 
        `;

        // Add this data at the end of app.js
        let endingData = `
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
                routeInfo.innerHTML = appendRM;
                })
                if(lib[0].auth === 'y'){
                var criden = `<hr>
                    <h4>Your auth cridential</h4>
                    <ul><li>username = user1</li><li>password = pass1</li></ul>`;
                authCrid.innerHTML = criden;
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
       
       // Add data on init
       const initLib = {
                appName:getAppName,
                des:getDes,
                port:getPort,
                mongojs:getMongoJS,
                auth:getAuth
                };
        db.libraries.update(1,initLib);
         
        const authSystemFun = `app.use(session({
            secret: 'secretkeyblabla',
            resave: true,
            saveUninitialized: false
        }))

        //support parsing of application/x-www-form-urlencoded post data
        app.use(bodyParser.urlencoded({ extended: true }));
        // Check Auth
        function Auth(req,res,next){

            // username and password
            let userName = "user1";
            let password = "pass1";
            if(!req.session.user){
                if(req.body.username === userName && req.body.password === password){
                    req.session.user = {
                        username: userName,
                        password: password
                    }
                    req.session.isLoggedIn = true;
                }else{
                    req.session.isLoggedIn = false;
                }
            }else{
                req.session.isLoggedIn = true;
            }
                

            if(!req.session.isLoggedIn){
            res.render('login',{'isLogged':false,'page_name':req.path});
                return;
            }else{
                if(req.body.return_url){
                    const returnlURL = req.body.return_url;
                    res.redirect(returnlURL);
                }else{
                    next();
                }
            }
        }
        app.post('/login', Auth, (req,res)=>{
            res.render('index',{'isLogged':true})
        })
        app.get('/login', Auth, (req,res)=>{
            res.render('index',{'isLogged':true})
        })
        app.post('/logout',(req,res)=>{
            logOutFun(req,res);
        })
        app.get('/logout',(req,res)=>{
            logOutFun(req,res);
        })
        function logOutFun(req,res){
            req.session.isLoggedIn = false;
            req.session.user = null;
            res.redirect('/login');
        }`;

         // App.Requires
        let RexSession = getAuth  === 'y'?`const session = require('express-session')`:'';
        let Rbodyparser = getAuth  === 'y'?`const bodyParser = require('body-parser')`:'';
        const monG = `
        // Mongo JS
        const mongojs = require('mongojs')
        // add mogondb URL here
        // const db = mongojs(connectionString, [collections])
        `;
        let mongoDB = getMongoJS  === 'y'?monG:'';
        
        // App.uses
        let port = getPort?`const port=${getPort}`:'';
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
        ${RexSession}
        ${Rbodyparser}

        // App Uses 
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
            var isLogVal = data.auth === 'Auth'?`{'isLogged':true}`:`{'isLogged':false}`;
            var indexVal = data.auth === 'Auth'?`res.send('index',{'isLogged':true});`:`res.send('Welcome, this is express main page!');`;
        routeData += `

        // ${data.route} page
        app.${data.method}('/${data.route}', ${authVal}(req,res)=>{
            res.render('${data.route}',${isLogVal})
        })`;
        })


        db.opts.toArray().then((e)=>{

         db.libraries.toArray().then(li =>{
            var AuthProtect = li[0].auth  === 'y'?`Auth,`:'';
            var AuthOrNot = li[0].auth  === 'y'?`,{'isLogged':true}`:'';
            var indexRoute = `
        // App Routes
        app.get('/', ${AuthProtect}(req, res)=>{
            res.render('index'${AuthOrNot})
        });
        `;        
        const orData = JSON.parse(e[0].optionData);
        const appData = orData + indexRoute + routeData + endingData;
        document.querySelector('#export-data').value = appData;
        })
        
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
        let Auth = genData.get('auth');
        let Method = genData.get('method');
            const objData = {
                route: routeName,
                auth: Auth,
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

let mongojs = lib[0].mongojs === 'y'? `"mongojs": "^2.6.0",`:'';
let session = lib[0].auth === 'y'? `"express-session": "^1.15.6",`:'';
let bodyparser = lib[0].auth === 'y'? `"body-parser": "^1.18.3",`:'';
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
    ${mongojs}
    ${session}
    ${bodyparser}
    "ejs": "^2.6.1",
    "express": "^4.17.1",
    "express-ejs-layouts": "^2.5.0",
    "nodemon": "^1.19.1"
    }
}
`;

            var zip = new JSZip();
            zip.file("app.js", data);
            zip.file("package.json", packJason);

            // create view folder
            var viewFolder = zip.folder("views");
            viewFolder.file("index.ejs",`<h4>Welcome to express generator index page!</h4>`);

            // add layout.ejs file
            var logOrNot = lib[0].auth === 'y'?`<br>
    <% if (isLogged === true) { %>
    <form action="/logout"><button>Logout</button></form>
    <% } %>`:'';
            var layOut = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>${lib[0].appName}</title>
</head>
<body>
    <%- body %>
    ${logOrNot}
</body>
</html>`;
        viewFolder.file("layout.ejs",layOut);

        // add login.ejs file
        if(lib[0].auth === 'y'){
            var loginPage = `<form action="/login" method="post">
    <h4>Login</h4>
    <input name="return_url" value="<%= page_name %>" type="hidden">
    <input placeholder="username" name="username">
    <input placeholder="password" name="password" type="password">
    <input type="submit" value="Login">
</form>`;
            viewFolder.file("login.ejs",loginPage);
        }

            // Create .ejs file for each route
            var createRoutes = new Promise((resolve,reject)=>{
                db.routes.toArray().then(ro=>{
                    if(!ro){resolve(); return}
                ro.forEach(data=>{
                    viewFolder.file(`${data.route}.ejs`,`<h4>Welcome to ${data.route} page!</h4>`);
                    })
                    resolve();
                })
            })
            
            createRoutes.then(()=>{
                zip.generateAsync({type:"blob"})
                .then(function(content) {
                const timeStamp = new Date();
                saveAs(content, `${Date.parse(timeStamp)}-export.zip`);
            })
            
        });
    })
}
