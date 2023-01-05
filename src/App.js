import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Game } from "./game/game";

// const stage = `
// ___W_W
// ___WWW
// W____W
// W__W_W
// W__WWW
// WWWWWW
// `;

const stage = `
W__B__
W_____
W_____
W_____
W_____
WWWWWW
`;

const width = 6;
const height = 6;

const globalGame = new Game(width, height, stage);

function App() {
  const game = useRef(globalGame);
  const [gameState, setGameState] = useState({
    ball: { x: 0, y: 0 },
    board: { obstacles: [] },
    ended: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      game.current.update(0.01);
      setGameState(game.current.getState());
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="App">
      <div
        className="board"
        style={{
          gridTemplateColumns: ((100.0 / width).toString() + "%").repeat(width),
          gridTemplateRows: ((100.0 / height).toString() + "%").repeat(height),
        }}
      >
        {gameState.ball.x}, {gameState.ball.y}
        <div
          className="ball"
          style={{
            left: (((gameState.ball.x - 0.5) * 100.0) / width).toString() + "%",
            top: (((gameState.ball.y - 0.5) * 100.0) / height).toString() + "%",
            width: (100.0 / width).toString() + "%",
            height: (100.0 / height).toString() + "%",
          }}
        ></div>
        {gameState.board.obstacles.map((obstacle) => {
          return (
            <div
              key={obstacle.x + ", " + obstacle.y}
              className={"obstacle-" + obstacle.constructor.symbol}
              style={{
                gridColumnStart: obstacle.x + 1,
                gridColumnEnd: obstacle.x + 2,
                gridRowStart: obstacle.y + 1,
                gridRowEnd: obstacle.y + 2,
              }}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
