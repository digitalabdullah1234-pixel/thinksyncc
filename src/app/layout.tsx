import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  IBM_Plex_Sans_Arabic,
  Inter,
  Space_Grotesk,
} from "next/font/google";
import { LanguageProvider } from "@/context/LanguageContext";
import { MotionProvider } from "@/components/MotionProvider";
import { CustomCursor } from "@/components/CustomCursor";
import { Preloader } from "@/components/Preloader";
import "./globals.css";

/**
 * Motion renders the `initial` state into the HTML, so with scripting off
 * nothing would ever animate away from opacity 0. This puts every animated
 * element back at its end state and drops the intro overlay.
 */
const NOSCRIPT_CSS = `<style>
[data-reveal],[data-page],[data-nav-in]{opacity:1!important;transform:none!important}
[data-preloader]{display:none!important}
[data-header-logo]{opacity:1!important}
</style>`;

/**
 * The display face. Bricolage Grotesque is a variable grotesque with a real
 * optical-size axis, so the same family reads as a tight, high-character
 * headline at hero sizes and stays sane at section-heading sizes — which is
 * what keeps the page from looking like a default type stack.
 */
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "wdth"],
});

/**
 * The hero headline, and nothing else.
 *
 * Deliberately NOT wired to `--font-display`: that variable drives every
 * section heading on the site, and swapping it would restyle Services, Work
 * and Contact along with the hero. This is its own variable so the change
 * stops at the one element that asked for it.
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThinkSync — IT & Infrastructure Engineering in Saudi Arabia",
  description:
    "ThinkSync designs, builds, and secures the digital and physical infrastructure enterprises across Saudi Arabia depend on — custom software, enterprise networking, servers, security, cloud, and IT hardware.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${inter.variable} ${ibmPlexSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-ink">
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_CSS }} />
        <Preloader />
        <MotionProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </MotionProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
