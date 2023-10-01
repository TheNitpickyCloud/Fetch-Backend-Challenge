test('add a transaction', async () => {
  const data = { "payer": "DANNON", "points": 300, "timestamp": "2022-10-31T10:00:00Z" }

  await fetch('http://localhost:8000/add', {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => {
    expect(res.status).toBe(200)
  })
})

test('handle having less points than required', async () => {
  const dataArray = [
    { "payer": "UNILEVER", "points": 200, "timestamp": "2022-10-31T11:00:00Z" },
    { "payer": "DANNON", "points": -200, "timestamp": "2022-10-31T15:00:00Z" },
    { "payer": "MILLER COORS", "points": 10000, "timestamp": "2022-11-01T14:00:00Z" },
    { "payer": "DANNON", "points": 1000, "timestamp": "2022-11-02T14:00:00Z" }
  ]
  
  for(const data of dataArray){
    await fetch('http://localhost:8000/add', {
      method: "POST", 
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  }

  await fetch('http://localhost:8000/spend', {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "points": 15000 }),
  }).then(res => {
    expect(res.status).toBe(400)
    return res.text()
  }).then(result => {
    expect(result).toBe("The user doesn't have enough points!")
  })
})

test('handle having enough points', async () => {
  await fetch('http://localhost:8000/spend', {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ "points": 5000 }),
  }).then(res => {
    expect(res.status).toBe(200)
    return res.json()
  }).then(result => {
    expect(result).toEqual([
      { "payer": "DANNON", "points": -100 },
      { "payer": "UNILEVER", "points": -200 },
      { "payer": "MILLER COORS", "points": -4700 }
    ])
  })
})

test('check the balance remaining', async () => {
  await fetch('http://localhost:8000/balance', {
    method: "GET", 
  }).then(res => {
    expect(res.status).toBe(200)
    return res.json()
  }).then(result => {
    expect(result).toEqual(
      {
        "DANNON": 1000,
        "UNILEVER" : 0,
        "MILLER COORS": 5300
      }
    )
  })
})