import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Game } from "./game/game";

const stage = `
WWWWWWWWWWWW
WB_W____HWWW
W__W__H____W
W__W_______W
W_HW_HWWW__W
W__W___WH__W
W__W___W__WW
WH_WWWWW___W
W__________W
W___H______W
W__W__WHHHHW
WWWWWWWWWWWW
`;

const width = 12;
const height = 12;

const gravity = 15;

const globalGame = new Game(width, height, stage);

function App() {
  const game = useRef(globalGame);
  const [gameState, setGameState] = useState({
    ball: { x: 0, y: 0 },
    board: { obstacles: [] },
    ended: false,
  });
  const [control, setControl] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      game.current.update(0.01);
      setGameState(game.current.getState());
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const keydown = (event) => {
    if (event.repeat) return;
    switch (event.key) {
      case "ArrowLeft":
        setControl((control) => ({ ...control, x: control.x - gravity }));
        break;
      case "ArrowRight":
        setControl((control) => ({ ...control, x: control.x + gravity }));
        break;
      case "ArrowUp":
        setControl((control) => ({ ...control, y: control.y - gravity }));
        break;
      case "ArrowDown":
        setControl((control) => ({ ...control, y: control.y + gravity }));
        break;
      default:
        break;
    }
  };

  const keyup = (event) => {
    switch (event.key) {
      case "ArrowLeft":
        setControl((control) => ({ ...control, x: control.x + gravity }));
        break;
      case "ArrowRight":
        setControl((control) => ({ ...control, x: control.x - gravity }));
        break;
      case "ArrowUp":
        setControl((control) => ({ ...control, y: control.y + gravity }));
        break;
      case "ArrowDown":
        setControl((control) => ({ ...control, y: control.y - gravity }));
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
    };
  }, []);

  useEffect(() => {
    game.current.changeControl(control.x, control.y);
  }, [control, game]);

  useEffect(() => {
    if (gameState.ended) {
      game.current = new Game(width, height, stage);
    }
  }, [gameState]);

  return (
    <div className="App">
      <div
        className="board"
        style={{
          gridTemplateColumns: ((100.0 / width).toString() + "%").repeat(width),
          gridTemplateRows: ((100.0 / height).toString() + "%").repeat(height),
        }}
      >
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
