'use strict'

angular.module('amApp').factory('handlerAutocompleteCategories', handlerAutocompleteCategories)

function handlerAutocompleteCategories() {
  return {
    convertSetCategoriesToSetTag: convertSetCategoriesToSetTag,
    convertSetTagToSetCategories: convertSetTagToSetCategories,
    buildCategoriesWithAliases: buildCategoriesWithAliases,
    accentFold: accentFold,
    convertSetInnerCategoriesToSetTag : convertSetInnerCategoriesToSetTag,
    // usado para reconstruir las categorias de un elemento editado,
    // esto es util en el tab de cupones y productos, debido a que el servicio de edicion
    // no devuelve el elemento editado.
    // La reconstruccion se hace a partir de los resultados de las categorias con alias
  }

  function convertSetCategoriesToSetTag(categories) {
    let tags = []

    angular.forEach(categories, function(category) {
      let tag = {}
      tag.levelOne = category.id
      tag.name = category.name
      tag.alias = category.alias
      tag.image = category.imageName
      tag.quoteable = category.quoteable
      tag.isProduct = category.isProduct

      if(category.childrens && category.childrens.length) {

        angular.forEach(category.childrens, function(children){
          tag.levelTwo = children.id
          tag.alias = children.alias
          tag.name = children.name
          tag.image = children.imageName
          tag.quoteable = children.quoteable
          tag.isProduct = children.isProduct

          if(children.childrens && children.childrens.length) {

            angular.forEach(children.childrens, function(grandson){
              let grandsonTag = {}
              tag.levelThree = grandson.id
              tag.alias = grandson.alias
              tag.name = grandson.name
              tag.image = grandson.imageName 
              tag.quoteable = grandson.quoteable
              tag.isProduct = grandson.isProduct
              tags.push(tag)
            })
          } else
            tags.push(tag)
        })
      } else
        tags.push(tag)
       /* let son = category.childrens[0]
        tag.levelTwo = son.id
        tag.alias = son.alias
        tag.name = son.name
        tag.image = son.imageName

        if(son.childrens && son.childrens.length) {
          let grandson = son.childrens[0]
          tag.levelThree = grandson.id
          tag.name = grandson.name
          tag.alias = grandson.alias
          tag.image = grandson.imageName
        } */
      })

    return tags
  }


  
  function convertSetInnerCategoriesToSetTag(categories) {
    let tags = []

    angular.forEach(categories, function(category) {
      let tag = {}
      tag.levelOne = category.firstLevel
     
      if(category.secondLevel) {

        tag.levelTwo = category.secondLevel
     
        if(category.thirdLevel) {
          tag.levelThree = category.thirdLevel
        }
      }
     
      tag.name = category.name
      tag.alias = category.alias
      tag.image = category.imageName
      tag.quoteable = category.quoteable
      tag.isProduct = category.isProduct
      tags.push(tag)
    })
    return tags
  }

  


  function convertSetTagToSetCategories(tags) {
    let results = []

    angular.forEach(tags, function(flatCategory) {
      let item = {}
      item.id = flatCategory.levelOne

      if(flatCategory.levelTwo !== undefined) {
        let son = {id: flatCategory.levelTwo}
        item.childrens = []
        item.childrens.push(son)

        if(flatCategory.levelThree !== undefined) {
          let grandson = {id: flatCategory.levelThree}
          son.childrens = []
          son.childrens.push(grandson)
        }
      }
      results.push(item)
    })

    return results
  }


  function buildCategoriesWithAliases(tags) {
    let results = []

    angular.forEach(tags, function(flatCategory) {
      let item = { id: flatCategory.levelOne }

      if(flatCategory.levelTwo !== undefined) {
        let son = {id: flatCategory.levelTwo}
        item.childrens = []
        item.childrens.push(son)

        if(flatCategory.levelThree !== undefined) {
          let grandson = {id: flatCategory.levelThree}
          grandson.name = flatCategory.name
          grandson.alias = flatCategory.alias
          grandson.imageName = flatCategory.image
          grandson.quoteable = flatCategory.quoteable
          grandson.isProduct = flatCategory.isProduct

          son.childrens = []
          son.childrens.push(grandson)
        } else {
          son.name = flatCategory.name
          son.alias = flatCategory.alias
          son.imageName = flatCategory.image
          son.quoteable = flatCategory.quoteable
          son.isProduct = flatCategory.isProduct
        }
      } else {
        item.name = flatCategory.name
        item.alias = flatCategory.alias
        item.imageName = flatCategory.image
        item.quoteable = flatCategory.quoteable
        item.isProduct = flatCategory.isProduct
      }

      results.push(item)
    })

    return results
  }


  function accentFold(tag) {

    let accentMap = {
    'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u'
    };

    if (!tag) { return ''; }
    let ret = ''
    for (let i = 0; i < tag.length; i++) {
      ret += accentMap[tag.charAt(i)] || tag.charAt(i);
    }
    return ret
  }


  // accent_folded_hilite("Fulanilo López", 'lo')
  //   --> "Fulani<b>lo</b> <b>Ló</b>pez"
  //
  function accentFoldedHilite(str, q) {
    let str_folded = accentFold(str).toLowerCase().replace(/[<>]+/g, '')
    let q_folded = accentFold(q).toLowerCase().replace(/[<>]+/g, '')
    // Create an intermediate string with hilite hints
    // Example: fulani<lo> <lo>pez
    let re = new RegExp(q_folded, 'g')
    let hilite_hints = str_folded.replace(re,'<'+q_folded+'>')
    // Index pointer for the original string
    let spos = 0
    // Accumulator for our final string
    let highlighted = ''  // Walk down the original string and the hilite hint
    // string in parallel. When you encounter a < or > hint,
    // append the opening / closing tag in our final string.
    // If the current char is not a hint, append the equiv.
    // char from the original string to our final string and
    // advance the original string's pointer.
    for (i = 0; i< hilite_hints.length; i++) {
      let c = str.charAt(spos)
      let h = hilite_hints.charAt(i);
      if (h === '<') {
        highlighted += '<b>'
      } else if (h === '>') {
        highlighted += '</b>'
      } else {
        spos += 1;
        highlighted += c
      }
    }
    return highlighted
  }

}
