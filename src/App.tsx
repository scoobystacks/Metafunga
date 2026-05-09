import { useState } from "react";
import { useDailyFungus } from "./hooks/useDailyFungus";
import { GameBoard } from "./components/GameBoard";
import { HowToPlay } from "./components/HowToPlay";
import { clearOldKeys } from "./utils/storage";

clearOldKeys();

export default function App() {
  const { fungus, dayNumber } = useDailyFungus();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-screen bg-spore-50 flex flex-col">
      <GameBoard
        target={fungus}
        dayNumber={dayNumber}
        onHelp={() => setShowHelp(true)}
      />
      {showHelp && <HowToPlay onClose={() => setShowHelp(false)} />}
    </div>
  );
}
