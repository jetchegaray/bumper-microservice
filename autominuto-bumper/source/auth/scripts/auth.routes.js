'use strict'

angular.module('amApp').config(authRoutes)

function authRoutes($stateProvider) {

  $stateProvider
    .state('register', {
      url: '/registro',
      templateUrl: 'auth/views/register.html',
      controller: 'RegisterController as $ctrl',
      section: 'AUTH',
      metaTags: {
        description: 'Registrate en Autominuto para que podamos ayudarte a elegir mejor ganando tiempo, ahorro y transparencia'
      }
    })
    .state('register_driver', {
      url: '/registro-conductor',
      templateUrl: 'auth/views/register-driver.html',
      controller: 'RegisterController as $ctrl',
      section: 'AUTH',
      metaTags: {
        description: 'Registrate en Autominuto para que podamos ayudarte a elegir mejor ganando tiempo, ahorro y transparencia'
      }  
    })
    .state('register_commerce', {
      url: '/registro-comerciante',
      templateUrl: 'auth/views/register-commerce.html',
      controller: 'RegisterController as $ctrl',
      section: 'AUTH',
      metaTags: {
        description: 'Autominuto hace crecer tu negocio conectandote con conductores para resolver la contratación de servicios y venta de repuestos'
      } 
    })
    .state('register_fleet', {
      url: '/registro-flota',
      templateUrl: 'auth/views/register-fleet.html',
      controller: 'RegisterController as $ctrl',
      section: 'AUTH',
      metaTags: {
        description: 'Registra tu flota en Autominuto para que podamos ayudarte a elegir mejor ganando tiempo, ahorro y transparencia'
      }  
    })
    .state('register_complete', {
      url: '/registro-completo',
      templateUrl: 'auth/views/register-complete.html',
      controller: 'RegisterCompleteController as $ctrl',
      section: 'AUTH',
      params: {email: null, userId: null}
    })
    .state('login', {
      url: '/login?next&params',
      templateUrl: 'auth/views/login.html',
      controller: 'UserController',
      section: 'AUTH',
      params: {callback: null},
      metaTags: {
        description: 'Conocé tu proximo taller mecánico o comerciante automotor de confianza en minutos sin salir de tu casa'
      }
    })
    .state('activate', {
      url: '/activate?token&salt',
      templateUrl: 'auth/views/login.html',
      controller: 'UserController',
      section: 'AUTH',
    })
    .state('recover_password', {
      url: '/recuperacion-clave',
      templateUrl: 'auth/views/recover-password.html',
      controller: 'RecoverPasswordController as $ctrl',
      section: 'AUTH',
    })
    .state('update_password', {
      url: '/password/update?token&code',
      templateUrl: 'auth/views/update-password.html',
      controller: 'UpdatePasswordController as $ctrl',
      section: 'AUTH',
    })
}
