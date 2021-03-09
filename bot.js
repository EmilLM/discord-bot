const Discord = require('discord.js');
const axios = require('axios');
const Database = require("@replit/database")

const client = new Discord.Client();
const db = new Database()

client.on('ready', ()=>{
  console.log(`Logged in as ${client.user.tag}`)
})

const getQuote = async () => {
  try {
    const res = await axios.get('https://zenquotes.io/api/random')
  return res.data[0].q + "- " + res.data[0].a
  } catch(err) {
    return 'Quote service unavailable!';
  }
}

getQuote();

const botTriggers = ['sad', 'pain','inspire', 'anxiety', 'anxious', 'depressed', 'bored', 'unmotivated', 'unwilling', 'hurt', 'hurting'];

const starterEncouragements = [
  "Cheer up!",
  "Hang in there.",
  "Everything will be alright!"
]

db.get('encouragements').then( encouragement => {
  if (!encouragement || encouragement.length < 1) {
    db.set('encouragements', starterEncouragements)
  }
})

db.get('responding').then(value =>{
  if (value == null) db.set('responding', true)
})

const updateEncouragements = msg => {
  db.get('encouragements').then(encMsgs => {
    encMsgs.push([msg])
    db.set("encouragements", encMsgs)
  })
}

const deleteEncouragements = (index) => {
  db.get('encouragements').then(encMsgs =>{
  if (encMsgs.length > index) encMsgs.splice(index, 1)
  db.set("encouragements", encMsgs)
  })
}

client.on('message', async (msg)=>{

  const quote = await getQuote();

  if (msg.author.bot) return 

  if (msg.content == "$inspire") {
    msg.channel.send(quote)
  }

  db.get('responding').then(responding => {
      if (responding && botTriggers.some(word => msg.content.includes(word))) {
      db.get('encouragements').then(encMsgs =>{
        const encouragement = encMsgs[Math.floor(Math.random()* encMsgs.length)]
        msg.reply(encouragement)
      })
    }
  })
  
  if (msg.content.startsWith('$new')) {
    const newMsg = msg.content.split(':')[1].trim()
    updateEncouragements(newMsg);
    msg.channel.send('New encouraging message added!')
  }

  if (msg.content.startsWith('$del')) {
    const index = parseInt(msg.content.split(':')[1].trim())
    deleteEncouragements(index);
    msg.channel.send('Encouraging message deleted!')
  }
  if (msg.content.startsWith('$list')) {
    db.get('encouragements').then(encMsgs =>{
      msg.channel.send(encMsgs)
    })
  }

  if (msg.content.startsWith('$responding')) {
    const value = msg.content.split(':')[1].trim();
    if (value.toLowerCase() == "true") {
      db.set('responding', true);
      msg.channel.send('Bot is active');
    } else if (value.toLowerCase() == "false") {
      db.set('responding', false)
      msg.channel.send('Bot is inactive')
    }
  }

})
client.login(process.env.TOKEN)
