import { useState } from "react";
import "./App.css";
import Wordle from "./Wordle";
import wordlist from "./assets/wordlist.json";

const getRandomAnswer = () =>
  wordlist[Math.floor(Math.random() * wordlist.length)];

function App() {
  const [answer, _] = useState(getRandomAnswer());

  return (
    <main>
      <h1>Wordle</h1>
      {<Wordle answer={answer} />}
    </main>
  );
}

export default App;
