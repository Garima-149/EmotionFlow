import { useState } from "react";
import '../Styles/global.css';
import '../Styles/navbar.css';
import '../Styles/mood.css';

const symbols = ["🍎", "🍌", "🍇", "🍒", "🍎", "🍌", "🍇", "🍒","🍎", "🍌", "🍇", "🍒","🍎", "🍌", "🍇", "🍒"];

export default function MemoryGame() {
  const [cards, setCards] = useState(shuffle([...symbols]));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
  }

  function flipCard(index) {
    if (flipped.length === 2 || flipped.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (cards[a] === cards[b]) {
        setMatched([...matched, a, b]);
      }
      setTimeout(() => setFlipped([]), 800);
    }
  }

  return (
    <div className="card">
      <h3>🧠 Memory Game</h3>
      <div className="grid-small">
        {cards.map((card, i) => (
          <div key={i} className="game-card" onClick={() => flipCard(i)}>
            {flipped.includes(i) || matched.includes(i) ? card : "❓"}
          </div>
        ))}
      </div>
    </div>
  );
}
