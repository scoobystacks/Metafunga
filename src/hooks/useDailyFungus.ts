import { useMemo } from "react";
import { FUNGI_MAP } from "../data/fungi";
import { getDailyFungusId, getDayNumber } from "../utils/daily";

export function useDailyFungus() {
  return useMemo(() => {
    const id = getDailyFungusId();
    const fungus = FUNGI_MAP.get(id)!;
    const dayNumber = getDayNumber();
    return { fungus, dayNumber };
  }, []);
}
