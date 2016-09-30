var LEFT = 0;
var RIGHT = 1;

var ANIM_IDLE_LEFT = 0;
var ANIM_JUMP_LEFT = 1;
var ANIM_WALK_LEFT = 2;
var ANIM_IDLE_RIGHT = 3;  
var ANIM_JUMP_RIGHT = 4;
var ANIM_WALK_RIGHT = 5;
var ANIM_MAX = 6;



/*constructor*/ 
	var Enemy = function(x , y) {	
	this.sprite = new Sprite ("enemy.png")
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[0, 1, 2, 3, 4, 5, 6, 7]);
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[8, 9, 10, 11, 12]);
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[52, 53, 54, 55, 56, 57, 58, 59]);
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[60, 61, 62, 63, 64]);
		this.sprite.buildAnimation(12, 8, 165, 126, 0.05,[65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78]);
	this.sprite.setAnimationOffset(0, -35, -40);
	
	this.startPosition = new Vector2
	this.startPosition.set(9 * TILE, 0 * TILE)
	
	this.position = new Vector2();
	this.position.set(this.startPosition.x, this.startPosition.y); //'TILE' is the width of  tile+
	
	this.velocity = new Vector2();
	
	//this.width = 159;
	//this.height = 163;	
	
	//this.falling = true;
	//this.jumping = false;
	
	//this.direction = LEFT;
   
	//this.lives = 3;
	//this.isAlive = true;
	this.moveRight - true;
	this.paue = 0;
	
	this.cooldownTimer = 0;
};

Enemy.prototype.update = function(deltaTime)
{	
	this.sprite.update(deltaTime);
		
	if(this.pause > 0)
	{
		this.pause -= deltaTime;
	}
	else
	{
		var ddx = 0; // acceleration
		
		var tx = pixelToTile(this.position.x);
		var ty = pixelToTile(this.position.y);
		var nx = (this.position.x)%TILE; // true if enemy overlaps right
		var ny = (this.position.y)%TILE; // true if enemy overlaps below
		var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
		var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
		var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
		var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);

		if(this.moveRight)
		{

			if(celldiag && !cellright) {
				ddx = ddx + ENEMY_ACCEL; // enemy wants to go right
			}	
			else {
				this.velocity.x = 0;
				this.moveRight = false;
				this.pause = 0.5;
			}
		}
		if(!this.moveRight)

			if(celldown && !cell) {
				ddx = ddx - ENEMY_ACCEL; // enemy wants to go left
			}
			else {
					this.velocity.x = 0;
					this.moveRight = true;
					this.pause = 0.5;
			}
		}
		this.position.x = Math.floor(this.position.x + (deltaTime * this.velocity.x));
		this.velocity.x = bound(this.velocity.x + (deltaTime * ddx),
		-ENEMY_MAXDX, ENEMY_MAXDX);
	}



	// we’ll insert code here later

	// collision detection
	// Our collision detection logic is greatly simplified by the fact that the
	// Enemy is a rectangle and is exactly the same size as a single tile.
	// So we know that the Enemy can only ever occupy 1, 2 or 4 cells.

	// This means we can short-circuit and avoid building a general purpose
	// collision detection engine by simply looking at the 1 to 4 cells that
	// the Enemy occupies:
	var tx = pixelToTile(this.position.x);
	var ty = pixelToTile(this.position.y);
	var nx = (this.position.x)%TILE; // true if Enemy overlaps right
	var ny = (this.position.y)%TILE; // true if Enemy overlaps below
	var cell = cellAtTileCoord(LAYER_PLATFORMS, tx, ty);
	var cellright = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty);
	var celldown = cellAtTileCoord(LAYER_PLATFORMS, tx, ty + 1);
	var celldiag = cellAtTileCoord(LAYER_PLATFORMS, tx + 1, ty + 1);
	
	// If the Enemy has vertical velocity, then check to see if they have hit a platform
	// below or above, in which case, stop their vertical velocity, and clamp their
	// y position:
	if (this.velocity.y > 0) {
		if ((celldown && !cell) || (celldiag && !cellright && nx)) {
			// clamp the y position to avoid falling into platform below
			 this.position.y = tileToPixel(ty);
			 this.velocity.y = 0; // stop downward velocity
			 this.falling = false; // no longer falling
			 this.jumping = false; // (or jumping)
			ny = 0; // no longer overlaps the cells below
		}
	}
	else if (this.velocity.y < 0) {
		if ((cell && !celldown) || (cellright && !celldiag && nx)) {
			// clamp the y position to avoid jumping into platform above
			 this.position.y = tileToPixel(ty + 1);
			 this.velocity.y = 0; // stop upward velocity
			 // Enemy is no longer really in that cell, we clamped them to the cell below
			 cell = celldown;
			 cellright = celldiag; // (ditto)
			 ny = 0; // Enemy no longer overlaps the cells below
		}
	}
	if (this.velocity.x > 0) {
		if ((cellright && !cell) || (celldiag && !celldown && ny)) {
			 // clamp the x position to avoid moving into the platform we just hit
			 this.position.x = tileToPixel(tx);
			 this.velocity.x = 0; // stop horizontal velocity
		}
	}
	else if (this.velocity.x < 0) {
		if ((cell && !cellright) || (celldown && !celldiag && ny)) {
			// clamp the x position to avoid moving into the platform we just hit
		 	this.position.x = tileToPixel(tx + 1);
			this.velocity.x = 0; // stop horizontal velocity
		}
	}
	
	if (Enemy.position.y > canvas.height)
	{
		this.onDeath();
	}
	
	/* screen loop 
	if (Enemy.position.y > canvas.height){
		Enemy.position.y = canvas.height - canvas.height 
	} 
	*/


Enemy.prototype.draw = function()
{
	this.sprite.draw(context, this.position.x - worldOffsetX , this.position.y)
}

Enemy.prototype.onDeath = function ()
{
	
	if (this.isAlive == true)
	{
		this.lives -= 1;
		
		
		if(this.lives >= 0)
		{
		
		this.respawn();
		}
		else
		{
			this.isAlive = false;
			this.lives = 0;
		
		}

	}
}

Enemy.prototype.respawn = function ()
{
	this.position.set(this.startPosition.x, this.startPosition.y);
	this.sprite.setAnimation(ANIM_IDLE_RIGHT);

}