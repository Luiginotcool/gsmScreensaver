let App = {}

App.setPosition = function(x, y, img) {
	img.style.position = 'absolute';
    img.style.left = x + 'px';
    img.style.top = y + 'px';
}


App.init = function() {
	App.img = document.getElementById("img");
	App.frames = 0;
    App.oldTimeStamp = 0;
    App.width = window.innerWidth;
    App.height = window.innerHeight;

	this.img.style.width = "500px";
	
	this.x = 0;
	this.y = 0;
	this.xSpeed = 0.22;
	this.ySpeed = 0.2;
	this.numImg = 6
	this.inverse = false;
	

	App.setPosition(0, 0, this.img);
    App.noLoop = false;
    window.requestAnimationFrame(App.appLoop);
}

App.setSize = function(size) {
	App.img.style.width = `${size}px`;
}

App.appLoop = function(timeStamp) {
    if (App.noLoop) {
        window.requestAnimationFrame(App.appLoop);
    } else {

        App.dt = (timeStamp - App.oldTimeStamp);
        App.oldTimeStamp = timeStamp;
        let fps = Math.round(1000 / App.dt);
        App.frames++;
        App.noLoop = false;
		

		
		this.x += this.xSpeed * App.dt;
		this.y += this.ySpeed * App.dt;
	
		let bounce = false;
		let windowW = App.width;
		let windowH = App.height;
		let imgW = this.img.clientWidth;
		let imgH = this.img.clientHeight;
		if (this.x <= 0) { this.xSpeed *= -1; bounce = true; }
		if (this.y <= 0) { this.ySpeed *= -1; bounce = true; }
		if (this.x >= windowW - imgW - 1) { this.xSpeed *= -1; bounce = true; }
		if (this.y >= windowH - imgH - 1) { this.ySpeed *= -1; bounce = true; }
		if (bounce) {
			let i = Math.floor(Math.random()*this.numImg);
			this.img.src = `./gsm${i}${inverse ? "i" : ""}.png`
			inverse = !inverse;
		}
		App.setPosition(this.x, this.y, this.img);
		
		// speed = d / t
		// d = speed * time
		
		
		
		
		
        window.requestAnimationFrame(App.appLoop);
    }
}

App.bounds = function(windowW, windowH, imgW, imgH, xSpeed, ySpeed, x, y) {
	// x, y is top left
	// Bounce if x or y is 0
	// Bounce if x is windowW - imgW 
	// or if y is windowH - imgH 
	// return new speed 
	console.log(windowW, windowH, imgW, imgH, xSpeed, ySpeed, x, y)
	if (x <= 0) { xSpeed *= -1 }
	if (y <= 0) { ySpeed *= -1 }
	if (x >= windowW - imgW) { xSpeed *= -1; console.log("BOUNCE........................................") }
	if (y >= windowH - imgH) { ySpeed *= -1; console.log("BOUNCE........................................")}
	return [xSpeed, ySpeed];
}

window.onload = App.init;