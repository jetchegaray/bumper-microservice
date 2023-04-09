'use strict'

angular.module('amApp').config(profileCommerceRoutes)

function profileCommerceRoutes($stateProvider) {
  $stateProvider
    .state('profile_commerce', {
      url: '/comercio/:commerceId/:commerceSlug',
      templateUrl: 'profile-commerce/views/profile-commerce.html',
      controller: 'ProfileCommerceController as $ctrl',
      params: {
        activeTab: 'summary',
        markAsFavoriteBeforeLogin: null,
        claimCommerceBeforeLogin: null,
        commerceSlug: { squash: true, value: null }  
      },
    })

  $stateProvider
    .state('profile_commerce_pieces', {
      url: '/comercio/:commerceId/:commerceSlug?productos',
      templateUrl: 'profile-commerce/views/profile-commerce.html',
      controller: 'ProfileCommerceController as $ctrl',
      params: {
        activeTab: 'pieces',
        markAsFavoriteBeforeLogin: null,
        claimCommerceBeforeLogin: null,
        commerceSlug: { squash: true, value: null }
      }
    })
  $stateProvider
    .state('profile_commerce_services', {
      url: '/comercio/:commerceId/:commerceSlug?servicios',
      templateUrl: 'profile-commerce/views/profile-commerce.html',
      controller: 'ProfileCommerceController as $ctrl',
      params: {
        activeTab: 'services',
        markAsFavoriteBeforeLogin: null,
        claimCommerceBeforeLogin: null,
        commerceSlug: { squash: true, value: null }
      }
    })
  $stateProvider
    .state('profile_commerce_coupons', {
      url: '/comercio/:commerceId/:commerceSlug?descuentos',
      templateUrl: 'profile-commerce/views/profile-commerce.html',
      controller: 'ProfileCommerceController as $ctrl',
      params: {
        activeTab: 'opportunities',
        markAsFavoriteBeforeLogin: null,
        claimCommerceBeforeLogin: null,
        pendingCoupon: null,
        commerceSlug: { squash: true, value: null }
      }
    })
  $stateProvider
    .state('profile_commerce_comments', {
      url: '/comercio/:commerceId/:commerceSlug?mensajes',
      templateUrl: 'profile-commerce/views/profile-commerce.html',
      controller: 'ProfileCommerceController as $ctrl',
      params: {
        activeTab: 'comments',
        newComment: null,
        markAsFavoriteBeforeLogin: null,
        claimCommerceBeforeLogin: null,
        commerceSlug: { squash: true, value: null }
      }
    })
}
