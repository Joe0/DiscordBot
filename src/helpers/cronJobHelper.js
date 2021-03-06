const cron = require('cron')

module.exports = {
  // error :
  // Error: Field (48) value is out of range
  startJob (dateHalf, timeHalf) {
    dateHalf = dateHalf.split('/')
    const month = dateHalf[0]
    const day = dateHalf[1]
    // const year = dateHalf[2]

    let hour = timeHalf[0]
    const minute = timeHalf[1]
    const second = timeHalf[2]
    const amPM = timeHalf[3]

    let cronJobTime
    const cronJobDate = day + ' ' + month

    if (amPM === 'AM') {
      cronJobTime = second + ' ' + minute + ' ' + hour + ' '
    } else if (amPM === 'PM') {
      hour = parseInt(hour, 10)
      hour += 12
      cronJobTime = second + ' ' + minute + ' ' + hour.toString() + ' '
    }

    console.log(cronJobTime + cronJobDate)
    const startSeason = new cron.CronJob(cronJobTime + cronJobDate, this.jobToExectute)
    startSeason.start()
  },
  pauseJob () {

  },
  jobToExectute () {
    console.log('WOOT')
  },
  async cleanJobFormat (dateToClean) {
    return new Promise((resolve, reject) => {
      const splitInHalf = dateToClean.split(',')

      // date clean
      const dateHalf = splitInHalf[0].toString()

      // time clean
      let timeHalf = splitInHalf[1].toString().slice(1)
      timeHalf = timeHalf.split(':')
      const seconds = timeHalf[2]
      timeHalf.pop()
      const secondsSplit = seconds.split(' ')
      timeHalf.push(secondsSplit[0], secondsSplit[1])

      this.startJob(dateHalf, timeHalf)

      resolve('Cleaned')
    })
  }
}
