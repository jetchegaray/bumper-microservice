'use strict'

angular.module('amApp').factory('userService', userService)

function userService(API_END_POINT, errorHandler, localStorageService, miscellaneous, ModalService, $auth, $http, $state, Upload, USER, $location, modalMessageService) {

  //const responseHandler = errorHandler.responseHandler

  return {
    activateAccountByToken: activateAccountByToken,
    authenticated: authenticated,
    getAddresses: getAddresses,
    getCars: getCars,
    getUserData: getUserData,
    logout: logout,
    recoverPassword: recoverPassword,
    saveUserData: saveUserData,
    updateUserDataCache: updateUserDataCache,
    sendActivationEmail: sendActivationEmail,
    signIn: signIn,
    signInSocialNetworking: signInSocialNetworking,
    loginSocial: loginSocial,
    signUpCommerce: signUpCommerce,
    signUpUser: signUpUser,
    signUpSocial: signUpSocial,
    updatePassword: updatePassword,
    verifyEmailExists: verifyEmailExists,
    addAddress: addAddress,
    updateAddress: updateAddress,
    deleteAddress: deleteAddress,
    getAllInsurancesCompanies: getAllInsurancesCompanies,
    getAllComments: getAllComments,
    addCar: addCar,
    addCars: addCars,
    updateCar: updateCar,
    deleteCar: deleteCar,
    userView : userView,
    getUserMap : getUserMap,
    updateUserData: updateUserData,
    getCommerces: getCommerces,
    getUserInactiveBannerVisibility: getUserInactiveBannerVisibility,
    setUserInactiveBannerVisibility: setUserInactiveBannerVisibility,
    getUserCookiesBannerVisibility: getUserCookiesBannerVisibility,
    setUserCookiesBannerVisibility: setUserCookiesBannerVisibility,
    buildNickName: buildNickName,
    calculatePercentageProfile: calculatePercentageProfile,
  }

  // Public
  function addAddress(userId, address) {
    const params = address;
    return $http.post(API_END_POINT + "user/" + userId + "/addAddress" , params).then(responseHandler)
  }

  function addCar(userId, car) {
    const params = car;
    return $http.post(API_END_POINT + "user/" + userId + "/addCar" , params).then(responseHandler)
  }

  function addCars(userId, file) {
    return Upload.upload({
      url: API_END_POINT + 'user/' + userId + "/addCars",
      data: { file: file }
    }).then(function (resp) {
      return responseHandler(resp);
    }, function (resp) {
      return responseHandler(resp);
    }, function (evt) {});
  }

  

  function getAllInsurancesCompanies() {
    return $http.get(API_END_POINT + "user/getAllInsurancesCompanies").then(responseHandler)
  }

  function getAllComments(userId, page) {
    return $http.get(`${API_END_POINT}user/${userId}/questions?page=${page}`).then(responseHandler)
  }

  function updateAddress(address) {
    const params = address;
    const addressId = address.id;

    return $http.post(API_END_POINT + "user/address/" + addressId, params).then(responseHandler)
  }

  function updateCar(car) {
    const params = car;
    const carId = car.id;
    return $http.post(API_END_POINT + "user/car/" + carId, params).then(responseHandler)
  }

  function deleteAddress(addressId) {
    return $http.delete(API_END_POINT + 'user/address/' + addressId).then(responseHandler);
  }

  function deleteCar(carId) {
    return $http.delete(API_END_POINT + 'user/car/' + carId).then(responseHandler);
  }

  function activateAccountByToken(token, salt) {
    return $http.get(API_END_POINT + "user/activate?token=" + token + "&salt=" + salt).then(res => {
      saveUserData(res.data)
    })
  }

  function setUserInactiveBannerVisibility(option) {
    localStorageService.set('userInactiveBannerVisible', option)
    return moment().local()
  }

  function getUserInactiveBannerVisibility(optionExpired) {
    let userInactiveBannerVisible = localStorageService.get('userInactiveBannerVisible')
    let visibility = userInactiveBannerVisible !== false || optionExpired

    setUserInactiveBannerVisibility(visibility)
    return visibility
  }

  function setUserCookiesBannerVisibility(option) {
    localStorageService.set('cookiesBannerVisibility', option)
  }

  function getUserCookiesBannerVisibility(optionExpired) {
    return !(localStorageService.get('cookiesBannerVisibility') === false)
  }

  function authenticated() {
    const host = localStorageService.get('host')

    if (host == $location.host()){
      const userId = localStorageService.get('userId')
      return userId != null
    }
    return false
  }

  function getAddresses(userId) {
    return $http.get(API_END_POINT + "user/" + userId + "/addresses").then(responseHandler)
  }

  function getCars(userId) {
    return $http.get(API_END_POINT + "user/" + userId + "/cars").then(responseHandler)
  }

  function getUserData() {
    return {
      nickName: localStorageService.get("nickName") || localStorageService.get("email"),
      email: localStorageService.get("email"),
      image: localStorageService.get("image"),
      isSocialLogin : localStorageService.get('isSocialLogin'),
      id : localStorageService.get('userId'),
      lastLogin : localStorageService.get('lastLogin'),
      hasCommerce : localStorageService.get('hasCommerce'),
      isActivate : localStorageService.get('isActivate')
    }
  }

  function logout() {

    let callback = function(res) {
      if(res){
        clearFullCache();
        $auth.logout()
        $state.go('login')
      }
    }

    modalMessageService.logout(callback)
  }

  function clearCache(){
    localStorageService.remove('userId')
    localStorageService.remove('nickName')
    localStorageService.remove('image')
    localStorageService.remove('email')
    localStorageService.remove('lastLogin')
    localStorageService.remove('hasCommerce')
    localStorageService.remove('isSocialLogin')
    localStorageService.remove('host')
  }

   function clearFullCache(){
//    localStorageService.remove('quote_data')
    localStorageService.remove('commerceToSave')
    localStorageService.remove('searchParams')
    localStorageService.remove('stepsHandler')

    localStorageService.remove('userId')
    localStorageService.remove('nickName')
    localStorageService.remove('image')
    localStorageService.remove('email')
    localStorageService.remove('lastLogin')
    localStorageService.remove('hasCommerce')
    localStorageService.remove('isSocialLogin')
    localStorageService.remove('host')
    localStorageService.remove('isActivate')
    localStorageService.remove('userInactiveBannerVisible')
}


  function recoverPassword(email) {
    return $http.get(API_END_POINT + `user/recoverPassword?email=${email}`).then(responseHandler)
  }

  function saveUserData(data) {
    localStorageService.set('userId', data.userId || data.id)
    localStorageService.set('nickName', data.nickName)
    localStorageService.set('image', data.imageUrl)
    localStorageService.set('isSocialLogin', isSocialLogin())
    localStorageService.set('email', data.email)
    if (data.lastLogin){
      localStorageService.set('lastLogin', moment().utc(data.lastLogin).toDate())
    }
    localStorageService.set('hasCommerce', data.hasCommerce)
    localStorageService.set('host', $location.host())
    localStorageService.set('isActivate', data.activated)

    $auth.setToken(data.token)
  }

  function updateUserDataCache(data) {
    localStorageService.set('nickName', data.nickName)
    localStorageService.set('image', data.imageUrl)
    localStorageService.set('email', data.email)
  }

  function sendActivationEmail(userId) {
    return $http.get(API_END_POINT + `user/sendMailActivation?userId=${userId}`).then(responseHandler)
  }

  function signInSocialNetworking(provider, profile) {
    return $http.post(API_END_POINT + `user/auth/${provider}`, profile).then(responseHandler)
  }

  function signIn(user) {
    const parameters = {
      'email': miscellaneous.nullSafe(user.email),
      'nickName': miscellaneous.nullSafe(user.nickName),
      'password': miscellaneous.nullSafe(user.password),
    }
    return $http.post(API_END_POINT + "user/login", parameters).then(res => {
      saveUserData(res.data)
    })
  }

  function loginSocial(email, nickName, socialId, image) {
    const params = {email, nickName, socialId, imageName: image}
    return $http.post(API_END_POINT + "user/loginSocial", params).then(responseHandler)
  }

  function signUpCommerce(email, password, nickName, phone) {
    const params = {email, password, nickName}
    return $http.post(API_END_POINT + "user/signUpCommerce", params).then(responseHandler)
  }

  function signUpSocial(email, nickName, socialId, image, hasCommerce) {
    clearFullCache()
    const params = {email, nickName, socialId, imageName: image}
    if (hasCommerce){
      return $http.post(API_END_POINT + "user/socialSignUpCommerce", params).then(responseHandler)
    }

    return $http.post(API_END_POINT + "user/socialSignUpUser", params).then(responseHandler)
  }

  function signUpUser(email, password, nickName, phone) {
    clearFullCache()
    const params = {email, password, nickName, phone}
    return $http.post(API_END_POINT + "user/signUpUser", params).then(responseHandler)
  }

  function verifyEmailExists(email) {
    const params = {'email': miscellaneous.nullSafe(email)}
    return $http.post(API_END_POINT + "user/mailAlreadyExists", params)
  }

  function updatePassword(token, verificationCode, password) {
    const params = {token, verificationCode, password}
    return $http.post(API_END_POINT + `user/updatePassword`, params).then(responseHandler)
  }


  // Private
  function isSocialLogin(){
    let image = localStorageService.get("image")
    if (image instanceof Object) {
      return false
    }
    return true
  }

  function getUserImage() {
    // If user logged with social network, then image is stored as string
    // For some reason though, regular login stores image as object with name property
    let image = localStorageService.get("image")
    if (image instanceof Object) {
      image = image.name
    }
    if (!image)
      image = 'assets/images/icons-default/driver.png'
    return image
  }


  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }

  function userView(userId) {
    return $http.get(API_END_POINT + "user/" + userId + "/view").then(responseHandler)
  }

  function getCommerces(userId, page){
    page = page || 1;
    return $http.get(API_END_POINT + "user/" + userId + "/commerces?page=" + page).then(responseHandler)
  }

  function getUserMap(location) {
    return `${USER.BASE_MAP}${location.lat},${location.lng}&zoom=${USER.ZOOM}&size=${USER.WIDTH_MAP}x${USER.HEIGHT}&scale=2`
  }

  function buildNickName(email) {
    return email.substr(0, email.indexOf('@'));
  }

  function updateUserData(userId, data, file){
    let dataJson = angular.toJson(data)
    return Upload.upload({
      url: `${API_END_POINT}user/${userId}/data`,
      data: {'data': dataJson, file: file }
    }).then(function(resp) {
      updateUserDataCache(resp.data)
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function calculatePercentageProfile(userData){
    var percentPoints = 0;

    //auto
    if(userData.cars.length > 0){
      percentPoints++;
    }
    //dirección
    if (userData.addresses.length > 0){
      percentPoints++;
    }
    //email
    if (userData.email){
      percentPoints++;
    }
    //telefono
    if (userData.phone){
      percentPoints++;
    }
    //nickname
    if (userData.nickName){
      percentPoints++;
    }
    //foto perfil == logo ??
    if (userData.imageName){
      percentPoints++;
    }
    //name
    if (userData.name){
      percentPoints++;
    }
    //activated ??
    /*if($ctrl.userData.name){
      percentPoints++;
    }*/

    return Math.round(percentPoints * 100 / 7)

  }

}
