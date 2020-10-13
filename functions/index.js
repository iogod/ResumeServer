const functions = require('firebase-functions');
const  admin = require('firebase-admin')
const express = require('express')
const bodyParser = require('body-parser')
const {sv} = require('./skey')
const DayJS = require('dayjs')
const  utc = require('dayjs/plugin/utc')

const svaKey = sv

admin.initializeApp({
    credential: admin.credential.cert(svaKey),
    databaseURL: "https://resume-7e186.firebaseio.com"
  })
const app = express();
app.use(bodyParser.urlencoded({extended:true}))
DayJS.extend(utc)

let db = admin.firestore()
db.settings({ignoreUndefinedProperties: true })

//:id
app.delete('/comment/:id',  (req,res) => {
    const id = req.params['id'].toString()
    console.log(id)
  db.collection('comments').doc(id.valueOf()).delete().then( (doc)=> {


       return res.status(200).json({stamp:doc})
       

    }).catch((err)=> {

        console.error(err)
    })
    

})

app.post('/comment', (req,res) => {
    const time = DayJS.utc().format().toLocaleString()
    console.log(time)
    let val = db.collection('comments').doc().id.toString()
    const output = req.body
    console.log(output)

    const comment = {
        createdAt: time,
        comment:req.body.comment,
        creator:req.body.creator,
        id:val,
        organization:req.body.organization}

const coms =   db.collection('comments').doc(val).set(comment).then((doc)=>{
        
       return res.status(200).json({comment:comment})
        }).catch((err) => {
            res.status(500).json({err})
        })
})

app.get('/comment', (req,res) => {

    db.collection('comments').orderBy('createdAt','desc').limit(10).get().then( (qs)=> {
        const info = qs.docs.map(doc => {
            return doc.data()
        })
       return  res.status(200).json({info})
        
    }).catch((err)=> {
        console.error(err)
        res.status(500).json({error:"Not loading"})

    })
    

})


exports.resume= functions.https.onRequest(app)
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into Cloud Firestore using the Firebase Admin SDK.
//     const writeResult = await admin.firestore().collection('messages').add({original: original});
//     // Send back a message that we've succesfully written the message
//     res.json({result: `Message with ID: ${writeResult.id} added.`});
//   });
  

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
