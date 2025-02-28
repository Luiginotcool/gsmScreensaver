let App = {}


App.init = function() {
	App.body = document.getElementsByTagName("body")[0];
	App.svgDiv = document.getElementById("svgs");
	App.menuDiv = document.getElementsByClassName("menu")[0];
	App.audio = document.getElementById("audio");
	App.spawnButton = document.getElementById("spawn");
	App.resetButton = document.getElementById("reset");
	App.playButton = document.getElementById("play");
	App.volumeSlider = document.getElementById("volume");
	App.exitMenu = document.getElementById("close");
	App.spawnButton.onclick = App.spawnFunction;
	App.resetButton.onclick = App.resetFunction;
	App.playButton.onclick = App.playFunction;
	App.volumeSlider.oninput = App.volumeFunction;
	App.exitMenu.onclick = App.closeFunction;
	App.menuPressed = false;
	App.frames = 0;
    App.oldTimeStamp = 0;
    App.width = window.innerWidth;
    App.height = window.innerHeight;
	App.colourIndex = 0;
	App.oldColourIndex  = 0;

	Input.init();

	App.boxes = []


	App.testBoxes = []
	for (let i = 0; i < 5; i++) {

	}


	App.fg = "#585a5c"
	App.bg1 = "#ff6dff"
	App.bg2 = "#000000"

    App.noLoop = false;
	console.log("Version 1.3")
    window.requestAnimationFrame(App.appLoop);
}

App.spawnFunction = function() {
	App.boxes.push(Box.randomBox(0, App.width, 0, App.height, 0.25))
}

App.resetFunction = function() {
	App.boxes.forEach(box => {
		box.svg.remove();
	})
	App.boxes = [];
}

App.volumeFunction = function() {
	console.log(this.value)
	App.audio.volume = this.value/100;
}

App.playFunction = function() {
	if (App.audio.paused) {
		App.playAudio();
	} else {
		App.pauseAudio();
	}
}

App.closeFunction = function() {
	App.toggleMenu();
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
		App.width = window.innerWidth;
		App.height = window.innerHeight;
		App.colourIndex = App.timeToIndex(App.audio.currentTime, 159.98/2)
		App.body.style.backgroundColor = "#"+App.colours[App.colourIndex].split(",")[3];
		console.log(App.colourIndex, App.oldColourIndex)
		App.boxes.forEach(box => {
			if (App.oldColourIndex != App.colourIndex) {
				box.randomColours();
				App.body.style.backgroundColor = "#"+App.colours[App.colourIndex].split(",")[3];
			}
			box.update(App.dt, App.boxes);
		})
		App.oldColourIndex = App.colourIndex;
		


		App.handleMenu();
		
		
        window.requestAnimationFrame(App.appLoop);
    }
}

App.toggleMenu = function() {
	App.menuDiv.classList.toggle("hidden");
}

App.timeToIndex = function(time, bpm) {
	// 160 bpm, means 1 minute = 160 beats
	// 1 second = 160 / 60 beats
	return Math.floor((time+0.1) * bpm / 60) % App.colours.length;
}

App.handleMenu = function() {
	if (Input.keys["menu"] && App.menuPressed == false) {
		App.menuPressed = true;
		console.log("App.menuPressed", App.menuPressed)
		App.toggleMenu();
	}
	if (!Input.keys["menu"] && App.menuPressed == true) {
		App.menuPressed = false;
	}

}



class Box {
	constructor(width, x, y, vx, vy) {
		this.w = width;
		this.h = width * 252.48 / 453.6;
		this.x = x;
		this.y = y;
		this.vx = vx;
		this.vy = vy;
		this.randomColours();
		let div = document.createElement("div");
		div.innerHTML = App.svg;
		this.svg = div.childNodes[0];
		this.updateSVG();
		App.svgDiv.appendChild(div);
	}

	static randomBox(xmin, xmax, ymin, ymax, speed) {
		let t = Math.random()*2*Math.PI;
		let x = Math.random() * Math.abs(xmax - xmin) + xmin;
		let y = Math.random() * Math.abs(ymax - ymin) + ymin;
		let vx = speed * Math.sin(t);
		let vy = speed * Math.cos(t);
		let newBox = new Box(Math.random()*400 + 100, x, y, vx, vy);
		return newBox;
	}

	update(dt, boxArray) {
		// update position
		this.x += this.vx * dt;
		this.y += this.vy * dt;

		// check bounds, if outside then push back in, reverse velocity
		let bounce = this.bounds(App.width, App.height)
		if (bounce) {
			//this.randomColours();
		}

		// check collision with other boxes
		boxArray.forEach(box => {
			this.collides(box);
		})

		this.updateSVG()
		
	}

	bounds(windowW, windowH) {
		let bounce = false;
		if (this.x <= 0) { this.vx *= -1; this.x = 1; bounce = true}
		if (this.y <= 0) { this.vy *= -1; this.y = 1; bounce = true}
		if (this.x >= windowW - this.w) { this.vx *= -1; this.x = windowW - this.w - 1; bounce = true}
		if (this.y >= windowH - this.h) { this.vy *= -1; this.y = windowH - this.h - 1; bounce = true}
		return bounce;
	}

	collides(box) {
		if (this == box) {
			return [0, 0, false];
		}
		let x1min = this.x;
		let x1max = this.x + this.w;
		let x2min = box.x;
		let x2max = box.x + box.w;
		let y1min = this.y;
		let y1max = this.y + this.h;
		let y2min = box.y;
		let y2max = box.y + box.h;
		let isOverlapping = (x1min < x2max && x2min < x1max && y1min < y2max && y2min < y1max);
		if (isOverlapping) {
			// right difference is our right edge to their left
			let rd = Math.abs(x1max - x2min);
			// left difference is our left to their right
			let ld = Math.abs(x1min - x2max);
			// top differecnce is our top to their bottom
			let td = Math.abs(y1min - y2max);
			// bottom difference is our bottom to their top
			let bd = Math.abs(y1max - y2min);
			let min = Math.min(rd, ld, td, bd);
			let vx;
			let vy;
			switch (min) {
				case rd:
					// move left
					this.x -= rd / 2;
					box.x += rd / 2;
					vx = this.vx;
					this.vx = box.vx;
					box.vx = vx;
					break;
				case ld:
					// move right
					this.x += ld / 2;
					box.x -= ld / 2;
					vx = this.vx;
					this.vx = box.vx;
					box.vx = vx;
					break;
				case td:
					// move down
					this.y += td / 2;
					box.y -= td / 2;
					vy = this.vy;
					this.vy = box.vy;
					box.vy = vy;
					break;
				case bd:
					// move up
					this.y -= bd / 2;
					box.y += bd / 2;
					vy = this.vy;
					this.vy = box.vy;
					box.vy = vy;
					break;
			}
		}
	}

	updateSVG() {
		this.svg.style.position = 'absolute';
		this.svg.style.left = this.x + 'px';
		this.svg.style.top = this.y + 'px';
		this.svg.style.width = `${this.w}px`;
		let paths = this.svg.querySelectorAll("path");
		let colourLookup = {
			"cls-1": this.fg,
			"cls-2": this.fg,
			"cls-3": this.bg1,
			"cls-4": this.bg1,
		}
		paths.forEach(path => {
			path.style.fill = colourLookup[path.classList[0]]
		})
		App.menuDiv.style.backgroundColor = colourLookup[App.menuDiv.classList[2]];

	}

	randomColours() {
		let i = Math.floor(Math.random() * App.colours.length);
		let palette = App.colours[i].split(",");
		this.bg1 = "#"+palette[1];
		this.bg2 = "#"+palette[3];
		this.fg = "#"+palette[3];
	}
}

App.playAudio = function() {
	App.audio.play();
}

App.pauseAudio = function() {
	App.audio.pause();
}



App.svg = `<svg 
		id="logo" 
		xmlns="http://www.w3.org/2000/svg" 
		viewBox="0 0 453.6 252.48"
		width="1">
			<defs>
			  <style>

			  </style>
			</defs>
			<path class="cls-4" d="M0,0h453.82v252.58H0V0Z"/>
			<path class="cls-2" d="M324.07,37.16c51.48,0,93.22,39.9,93.22,89.13s-41.74,89.13-93.22,89.13-93.22-39.9-93.22-89.13,41.74-89.13,93.22-89.13Z"/>
			<path class="cls-4" d="M352.57,77.47c6.52,0,11.81,8.18,11.81,18.27s-5.29,18.27-11.81,18.27-11.81-8.18-11.81-18.27,5.29-18.27,11.81-18.27Z"/>
			<path class="cls-4" d="M296.51,77.47c6.52,0,11.81,8.18,11.81,18.27s-5.29,18.27-11.81,18.27-11.81-8.18-11.81-18.27,5.29-18.27,11.81-18.27Z"/>
			<path class="cls-3" d="M324.79,180.57c17.25.01,31.96-6.15,44.2-18.24,3.38-3.34,6.25-7.11,8.67-11.23.83-1.41.72-2.41-.37-3.57-1.89-2.04-3.42-4.31-4.1-7.07-.18-.75-.4-1.53.51-1.86,1.01-.36,1.34.43,1.62,1.22,2.65,7.29,8.83,11.74,16.48,11.87.88.01,1.87,0,1.69,1.21-.15,1.07-1.15,1.36-2.06,1.17-2.69-.57-5.47-.86-7.96-2.11-1.33-.67-1.93-.21-2.53.95-5.98,11.71-14.81,20.66-26.45,26.82-6.53,3.46-13.52,5.63-20.82,6.74-12.15,1.85-23.9.13-35.06-4.81-13.09-5.79-23.24-14.92-29.88-27.72-.02-.05-.03-.1-.05-.15-1.28-2.48-1.28-2.49-3.88-1.44-2.38.96-4.9,1.29-7.4,1.74-.94.17-1.88-.2-1.94-1.3-.06-1.05.8-1.12,1.65-1.12,8.44.06,14.98-5.94,16.55-11.73.08-.3.21-.58.35-.86.42-.78,1.07-.7,1.75-.42.71.29.68.83.44,1.42-1.05,2.67-2.27,5.23-4.32,7.33-1.56,1.6-1.54,2.01-.35,3.95,6.83,11.12,16.27,19.2,28.3,24.3,8.42,3.57,14.09,4.67,24.93,4.89Z"/>
			<path class="cls-1" d="M188.64,59.93v-19.54l5.97,19.54h7.67l6.04-19.54v19.54h9.11v-25.03h-14.38l-4.63,15.25-4.29-15.25h-14.58v25.03h9.09Z"/>
			<path class="cls-1" d="M203.06,78.8c0,.06,0,.16,0,.3,0,1.26-.58,2.28-1.73,3.05-1.16.77-2.7,1.15-4.63,1.15-1.02,0-1.8-.17-2.36-.5-.55-.33-.83-.8-.83-1.41,0-.54.23-.94.69-1.2.46-.26,1.34-.45,2.63-.56.34-.03.83-.07,1.48-.1,2.22-.15,3.79-.45,4.7-.9.02.06.04.12.04.18ZM203.24,86.41c.1.45.23.86.39,1.24h9.14v-.42c-.32-.23-.55-.53-.68-.92-.13-.39-.2-.94-.2-1.67v-7.5c0-1.99-.21-3.51-.62-4.58-.41-1.07-1.11-1.98-2.09-2.73-.9-.7-2.24-1.23-4-1.58-1.76-.36-3.93-.53-6.5-.53-4.71,0-8.1.51-10.15,1.53-2.05,1.02-3.17,2.71-3.35,5.07h9.08c.11-.71.5-1.21,1.17-1.51.66-.29,1.77-.44,3.33-.44,1.2,0,2.15.16,2.85.48.7.32,1.05.75,1.05,1.28,0,.78-1.66,1.24-4.98,1.37-1.65.06-2.99.12-4.01.19-3.12.2-5.25.5-6.37.91-1.13.4-2.03,1.01-2.7,1.84-.33.43-.59.94-.77,1.53-.18.59-.27,1.24-.27,1.94,0,2.13.81,3.73,2.42,4.79,1.61,1.06,4.03,1.59,7.24,1.59,2.38,0,4.34-.26,5.89-.79,1.55-.52,2.87-1.36,3.97-2.5.02.5.08.97.18,1.41Z"/>
			<path class="cls-1" d="M187.94,114.39c2.1,1.1,5.39,1.65,9.87,1.65,5.04,0,8.67-.55,10.89-1.66,2.21-1.11,3.32-2.9,3.32-5.38,0-1.34-.31-2.4-.93-3.17-.62-.77-1.68-1.42-3.19-1.95-.77-.26-3.45-.59-8.06-1-.39-.03-.67-.06-.86-.07-.25-.02-.62-.06-1.1-.1-2.29-.18-3.43-.64-3.43-1.39,0-.46.24-.8.73-1.02.49-.22,1.25-.33,2.29-.33,1.22,0,2.11.15,2.67.44.55.29.86.77.92,1.42h10.11c-.14-2.22-1.26-3.86-3.35-4.92-2.1-1.06-5.3-1.59-9.6-1.59-4.55,0-7.87.52-9.95,1.56-2.08,1.04-3.12,2.68-3.12,4.92,0,1.12.24,2.09.71,2.91.47.82,1.15,1.43,2.03,1.81,1.51.67,4.41,1.21,8.72,1.62h.07c.27.02.67.06,1.2.12,2.66.24,4,.74,4,1.51,0,.44-.25.77-.76.99-.51.22-1.26.33-2.26.33-1.19,0-2.05-.15-2.58-.45-.53-.3-.83-.79-.9-1.46l-10.72.02c.1,2.37,1.2,4.1,3.3,5.2Z"/>
			<path class="cls-1" d="M187.94,142.12c2.1,1.1,5.39,1.65,9.87,1.65,5.04,0,8.67-.55,10.89-1.66,2.21-1.11,3.32-2.9,3.32-5.38,0-1.34-.31-2.4-.93-3.17-.62-.77-1.68-1.42-3.19-1.95-.77-.26-3.45-.59-8.06-1-.39-.03-.67-.06-.86-.07-.25-.02-.62-.06-1.1-.1-2.29-.18-3.43-.64-3.43-1.39,0-.46.24-.8.73-1.02.49-.22,1.25-.33,2.29-.33,1.22,0,2.11.15,2.67.44.55.29.86.77.92,1.42h10.11c-.14-2.22-1.26-3.86-3.35-4.92-2.1-1.06-5.3-1.59-9.6-1.59-4.55,0-7.87.52-9.95,1.56-2.08,1.04-3.12,2.68-3.12,4.92,0,1.12.24,2.09.71,2.91.47.82,1.15,1.43,2.03,1.81,1.51.67,4.41,1.21,8.72,1.62h.07c.27.02.67.06,1.2.12,2.66.24,4,.74,4,1.51,0,.44-.25.77-.76.99-.51.22-1.26.33-2.26.33-1.19,0-2.05-.15-2.58-.45-.53-.3-.83-.79-.9-1.46l-10.72.02c.1,2.37,1.2,4.1,3.3,5.2Z"/>
			<path class="cls-1" d="M202.99,170.83v-19.41h-8.96v19.41h8.96ZM202.99,149.83v-4.92h-8.96v4.92h8.96Z"/>
			<path class="cls-1" d="M203.19,198.55l9.16-19.41h-10l-3.14,8.83c-.18.52-.34,1.01-.48,1.48-.14.47-.26.93-.36,1.4-.09-.54-.21-1.07-.34-1.57-.14-.51-.29-1-.46-1.47l-3.12-8.66h-10.12l9.18,19.41h9.69Z"/>
			<path class="cls-1" d="M195.03,211.93c.94-.58,2.19-.86,3.75-.86,1.44,0,2.59.29,3.45.88.86.59,1.35,1.42,1.48,2.49h-10.43c.23-1.09.81-1.93,1.76-2.5ZM203,220.36c-.31.5-.82.87-1.53,1.13-.71.26-1.6.39-2.66.39-1.61,0-2.87-.29-3.76-.86-.89-.58-1.34-1.39-1.34-2.44h19.01v-.34c0-3.95-1.22-6.94-3.66-8.98-2.44-2.04-6.03-3.05-10.77-3.05-4.46,0-7.91.9-10.35,2.71-2.44,1.81-3.65,4.36-3.65,7.67s1.22,5.84,3.65,7.65c2.44,1.81,5.88,2.71,10.35,2.71,4.01,0,7.23-.56,9.64-1.68,2.41-1.12,3.95-2.75,4.62-4.91h-9.56Z"/>
			<path class="cls-1" d="M150.62,120.18h17.4v-56.67h-55.72v21.59h16.06c-.94,4.05-3.55,7.24-7.83,9.58-4.27,2.34-9.62,3.51-16.06,3.51-8.59,0-15.28-2.44-20.07-7.32-4.79-4.88-7.18-11.73-7.18-20.54s2.43-15.67,7.29-20.85c4.86-5.17,11.31-7.76,19.36-7.76,4.81,0,8.92.99,12.31,2.97,3.4,1.98,6.13,4.99,8.2,9.04h42.37c-1.48-11.29-7.85-20.1-19.09-26.44-11.24-6.34-26.2-9.51-44.86-9.51-22.17,0-38.9,4.42-50.19,13.26-11.29,8.84-16.93,21.94-16.93,39.3s5.64,30.39,16.93,39.23c11.29,8.84,28.02,13.26,50.19,13.26,10.52,0,19.3-.92,26.34-2.77,7.04-1.84,12.81-4.74,17.3-8.7l4.18,8.84Z"/>
			<path class="cls-1" d="M50.4,226.84c9.96,5.76,24.25,8.64,42.87,8.64,23.43,0,40.59-2.86,51.47-8.57,10.88-5.71,16.33-14.68,16.33-26.92,0-8.18-2.72-14.69-8.16-19.53-5.44-4.83-13.67-8.04-24.69-9.61l-35.21-4.99c-6.03-.85-10-1.78-11.91-2.77-1.91-.99-2.87-2.43-2.87-4.32,0-2.02,1.24-3.63,3.71-4.82,2.47-1.19,5.87-1.79,10.19-1.79,5.94,0,10.55.8,13.83,2.39,3.28,1.6,5.17,3.97,5.67,7.12h44.93c-.81-10.84-6.27-18.82-16.39-23.95-10.12-5.13-25.57-7.69-46.35-7.69s-34.6,2.56-43.75,7.69c-9.15,5.13-13.73,13.27-13.73,24.42,0,8.37,3.02,15.04,9.07,20.04,6.05,4.99,15.05,8.21,27.02,9.65l28.87,3.58c4.68.59,8.14,1.52,10.39,2.8,2.25,1.28,3.37,2.98,3.37,5.09,0,2.38-1.29,4.17-3.88,5.36-2.59,1.19-6.49,1.79-11.7,1.79s-9.33-.73-12.35-2.19c-3.01-1.46-4.7-3.54-5.06-6.24l-46.82.07c.13,10.75,5.18,19,15.15,24.76Z"/>
			<path class="cls-3" d="M142.27,80.05c-.7.12-1.34.18-1.94.18-.51,0-1.03-.08-1.56-.23-.53-.15-.98-.39-1.36-.71-.38-.32-.67-.71-.87-1.17-.2-.46-.3-.96-.3-1.51,0-.18,0-.42.03-.72h9.51c.09-.42.13-.82.13-1.2,0-.82-.14-1.56-.43-2.23-.29-.67-.7-1.24-1.24-1.71-.54-.47-1.21-.82-2-1.02-.8-.21-1.63-.31-2.52-.31-.93,0-1.83.12-2.68.37s-1.62.68-2.29,1.28c-.67.6-1.19,1.38-1.56,2.32-.37.95-.56,1.92-.56,2.93,0,.91.16,1.78.48,2.6.32.83.82,1.52,1.49,2.09.67.57,1.46.96,2.35,1.17.89.21,1.91.32,3.04.32.65,0,1.29-.03,1.93-.1.64-.07,1.43-.19,2.36-.38.21-1.25.37-2.12.48-2.61-.96.29-1.79.5-2.48.63ZM136.63,73.52c.09-.23.22-.48.4-.73.18-.25.41-.48.69-.69s.6-.36.94-.46c.34-.11.69-.16,1.06-.16.31,0,.6.03.88.1s.51.16.72.28c.21.12.39.28.54.46.16.18.28.4.37.64.09.24.15.45.18.64.03.19.04.48.04.87h-6.07c.09-.4.17-.72.26-.95Z"/>
			<path class="cls-3" d="M149.86,82.18c.49,0,1.09,0,1.8.02l.05-2.29.45-10,.31-4.49c-.74.02-1.36.02-1.87.02-.38,0-1.02,0-1.92-.02-.04,2.61-.16,5.72-.34,9.31-.19,3.59-.34,6.08-.47,7.47,1.16-.02,1.82-.02,1.99-.02h0Z"/>
			<path class="cls-3" d="M156.9,82.18c.49,0,1.09,0,1.8.02l.05-2.29.45-10,.31-4.49c-.74.02-1.36.02-1.87.02-.38,0-1.02,0-1.92-.02-.04,2.61-.16,5.72-.34,9.31-.19,3.59-.34,6.08-.47,7.47,1.16-.02,1.82-.02,1.99-.02h0Z"/>
			<path class="cls-3" d="M101.93,227.69c-.24.03-.46.05-.68.05-.29,0-.57-.06-.83-.18-.26-.12-.45-.32-.56-.6-.12-.28-.18-.67-.18-1.18s.09-2.45.27-5.79h3.31c0-.48.03-1.27.09-2.37h-3.3c0-.97.04-2,.11-3.11-.92.21-1.54.35-1.86.41l-1.53.28c-.05,1.14-.1,1.95-.15,2.42h-1.95c-.03,1.09-.07,1.88-.12,2.37h1.87l-.3,5.11c-.06.98-.1,1.56-.1,1.74,0,.18-.01.32-.01.43,0,.42.06.82.18,1.21.12.39.34.73.67,1.02.33.29.75.49,1.25.61.51.11,1.08.17,1.72.17.36,0,.75-.02,1.17-.06.41-.04.99-.14,1.71-.29.22-1.22.39-2.06.49-2.51-.6.15-1.01.24-1.25.27Z"/>
			<path class="cls-3" d="M106.97,229.96l1.7.02.08-1.5c.03-.61.06-1.21.1-1.81-.96.02-1.53.02-1.7.02l-1.97-.02c-.06,1.61-.11,2.72-.14,3.31,1.22-.02,1.86-.02,1.93-.02h0Z"/>
		  </svg>`


App.colours = `585a5c,d0d026,ff6d5d,e92b16,303131,4cd5ff
c5c3c6,dedbde,7595c5,484c54,8092ae,687e9d
16192d,1b2038,232438,f1effa,ff1e91,ffffff
342421,5b403b,452221,ee9947,5b403b,fff897
bae4f5,7b88c4,3f367e,f4f8ff,a8c6db,5e14c5
7f2d44,b74047,2a0728,2ccdee,b74047,fff32c
f0eef1,fffaff,09bbf8,5b4dc0,4b1ead,9b35d6
3f0d08,1e0703,480803,c33232,1e0703,e82a1c
0026c7,0026c7,0026c7,ffffff,0026c7,ffffff
671f30,7e233c,3d3836,bfdce5,df8481,f0cbb9
543e36,3d2e2b,4b2b2e,f34a6c,3f2d28,f5d096
7d6552,6d5340,4f3522,e2c8b5,6d5340,e4cab9
d0c5bd,e0d6cb,58a9b0,326d64,e3d6ce,855a42
343434,697369,2d3830,7c867e,6a7267,6f9773
ad3341,2a0c13,1d5676,34add2,eb8f94,f4ebef
7e7b8b,cbc8d2,74b8d1,2b3949,7e7b8b,92308b
f4eded,5dbfdd,2a61a2,a0e440,2764a6,fbc700
50514c,817f7d,ff35d7,523964,817f7d,ff7f03
e9e8ed,e9e8ed,e9eaf6,c0c0c4,42b9e1,ff1e91
282821,181914,2e271c,e89b42,181914,787064
6d5340,b89e76,e1c9d2,66496b,b89e76,fef295
002b39,002b39,002b39,d7f6ff,5c6e7a,e2f7f3
1f181a,291f24,da8285,9a8c8d,1f181a,ff7d79
f33976,b5315d,f7d80d,ffeff8,bb3160,ffffff
cdc8cb,303032,e89533,5f2606,cdc8cb,ff9103
f41f79,ff8694,ffb644,c1364b,ff670d,761227
ff8062,ff8062,ff8062,fff5eb,ff8062,57455e
fcf3de,f4dca6,ff65a6,5f2226,f5dba8,ff69a8
000200,5d1b65,000001,fee8fd,5d1b65,eb2a93
fff7d3,fff7d3,fff7d3,522231,fff7d3,ff1f7b
e9e8ed,0e1122,942449,81828f,0e1122,005580
ffffff,ffffff,ffffff,050405,ffffff,fb2490
ff7f34,efc8b6,e68151,481a0d,efc8b6,3c1013
918a90,cc9393,4a525c,e99c99,cc9393,f7f9ac
2a303a,2a303a,b1655c,d1cddb,727584,c6c1c4
000000,000000,7f1c2f,ffa700,956c51,ff6700`.split("\n")

window.onload = App.init;