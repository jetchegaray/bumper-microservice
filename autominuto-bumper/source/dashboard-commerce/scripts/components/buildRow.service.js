'use strict'

angular.module('amApp').factory('buildRowsService', buildRowsService)

function buildRowsService() {
  return {
    buildItemRows: buildItemRows
  }

  function buildItemRows(items, maxAmountItemsByRow) {
    let row = []
    let rowItems = []

    angular.forEach(items, function(item) {
      if(row.length < maxAmountItemsByRow) {
        row.push(item)
      }
      if(row.length === maxAmountItemsByRow || item === items[items.length - 1]) {
        rowItems.push(row)
        row = []
      }
    })

    return rowItems
  }
}
