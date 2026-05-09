import { useCallback, useEffect, useRef, useState } from "react";
import { FUNGI } from "../data/fungi";
import type { Fungus } from "../types";

interface Props {
  onGuess: (fungusId: string) => void;
  usedIds: Set<string>;
  disabled: boolean;
}

export function GuessInput({ onGuess, usedIds, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const candidates: Fungus[] = query.trim().length >= 1
    ? FUNGI.filter((f) => {
        if (usedIds.has(f.id)) return false;
        const q = query.toLowerCase();
        return (
          f.commonName.toLowerCase().includes(q) ||
          f.scientificName.toLowerCase().includes(q)
        );
      }).slice(0, 8)
    : [];

  useEffect(() => {
    setHighlighted(0);
  }, [query]);

  const commit = useCallback(
    (f: Fungus) => {
      onGuess(f.id);
      setQuery("");
      setOpen(false);
      inputRef.current?.focus();
    },
    [onGuess]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || candidates.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, candidates.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      commit(candidates[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          disabled={disabled}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={handleKeyDown}
          placeholder="Type a fungus name…"
          className="flex-1 rounded-xl border border-spore-300 bg-white px-4 py-3 text-sm placeholder:text-spore-400 focus:outline-none focus:ring-2 focus:ring-myco-500 disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {open && candidates.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 w-full rounded-xl border border-spore-200 bg-white shadow-lg overflow-hidden"
        >
          {candidates.map((f, i) => (
            <li
              key={f.id}
              className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === highlighted
                  ? "bg-myco-50 text-myco-800"
                  : "hover:bg-spore-50"
              }`}
              onMouseDown={() => commit(f)}
              onMouseEnter={() => setHighlighted(i)}
            >
              <span className="font-medium">{f.commonName}</span>
              <span className="ml-2 text-spore-500 italic text-xs">
                {f.scientificName}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
