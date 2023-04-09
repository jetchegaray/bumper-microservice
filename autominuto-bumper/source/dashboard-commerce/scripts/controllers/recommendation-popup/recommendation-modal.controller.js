'use strict'

angular.module('amApp').controller('RecommendationAmModalController', RecommendationAmModalController)


function RecommendationAmModalController($scope, $stateParams, $auth, commerceService, SOCIAL_RECOMMENDATION_URL, SOCIAL_RECOMMENDATION, close) {

        $scope.close = function(result) {
          close(result, 500)
        }

        $scope.withGmail = function () {
          $.LoadingOverlay('show')
          commerceService.findCommerce($stateParams.commerceId).then(({name}) => {
            const link = `${SOCIAL_RECOMMENDATION_URL}/comercio/${$stateParams.commerceId}/recomendacion`
            const body = encodeURIComponent(SOCIAL_RECOMMENDATION.GMAIL_MESSAGE.replace('{link}', link).replace('{name}', name))
            window.open(`https://mail.google.com/mail/?view=cm&su=${SOCIAL_RECOMMENDATION.SUBJECT}&body=${body}`,'popup','width=400,height=400')
            $.LoadingOverlay('hide')
          })
        }

        $scope.withFacebook = function () {
          $.LoadingOverlay('show')
          commerceService.findCommerce($stateParams.commerceId).then(({name}) => {
            $.LoadingOverlay('hide')
            
            FB.getLoginStatus((auth) => {
              const link = `${SOCIAL_RECOMMENDATION_URL}/re?commerceId=${$stateParams.commerceId}&businessName=${name}`
               
              if (auth.status !== 'connected') {
                FB.login((response) => {
                  if (response.authResponse) {
                    FB.ui({method: 'send', link, display: 'popup'})
                  }
                })
              } else {
                FB.ui({method: 'send', link, display: 'popup'})
              }
            })
          })
        }
  }