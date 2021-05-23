'use stict'

const express=require('express');
const pg= require('pg');
const superagent=require('superagent');
const methodoverride=require('method-override');
const cors=require('cors');

require('dotenv').config();
const PORT=process.env.PORT;
const DATABASE_URL=process.env.DATABASE_URL;

const app=express();
const client=new pg.Client(DATABASE_URL)
app.use(express.urlencoded({extended:true}));
app.use(express.static('./public'));
app.use(methodoverride('_method'));
app.use(cors());
app.set('view engine' ,'ejs');

app.get('/',renderAllJobs);
app.get('/searchjob',searchjobs);
app.post('/savetodb',saveinDB);
app.get('/my-list',renderFromDB);
app.get('/showdetails/:id',detailsshow);
app.put('/updatejob/:id',updatejob);
app.delete('/deletejob/:id',deletejob)

function deletejob(req,res){
    const id =req.params.id;
    const sql=`DELETE FROM job WHERE id=$1;`
    const safevalue=[id];
    client.query(sql,safevalue).then(()=>{
        res.redirect('/my-list')
    })



}

function updatejob(req,res){
    const id =req.params.id;
    const{title,company,location,url,description}=req.body
    const sql=`UPDATE job SET title=$1, company=$2 , location=$3 , url=$4 , description=$5 WHERE id=$6 `
    const safevalue=[title,company,location,url,description]
    client.query(sql,safevalue).then(()=>{
        res.redirect(`/showdetails/${id}`)
    })



}


function detailsshow(req,res){
const id =req.params.id;
const sql=`SELECT * FROM job WHERE id=$1`
const safevalue=[id];
client.query(sql,safevalue).then(data =>{
    res.render('detailspage',{obj:data.rows})
})
}

function renderFromDB(req,res){
    const sql=`SELECT * FROM job;`
    client.query(sql).then(data=>{
        res.render('my-list',{obj:data.rows})
    })
}

function saveinDB(req,res){
    const {title,company,location,url}=req.body
    const sql=`INSERT INTO job(title,company,location,url) VALUES($1,$2,$3,$4)`
    const safevalue=[title,company,location,url]
    client.query(sql,safevalue).then(()=>{
        res.redirect('/mylist')
    })
}





function searchjobs(req,res){
    const {description}=req.body
    const url=`https://jobs.github.com/positions.json?description=python&location=usa`
    superagent.get(url).then(data =>{
        res.render('/result',{obj:data.body})
    })

}

function Jobs(info){
    this.title=info.title;
    this.company=info.company;
    this.location=info.location;
    this.url=info.url;
}

function renderAllJobs(req,res){
    const url=`https://jobs.github.com/positions.json?location=usa`
    superagent.get(url).then(data =>{
        const job=data.body.map(result =>{
            return new Jobs(result)
        })
        res.render('home',{obj:job})
    })
}


client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`hi ${PORT}`);
    })
})
