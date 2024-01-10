import { useCallback, useEffect, useMemo, useState } from "react";
import "./Wordle.css";

enum GameState {
  InProgress = 0,
  Won = 1,
  Lost = 2,
}

function Wordle({
  answer,
  attempts = 6,
}: { answer: string; attempts?: number }) {
  const [gameState, setGameState] = useState(GameState.InProgress);
  const [activeRow, setActiveRow] = useState(0);

  const handleRowSubmitGuess = useCallback(
    (guess: string) => {
      setActiveRow((activeRow) => activeRow + 1);
      if (guess === answer) setGameState(GameState.Won);
      if (activeRow === attempts - 1) setGameState(GameState.Lost);
    },
    [answer, attempts, activeRow],
  );

  const status = useMemo(() => {
    switch (gameState) {
      case GameState.Won:
        return "You guessed the correct word. Congrats!";
      case GameState.Lost:
        return "You ran out of attempts. Game over!";
    }
  }, [gameState]);

  return (
    <div className="wordle">
      {status && <div className="status">{status}</div>}
      <div className="row-wrapper">
        {Array.from({ length: attempts }).map((_, idx) => (
          <WordleRow
            answer={answer}
            width={answer.length}
            active={gameState === GameState.InProgress && idx === activeRow}
            onRowSubmitGuess={handleRowSubmitGuess}
          />
        ))}
      </div>
    </div>
  );
}

function WordleRow({
  answer,
  width,
  active,
  onRowSubmitGuess,
}: {
  answer: string;
  width: number;
  active: boolean;
  onRowSubmitGuess: (guess: string) => void;
}) {
  const [guess, setGuess] = useState<string[]>([]);

  const submitGuess = useCallback(() => {
    onRowSubmitGuess(guess.join(""));
  }, [guess, onRowSubmitGuess]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setGuess((guess) => guess.slice(0, -1));
        return;
      }
      if (e.key === "Enter" && guess.length === width) {
        // TODO: Check if the guess is a correct word
        submitGuess();
        return;
      }
      if (!/^[a-zA-Z]$/.test(e.key)) return;
      if (guess.length >= width) return;
      setGuess((guess) => [...guess, e.key.toLowerCase()]);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [width, active, guess, submitGuess]);

  const getCellState = useCallback(
    (idx: number) => {
      if (guess[idx] === undefined) return CellState.Empty;
      if (guess[idx] === answer[idx]) return CellState.Correct;
      if (answer.includes(guess[idx])) return CellState.Incorrect;
      return CellState.Neutral;
    },
    [answer, guess],
  );

  return (
    <div className="wordle__row">
      {Array.from({ length: width }).map((_, idx) =>
        active ? (
          <WordleCell state={CellState.Empty} letter={guess[idx]} />
        ) : (
          <WordleCell state={getCellState(idx)} letter={guess[idx]} />
        ),
      )}
    </div>
  );
}

enum CellState {
  Empty = 0,
  Neutral = 1,
  Incorrect = 2, // Present but in the wrong position
  Correct = 3, // Correct and in the correct position
}

function WordleCell({ state, letter }: { state: CellState; letter?: string }) {
  const stateClassName = useMemo(() => {
    switch (state) {
      case CellState.Empty:
        return "wordle__cell--empty";
      case CellState.Neutral:
        return "wordle__cell--neutral";
      case CellState.Incorrect:
        return "wordle__cell--incorrect";
      case CellState.Correct:
        return "wordle__cell--correct";
    }
  }, [state]);
  return <div className={`wordle__cell ${stateClassName}`}>{letter}</div>;
}

export default Wordle;
