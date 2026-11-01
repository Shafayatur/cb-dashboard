import { Source_Serif_4, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["600"], variable: "--serif" });
const ui = Source_Sans_3({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--ui" });
export const metadata = { title: "On The Go: where to add or move delivery agents" };
export default function Root({ children }) {
  return <html lang="en" className={`${serif.variable} ${ui.variable}`}><body><Shell>{children}</Shell></body></html>;
}
