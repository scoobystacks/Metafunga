interface Props {
  onClose: () => void;
}

export function HowToPlay({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-spore-900">How to Play</h2>
          <button
            onClick={onClose}
            className="text-spore-400 hover:text-spore-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-sm text-spore-700">
          <p>
            <strong>Metafunga</strong> is a daily fungi phylogeny game. Guess
            today's mystery fungus by exploring the tree of life!
          </p>

          <div>
            <p className="font-semibold text-spore-900 mb-1">Each guess:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Pick any fungus from the list</li>
              <li>
                The tree reveals the <em>deepest shared rank</em> between your
                guess and the target
              </li>
              <li>The photo gradually unblurs with each guess</li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-spore-900 mb-2">Match badges:</p>
            <div className="space-y-1">
              {[
                ["bg-stone-100 text-stone-700", "Kingdom match only — very far away"],
                ["bg-amber-100 text-amber-800", "Phylum match (e.g., both Basidiomycota)"],
                ["bg-yellow-100 text-yellow-800", "Class match"],
                ["bg-lime-100 text-lime-800", "Order match"],
                ["bg-green-100 text-green-800", "Family match — getting close!"],
                ["bg-teal-100 text-teal-800", "Genus match — very close!"],
                ["bg-myco-500 text-white", "Correct! You found the fungus!"],
              ].map(([cls, label]) => (
                <div key={label} className={`rounded px-2 py-1 text-xs ${cls}`}>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <p>You have <strong>20 guesses</strong> per day. A new fungus appears every day.</p>

          <p className="text-spore-500 text-xs">
            Taxonomy sourced from{" "}
            <strong>Index Fungorum</strong> and <strong>NCBI Taxonomy</strong>.
            Images from <strong>iNaturalist</strong> and{" "}
            <strong>Wikimedia Commons</strong> (CC-licensed).
          </p>
        </div>
      </div>
    </div>
  );
}
