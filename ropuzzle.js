
class Turtle {

	constructor(canvas, levelName) {
		this.canvas = canvas;
		this.level = levels[levelName];
		this.posx = 0;
		this.posy = 0;
		this.enabled = true;

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
		return this.location(this.posx, this.posy) == 'R';
	}

	async fd(n = 1) {
		if (!this.enabled) return false;
		let dx = sin4(this.dir);
		let dy = - cos4(this.dir);
		for (let i = 0; i < n; i++) {
			let nx = this.posx + dx;
			let ny = this.posy + dy;
			await this.animFd(dx, dy);
			this.posx = nx;
			this.posy = ny;
			if (this.location(nx, ny) == '_') {
				this.enabled = false;
				await this.drawA();
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
	location(x, y) {
		if (y < 0) return '_';
		if (y >= this.level.length) return '_';
		let row = this.level[y];
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
	level1A: [
		"_RWWWWWR_",
		"_W_____W_",
		"_W_RWS_W_",
		"_W_W___W_",
		"_W_W___W_",
		"_W_RWWWR_",
		"_B_______"
	],
	level1B: [
		"____RWWS_",
		"____W____",
		"_RWWWWWWR",
		"_W__W___W",
		"_W__W___W",
		"_W__RWWWR",
		"_B_______",
	]
}
