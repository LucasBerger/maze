import "./App.css";
import { useEffect, useRef, useState } from "react";
import { Game } from "./game/game";

const stage1 = `
WWWWWWWWWWWW
WB_W____HWWW
W__W__H____W
W__W_______W
W_HW_HWWW__W
W__W___WH__W
W__W__GW__WW
WH_WWWWW___W
W__________W
W___H______W
W__W__WHHHHW
WWWWWWWWWWWW
`;

const stage2 = `
WWWWWWWWWWWW
WHHHHHHHHHHW
WH____HHHHHW
WH_B______HW
WH____HH__HW
WHHHHHHH__HW
W___H_____HW
WH______HHHW
W__H__HHHHHW
W_________HW
WHHHH____GHW
WWWWWWWWWWWW
`;

const stages = [stage1, stage2];

const width = 12;
const height = 12;

const gravity = 15;

const globalGame = new Game(width, height, stage1);

function App() {
  const game = useRef(globalGame);
  const [gameState, setGameState] = useState({
    ball: { x: 0, y: 0 },
    board: { obstacles: [] },
    ended: false,
    won: false,
  });
  const [control, setControl] = useState({ x: 0, y: 0 });
  const [stop, setStop] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const interval = useRef(undefined);

  useEffect(() => {
    if (!stop) {
      interval.current = setInterval(() => {
        game.current.update(0.01);
        setGameState(game.current.getState());
      }, 10);
    } else {
      clearInterval(interval.current);
    }

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, [stop]);

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

  const handleOrientation = (event) => {
    const beta = event.beta;
    const gamma = event.gamma;
    setControl({ x: gamma * 3, y: beta * 3 });
  };

  const setupOrientation = () => {
    if (window.DeviceOrientationEvent) {
      DeviceOrientationEvent.requestPermission()
        .then((permissionState) => {
          if (permissionState === "granted") {
            window.addEventListener(
              "deviceorientation",
              handleOrientation,
              true
            );
          }
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    return () => {
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  useEffect(() => {
    game.current.changeControl(control.x, control.y);
  }, [control, game]);

  useEffect(() => {
    if (gameState.ended) {
      setStop(true);
      let nextStage = currentStage;
      if (gameState.won) {
        nextStage = currentStage + 1;
        setCurrentStage(nextStage);
      }
      setTimeout(() => {
        if (stages.length > nextStage - 1) {
          game.current = new Game(width, height, stages[nextStage - 1]);
          setStop(false);
        }
      }, 1000);
    }
    // eslint-disable-next-line
  }, [gameState]);

  return (
    <div className="App">
      <p className="level">Level {currentStage}</p>
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
        {stages.length < currentStage && <div className="screen">You Won</div>}
        {gameState.ended && !gameState.won && (
          <div className="screen">You Lost</div>
        )}
      </div>
      {(window.DeviceOrientationEvent?.requestPermission ?? false) && (
        <button
          onClick={setupOrientation}
          className={"request-button"}
          style={{ marginBottom: 50 }}
        >
          Orientation Control
        </button>
      )}
    </div>
  );
}

export default App;
