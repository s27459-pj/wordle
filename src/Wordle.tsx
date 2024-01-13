import { useCallback, useEffect, useMemo, useState } from "react";
import "./Wordle.css";

enum GameState {
  InProgress = 0,
  Won = 1,
  Lost = 2,
}

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
type Letter = {
  letter: string;
  status: CellState;
};

function Wordle({
  answer,
  attempts = 6,
}: { answer: string; attempts?: number }) {
  const [gameState, setGameState] = useState(GameState.InProgress);
  const [activeRow, setActiveRow] = useState(0);
  // prefill usedLetters with all letters in the alphabet
  const [letters, setLetters] = useState<Letter[]>(
    ALPHABET.map((letter) => ({ letter, status: CellState.Empty })),
  );

  const updateLetter = useCallback((letter: string, status: CellState) => {
    setLetters((letters) =>
      letters.map((l) => {
        if (l.letter === letter) {
          // Empty can be upgraded to any status
          if (l.status === CellState.Empty) return { ...l, status };
          // Neutral can be upgraded to Incorrect or Correct
          if (l.status === CellState.Neutral && status !== CellState.Empty)
            return { ...l, status };
          // Incorrect can only be upgraded to Correct
          if (l.status === CellState.Incorrect && status === CellState.Correct)
            return { ...l, status };
          // Correct can't be upgraded
          if (l.status === CellState.Correct) return l;
        }
        return l;
      }),
    );
  }, []);

  const handleRowSubmitGuess = useCallback(
    (guess: string) => {
      setActiveRow((activeRow) => activeRow + 1);
      for (const [i, letter] of guess.split("").entries()) {
        if (answer[i] === letter) {
          updateLetter(letter, CellState.Correct);
        } else if (answer.includes(letter)) {
          updateLetter(letter, CellState.Incorrect);
        } else {
          updateLetter(letter, CellState.Neutral);
        }
      }
      if (guess === answer) setGameState(GameState.Won);
      else if (activeRow === attempts - 1) setGameState(GameState.Lost);
    },
    [answer, attempts, activeRow, updateLetter],
  );

  const status = useMemo(() => {
    switch (gameState) {
      case GameState.Won:
        return "You guessed the correct word. Congrats!";
      case GameState.Lost:
        return `You ran out of attempts. Answer: ${answer.toUpperCase()}.`;
    }
  }, [gameState, answer]);

  return (
    <div className="wordle">
      {status && <div className="status">{status}</div>}
      {gameState === GameState.InProgress && (
        <input id="dummy-input" type="text" placeholder="Click to type..." />
      )}
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
      <WordleLetters letters={letters} />
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
      if (!ALPHABET.includes(e.key.toLowerCase())) return;
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

function WordleLetters({ letters }: { letters: Letter[] }) {
  return (
    <div className="used-letters">
      {letters.map(({ letter, status }) => {
        return <WordleLetter letter={letter} status={status} />;
      })}
    </div>
  );
}

function WordleLetter({ letter, status }: Letter) {
  const usedLetterClassName = useMemo(() => {
    switch (status) {
      case CellState.Empty:
        return "letter--empty";
      case CellState.Neutral:
        return "letter--neutral";
      case CellState.Incorrect:
        return "letter--incorrect";
      case CellState.Correct:
        return "letter--correct";
    }
  }, [status]);

  return <div className={`letter ${usedLetterClassName}`}>{letter}</div>;
}

export default Wordle;
