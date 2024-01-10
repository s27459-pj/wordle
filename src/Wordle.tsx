import { useMemo } from "react";
import "./Wordle.css";

function Wordle({
  answer,
  attempts = 6,
}: { answer: string; attempts?: number }) {
  return (
    <div className="wordle">
      {Array.from({ length: attempts }).map(() => (
        <WordleRow width={answer.length} />
      ))}
    </div>
  );
}

function WordleRow({ width }: { width: number }) {
  return (
    <div className="wordle__row">
      {Array.from({ length: width }).map(() => (
        <WordleCell state={CellState.Empty} />
      ))}
    </div>
  );
}

enum CellState {
  Empty = 0,
  Neutral = 1,
  Incorrect = 2, // Present but in the wrong position
  Correct = 3, // Correct and in the correct position
}

function WordleCell({ state }: { state: CellState }) {
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
  return <div className={`wordle__cell ${stateClassName}`} />;
}

export default Wordle;
