export class MiniMap {
    constructor(map, tileSize = 20, viewSize = 13) {
        this.map = map;
        this.tileSize = tileSize;
        this.viewSize = viewSize;

        this.half = Math.floor(viewSize / 2);

        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = viewSize * tileSize;
        this.canvas.height = viewSize * tileSize;

        this.canvas.style.position = "absolute";
        this.canvas.style.right = "20px";
        this.canvas.style.top = "20px";
        this.canvas.style.background = "rgba(0,0,0,0.6)";
        this.canvas.style.border = "2px solid white";

        document.body.appendChild(this.canvas);
    }

    drawView(px, py, enemies = [], pellets = []) {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let vy = 0; vy < this.viewSize; vy++) {
            for (let vx = 0; vx < this.viewSize; vx++) {

                const mapX = px + vx - this.half;
                const mapY = py + vy - this.half;

                let color = "#000";

                if (
                    mapY >= 0 && mapY < this.map.length &&
                    mapX >= 0 && mapX < this.map[0].length
                ) {
                    color = this.map[mapY][mapX] === 1 ? "#222" : "#aaa";
                }

                ctx.fillStyle = color;
                ctx.fillRect(
                    vx * this.tileSize,
                    vy * this.tileSize,
                    this.tileSize,
                    this.tileSize
                );
            }
        }

        enemies.forEach(e => {
            const dx = e.x - px;
            const dy = e.y - py;

            if (
                Math.abs(dx) <= this.half &&
                Math.abs(dy) <= this.half
            ) {
                ctx.fillStyle = e.color;
                ctx.beginPath();
                ctx.arc(
                    (dx + this.half + 0.5) * this.tileSize,
                    (dy + this.half + 0.5) * this.tileSize,
                    this.tileSize * 0.3,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        pellets.forEach(p => {
            const dx = p.x - px;
            const dy = p.y - py;

            if (
                Math.abs(dx) <= this.half &&
                Math.abs(dy) <= this.half
            ) {
                ctx.fillStyle = "#FFFF00";
                ctx.beginPath();
                ctx.arc(
                    (dx + this.half + 0.5) * this.tileSize,
                    (dy + this.half + 0.5) * this.tileSize,
                    this.tileSize * 0.3,
                    0, Math.PI * 2
                );
                ctx.fill();
            }
        });

        ctx.fillStyle = "#00ff00";
        ctx.beginPath();
        ctx.arc(
            (this.half + 0.5) * this.tileSize,
            (this.half + 0.5) * this.tileSize,
            this.tileSize * 0.35,
            0, Math.PI * 2
        );
        ctx.fill();
    }

    render(playerTile, enemyTiles, pelletTiles) {
        this.drawView(playerTile.x-1, playerTile.y-1, enemyTiles, pelletTiles);
    }
}
