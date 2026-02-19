import express from 'express'
import 'dotenv/config'
const PORT = process.env.PORT
const app = express()



app.get('/',(req, res) => {
    res.status(200).json({message : 'YOU ARE LIVE ON FLEET OS'})
})




app.listen(PORT, () => {
    console.log(`we are live on ${PORT}`)
})