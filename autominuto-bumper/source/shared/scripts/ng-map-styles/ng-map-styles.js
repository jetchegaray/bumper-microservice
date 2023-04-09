angular.module('amApp.ngMapStyleConstants', [])
	.constant('MAP_WITHOUT_INTERESTS_POINTS_STYLE', 
		[
			{
				featureType: 'poi',
				stylers: [{visibility: 'off'}]
			},
			{ 
				featureType: 'poi.park',
				stylers: [{visibility: 'on'}]
			},
			{
				featureType: 'transit',
				elementType: 'labels.icon',
				stylers: [{visibility: 'off'}]
			}
		],
		{name: 'Styled Map'}
	)