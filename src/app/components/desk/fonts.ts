import { Caveat, Instrument_Serif } from "next/font/google";

export const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--desk-hand", display: "swap" });
export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--desk-serif", display: "swap" });
