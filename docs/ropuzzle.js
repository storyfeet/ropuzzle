
export function getTurtles(fnCanvas, levelName) {
	let res = [];
	let lev = levels[levelName];
	if (!lev) {
		console.log("NO Levels by that name");
		return;
	}
	for (let l in levels[levelName]) {
		res.push(new Turtle(fnCanvas(), lev[l]));
	}

	return res;
}

class Turtle {

	constructor(canvas, level) {
		this.canvas = canvas;
		this.level = level;
		this.posx = 0;
		this.posy = 0;
		this.enabled = true;
		this.actionCounter = 0;

		for (let i = 0; i < this.level.length; i++) {
			for (let j = 0; j < this.level[i].length; j++) {
				if (this.level[i][j] == 'B') {
					this.posy = i;
					this.posx = j;
				}
			}
		}
		this.dir = 0;

		this.draw();
	}

	action() {
		this.actionCounter += 1;
		if (this.actionCounter > 1000) {
			this.error("Action Limit 1000 reached");
		}
	}

	async drawA() {
		await new Promise((resolve) => {
			requestAnimationFrame(() => { this.draw(); resolve() })
		});
	}

	draw() {
		let tileSize = Math.min(this.canvas.width / this.level[0].length,
			this.canvas.height / this.level.length);

		let ctx = this.canvas.getContext("2d");
		ctx.fillStyle = "lightblue";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);


		for (let y = 0; y < this.level.length; y++) {
			let row = this.level[y];
			for (let x = 0; x < row.length; x++) {
				switch (row[x]) {
					case 'W': case 'B':
						tile(ctx, x, y, tileSize);
						break;
					case 'R':
						tile(ctx, x, y, tileSize, "red");
						break;
					case 'S':
						tile(ctx, x, y, tileSize);
						star(ctx, x, y, tileSize);
						break;
					default:
				}

			}
		}

		turtle(ctx, this.posx, this.posy, this.dir, tileSize, this.enabled ? "blue" : "red");
	}

	onRed() {
		this.action();
		return this.location(this.posx, this.posy) == 'R';
	}

	async fd(n = 1) {
		this.action();
		if (!this.enabled) {
			this.error("Turtle has failed");
			return
		}
		let dx = sin4(this.dir);
		let dy = - cos4(this.dir);
		for (let i = 0; i < n; i++) {
			let nx = this.posx + dx;
			let ny = this.posy + dy;
			await this.animFd(dx, dy);
			this.posx = nx;
			this.posy = ny;
			let loc = this.location(nx, ny);
			if (loc == '_' || loc == 'S') {
				this.enabled = false;
				await this.drawA();
				this.error("Mission Complete");
				return false;
			}
			await this.drawA();
			await sleep(200);
		}

		return true;
	}

	async animFd(dx, dy) {
		for (let i = 0; i < 10; i += 10) {
			this.posx += 0.1 * dx;
			this.posy += 0.1 * dy;
			await this.drawA();
			await sleep(100);
		}
	}

	async rt(n = 1) {
		this.action();
		if (!this.enabled) return false;
		for (let i = 0; i < n; i++) {
			let ndir = this.dir + 1;
			await this.animRt();
			this.dir = ndir % 4;

			await this.drawA();
			await sleep(200);

		}
		return true;
	}

	async animRt() {
		for (let i = 0; i < 10; i += 10) {
			this.dir += 0.1;
			await this.drawA();
			await sleep(100);
		}
	}

	async lt(n = 1) {
		this.action();
		if (!this.enabled) return false;
		for (let i = 0; i < n; i++) {
			let ndir = this.dir - 1;
			await this.animLt();
			if (ndir < 0) ndir += 4;
			this.dir = ndir % 4;
			await this.drawA();
			await sleep(200);
		}
		return true;
	}

	async animLt() {
		for (let i = 0; i < 10; i += 10) {
			this.dir -= 0.1;
			await this.drawA();
			await sleep(100);
		}
	}

	error(s) {
		this.quickMessage(s);
		throw new Error(s);
	}

	async message(s) {
		quickMessage(s);
		await sleep(1500);
	}

	quickMessage(s) {
		console.log(s);
		let ctx = this.canvas.getContext("2d");
		let fontsize = this.canvas.width / 20;

		ctx.fillStyle = "white";
		ctx.fillRect(fontsize, 0, fontsize * s.length * 0.6, fontsize * 1.3);

		ctx.font = `${fontsize}px serif`;
		ctx.fillStyle = "black";
		ctx.fillText(s, fontsize, fontsize);
	}

	location(x, y) {
		if (y < 0) return '_';
		if (y >= this.level.length) return '_';
		let row = this.level[y];
		if (row === undefined) {
			return '_';
		}
		if (x < 0) return '_';
		if (x > row.length) return '_';
		return row[x];
	}

}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function cos4(dir) {
	switch (dir % 4) {
		case 0: return 1;
		case 1: case 3: return 0;
		default: return -1;
	}
}
function sin4(dir) {
	switch (dir % 4) {
		case 0: case 2: return 0;
		case 1: return 1;
		default: return -1;
	}
}

function tile(ctx, x, y, size, color = "white") {
	ctx.fillStyle = color;
	ctx.fillRect(x * size, y * size, size, size);
	ctx.lineStyle = "black";
	ctx.lineWidth = size / 20;
	ctx.strokeRect(x * size, y * size, size, size);
}

function star(ctx, x, y, size) {
	ctx.fillStyle = "yellow";
	ctx.strokeStyle = "black";
	ctx.lineWidth = size / 25;

	ctx.fillRect((x + 0.2) * size, (y + 0.2) * size, size * 0.6, size * 0.6);
	ctx.strokeRect((x + 0.2) * size, (y + 0.2) * size, size * 0.6, size * 0.6);
}

function turtle(ctx, x, y, dir, size, color = "blue") {
	ctx.save();
	ctx.translate((x + 0.5) * size, (y + 0.5) * size);
	ctx.rotate(dir * Math.PI / 2);
	ctx.translate(-size * 0.5, -size * 0.5);
	ctx.beginPath();
	ctx.moveTo(size * 0.5, size * 0.1);
	ctx.lineTo(size * 0.8, size * 0.8);
	ctx.lineTo(size * 0.2, size * 0.8);
	ctx.lineTo(size * 0.5, size * 0.1);

	ctx.fillStyle = color;
	ctx.strokeStyle = "green";
	ctx.fill();
	ctx.stroke();
	ctx.closePath();
	ctx.restore();


}


export function listLevels() {
	let res = [];
	for (p in levels) {
		res.push(p);
	}
	return res;
}

export function newTurtle(canvas, level) {
	return new Turtle(canvas, level);
}



const levels = {
	level1: [
		[
			"_RWWWWWR_",
			"_W_____W_",
			"_W_RWS_W_",
			"_W_W___W_",
			"_W_W___W_",
			"_W_RWWWR_",
			"_B_______"
		],
		[
			"____RWWS_",
			"____W____",
			"_RWWWWWWR",
			"_W__W___W",
			"_W__W___W",
			"_W__RWWWR",
			"_B_______",
		]
	],
	level2: [
		[
			"________S_",
			"________W_",
			"_______RR_",
			"_______W__",
			"____RWWR__",
			"____W_____",
			"____W_____",
			"__RWR_____",
			"__B_______"
		],
		[
			"_____RWWS_",
			"_____W____",
			"___RWR____",
			"___W______",
			"___W______",
			"__RR______",
			"__W_______",
			"_RR_______",
			"_B________",

		]
	],
	level3: [
		[
			"_________",
			"_______S_",
			"_RWWWWWW_",
			"_W_______",
			"_W_______",
			"_W_______",
			"_W_______",
			"_W_______",
			"_B_______",
		],
		[
			"______",
			"____S_",
			"_RWWW_",
			"_W____",
			"_W____",
			"_B____",
		]
	],
	level4: [
		[
			"________",
			"_RRWWRR_",
			"_W____R_",
			"_R____R_",
			"_W____W_",
			"_R_SRWR_",
			"_W______",
			"_B______",
		],
		[
			"________",
			"_RWWRRR_",
			"_W____R_",
			"_R____R_",
			"_W_RS_W_",
			"_W_R__W_",
			"_W_R__W_",
			"_W_W__W_",
			"_W_RRRR_",
			"_R______",
			"_B______",
		]
	]

}
