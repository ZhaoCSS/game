/*
poisson-disk-sample

https://github.com/jeffrey-hearn/poisson-disk-sample

MIT License
*/

function PoissonDiskSampler3D( width, height, depth, minDistance, sampleFrequency, existingPoints, oldXOff, oldYOff, oldZOff ){

	this.width = width;
	this.height = height;
	this.depth = depth;	
	this.minDistance = minDistance;
	this.sampleFrequency = sampleFrequency;
	this.oldOffset = { x: 0, y: 0, z: 0 }; // relative offset of previous center used
	if ( oldXOff != undefined ) this.oldOffset.x = oldXOff;
	if ( oldYOff != undefined ) this.oldOffset.y = oldYOff;
	if ( oldZOff != undefined ) this.oldOffset.z = oldZOff;

	this.newStartIndex = 0;
	this.fromExisting = false;	

	if( existingPoints != undefined ) {
		this.fromExisting = true;
	} else {
		this.fromExisting = false;
	}

	this.reset();

	if( existingPoints != undefined ) {
		this.newStartIndex = existingPoints.length; //TODO: take into account the case where some existing points might be thrown out	
		this.initExistingPoints( existingPoints );
	}
}

PoissonDiskSampler3D.prototype.reset = function(){
	this.grid = new Grid3D( this.width, this.height, this.depth, this.minDistance );
	this.grid.fromExisting = this.fromExisting;
	this.grid.radius = this.width / 2;
	this.grid.oldOffset = this.oldOffset;
	this.outputList = new Array();
	this.preProcessQueue = new RandomQueue();	
	this.processingQueue = new RandomQueue();
}

PoissonDiskSampler3D.prototype.initExistingPoints = function( points ) {
	for( var i = 0; i < points.length; i++ ) {
		this.queueToAll( { x: points[i].x, y: points[i].y, z: points[i].z } );
	}
}

PoissonDiskSampler3D.prototype.sampleUntilSolution = function(){
	while( this.sample() ){};
	return this.outputList;
}

PoissonDiskSampler3D.prototype.sample = function(){

	// If this is the first sample
	if ( 0 == this.outputList.length ){
		// Generate first point
		this.queueToAll( this.grid.randomPoint() );
		return true;
	}

	var processPoint = this.processingQueue.pop();

	// Processing queue is empty, return failure
	if ( processPoint == null ) {
		return false;
	}

	// Generate sample points around the processing point
	// And check if they have any neighbors on the grid
	// If not, add them to the queues
	for ( var i = 0; i < this.sampleFrequency; i++ ){
		samplePoint = this.grid.randomPointAround( processPoint );
		if ( ! this.grid.inNeighborhood( samplePoint ) ){
			// No on in neighborhood, welcome to the club
			this.queueToAll( samplePoint );
		}
	}
	// Sample successful since the processing queue isn't empty
	return true;
}


PoissonDiskSampler3D.prototype.queueToAll = function ( point ){
	var valid = this.grid.addPointToGrid( point, this.grid.pixelsToGridCoords( point ) );
	if ( !valid )
		return;
	this.processingQueue.push( point );
	this.outputList.push( point );
}



function Grid3D( width, height, depth, minDistance ){

	this.width = width;
	this.height = height;
	this.depth = depth;

	this.minDistance = minDistance;

	this.cellSize = this.minDistance / Math.SQRT2;
	this.cellsWide = Math.ceil( this.width / this.cellSize );
	this.cellsHigh = Math.ceil( this.height / this.cellSize );
	this.cellsDeep = Math.ceil( this.depth / this.cellSize );

	// Initialize grid
	this.grid = [];
	for ( var x = 0; x < this.cellsWide; x++ ){
		this.grid[x] = [];
		for ( var y = 0; y < this.cellsHigh; y++ ){
			this.grid[x][y] = [];
			for ( var z = 0; z < this.cellsDeep; z++ ) {
				this.grid[x][y][z] = null;
			}
		}
	}
}

Grid3D.prototype.pixelsToGridCoords = function( point ){
	var gridX = Math.floor( point.x / this.cellSize );
	var gridY = Math.floor( point.y / this.cellSize );
	var gridZ = Math.floor( point.z / this.cellSize );	
	return { x: gridX, y: gridY, z: gridZ };
}

Grid3D.prototype.addPointToGrid = function( pointCoords, gridCoords ){
	// Check that the coordinate makes sense
	if ( gridCoords.x < 0 || gridCoords.x > this.grid.length - 1 )
		return false;
	if ( gridCoords.y < 0 || gridCoords.y > this.grid[gridCoords.x].length - 1 )
		return false;
	if ( gridCoords.z < 0 || gridCoords.z > this.grid[gridCoords.x][gridCoords.y].length - 1 )
		return false;	

	// Testing, check if this point is within radius defined
	// var distance = this.dist2D( pointCoords.x, pointCoords.z, this.radius, this.radius );	
	var distance = this.dist2D( pointCoords.x, pointCoords.z, this.radius + this.oldOffset.x, this.radius + this.oldOffset.z );

	if( distance < this.radius ) {

		this.grid[ gridCoords.x ][ gridCoords.y ][ gridCoords.z ] = pointCoords;
		// console.log( "Adding ("+pointCoords.x+","+pointCoords.y+","+pointCoords.z+" to grid ["+gridCoords.x+","+gridCoords.y+","+gridCoords.y+"]" );
		return true;		

	} else {

		return false;

	}


}

Grid3D.prototype.randomPoint = function(){
	return { x: getRandomArbitrary(0,this.width), y: getRandomArbitrary(0,this.height), z: getRandomArbitrary(0,this.depth) };
}

Grid3D.prototype.dist2D = function( x1, y1, x2, y2 ) {
    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

Grid3D.prototype.randomPointAround = function( point ){
	// get a random radius between the min distance and 2 X mindist
	var radius = this.minDistance * (Math.random() + 1);
	// get random point on sphere
	var phi = Math.random() * 2 * Math.PI;
	var theta = Math.acos( Math.random() * 2 - 1 );
	var x = point.x + radius * Math.sin(theta) * Math.cos(phi);
	var y = point.y + radius * Math.sin(theta) * Math.sin(phi);
	var z = point.z + radius * Math.cos(theta);
	return { x: x, y: y, z: z };
}

Grid3D.prototype.inNeighborhood = function( point ){

	var gridPoint = this.pixelsToGridCoords( point );

	var cellsAroundPoint = this.cellsAroundPoint( point );

	for ( var i = 0; i < cellsAroundPoint.length; i++ ){
		if ( cellsAroundPoint[i] != null ){
			if ( this.calcDistance( cellsAroundPoint[i], point ) < this.minDistance ){
				return true;
			}
		}
	}
	return false;
}

Grid3D.prototype.cellsAroundPoint = function( point ){
	var gridCoords = this.pixelsToGridCoords( point );
	var neighbors = new Array();

	var checkRange = 2;

	for ( var x = -checkRange; x < checkRange+1; x++ ){
		var targetX = gridCoords.x + x;
		// make sure lowerbound and upperbound make sense
		if ( targetX < 0 )
			targetX = 0;
		if ( targetX > this.grid.length - 1 )
			targetX = this.grid.length - 1;

		for ( var y = -checkRange; y < checkRange+1; y++ ){
			var targetY = gridCoords.y + y;
			// make sure lowerbound and upperbound make sense
			if ( targetY < 0 )
				targetY = 0;
			if ( targetY > this.grid[ targetX ].length - 1 )
				targetY = this.grid[ targetX ].length - 1;

			for ( var z = -checkRange; z < checkRange+1; z++ ){
				var targetZ = gridCoords.z + z;
				//make sure lowerbound and upperbound make sense
				if ( targetZ < 0 )
					targetZ = 0;
				if ( targetZ > this.grid[ targetX ][ targetY ].length - 1 )
					targetZ = this.grid[ targetX ][ targetY ].length - 1;

				neighbors.push( this.grid[ targetX ][ targetY ][ targetZ ] )		

			}
		}
	}
	return neighbors;
}

Grid3D.prototype.calcDistance = function( pointInCell, point ){
	return Math.sqrt( (point.x - pointInCell.x)*(point.x - pointInCell.x)
	                + (point.y - pointInCell.y)*(point.y - pointInCell.y) 
	                + (point.z - pointInCell.z)*(point.z - pointInCell.z) );
}

function RandomQueue( a ){
	this.queue = a || new Array();
}

RandomQueue.prototype.push = function( element ){
	this.queue.push( element );
}

RandomQueue.prototype.pop = function(){

	randomIndex = getRandomInt( 0, this.queue.length );
	while( this.queue[randomIndex] === undefined ){

		// Check if the queue is empty
		var empty = true;
		for ( var i = 0; i < this.queue.length; i++ ){
			if ( this.queue[i] !== undefined )
				empty = false;
		}
		if ( empty )
			return null;

		randomIndex = getRandomInt( 0, this.queue.length );
	}

	element = this.queue[ randomIndex ];
	this.queue.remove2( randomIndex );
	return element;
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove2 = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};

// MDN Random Number Functions
// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}