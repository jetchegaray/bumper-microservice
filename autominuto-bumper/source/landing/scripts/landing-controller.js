'use strict'

angular.module('amApp').controller('LandingController', LandingController)

function LandingController($state, $stateParams, $timeout, planService, anchorSmoothScroll, contactService, spinner, modalMessageService, errorService, $window, $document, viewport) {

	const $ctrl = this

	$ctrl.gotoAnchor = function(eID, offsetTop) {
      anchorSmoothScroll.scrollTo(eID, offsetTop);
    };

    $ctrl.suscribeToNewsletter = () => {
	    if (!$ctrl.newsletterEmail)
	      return
	    
	    spinner.start()
	    contactService.suscribeToNewsletter($ctrl.newsletterEmail)
		.then(() => {
	        modalMessageService.success('Se ha dado de alta tu suscripción', '', null)
	        $ctrl.newsletterEmail = ''
		})
		.catch(err => errorService.handle(err))
		.finally(spinner.stop)
	}

	$ctrl.$onInit = () => {

        $window.fbq('track', 'VendemasVisited')

		planService.paymentMethodsName()
	      .then(function (data) {
	        $ctrl.credit_cards = data.credit_cards
	        $ctrl.others = data.others
	      })
	      .catch(err => {
	        console.log("Error al obtener las tarjetas: ", err)
	      })

        planService.plans()
      	.then(function (data) {
         	$ctrl.quotesAmountFree = data[0].quoteAmount
         	$ctrl.couponsAmountFree = data[0].couponAmount
         	$ctrl.priceHighline = data[1].price*12
  		})
      	.catch(err => {
        	errorService.handle(err)
      	})

        $('.carousel').carousel({
            interval: 2500
        })

        // Show sticky header at the bottom once the button isn't visible
        let maxWidth = 991

        let button = document.querySelector('.rectangulo');
        $window.addEventListener('scroll', function (event) {
            (maxWidth >= $window.innerWidth && !viewport.isInViewport(button)) ? $('.nav-links.bottom').show() : $('.nav-links.bottom').hide()
        }, false);

        let image = document.querySelector('#main-text');
        $window.addEventListener('scroll', function (event) {
            //(maxWidth >= $window.innerWidth && !viewport.isInViewport(image)) ? $('.nav-links.top').addClass('showHeader') : $('.nav-links.top').removeClass('showHeader')
            (maxWidth >= $window.innerWidth) ? ((!viewport.isInViewport(image)) ? $('#landing .nav-links.top').show() : $('#landing .nav-links.top').hide()) : ''
        }, false);

        // Inject class to body in order to manipulate footer padding due to header fixed at the bottom
        angular.element($document)[0].body.classList.add('vendemas');
	}

	$ctrl.goToLogin = () => {
		$state.go("login")
	}

	$ctrl.goToRegisterCommerce = () => {
        $window.fbq('track', 'VendemasStartNowClicked')
		$state.go("addcommerce")
	}

	$ctrl.requestSupportContact = () => {
		if(!$ctrl.userDataForm.$valid)
	       return
	    
	    spinner.start()
	    contactService.sendMailAutominuto($ctrl.userData.name, $ctrl.userData.email, $ctrl.userData.phone)
	      .then(() => {
	        modalMessageService.success('Solicitud enviada con éxito', 'En breve nos estaremos comunicando con vos', null)
	      })
	      .catch(err => errorService.handle(err))
	      .finally(spinner.stop)
  	}

}