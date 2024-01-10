import "./App.css";
import Wordle from "./Wordle";

function App() {
  // TODO: Randomize the answer
  return (
    <main>
      <h1>Wordle</h1>
      {<Wordle answer="music" />}
    </main>
  );
}

export default App;
