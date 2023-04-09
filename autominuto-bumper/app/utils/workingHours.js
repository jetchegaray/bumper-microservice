const moment = require('moment')
const _ = require('underscore')

module.exports = {
  /*isCommerceOpen: function(workingHours) {
    if(workingHours !== null && workingHours !== undefined && workingHours.periods !== undefined && workingHours.periods.length > 0) {
      let periods = [[], [], [], [], [], [], [], [], []] // dont use item 0

      _.each(workingHours.periods, function (period) {
        periods[period.openDay].push(period)
      })

      let today = moment(new Date()).day()
      if(periods[today].length > 0) { // today is open
        let workingHourToday = periods[today]
        let now = moment(new Date()).format('HH:mm')
        now = moment(now, 'HH:mm')
        if(workingHourToday[0].open24) return true
        
        let isOpen = workingHourToday.find(function (workingHour) {
          let start = moment(workingHour.openHour, 'HH:mm')
          let end = moment(workingHour.closeHour, 'HH:mm')
          return now.isBefore(end) && now.isAfter(start)
        })

        return !!isOpen
      }
      return false
    }
    return null
  },*/
  isCommerceOpen: function(workingHours) {
    if(workingHours !== null && workingHours !== undefined && workingHours.periods !== undefined && workingHours.periods.length > 0) {
       
      let periods = [[], [], [], [], [], [], [], [], []] // dont use item 0
      _.each(workingHours.periods, function (period) {
          periods[period.openDay].push(period)
      })
      
      let today = moment(new Date()).day()
      if(periods[today].length > 0) { // today is open
        let workingHourToday = periods[today]
        return workingHourToday[0].open
      }
      return false
    }
  },
  parseWorkingHours: function(workingHours) {
    let results = {}
    const keys = ['', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'holiday']

    // Init empty arrays
    for (var i = 1; i <= 8; i++) {
      results[keys[i]] = []
    }

    // Group periods by day
    _.each(workingHours.periods, (period) => {
      results[keys[period.openDay]].push(period)
    })

    return results
  }
}



