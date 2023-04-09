'use strict'

angular.module('amApp').controller('HomeController', HomeController)

function HomeController(contactService, homeService, ModalService, modalMessageService, errorService, spinner, userService,
  $state, $timeout, $window) {

  const $ctrl = this

  $ctrl.marcas_oficiales = []
  $ctrl.services = []
  $ctrl.topCommerces = []
  $ctrl.topCoupons = []

  $ctrl.$onInit = () => {
    $window.fbq('track', 'homeView')

    $ctrl.dataUser = userService.getUserData()

    $('.carousel').carousel({
      interval: 2500
    })

   
    /*const topCommercesRequest = homeService.topCommerces().then(res => {
      $ctrl.topCommerces = res
    }).catch(console.log)
    */
    
   /* const searchBrands = homeService.searchBrands().then(res => {
      $ctrl.brands = res
    }).catch(err => errorService.handle(err))

    const topCouponsRequest = homeService.topCoupons().then(res => {
      $ctrl.topCoupons = res
    }).catch(console.log)

  
    //$.LoadingOverlay('show');
    Promise.all([searchBrands, topCouponsRequest]).then(() => {
      //do nothing
    }) */
    // .finally(() => {
    //   $.LoadingOverlay('hide', true)
    // })
  }

  //$ctrl.isLogged = () => $auth.isAuthenticated()

  $ctrl.isLogged = () => userService.authenticated()

  $ctrl.logout = () => userService.logout()

  $ctrl.reduceDescription = (text) => text ? String(text).replace(/<[^>]+>/gm, '') : ''

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

  $ctrl.loadBrands = () => {

    const config = {
      centerMode: true,
      centerPadding: '0',
      slidesToShow: 5,
      autoplay: true,
      autoplaySpeed: 3000,
      responsive: [
        { breakpoint: 768, settings: { arrows: false, centerMode: true, centerPadding: '40px', slidesToShow: 2}},
        { breakpoint: 480, settings: { arrows: false, centerMode: true, centerPadding: '20px', slidesToShow: 1,}}
      ]
    }
    $('.brands.slider').slick(config)
  }

  $ctrl.selectCategory = categorySlug => {
    $window.fbq('track', 'clickSearch'+categorySlug+'FromHome')
    $state.go("steps.one", {"serviceSlug" : categorySlug})
  }

  $ctrl.goToResults = categorySlug => {
    $state.go("results", {"serviceSlug" : categorySlug})
  }

  $ctrl.goToLogin = () => {
    $state.go("login")
  }

  $ctrl.startNow = () => {
    $window.fbq('track', 'clickStepOneFromHome')
    $state.go("steps.one")
  }

  $ctrl.goToCoupons = (commerceId, commerceSlug) => {
    $window.fbq('track', 'clickCouponFromHome')
    $state.go("profile_commerce_coupons", {commerceId: commerceId, commerceSlug: commerceSlug})
  }

  

}
