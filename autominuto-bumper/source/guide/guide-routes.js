'use strict'

angular.module('amApp').config(manageGuideRoutes)

function manageGuideRoutes($stateProvider) {

    $stateProvider
        .state('guides', {
            url: '/guias',
            templateUrl: 'guide/views/guide.html',
            controller: 'GuideController as $ctrl',
            metaTags: {
                description: 'Ingresá acá si tenes alguna inquietud respecto de funciona nuestra app, ya seas Conductor, un Mecánico o Comercio automotor, estamos para ayudarte '
            }
        })
        .state('guide-video', {
            url: '/guias/:guideType',
            templateUrl: 'guide/views/guide-video.html',
            controller: 'GuideController as $ctrl',
            metaTags: {
                description: 'Ingresá acá si tenes alguna inquietud respecto de funciona nuestra app, ya seas Conductor, un Mecánico o Comercio automotor, estamos para ayudarte '
            }
        })
}
