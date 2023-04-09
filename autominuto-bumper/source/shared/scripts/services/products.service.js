'use strict'

angular.module('amApp').factory('productService', productService)

function productService($http, API_END_POINT, Upload) {

  return {
    searchProducts: searchProducts,
    saveProduct: saveProduct,
    saveAllProducts: saveAllProducts,
    saveAllProductsWithImages : saveAllProductsWithImages,
    saveAllProductsWithoutImages : saveAllProductsWithoutImages,
    getAllByParams: getAllByParams,
    getAllByParamsWithCategoriesLikeProducts: getAllByParamsWithCategoriesLikeProducts,
    getAllByCommerceCategory: getAllByCommerceCategory,
    allBrands: allBrands,
    getInitialData: getInitialData,
    getInitialDataWithCategories: getInitialDataWithCategories,
    deleteProduct: deleteProduct,
    editProductStore: editProductStore,
    productDetail: productDetail,
    productsRelated : productsRelated,
    getAllComments : getAllComments,
    saveQuestionFrom : saveQuestionFrom,
  }

  function deleteProduct(productId) {
    return $http.delete(`${API_END_POINT}product/${productId}`).then(responseHandler)
  }

  function searchProducts(commerceId) {
    return $http.get(`${API_END_POINT}commerce/search`).then(responseHandler)
  }

  function editProductStore(productId, data, files) {
    let endpoint = `${API_END_POINT}product/${productId}/edit`
    return updateOrCreateProduct(endpoint, data, files)
//    return $http.post(`${API_END_POINT}product/${product.id}/edit`, { data: product }).then(responseHandler)
  }

  function saveProduct(commerceId, data, files) {
    let endpoint =`${API_END_POINT}product/save?commerceId=${commerceId}`
    return updateOrCreateProduct(endpoint, data, files)
  }

  function saveAllProductsWithImages(commerceId, data, fileImage) {
    return Upload.upload({
      url: `${API_END_POINT}product/saveAllWithImages?commerceId=${commerceId}`,
      data: {'data': angular.toJson(data), files: fileImage }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function saveAllProductsWithoutImages(commerceId, data) {
    return $http.post(`${API_END_POINT}product/saveAllWithoutImages?commerceId=${commerceId}`, { data: angular.toJson(data) }).then(responseHandler)
  }

  function saveAllProducts(commerceId, data, fileImage) {
    return Upload.upload({
      url: `${API_END_POINT}product/saveAll?commerceId=${commerceId}`,
      data: {'data': angular.toJson(data), files: fileImage }
    }).then(function(resp) {
      return responseHandler(resp)
    }, function(resp) {
      return responseHandler(resp)
    }, function(evt) {
    })
  }

  function updateOrCreateProduct(endpoint, data, files) {
    data = angular.toJson(data)
    return Upload.upload({
      url: endpoint,
      data: { 'data': data, files: files }
    }).then(function (resp) {
      return responseHandler(resp);
    }, function (resp) {
      return responseHandler(resp);
    }, function (evt) {});
  }

  function getAllByParams(commerceId, page, searched) {
    return $http.post(`${API_END_POINT}product/getAllBy/${commerceId}?page=${page}`, { data: searched }).then(responseHandler)
  }

  function getAllByParamsWithCategoriesLikeProducts(commerceId, page, searched) {
    return $http.post(`${API_END_POINT}product/getAllByWithCategoriesLikeProducts/${commerceId}?page=${page}`, { data: searched }).then(responseHandler)
  }

  function getAllByCommerceCategory(commerceId, categoryId, page) {
    return $http.get(`${API_END_POINT}product/getAllByCommerceCategory/${commerceId}/${categoryId}/?page=${page}`).then(responseHandler)
  }

  function allBrands(params) {
    return $http.get(`${API_END_POINT}home/brands`).then(responseHandler)
  }

  function getInitialData(commerceId) {
    return $http.get(`${API_END_POINT}product/getInitialData/${commerceId}`).then(responseHandler)
  }

  function getInitialDataWithCategories(commerceId) {
    return $http.get(`${API_END_POINT}product/getInitialDataWithCategories/${commerceId}`).then(responseHandler)
  }

  function productDetail(productId) {
    return $http.get(`${API_END_POINT}product/${productId}`).then(responseHandler)
  }

  function productsRelated(productId) {
    return $http.get(`${API_END_POINT}product/related/${productId}`).then(responseHandler)
  }

  function getAllComments(productId, page) {
    return $http.get(`${API_END_POINT}product/${productId}/questions?page=${page}`).then(responseHandler)
  }

  function saveQuestionFrom(productId, userId, comment) {
    return $http.post(`${API_END_POINT}product/${productId}/saveQuestionFrom?userId=${userId}`, { data: comment }).then(responseHandler)
  }

  function responseHandler(res) {
    if (res.status != 200 && res.status != 201) {
      throw res.data
    }
    return res.data
  }
}
