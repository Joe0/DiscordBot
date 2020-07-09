// This file should provide assistance for the help() command.
// It will save the default "help" strings for each of the supported commands,
// as well as an example of the command that further assists the user.
//
const Discord = require('discord.js')

var helpDictionary = Object();

//Colors
const messageColorRed = "#af0000"
const messageColorGreen = "#5fff00"
const messageColorBlue = "#0099ff"

// Define dictionary with (string) key : (string) value.
// ex. helpDictionary["help"] = "Where you are now. A list of all available commands."

helpDictionary =
{
    help : "Where you are now. A list of all available commands.",
    register : "Allows you to register yourself as a user to keep track of your stats/season.",
    users : "Shows all the users registered to the elo bot.",
    log : "The command used to log a game.",
    remind : "Command to remind a user to confirm a game.",
    // delete is a keyword...we gotta choose something else.
    de_lete : "Command to delete a record from the elo bot records. **",
    info : "Command to get info about a match.",
    profile : "Command to check a profile of a user.",
    recent : "Command to see recent matches.",
    use : "Command to set the deck you are using.",
    current : "Command to show the deck you are currently using.",
    adddeck : "Command to add a deck to the collection. **",
    decks : "Command to show the decks currently registered.",
    decksdetailed : "Command to show detailed info on the decks registered.",
    removedeck : "Command to remove a deck from the list. **",
    updatedeck : "Command to update a deck's information. **",
    mydecks : "List decks registered to you.",
    credits : "Roll the credits!",
    unknown : "We have no real clue what we can do to help you after that command. =)"
}



module.exports = {
    test()
    {
        console.log("Testing other file.")
    },
    /**
     * This is used in !deck to quickly create 5 embeds, one for each color
     * @param {*} colorArr 
     * @param {*} colorNum 
     */
    createDeckEmbed(colorArr, colorNum){
        const someEmbed = new Discord.MessageEmbed()
            .setColor(messageColorBlue)
            .setAuthor(colorNum)
        for(i = 0; i < colorArr.length; i++){
            someEmbed.addFields(
                { name: " \u200b",value: colorArr[i], inline: true},
            )
        }
        return someEmbed
    },

    /**
    * isUserAdmin()
    * @param {*} receivedMessage 
    * 
    * Simple check for issuer admin rights.
    */
    isUserAdmin(receivedMessage)
    {
        // Admin check from issuer.
        let isAdmin = receivedMessage.member.hasPermission('ADMINISTRATOR', { checkAdmin: true, checkOwner: false });
        return isAdmin;
    },

    /**
     * showEmbedHelpForCommand()
     * @param {*} receivedMessage 
     * @param {*} arguments - command key
     * 
     * Retrieves info from the help dictionary about a specific command. 
     */
    showEmbedHelpForCommand(receivedMessage, arguments)
    {
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle('PWP Bot - !help ' + [arguments])
        .setURL('')
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        // due to keyword collision, delete is 'de_lete' in dictionary
        if (arguments == 'delete')
        {
            exampleEmbed.addFields(
                { name: "Command: !delete", value: helpDictionary['de_lete'] },
            )
        }
        else
        {
            exampleEmbed.addFields(
                { name: "Command: !" + [arguments], value: helpDictionary[arguments] },
            )
        }

        receivedMessage.channel.send(exampleEmbed);
    },

    /**
     * showEmbedHelpForAllCommands()
     * @param {*} receivedMessage 
     * 
     * Loops through command help dictionary and prints
     * out all commands supported in an embed message.
     */
    showEmbedHelpForAllCommands(receivedMessage)
    {
        let isAdmin = this.isUserAdmin(receivedMessage)
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(messageColorBlue)
        .setTitle('PWP Bot')
        .setURL('')
        .setAuthor('Noah Saldaña', '', '')
        .setDescription('An excellent bot for excellent people')
        .setTimestamp()
        .setFooter('Here to help, anytime!', '');

        if (isAdmin)
        {
            // User tag at bottom for admin.
            exampleEmbed.setFooter("** Denote admin-only commands. Records show " + receivedMessage.author.username + " is an admin.")
        }

        for(var keyVal in helpDictionary)
        {
            // due to keyword collision, delete is 'de_lete' in dictionary
            if (keyVal == 'de_lete')
            {   
                if (isAdmin)
                {
                    exampleEmbed.addField('!delete', helpDictionary[keyVal], true);
                }  
            }
            else
            {
                // We will attempt to not show admin commands to everyone. If they see it b/c a mod
                // issued the command, oh well.
                if (keyVal == 'adddeck' || keyVal == 'removedeck' || keyVal == 'updatedeck')
                {
                    if (isAdmin)
                    {
                        exampleEmbed.addField('!' + keyVal, helpDictionary[keyVal], true);
                    }
                }
                else
                {
                    exampleEmbed.addField('!' + keyVal, helpDictionary[keyVal], true);
                }
            }    
        }

        receivedMessage.channel.send(exampleEmbed);
    }
}
