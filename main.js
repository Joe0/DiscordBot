//The main hub for the bot, more comments coming soon.
//Most of the commands are labeled apprioriately so far. More organization coming soon.
const Discord = require('discord.js')
const client = new Discord.Client()

const deckObj = require('./objects/Deck')
const gameObj = require('./objects/Game')
const leagueObj = require('./objects/League')
const seaonObj = require('./objects/Season')
const userObj = require('./objects/User')

const botListeningPrefix = "!";

const Module = require('./mongoFunctions')
const generalID = require('./constants')
const moongoose = require('mongoose')
const { Cipher } = require('crypto')
const url = 'mongodb+srv://firstuser:e76BLigCnHWPOckS@cluster0-ebhft.mongodb.net/UserData?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true'

moongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

client.on('ready', (on) =>{
    console.log("Debug log: Successfully connected as " + client.user.tag)
    client.user.setPresence({
        game: { 
            name: 'my code',
            type: 'WATCHING'
        },
        status: 'online'
    })
  
    deckObj.populateDecks()
    //Lists out the "guilds" in a discord server, these are the unique identifiers so the bot can send messages to server channels
    // client.guilds.cache.forEach((guild) => {
    //     console.log(guild.id)
    //     guild.channels.cache.forEach((channel) =>{
    //         console.log(` - ${channel.name} ${channel.type} ${channel.id}`)
    //     })
    // })
    // client.user.setUsername("PWP Bot"); 
})
client.on('message', (receivedMessage) =>{
    if (receivedMessage.author == client.user){
        return 
    }
    if (receivedMessage.mentions.users == client.user){
        let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
        generalChannel.channel.send("text")
    }
    if (receivedMessage.content.startsWith(botListeningPrefix)){
        processCommand(receivedMessage)
    }
    else{
        let currentChannel =  client.channels.cache.get()
    }
})
function processCommand(receivedMessage){
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    let channel = receivedMessage.channel.id
    let channelResponseFormatted = client.channels.cache.get(channel)

    let server = receivedMessage.guild.id
    //console.log(server)
    let responseFormatted = client.channels.cache.get(channel)


    switch(primaryCommand){
        case "help":
            helpCommand(receivedMessage, arguments)
            break;
        case "register":
            register(receivedMessage, arguments, channelResponseFormatted)
            break;
        case "users":
            users(receivedMessage, arguments)
            break;
        case "log":
            //logLosers(receivedMessage, arguments)
            logMatch(receivedMessage, arguments)
            break;
        case "profile":
            profile(receivedMessage, arguments)
            break;
        case "use":
            use(receivedMessage, arguments)
            break;
        case "current":
            current(receivedMessage, arguments)
            break;
        case "add":
            addToCollection(receivedMessage, arguments)
            break;
        case "mydecks":
            listCollection(receivedMessage,arguments)
        case "decks":
            listDecks(responseFormatted)
            break;
        case "decksdetailed":
            listDecksDetailed(responseFormatted);
            break;
        case "userdecks":
            listUserDecks(responseFormatted);
            break;
        case "credits":
            credits(receivedMessage, arguments)
            break;
        default:
            receivedMessage.channel.send(">>> Unknown command. Try '!help'")
    }
}
function toUpper(str) {
    return str
        .toLowerCase()
        .split(' ')
        .map(function(word) {
            // console.log("First capital letter: "+word[0]);
            // console.log("remain letters: "+ word.substr(1));
            return word[0].toUpperCase() + word.substr(1);
        })
        .join(' ');
}
/**  */
function listCollection(receivedMessage, args){
    var callbackName = new Array();
    var callbackWins = new Array();
    var callbackLosses = new Array();
    const profileEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
            .setURL('')

    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    userObj.profile(receivedMessage, args, function(callback, err){
            callback._deck.forEach(callbackItem =>{
                callbackName.push(toUpper(callbackItem.Deck))
                callbackWins.push(callbackItem.Wins)
                callbackLosses.push(callbackItem.Losses)
            })
            if (callbackName.length > 1){
                for (i = 1; i < callbackName.length; i++){
                    var calculatedWinrate = (callbackWins[i]/((callbackLosses[i])+(callbackWins[i])))*100
                    if (isNaN(calculatedWinrate)){
                        calculatedWinrate = 0;
                    }

                    profileEmbed.addFields(
                        { name: 'Deck Name', value: callbackName[i]},
                        { name: 'Wins', value: callbackWins[i], inline: true },
                        { name: 'Losses', value: callbackLosses[i], inline: true },
                        { name: 'Winrate', value: calculatedWinrate + "%", inline: true },
                    )
                }
                generalChannel.send(profileEmbed)
            }
            else{
                generalChannel.send(">>> No decks in "+"<@!"+receivedMessage.author.id+">"+"'s collection. Please add decks using !addtoprofile <deckname>")
            }
        })
        
            
}
function addToCollection(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    userObj.addToCollection(receivedMessage, args, function(callback, err){
        generalChannel.send(">>> " + callback)
    })
}
function use(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    userObj.useDeck(receivedMessage, args, function(callback, err){
            if (callback == "Error: 1"){
                generalChannel.send(">>> Deck not found in Deckname Database. Check !help")
            }else if (callback == "Error: 2"){
                generalChannel.send(">>> Deck not found in your collection. Make sure to !register and then add it using !add <deckname>. ")
            }else if (callback == "Error: 3"){
                generalChannel.send(">>> Unable to find user. Please register first with !register")
            }
            else{
                generalChannel.send(">>> Deck set to " + "**" + callback + "**" + " for " + receivedMessage.author.username)
            }
    });
}
function current(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    var callBackArray = new Array();
    userObj.currentDeck(receivedMessage, args, function(callback, err){
        if (callback == "Error: 1"){
            generalChannel.send(">>> User not found.")
        }
        else if (callback == "Error: 2"){
            generalChannel.send(">>> No deck found for that user")
        }
        else{

function listUserDecks(channel){

    channel.send(">>> ")

}
function listDecks(channel){
    deckObj.listDecks(function(callback,err){
        const listedDecksEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
       for(i = 0; i < callback.length; i++){
            listedDecksEmbed.addFields(
                { name: " \u200b",value: callback[i]._name},
            )
        }
        channel.send(listedDecksEmbed)
    });
}
function listDecksDetailed(channel){
    deckObj.listDecks(function(callback,err){
        const listedDecksEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
       for(i = 0; i < callback.length; i++){
            listedDecksEmbed.addFields(
                { name: " \u200b",value: callback[i]._name},
                { name: 'User', value: callback[i]._user, inline: true},
                { name: 'Wins', value: "Update me", inline: true},
                { name: 'Losses', value: "Update me", inline: true},
            )
        }
        channel.send(listedDecksEmbed)
    });
}
function addDeck(receivedMessage, args){
    var callBackArray = new Array();
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    
    deckObj.addDeck(receivedMessage, args, function(callback,err){
        if ((callback != ("Error: Deck name already used"))&& 
        (callback != ("Error: Unable to save to Database, please try again"))&&
        (callback != ("Error: Not a valid URL, please follow the format !adddeck <url> <name>"))
        ){
            callback.forEach(item => {
                callBackArray.push(item)
            });

            var grabURL = callBackArray[0].toString()
            var grabName = callBackArray[1].toString()
            
            const exampleEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setURL('')
            .addFields(
                { name: 'Decklist', value: "[Link]("+grabURL+")"},
                { name: 'Name', value: grabName},
            )
            generalChannel.send("Successfully uploaded new Decklist to Decklists!")
            generalChannel.send(exampleEmbed)
        }
        else{
            generalChannel.send(callback)
        }
    });
}
function profile(receivedMessage, args){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    userObj.profile(receivedMessage, args, function(callback, err){
        var calculatedWinrate = (callback._wins/((callback._losses)+(callback._wins)))*100
        if (isNaN(calculatedWinrate)){
            calculatedWinrate = 0;
        }
        const profileEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
            .setURL('')
            .addFields(
                { name: 'User', value: callback._id, inline: true },
                { name: 'Server', value: callback._server, inline: true },
                { name: 'Season', value: callback._season, inline: true },
                { name: 'Current Deck', value: callback._currentDeck, inline: true },
                { name: 'Current Rating', value: callback._elo, inline: true },
                { name: 'Wins', value:  callback._wins, inline: true },
                { name: 'Losses', value:  callback._losses, inline: true },
                { name: 'Winrate', value: calculatedWinrate + "%", inline: true },
            )
        generalChannel.send(profileEmbed)
    });
    
}
async function logLosers(receivedMessage, args){
    var callBackArray = new Array();
    //var lostEloArray = new Array();
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())

    Module.logLosers(args, function(callback,err){
        callback.forEach(item => {
            callBackArray.push(item)
        });
        generalChannel.send(">>> " + callback[0] + " upvote to confirm this game. Downvote to contest. Make sure to $use <deckname> before reacting.")
        .then(function (message, callback){
            const filter = (reaction, user) => {
                return ['👍', '👎'].includes(reaction.emoji.name) && user.id !== message.author.id;
            };   

            message.react("👍")
            message.react("👎")
            // @TODO: 
            // Look into time of awaitReactions (configurable?)
            // Log points only after upvotes are seen. Right now we are logging THEN checking upvotes
            message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                    const reaction = collected.first();

                    if (reaction.emoji.name === '👍') {
                        receivedMessage.reply("received confirmation for logging");
                        //console.log(reaction.users)
                    }
                    else {
                        receivedMessage.reply('received contest on game. Please resolve issue then log game again.');
                        return
                    }
                })
        })
        callback.shift()
        // Module.logWinners(receivedMessage, callback, function(callback, err){
        //     //console.log(callback)
        // })
        
    })
   
}
function logMatch(receivedMessage, args){
    const user = require ('../DiscordBot/Schema/Users')
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    let arg
    callbackArr = new Array()
    cbArr = new Array()

    args.forEach(loser =>{
        let findQuery = {_id: loser.toString()}
        user.findOne(findQuery, function(err, res){
            if (res){
                arg = res._name.toString()
                Module.logLoser(arg, function(cb, err){
                    cbArr.push(cb)
                    if (cb == "Error: FAIL"){
                        callbackArr.push("Error: FAIL " + " " + loser)
                    }
                    else if (cb == "Error: NO-REGISTER"){
                        callbackArr.push("Error: NO-REGISTER " + " " + loser)
                    }
                    else {
                        callbackArr.push("SUCCESS" + " " + loser)
                    }
                })
            }
            else {
                callbackArr.push("USER NOT FOUND ", + " " + loser)
            }
        })
    });
    arg = receivedMessage.author.id.toString()
    Module.logWinner(arg, function(cb, err){
        cbArr.push(cb)
        if (cb == "Error: FAIL"){
            callbackArr.push("Error: FAIL " + " " + receivedMessage.author.id)
        }
        else if (cb == "Error: NO-REGISTER"){
            callbackArr.push("Error: NO-REGISTER " + " " + receivedMessage.author.id)
        }
        else {
            callbackArr.push("SUCCESS" + " " + receivedMessage.author.id)
        }
    })
    
    console.log(callbackArr)
    console.log(cbArr)
    callbackArr.forEach(cb => {
        generalChannel.send(">>> " + cb)
    });
}
function users(receivedMessage, args){
    /* @TODO
    This function can be useful for other aspects of the project, it should be converted to a general count function. ATM it only 
    counts the number of documents in the user collection, but it can be expanded to a lot more.
    */
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    Module.listAll(receivedMessage, function(callback, err){
        generalChannel.send(">>> There are " + callback + " registered users in this league.")
    })
}
function register(receivedMessage, args, channel){
    leagueObj.register(receivedMessage, function(callback,err){
        const messageEmbed = new Discord.MessageEmbed()
        if (callback == "1"){ 
            messageEmbed
            .setColor("#5fff00")
            .setDescription(receivedMessage.author.username + " is now registered.")
            channel.send(messageEmbed)
        }
        else if (callback == "3"){
            messageEmbed
            .setColor("#af0000")
            .setDescription(receivedMessage.author.username + " is already registered.")
            channel.send(messageEmbed)
        }
        else if (callback == "2"){
            messageEmbed
            .setColor("#af0000")
            .setDescription("Critical Error. Try again. If problem persists, please reach out to developers.")
            channel.send(messageEmbed)
        }
    })
}
function helpCommand(receivedMessage, arguments){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    if (arguments.length == 0){
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('PWP Bot')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent people')
        .setThumbnail('')
        .addFields(
            { name: '!help', value: 'Where you are now. A list of all available commands with a brief description of each.' },
            { name: '\u200B', value: '\u200B' },
            { name: '!multiply', value: 'Multiply two numbers.', inline: true },
            { name: '!send', value: 'Bot will tell your friends what you really think of them.', inline: true },
            { name: '!log', value: 'Testing function, adds elo to an account. ', inline: true },
            /* @TODO
                Add other commands manually or find a way to programmatically list all commands available + a blurb
            */
        )
        .setImage('')
        .setTimestamp()
        .setFooter('Some footer text here', '');
    
    generalChannel.send(exampleEmbed);
    } else{
        receivedMessage.channel.send("It looks like you need help with " + arguments)

        //@TODO
        //  Take argument user has mentioned and spit back information on it. EX: user types: !help test. Spit back information about test command.
    }
}
function credits(argument, receivedMessage){
    /* @TODO
        Give credit where credit is due 
    */
}
client.login("NzE3MDczNzY2MDMwNTA4MDcy.XtZgRg.k9uZEusoc7dXsZ1UFkwtPewA72U")





//Outdated or old testing commands. Not commented out so they can be collapsed.

//Sends a message to a user. Mention them and then your message and the bot will
//   take the mentioned person and repeat your message to them
function sendMessage(arguments, receivedMessage){
    let generalChannel = client.channels.cache.get(generalID.getGeneralChatID())
    let count = 0
    msg = receivedMessage.content.toLowerCase();
    mention = receivedMessage.mentions.users
    if (mention == null){ return; }
    if (msg.startsWith (prefix + "send")){
        mention.forEach((users) => {
            count++;
        }) 
    }
    if (count > 1){ 
        generalChannel.send(">>> Error, try again and only mention 1 person.")
        generalChannel.send(">>> Try: !send @Username Hello my dear friend!")
        return; 
    }
    else{
        mention.forEach((users) => {
            let fullMessage =  receivedMessage.content.substr(6)
            let splitCommand = fullMessage.split(" ")
            let mentionedAndMessage = splitCommand.slice(1)
            let finishedString = mentionedAndMessage.join(" ");
            generalChannel.send(">>> **psst " + users.toString() + " " + receivedMessage.author.toString() + " says: **")
            generalChannel.send(">>> " + finishedString)
        }) 
    }
}
//Multiplies two numbers. Tutorial stuff 
function multiplyCommand(arguments, receivedMessage){
    if (arguments.length < 2){
        receivedMessage.channel.send("Not enough arguments. Try '!multiply 2 10'")
        return
    }
    let product = 1
    arguments.forEach((value) =>{
        product = product * parseFloat(value)
    })
    receivedMessage.channel.send("The product of " + arguments + " is " + product.toString())
}