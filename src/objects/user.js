const bootstrap = require('../bootstrap')

/**
 * User Object
 *
 * All user based functionality.
 */

module.exports = {

  /**
     * Get user league profile
     */
  async profile (receivedMessage, args) {
    const currentSeasonObj = await bootstrap.SeasonHelper.getCurrentSeason(receivedMessage.guild.id)
    const currentSeason = currentSeasonObj._season_name
    let lookUpID
    if (typeof args[0] === 'undefined') {
      args[0] = 'Not Defined'
      lookUpID = receivedMessage.author.id
    } else {
      lookUpID = args[0].replace(/[<@!>]/g, '')
    }
    let conditionalQuery
    let personLookedUp = ''
    const passedArray = []

    // Query
    if (args[0] === 'Not Defined') {
      personLookedUp = receivedMessage.author.id
      conditionalQuery = {
        _server: receivedMessage.guild.id,
        _season: currentSeason,
        _Status: 'FINISHED',
        $or: [
          { _player1: receivedMessage.author.id },
          { _player2: receivedMessage.author.id },
          { _player3: receivedMessage.author.id },
          { _player4: receivedMessage.author.id }
        ]
      }
    } else {
      personLookedUp = args[0].replace(/[<@!>]/g, '')
      conditionalQuery = {
        _server: receivedMessage.guild.id,
        _season: currentSeason,
        _Status: 'FINISHED',
        $or: [
          { _player1: args[0].replace(/[<@!>]/g, '') },
          { _player2: args[0].replace(/[<@!>]/g, '') },
          { _player3: args[0].replace(/[<@!>]/g, '') },
          { _player4: args[0].replace(/[<@!>]/g, '') }
        ]
      }
    }
    const passingResult = await bootstrap.Game.find(conditionalQuery)
    if (!passingResult) {
      return 'Error 1'
    }
    if (passingResult && passingResult.length > 0) {
      const matchResults = []
      for (let i = 0; i < passingResult.length; i++) {
        let pasRes = passingResult[i]._player1Deck
        if (passingResult[i]._player1Deck === 'Rogue') {
          pasRes = passingResult[i]._player1Rogue + ' | Rogue'
        }
        if (passingResult[i]._player1 === personLookedUp) {
          const exists = matchResults.find(el => el[0] === pasRes)
          if (exists) {
            exists[1] += 1
          } else {
            matchResults.push([pasRes, 1, 0])
          }
        }

        pasRes = passingResult[i]._player2Deck
        if (passingResult[i]._player2Deck === 'Rogue') {
          pasRes = passingResult[i]._player2Rogue + ' | Rogue'
        }
        if (passingResult[i]._player2 === personLookedUp) {
          const exists2 = matchResults.find(el => el[0] === pasRes)
          if (exists2) {
            exists2[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }
        }

        pasRes = passingResult[i]._player3Deck
        if (passingResult[i]._player3Deck === 'Rogue') {
          pasRes = passingResult[i]._player3Rogue + ' | Rogue'
        }
        if (passingResult[i]._player3 === personLookedUp) {
          const exists3 = matchResults.find(el => el[0] === pasRes)
          if (exists3) {
            exists3[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }
        }

        pasRes = passingResult[i]._player4Deck
        if (passingResult[i]._player4Deck === 'Rogue') {
          pasRes = passingResult[i]._player4Rogue + ' | Rogue'
        }
        if (passingResult[i]._player4 === personLookedUp) {
          const exists4 = matchResults.find(el => el[0] === pasRes)
          if (exists4) {
            exists4[2] += 1
          } else {
            matchResults.push([pasRes, 0, 1])
          }
        }
      }
      passedArray.push('Profile Look Up', matchResults, currentSeason, lookUpID)
    } else {
      passedArray.push('No On-Going Season', passingResult, lookUpID)
    }
    const query = { _server: receivedMessage.guild.id, _mentionValue: lookUpID }
    const res = await bootstrap.User.findOne(query)
    if (res) {
      passedArray.push(res._elo, res._currentDeck)
      return passedArray
    } else {
      return 'Can\'t find user'
    }
  },
  sortFunction (a, b) {
    if (a[0] === b[0]) {
      return 0
    } else {
      return (a[0] < b[0]) ? -1 : 1
    }
  },

  /**
     *
     * @param {Discord Message Object} message
     *
     * @param user
     * @param server
     * @returns {2D Array} Array of match Arrays sorted from most recent to least recent.
     */
  async recent (message, user = null, server = null) {
    const gameArr = []
    let id
    const seasonObj = await bootstrap.SeasonHelper.getCurrentSeason(message.guild.id)
    const seasonName = seasonObj._season_name
    if (user == null) {
      id = message.author.id
    } else {
      id = user.replace(/[<@!>]/g, '')
    }
    let findQuery
    return new Promise((resolve, reject) => {
      if (server == null) {
        findQuery = {
          $and: [
            {
              $or: [
                { _player1: id },
                { _player2: id },
                { _player3: id },
                { _player4: id }
              ]
            },
            {
              _Status: 'FINISHED'
            },
            {
              _server: message.guild.id,
              _season: seasonName
            }
          ]
        }
      } else {
        findQuery = {
          _Status: 'FINISHED',
          _server: message.guild.id,
          _season: seasonName
        }
      }
      bootstrap.Game.find(findQuery).then((docs) => {
        docs.forEach((doc) => {
          const timestamp = doc._id.toString().substring(0, 8)
          const date = new Date(parseInt(timestamp, 16) * 1000)
          gameArr.push([date, doc._match_id, doc._server, doc._season, doc._player1, doc._player2, doc._player3, doc._player4, doc._player1Deck, doc._player2Deck, doc._player3Deck, doc._player4Deck, doc._Status, doc._player1Confirmed, doc._player2Confirmed, doc._player3Confirmed, doc._player4Confirmed])
        })
      }).then(function () {
        gameArr.sort(module.exports.sortFunction)
        resolve(gameArr)
      })
    })
  },
  /**
     * Sets the users current Deck
     */
  async useDeck (receivedMessage, args) {
    let typeOfQuery = ''
    if (args.length > 2) {
      if (args[args.length - 1].toString().toLowerCase() === 'rogue') {
        typeOfQuery = 'rogue'
      }
    } else {
      typeOfQuery = 'non-rogue'
    }

    if (typeOfQuery === 'rogue') {
      const cleanedArg = bootstrap.DeckHelper.toUpper(args.join(' '))
      const userQuery = {
        _server: receivedMessage.guild.id,
        _mentionValue: receivedMessage.author.id
      }
      const updateSave = { $set: { _currentDeck: cleanedArg } }
      const res = await bootstrap.User.updateOne(userQuery, updateSave)
      if (res) {
        return 'Success'
      } else {
        return "Can't find user"
      }
    } else {
      const cleanedArg = bootstrap.DeckHelper.toUpper(args.join(' '))
      const deckQuery = {
        _server: receivedMessage.guild.id,
        _alias: args.join(' ').toLowerCase()
      }
      const userQuery = {
        _server: receivedMessage.guild.id,
        _mentionValue: receivedMessage.author.id
      }
      const updateSave = { $set: { _currentDeck: cleanedArg } }
      const deckRes = await bootstrap.Deck.find(deckQuery)
      if (deckRes.length !== 0) {
        const res = await bootstrap.User.updateOne(userQuery, updateSave)
        if (res.n > 0) {
          return 'Success'
        } else {
          return 'Can\'t find user'
        }
      } else {
        // Deck.collection.createIndex(
        //     {
        //       _name: "text",
        //       _commander: "text"
        //     }
        //   )
        const res = await bootstrap.Deck.find(
          {
            _server: receivedMessage.guild.id,
            $text: { $search: args.join(' ') }
          })
        if (res.length > 0) {
          return res
        } else {
          return 'Not a registered deck'
        }
      }
    }
  }
}
