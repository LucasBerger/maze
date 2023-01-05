export class Game {
  ball;
  board;
  ended = false;

  constructor(width, height, stage) {
    const ballPos = stage.replaceAll("\n", "").indexOf("B");
    if (ballPos !== -1) {
      this.ball = new Ball(
        (ballPos % width) + 0.5,
        Math.floor(ballPos / width) + 0.5
      );
    } else {
      this.ball = new Ball(0.5, 0.5);
    }
    this.board = new Board(width, height, stage);
  }

  changeControl(x, y) {
    this.ball.ax = x;
    this.ball.ay = y;
  }

  update(dt) {
    this.ball.update(dt);
    this.board.interact(this.ball);
    if (this.ball.gone) {
      this.ended = true;
    }
  }

  getState() {
    return {
      ball: this.ball.getState(),
      board: this.board.getState(),
      ended: this.ended,
    };
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

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  update(dt) {
    this.vx = this.vx * 0.999 + dt * this.ax;
    this.vy = this.vy * 0.999 + dt * this.ay;
    this.x = this.x + dt * this.vx;
    this.y = this.y + dt * this.vy;
  }

  getState() {
    return {
      x: this.x,
      y: this.y,
    };
  }
}

export class Obstacle {
  x = 0;
  y = 0;
  static symbol = "";
  unhandled = true;
  stage = 0;

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

  static reset() {}
}

export class Hole extends Obstacle {
  static symbol = "H";

  interact(ball) {}
}

export class Wall extends Obstacle {
  static symbol = "W";
  static hit = false;

  get centerX() {
    return this.x + 1 / 2;
  }

  get centerY() {
    return this.y + 1 / 2;
  }

  static reset() {
    Wall.hit = false;
  }

  /**
   * check intersect with a ball
   * @param {Ball} ball - The ball to interact with.
   */
  interact(ball) {
    if (Wall.hit) {
      return true;
    }
    let normal;
    switch (this.stage) {
      case 0:
        normal = this.checkRectNormal(ball);
        if (normal) {
          console.log("rect");
          if (normal.x !== 0) {
            ball.x = this.centerX + normal.x * 1;
          } else {
            ball.y = this.centerY + normal.y * 1;
          }
        }
        break;
      case 1:
        normal = this.checkCornerNormal(ball);
        break;

      default:
        return true;
    }
    if (normal) {
      const scalar = normal.x * ball.vx + normal.y * ball.vy;
      if (scalar < 0) {
        ball.vx = 0.5 * (ball.vx - 2 * scalar * normal.x);
        ball.vy = 0.5 * (ball.vy - 2 * scalar * normal.y);
      }

      Wall.hit = true;

      return true;
    } else {
      return false;
    }
  }

  checkCornerNormal(ball) {
    const dist = { x: 0, y: 0 };

    dist.x = Math.abs(ball.x - this.centerX);
    dist.y = Math.abs(ball.y - this.centerY);

    if (dist.x > 1) {
      return false;
    }
    if (dist.y > 1) {
      return false;
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
  checkRectNormal(ball) {
    const dist = { x: 0, y: 0 };

    dist.x = Math.abs(ball.x - this.centerX);
    dist.y = Math.abs(ball.y - this.centerY);

    if (dist.x > 1) {
      return false;
    }
    if (dist.y > 1) {
      return false;
    }

    if (dist.y > dist.x) {
      if (dist.y <= 1 && dist.x < 1 / 2) {
        if (ball.y - this.centerY > 0) {
          return { x: 0, y: 1 };
        } else {
          return { x: 0, y: -1 };
        }
      }
      if (dist.x <= 1 && dist.y < 1 / 2) {
        if (ball.x - this.centerX > 0) {
          return { x: 1, y: 0 };
        } else {
          return { x: -1, y: 0 };
        }
      }
    } else {
      if (dist.x <= 1 && dist.y < 1 / 2) {
        if (ball.x - this.centerX > 0) {
          return { x: 1, y: 0 };
        } else {
          return { x: -1, y: 0 };
        }
      }
      if (dist.y <= 1 && dist.x < 1 / 2) {
        if (ball.y - this.centerY > 0) {
          return { x: 0, y: 1 };
        } else {
          return { x: 0, y: -1 };
        }
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

  getState() {
    return {
      obstacles: this.obstacles,
    };
  }

  interact(ball) {
    for (const obstacleTypes of Object.keys(validObstacles)) {
      validObstacles[obstacleTypes].reset();
    }

    for (const obstacle of this.obstacles) {
      obstacle.unhandled = true;
      obstacle.stage = 0;
    }
    while (
      this.obstacles.some((value) => value.unhandled && value.stage < 10)
    ) {
      for (const obstacle of this.obstacles
        .filter((value) => value.unhandled)
        .sort((a, b) => distSq(ball, a) - distSq(ball, b))) {
        obstacle.unhandled = !obstacle.interact(ball);
        obstacle.stage++;
      }
    }
  }
}

const distSq = (ball, obstacle) => {
  const x = ball.x - obstacle.x;
  const y = ball.y - obstacle.y;

  return x * x + y * y;
};
