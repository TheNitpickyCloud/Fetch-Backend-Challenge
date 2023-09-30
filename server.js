const express = require('express')
const app = express()

app.use(express.json());

let transactions = []

app.get('/', (req, res) => {
  res.send("This is the API for the Fetch backend challenge!")
})

app.post('/add', (req, res) => {
  const obj = {
    "payer": req.body.payer,
    "points": parseInt(req.body.points),
    "timestamp": Date.parse(req.body.timestamp)
  }

  transactions.push(obj)

  res.status(200).send()
})

app.post('/spend', (req, res) => {
  transactions.sort((a, b) => {
    return a.timestamp - b.timestamp
  })

  const spendList = []
  const newTransactions = JSON.parse(JSON.stringify(transactions))
  let spend = parseInt(req.body.points)

  for(const transaction of newTransactions){
    const sub = Math.min(spend, transaction.points)
    transaction.points -= sub
    spend -= sub

    if(sub > 0){
      spendList.push({"payer": transaction.payer, "points": 0-sub})
    }
  }

  if(spend > 0){
    res.status(400).send("The user doesn't have enough points!")
  }
  else{
    transactions = JSON.parse(JSON.stringify(newTransactions))
    res.status(200).send(spendList)
  }
})

app.get('/balance', (req, res) => {
  const balanceMap = {}

  for(const transaction of transactions){
    balanceMap[transaction.payer] = transaction.points
  }

  res.status(200).send(balanceMap)
})

app.listen(8000)
