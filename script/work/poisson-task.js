/*

Web worker for executing poisson disk sampling


*/

importScripts( 'glmatrix.min.js', 'poisson-disk-3d.js', 'poisson-helper.js' );

self.addEventListener( 'message', function( e ) {

	var params = e.data;

	var points = getPoissonPoints( params );

  	self.postMessage( points );

}, false );