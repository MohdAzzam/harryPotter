'use strict';
require('dotenv').config();
const PORT=3000;
const express = require('express');
const pg = require('pg');
const methodoverride=require('method-override');
const superagent = require('superagent');
const client = new pg.Client(process.env.DB_URL)
const app = express();


app.use(express());
app.set('view engine','ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodoverride('_method'));
app.use(express.static(__dirname + '/public'));

app.get('/',(req,res)=>{
    const url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url)
    .then(result=>{
        res.render('pages/index',{data:result.body})
    })
    .catch(err=>console.log('API ERROR',err))
})

app.post('/myCharacters',(req,res)=>{
    console.log(req.body);
    const sql = 'insert into characters (image,name,species,alive,gender,house,patronus) values ($1,$2,$3,$4,$5,$6,$7)';
    client.query(sql,[req.body.image,req.body.name,req.body.species,req.body.alive,req.body.gender,req.body.house,req.body.patronus])
    .then(()=>{
        res.redirect('/mychar');
    })
    .catch(err=>console.log('ERROR while insert',err))

})

app.get('/mychar',(req,res)=>{
    const sql = 'select * from characters';
    client.query(sql)
    .then(result=>{
        res.render('pages/charchter',{data:result.rows,count:result.rowCount})
    })
    .catch(err=>console.log('error while retrive the data',err))
})


app.get('/update/:id',(req,res)=>{
    console.log(req.params.id);
    const sql = 'select * from characters where id=$1';
    client.query(sql,[req.params.id])
    .then(result=>{
        res.render('pages/update',{data:result.rows})
    })
    .catch(err=>console.log('error while retrive the data',err))
})

app.put('/update/:id',(req,res)=>{
    const sql = 'update characters set name=$1 ,species=$2 , house=$3 , patronus=$4 where id = $5';
    client.query(sql,[req.body.name,req.body.species,req.body.house,req.body.patronus,req.params.id])
    .then(result=>{
        res.redirect('/mychar');
    })
    .catch(err=>console.log('error while update',err))
})

app.delete('/delete/:id',(req,res)=>{
    const sql = 'delete from characters where id=$1';
    client.query(sql,[req.params.id])
    .then(()=>{
        res.redirect('/mychar')
    })
    .catch(err=>console.log('error while delete',err))
})

app.get('/addYour',(req,res)=>{
    res.render('pages/addyourOwn')
})

app.post('/addYour',(req,res)=>{
    console.log(req.body);
    const sql = 'insert into characters (image,name,species,house,patronus,gender,alive) values ($1,$2,$3,$4,$5,$6,$7)';
    client.query(sql,[req.body.image,req.body.name,req.body.species,req.body.alive,req.body.gender,req.body.house,req.body.patronus])
    .then(()=>{
        res.redirect('/mychar');
    })
    .catch(err=>console.log('ERROR while insert',err))

})
/**
 * Error Handler
 */
app.use('*', (req,res)=>{
    res.status(404).render('pages/error',{err:'Page Not Found'})
    // response.status(404).sendFile('./error', { root: './' })
}) 

app.use((err,req,res,next)=>{
    res.status(500).render('pages/error',{err:err})
});
client.connect()
.then(()=>{
    console.log('DB Connected successfuly');
    app.listen(PORT||process.env.PORT,()=>{
        console.log('SERVER listen on PORT : ',PORT);
    })
})
.catch(err=>console.log('error while connicting to db '))