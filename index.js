const Discord = require("discord.js")
const fetch = require("node-fetch")
const keepAlive = require("./server")
const Database = require("@replit/database")

const db = new Database()
const client = new Discord.Client()
const mySecret = process.env['TOKEN']

const beeTrigger = ["bee", "Bee"]
const starterBeeResponse = [
  "buzz",
  "buzz buzz",
  "ya like jazz?"
  ]

  db.get("beeResponse").then(beeResponse => {
    if (!beeResponse || beeResponse.length < 1) {
      db.set("beeResponse", starterBeeResponse)
    }
  })

  db.get("responding").then(value => {
    if (value == null) {
      db.set("responding", true)
    }
  })

  function updateBeeResponse(beeMessage) {
    db.get("beeResponse").then(beeResponse => {
      beeResponse.push([beeMessage])
      db.set("beeResponse", beeResponse) 
    })
  }

  function deleteResponse(index) {
    db.get("beeResponse").then(beeResponse => {
      if (beeResponse.length > index) {
        beeResponse.splice(index, 1)
        db.set("beeResponse", beeResponse)
      }
      
    })
  }

function getQuote() {
  return fetch ("https://zenquotes.io/api/random")
    .then(res => {
      return res.json()
    })
    .then(data => {
      return data[0] ["q"] + " -" + data[0]["a"]
    })
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on("message", msg => {
  if (msg.author.bot) return

  if (msg.content === "!inspirebee") {
    getQuote().then(quote => msg.channel.send(quote))
  }

  db.get("responding").then(responding =>{
    if (responding && beeTrigger.some(word => msg.content.includes(word)))  {
      msg.react('🐝')
      db.get("beeResponse").then(beeResponse => {
        const beeSponse = beeResponse[Math.floor
        (Math.random()  *  beeResponse.length)]
         msg.reply(beeSponse)
      })
    }
})
    


  if (msg.content.startsWith("$new")) {
    beeMessage = msg.content.split("$new ") [1]
    updateBeeResponse(beeMessage)
    msg.channel.send("The Bee's power grows stronger.")
  }

   if (msg.content.startsWith("$del")) {
    index = parseInt(msg.content.split("$del ")[1])
    deleteResponse(index)
    msg.channel.send("The Bee weakens.")
  }

  if (msg.content.startsWith("$list"))  {
    db.get("beeResponse").then(beeResponse =>  {
      msg.channel.send(beeResponse)
    })
  }

if (msg.content.startsWith("$responding"))  {
  value = msg.content.split("$responding ")[1]

  if (value.toLowerCase() == "true")  {
    db.set("responding", true)
    msg.channel.send("The Bee is awake.")
  } else {
      db.set("responding", false)
      msg.channel.send("The Bee is sleeping.")
  }
}


})


keepAlive()
client.login(process.env.TOKEN)