import type { Metadata } from "next"
import { Space_Grotesk, Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/layout/providers"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Guess The Song",
  description:
    "Ascolta l'anteprima, indovina la canzone. Un gioco musicale veloce e divertente.",
}

export default function RootLayout({
  children,
}: Readonly<{
  readonly children: React.ReactNode
}>): React.ReactElement {
  return (
    <html lang="it" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
