
function getPoissonPoints( params ) {

	function dist3D(x1,y1,z1,x2,y2,z2) {
	    return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)+(z2-z1)*(z2-z1));
	}

	//required
	var minDis = params.minDistance;
	var height = params.height;

	//optional params
	var mode, pointCount, centerPos, proxCenterPos, existingPoints, samplFreq, newOnly;
	if( params.mode != undefined ) {
		mode = params.mode;
	} else {
		mode = 'dynamic';
	}

	if( params.count != undefined ) {
		pointCount = params.count;
	}

	if( params.center != undefined ) {
		centerPos = params.center;
	} else {
		centerPos = vec3.create();
	}

	if( params.proxCenter != undefined ) {
		proxCenterPos = params.proxCenter;
	} else {
		proxCenterPos = centerPos;
	}

	if( params.existingPoints != undefined ) {
		existingPoints = params.existingPoints;
	}

	if( params.sampFreq != undefined ) {
		sampFreq = params.sampFreq;
	} else {
		sampFreq = 20;
	}

	if( params.newOnly != undefined ) {
		newOnly = params.newOnly;
	} else {
		newOnly = false;
	}

	var width, depth;

	if( mode == 'dynamic' ) {

		//if point count provided, determine calculation volume dynamically
		//required: pointCount

		//use minDis as side of cube cell + headroom scalar, add them up to find volume with some extra headroom
		var compPointCount = pointCount;
		if( compPointCount < 10 ) {
			compPointCount += 10;
		}
		var headroomScalar = 1.4; //hard coded for now
		var cellVolume = Math.pow( minDis * headroomScalar, 3 );
		var volume = compPointCount * cellVolume;
		var area = volume / height;
		width = depth = Math.sqrt( area );

	} else if( mode == 'static' ) {

		//calculate from fixed width, height, depth
		width = params.width;
		depth = params.depth;

	}

	//find offset
	var xoff = -width / 2 + centerPos.x;
	var yoff = -height / 2 + centerPos.y;
	var zoff = -depth / 2 + centerPos.z;

	var oldXOff, oldYOff, oldZOff;

	var relativeExistingPoints = [];

	if( existingPoints !== undefined ) {

		//transpose existing points to relative space
		for( var i = 0; i < existingPoints.length; i++ ) {
			var pos = { x: existingPoints[i].x, y: existingPoints[i].y, z: existingPoints[i].z };
			pos.x -= xoff;
			pos.y -= yoff;
			pos.z -= zoff;
			relativeExistingPoints.push( pos );
		}

		//set offset to previous center
		if( params.lastCenter != undefined ) {
			oldXOff = centerPos.x - params.lastCenter.x;
			oldYOff = centerPos.y - params.lastCenter.y;
			oldZOff = centerPos.z - params.lastCenter.z;
		}

	}

	var sampler = new PoissonDiskSampler3D( width, height, depth, minDis, sampFreq, relativeExistingPoints, oldXOff, oldYOff, oldZOff );
	var solution = sampler.sampleUntilSolution();

	var points = new Array( sampler.outputList.length );
	for( var i = 0; i < sampler.outputList.length; i++ ) {
		var p = sampler.outputList[i];
		points[i] = { x: p.x, y: p.y, z: p.z };
	}

	//get rid of any points outside of the bounds!
	for( var i = points.length - 1; i >= 0; i-- ) {
		if( points[i].x < 0 || points[i].x > width ||
		  	points[i].y < 0 || points[i].y > height ||
		  	points[i].z < 0 || points[i].z > depth ) {
			points.splice( i, 1 );
		}
	}

	//if new only, exclude existing points, delete first ones
	if( relativeExistingPoints.length != 0 && newOnly ) {

		var removalCount = 0;
		for( var i = 0; i < existingPoints.length; i++ ) {
			for( var j = 0; j < points.length; j++ ) {
				var dis = dist3D( relativeExistingPoints[i].x, relativeExistingPoints[i].y, relativeExistingPoints[i].z, points[j].x, points[j].y, points[j].z );
				if( dis < 10 ) {
					points.splice( j, 1 );
					removalCount++;
					break;
				}
			}
		}

	}

	//transpose points to world space
	for( var i = 0; i < points.length; i++ ) {
		points[i].x += xoff;
		points[i].y += yoff;
		points[i].z += zoff;
	}

	//apply directional filter
	if( params.directionalVec != undefined && params.maxAngleFromDirVec != undefined ) {
		points = filterByDirectionalAngle( points, params.center, params.directionalVec, params.maxAngleFromDirVec );
	}

	//apply amorphous border filter
	if( params.borderSampleCount != undefined && existingPoints != undefined ) {
		points = filterByAmorphousBorder( points, params.center, existingPoints, params.borderSampleCount, false );
	}

	//sort by proximity to center
	var distanceInfo = new Array();
	var flatCenter = { x: proxCenterPos.x, y: 0, z: proxCenterPos.z };
	for( var i = 0; i < points.length; i++ ) {
		var flatPoint = { x: points[i].x, y: 0, z: points[i].z };
		var d = dist3D( flatCenter.x, flatCenter.y, flatCenter.z, flatPoint.x, flatPoint.y, flatPoint.z );
		distanceInfo.push( { index: i, distance: d } );
	}

	distanceInfo.sort( function(a, b) {
		a = a.distance;
		b = b.distance;
		return a < b ? -1 : a > b ? 1 : 0;
	});

	var finalPoints = new Array( points.length );
	for( var i = 0; i < points.length; i++ ) {
		finalPoints[i] = points[ distanceInfo[i].index ];
	}

	// if( pointCount !== undefined ) {
	// 	finalPoints.splice( pointCount, finalPoints.length - pointCount );
	// }

	return finalPoints;

}

//filter out anything outside of a given view angle from a given center point and direction
function filterByDirectionalAngle( points, centerPoint, dirVec, maxAngle ) {

    var center = cloneVec( centerPoint );
    center.y = 0;

    var outPoints = [];

    for( var i = 0; i < points.length; i++ ) {

        var pointVec = subVecs( points[i], centerPoint );
        var angle = angleBetweenVecs( dirVec, pointVec );

        if( angle < maxAngle ) {
            outPoints.push( points[i] );
        }

    }

    return outPoints;

}

//filter anything that is inside or outside of the boundary around a given set of points
function filterByAmorphousBorder( inPoints, centerPoint, inExistingPoints, sampleCount, inside ) {

    var TWO_PI = Math.PI * 2;

    //put points into glmatrix vec3 format
    var points = new Array( inPoints.length );
    for( var i = 0; i < inPoints.length; i++ ) {
    	points[i] = cloneVecXYZ( inPoints[i] );
    }

    //put existing points into glmatrix vec3 format
    var existingPoints = new Array( inExistingPoints.length );
    for( var i = 0; i < inExistingPoints.length; i++ ) {
    	existingPoints[i] = cloneVecXYZ( inExistingPoints[i] );
    }

   	//find centroid
    var center = vec3.create();
    for( var i = 0; i < existingPoints.length; i++ ) {
    	vec3.add( center, center, existingPoints[i] );
    }
    vec3.scale( center, center, 1 / existingPoints.length );
    center[1] = 0;

    var angleInc = TWO_PI / sampleCount;
    var borderPointIds = new Array( sampleCount.length );

    //find angle indices for each item
    var anglePointIndices = [];
    var angleVecs = []

    for( var i = 0; i < sampleCount; i++ ) {

        anglePointIndices.push( [] );

        var angle = i * angleInc;
        var point = vec3.fromValues( 1, 0, 0 );
        var tmpQuat = quat.create();
        quat.setAxisAngle( tmpQuat, vec3.fromValues( 0, 1, 0 ), angle );
        vec3.transformQuat( point, point, tmpQuat );
        angleVecs.push( point );

    }

    for( var i = 0; i < existingPoints.length; i++ ) {

        //get normalized relative vector of object from center
        var flatVec = vec3.clone( existingPoints[i] );
        vec3.sub( flatVec, flatVec, center );
        flatVec.y = 0;
        vec3.normalize( flatVec, flatVec );

        //find closest angle vector
        var closestIndex = -1;
        var closestDis = 9999999999;
        for( var j = 0; j < angleVecs.length; j++ ) {
            var dis = vec3.distance( flatVec, angleVecs[j] );
            if( dis < closestDis ) {
                closestIndex = j;
                closestDis = dis;
            }
        }

        //assign item id to angle index
		anglePointIndices[closestIndex].push( i );

    }

    //find farthest point in each angle sector
    for( var i = 0; i < anglePointIndices.length; i++ ) {

        var farthestIndex = -1;
        var farthestDis = 0;

        for( var j = 0; j < anglePointIndices[i].length; j++ ) {

            var index = anglePointIndices[i][j];
            var pos = existingPoints[index];
            var dis = vec3.distance( center, pos );
            if( dis > farthestDis ) {
                farthestIndex = index;
                farthestDis = dis;
            }

        }

        borderPointIds[i] = farthestIndex;

    }

    //filter out points that are outside border!
    var outPoints = [];
    var inValidPoints = [];
    for( var i = 0; i < points.length; i++ ) {

        //get normalized relative vector of object from center
        var flatVec = vec3.create();
        vec3.sub( flatVec, points[i], center );
        flatVec.y = 0;
        vec3.normalize( flatVec, flatVec );

        //find closest angle vector
        var closestIndex = -1;
        var closestDis = 9999999999;
        for( var j = 0; j < angleVecs.length; j++ ) {
            var dis = vec3.distance( flatVec, angleVecs[j] );
            if( dis < closestDis ) {
                closestIndex = j;
                closestDis = dis;
            }
        }

        //get value at this index
        var index = borderPointIds[ closestIndex ];
        var borderPoint = existingPoints[ index ];

        var borderDis = vec3.distance( center, borderPoint );
        var pointDis = vec3.distance( center, points[i] );

        var valid = false;
        if( inside === true ) {
            if( pointDis < borderDis ) {
                valid = true;
            }
        } else {
            if( pointDis > borderDis ) {
                valid = true;
            }
        }

        if( valid ) {
            outPoints.push( cloneVec3( points[i] ) );
        } else {
        	inValidPoints.push( cloneVec3( points[i] ) );
        }

    }

    return outPoints;

}

// util functions
function cloneVec( inVec ) {
	return {
		x: inVec.x,
		y: inVec.y,
		z: inVec.z
	}
}
function cloneVecXYZ( inVec ) {
	return vec3.fromValues( inVec.x, inVec.y, inVec.z );
}

function cloneVec3( inVec ) {
	return {
		x: inVec[0],
		y: inVec[1],
		z: inVec[2]
	}
}

// // geometry functions

function angleBetweenVecs( vec1, vec2 ) {
    return Math.acos( dot( vec1, vec2 ) / ( vecLength( vec1 ) * vecLength( vec2 ) ) );
}
function dot( vec1, vec2 ) {
	return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z;
}

function subVecs( vec1, vec2 ) {
	return {
		x: vec1.x - vec2.x,
		y: vec1.y - vec2.y,
		z: vec1.z - vec2.z
	};
}

function vecLength( vec ) {
	return Math.sqrt( vec.x * vec.x + vec.y * vec.y + vec.z * vec.z );
}