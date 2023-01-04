export class Game {
  ball;
  board;
  ended = false;

  constructor(width, height, stage) {
    this.ball = new Ball(0, 0);
    this.board = new Board(width, height, stage);
  }

  static fromBallandBoard(ball, board) {
    const game = new Game(0, 0, "");
    game.ball = ball;
    game.board = board;
    return game;
  }

  update(dt) {
    this.ball.update(dt);
    this.board.interact(this.ball);
    if (this.ball.gone) {
      this.ended = true;
    }
    return Game.fromBallandBoard(this.ball, this.board);
  }
}

export class Ball {
  x = 0;
  y = 0;
  vx = 0;
  vy = 0;
  ax = 0;
  ay = 0;
  gone = false;

  update(dt) {
    this.vx = this.vx + dt * this.ax;
    this.vy = this.vy + dt * this.ay;
    this.x = this.x + dt * this.vx;
    this.y = this.y + dt * this.vy;
  }
}

export class Obstacle {
  x = 0;
  y = 0;
  static symbol = "";

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * interact with a ball
   * @param {Ball} ball - The ball to interact with.
   */
  interact(ball) {
    throw new Error(
      'abstract export class function "interact should be implemented"'
    );
  }
}

export class Hole extends Obstacle {
  static symbol = "H";

  interact(ball) {}
}

export class Wall extends Obstacle {
  static symbol = "W";

  /**
   * interact with a ball
   * @param {Ball} ball - The ball to interact with.
   */
  interact(ball) {
    if (this.intersects(ball)) {
    }
  }

  get centerX() {
    return this.x + 1 / 2;
  }

  get centerY() {
    return this.y + 1 / 2;
  }

  /**
   * check intersect with a ball
   * @param {Ball} ball - The ball to interact with.
   */
  intersects(ball) {
    const normal = this.checkNormal(ball);
    if (normal) {
      const scalar = normal.x * ball.vx + normal.y * ball.vy;

      if (scalar > 0) {
        ball.vx = ball.vx - 2 * scalar * normal.x;
        ball.vy = ball.vy - 2 * scalar * normal.y;
      }
    }
  }

  checkNormal(ball) {
    const dist = { x: 0, y: 0 };

    dist.x = Math.abs(ball.x - this.centerX);
    dist.y = Math.abs(ball.y - this.centerY);

    if (dist.x > 1) {
      return false;
    }
    if (dist.y > 1) {
      return false;
    }

    if (dist.x <= 1 / 2) {
      if (ball.x - this.centerX > 0) {
        return { x: -1, y: 0 };
      } else {
        return { x: 1, y: 0 };
      }
    }
    if (dist.y <= 1 / 2) {
      if (ball.y - this.centerY > 0) {
        return { x: 0, y: -1 };
      } else {
        return { x: 0, y: 1 };
      }
    }

    const test = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];

    for (const check of test) {
      const corner_tl_dist =
        Math.pow(dist.x + check[0] / 2, 2) + Math.pow(dist.y + check[1] / 2, 2);

      if (corner_tl_dist <= 0.25) {
        const dir = {
          x: ball.x - this.centerX + check[0] / 2,
          y: ball.y - this.centerY + check[1] / 2,
        };

        const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);

        return { x: dir.x / length, y: dir.y / length };
      } else {
        return false;
      }
    }
  }
}

const validObstacles = {
  [Wall.symbol]: Wall,
  [Hole.symbol]: Hole,
};

export class Board {
  width = 0;
  height = 0;
  /**
   * @type {Obstacle[]}
   */
  obstacles = [];
  rotateX;
  rotateY;

  /**
   * create a Board with a stage string
   * @param {number} width - width
   * @param {number} height - height
   * @param {string} stage - stage string, can include newlines
   */
  constructor(width, height, stage) {
    this.width = width;
    this.height = height;
    this.rotateX = 0;
    this.rotateY = 0;
    this.obstacles = [];

    const stageSequence = stage.replaceAll("\n", "");

    if (stageSequence.length !== this.width * this.height) {
      throw new Error("stage is not valid wrong width / height");
    }

    for (let i = 0; i < stageSequence.length; i++) {
      const symbol = stageSequence[i];

      const x = i % width;
      const y = Math.floor(i / width);

      if (Object.keys(validObstacles).includes(symbol)) {
        this.obstacles.push(new validObstacles[symbol](x, y));
      }
    }
  }

  interact(ball) {
    for (const obstacle of this.obstacles) {
      obstacle.interact(ball);
    }
  }
}
