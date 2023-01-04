import "./App.css";
import { useEffect, useState } from "react";
import { Game } from "./game/game";

const stage = `
___W_W
___WWW
W____W
W__W_W
W__WWW
WWWWWW
`;

const width = 6;
const height = 6;

function App() {
  const [game, setGame] = useState(new Game(width, height, stage));

  useEffect(() => {
    const interval = setInterval(() => {
      setGame(game.update(0.02));
    }, 20);

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
        {game.ball.x}, {game.ball.y}
        <div
          className="ball"
          style={{
            left: (((game.ball.x - 0.5) * 100.0) / width).toString() + "%",
            top: (((game.ball.y - 0.5) * 100.0) / height).toString() + "%",
            width: (100.0 / width).toString() + "%",
            height: (100.0 / height).toString() + "%",
          }}
        ></div>
        {game.board.obstacles.map((obstacle) => {
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
