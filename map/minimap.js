export class MiniMap {
    constructor(map, tileSize = 6) {
        this.map = map;
        this.tileSize = tileSize;

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        
        this.canvas.width = map[0].length * tileSize;
        this.canvas.height = map.length * tileSize;

        this.canvas.style.position = "absolute";
        this.canvas.style.right = "20px";
        this.canvas.style.top = "20px";
        this.canvas.style.background = "rgba(0,0,0,0.4)";
        this.canvas.style.border = "2px solid white";
        
        document.body.appendChild(this.canvas);
    }

    drawWalls() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[0].length; x++) {
                if (this.map[y][x] === 1) {
                    ctx.fillStyle = "#222";
                } else {
                    ctx.fillStyle = "#aaa";
                }
                ctx.fillRect(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        }
    }

    drawPlayer(px, py) {
        const ctx = this.ctx;

        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(
            (px-1) * this.tileSize + this.tileSize / 2,
            (py-1) * this.tileSize + this.tileSize / 2,
            this.tileSize * 0.3,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    drawEnemy(ex, ey) {
        const ctx = this.ctx;

        ctx.fillStyle = "#ff0000";
        ctx.beginPath();
        ctx.arc(
            ex * this.tileSize + this.tileSize / 2,
            ey * this.tileSize + this.tileSize / 2,
            this.tileSize * 0.3,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    drawPellets(pelletsTiles) {
        const ctx = this.ctx;

        ctx.fillStyle = "#ffff66";

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[0].length; x++) {

                if (pelletsTiles[y][x] === 2) {
                    ctx.beginPath();
                    ctx.arc(
                        x * this.tileSize + this.tileSize / 2,
                        y * this.tileSize + this.tileSize / 2,
                        this.tileSize * 0.15,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
            }
        }
    }

    render(playerTile, enemyTile) {
        this.drawWalls();
        //this.drawPellets(pelletsTiles);
        this.drawPlayer(playerTile.x, playerTile.y);
        this.drawEnemy(enemyTile.x, enemyTile.y);
    }
}
