$(function(){
	var compass = $('.compass-icon');
	if(window.DeviceOrientationEvent) {

	  window.addEventListener('deviceorientation', function(event) {
			var alpha;
			//Check for iOS property
			if(event.webkitCompassHeading) {
			  alpha = event.webkitCompassHeading;
			  //Rotation is reversed for iOS
			  compass.style.WebkitTransform = 'rotate(-' + alpha + 'deg)';
			}
			//non iOS
			else {
			  alpha = event.alpha;
			  webkitAlpha = alpha;
			  if(!window.chrome) {
				//Assume Android stock (this is crude, but good enough for our example) and apply offset
				webkitAlpha = alpha-270;
			  }
			}

			compass[0].style.Transform = 'rotate(' + alpha + 'deg)';
			compass[0].style.WebkitTransform = 'rotate('+ webkitAlpha + 'deg)';
			//Rotation is reversed for FF
			compass[0].style.MozTransform = 'rotate(-' + alpha + 'deg)'; 
		  }, false);
	}
});