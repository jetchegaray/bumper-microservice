'use strict'

angular.module('amApp').config(manageLandingRoutes)

function manageLandingRoutes($stateProvider) {
	$stateProvider
		.state('vendemas', {
			url: '/vendemas',
			templateUrl: 'landing/views/landing.html',
			controller: 'LandingController as $ctrl',
			metaTags: {
				description: 'Si sos comerciante automotor y queres saber como podemos ayudarte a crear tu comercio automotor digital, entra acá'
      		}
	})
}
