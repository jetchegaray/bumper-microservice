'use strict'

const appDependencies = [
  'angularModalService',
  'angularSpinner',
  'amApp.constants',
  'amApp.constants.env',
  'AutoCompleteModule',
  'LocalStorageModule',
  'moment-picker',
  'ng',
  'ngMap',
  'ui.select',
  'ngSanitize',
  'ngMessages',
  'satellizer',
  'slickCarousel',
  'ui.router',
  'ui.router.metatags',
  'underscore',
  'ngFileUpload',
  'amApp.ngMapStyleConstants'
]

var app = angular.module('amApp', appDependencies)

angular.element(document).ready(function() {
  angular.bootstrap(document, ["amApp"]);
});

//angular.module('amApp', appDependencies)
app
  .config(appConfig)
  .config(authConfig)
  .run(appRun)
  .run(transitionHooks)
  .run(['$rootScope', 'MetaTags', runBlock])

function appConfig(localStorageServiceProvider, $stateProvider, $urlRouterProvider, $locationProvider) {

  localStorageServiceProvider.setPrefix('am')
  $locationProvider.html5Mode(true)
  $locationProvider.hashPrefix('')

  $.LoadingOverlaySetup({
      color           : "rgba(190,190,190,0.9)",
      image           : 'assets/images/loader-autominuto-circle.gif',
      maxSize         : '200px',
      minSize         : '20px',
      resizeInterval  : 0,
      imageClass      : 'custom-background-overlay',
      size            : '50%'
  });

  $urlRouterProvider.otherwise('/')

  $stateProvider
    .state('error', {
      url: '/error',
      templateUrl: 'shared/views/error.html',
      controller: 'ErrorController as $ctrl'
    })

}

function authConfig($authProvider) {

  $authProvider.loginUrl = '/api/user/login'
  $authProvider.signupUrl = '/api/user/signUp'
  $authProvider.tokenName = 'tokenAutominuto'
  $authProvider.tokenPrefix = 'ls'
  $authProvider.tokenHeader = 'Authorization'
  $authProvider.tokenType = 'Bearer'
  $authProvider.storageType = 'localStorage'

  $authProvider.google({
    url: '/api/user/auth/google',
    clientId: '428877269522-f12r2gvd0gbnl05f41jdmcrqv7d7dh6t.apps.googleusercontent.com'
  })

  $authProvider.live({
    url: '/api/user/auth/live',
    clientId: 'de5aa9ba-b3f3-48c3-9b4d-b5c16fd3fc11',
    redirectUri: 'http://www.autominuto.com/'
  })

  $authProvider.twitter({
    url: '/api/user/auth/twitter'
  })

  angular.element(document).ready(() => {
    FB.init({
      appId : '2110556505881369',
      status : true,
      xfbml : true,
      version: 'v3.0'
    })
  })
}


function appRun($rootScope, $state, miscellaneous, $anchorScroll) {
  $rootScope.appData = miscellaneous
  $rootScope.$on('$locationChangeSuccess', $anchorScroll)
  $rootScope.$state = $state; // index.html hide footer
}

function transitionHooks($transitions, userService, redirectService) {

  $transitions.onBefore({}, onBefore)

  function onBefore(transition) {

    const from = transition.from()
    const to = transition.to()
    const params = transition.params()

    $.LoadingOverlay("hide", true)

    // If user is in AUTH section, most likely they'll have a 'nextState' defined
    // We want to keep that state only while the user navigates through the AUTH section screens
    // So if the user was redirected to login from screen X (nextState = X),
    // and then manually navigates to screen Y, then nextState will be cleared if Y does not belong AUTH section
    if (from.section && from.section == 'AUTH' && (!to.section || to.section != 'AUTH')) {
      redirectService.clearNextState()
    }

    // If user navigates to a screen that requires authentication,
    // we redirect them to login and store the 'nextState'
    if (to.auth === true && !userService.authenticated()) {
      redirectService.setNextState(to.name, params)
      return transition.router.stateService.target('login')
    }

    // If user manually navigates to login from a random screen X,
    // we store X as the next state so the user gets redirected to X after logging in
    // However, we must be carefoul not to erase current params with redirectService.paramsAvailable()
    if ((!from.section || from.section !== 'AUTH') && to.name == 'login' && !redirectService.paramsAvailable()) {
      redirectService.setNextState(from.name)
    }
  }
}

function runBlock($rootScope, MetaTags) {
  $rootScope.MetaTags = MetaTags;
}
