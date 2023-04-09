'use strict'

angular.module('amApp').controller('GuideController', GuideController)

function GuideController($state, $stateParams, $location, $sce, userService, errorService) {
    const $ctrl = this

    $ctrl.commerceGuides = {
        'alta-de-comercio': {
            title: '¿Cómo registro mi taller en Autominuto?',
            description: 'En este video podrás encontrar los pasos a seguir para poder registrarte como usuario comerciante en Autominuto y así poder dar a conocer tu comercio automotor ofreciendo tus servicios y productos automotrices. Cargá todos los datos sobre tu comercio y completa tu perfil al máximo para empezar a vender.',
            video: 'https://www.youtube.com/embed/tFtts3SsZDk'
        },
        'responder-presupuesto': {
            title: '¿Cómo respondo un pedido de presupuesto?',
            description: 'En este video podrás encontrar los pasos a seguir para empezar a reponder los presupuestos que te llegaran a tu tienda de comercio automotor.',
            video: 'https://www.youtube.com/embed/mAkmKjdDUaQ'
        },
        'recibir-pagos': {
            title: 'Recibir pagos',
            description: 'En este video podrás encontrar todos los pasos a seguir para vincular tu cuenta de Mercado Pago para recibir  el dinero de las transacciones que realices a través de nuestra aplicación. Si todavía no tenés una cuenta en Mercado Pago ',
            mercadopago: 'hacé click acá para crearla.',
            video: 'https://www.youtube.com/embed/RIxkaev5fLM'
        },
        'generacion-de-cupones': {
            title: '¿Cómo creo un cupón de descuento?',
            description: 'En este video podrás encontrar los pasos a seguir para obtener herramientas comerciales que te permitirán potenciar tu comercio y diferenciate de la competencia captando la atención de nuevos clientes a través de la creación de cupones de descuento. Miles de usuarios conductores están buscando nuevas oportunidades, destacá tu comercio con ofertas atractivas.',
            video: 'https://www.youtube.com/embed/ln6k7R783Ho'
        },
         'mecanico-delivery': {
            title: 'Soy mecánico delivery',
            description: 'En este video podrás encontrar los pasos a seguir para poder registrarte como mecánico a domicilio en Autominuto y así poder dar a conocer tu comercio automotor ofreciendo tus servicios y productos automotrices. Cargá todos los datos sobre tu comercio y completa tu perfil al máximo para empezar a vender.',
            video: 'https://www.youtube.com/embed/l1UqlZA8cxw'
        },
        'tour-tienda-online': {
            title: 'Tour tienda online',
            description: 'En este video podrás conocer todas las funcionalidades de nuestra plataforma y de tu tienda online para poder disfrutar de al máximo de la experiencia Autominuto.',
            video: 'https://www.youtube.com/embed/tiOSz3x4Q6o'
        } 
    }

    $ctrl.driverGuides = {
        static: {
            'alta-de-conductor': {
                title: 'Alta de conductor'
            },
            'como-comprar': {
                title: '¿Cómo comprar?',
                description: 'En este video podrás encontrar como generar un pedido de presupuesto en Autominuto paso por paso y poder acceder al comparador integral de precios en cuestion de segundos. Recibiendo respuestas de los comercios de tu barrio en un plazo de 24 horas.',
                video: 'https://www.youtube.com/embed/ln6k7R783Ho'
            },
            'solicitar-presupuestos': {
                title: '¿Cómo hago un pedido de presupuesto?',
                description: 'En este video podrás encontrar como generar un pedido de presupuesto en Autominuto paso por paso y poder acceder al comparador integral de precios en cuestion de segundos. Recibiendo respuestas de los comercios de tu barrio en un plazo de 24 horas.',
                video: 'https://www.youtube.com/embed/ln6k7R783Ho'
            },
            'obtener-cupones': {
                title: 'Obtener cupones'
            }
        },
        interactive: {
            'medios-de-pago': {
                title: 'Medios de pago',
                link: 'https://www.mercadopago.com.ar/ayuda/medios-de-pago-cuotas-promociones_264'
            }
        }
    }    

    $ctrl.$onInit = () => {
        $.LoadingOverlay('show')

        $ctrl.guideType = $stateParams.guideType

        if ($ctrl.guideType !== 'undefined') { // is page guides/:guide-type
            
            let commerce = $ctrl.commerceGuides[$ctrl.guideType]
            let driver = $ctrl.driverGuides.static[$ctrl.guideType]
            
            if (commerce) {
                $ctrl.title = commerce.title
                $ctrl.description = commerce.description
                $ctrl.trustAsResourceUrl = $sce.trustAsResourceUrl;
                $ctrl.video = commerce.video
                $ctrl.mercadopago = commerce.mercadopago;
            }else if (driver){
                $ctrl.title = driver.title
                $ctrl.description = driver.description
                $ctrl.trustAsResourceUrl = $sce.trustAsResourceUrl;
                $ctrl.video = driver.video
                $ctrl.mercadopago = driver.mercadopago;
            } else {
                $location.path('guias')    
            }
        } else { // is page guides
    }

    $.LoadingOverlay('hide')
  }
}
