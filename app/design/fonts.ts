// Paddock design-system typefaces — scoped to the /design subtree only.
// Motorsport timing-screen: extended-bold Archivo (livery numbers/headlines),
// condensed Saira (standings/grid positions), JetBrains Mono (timing data).
import { Archivo, Saira_Condensed, JetBrains_Mono } from "next/font/google";

// variable weight + width (push wide for the "extended bold" livery look)
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo-x",
});

// condensed numerals — grid positions & big standings numbers
export const sairaCond = Saira_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-saira-c",
});

// tabular technical data — lap/gap times, part refs, channel labels
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-mono-x",
});
