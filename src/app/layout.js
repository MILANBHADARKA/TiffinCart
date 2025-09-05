import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/context/User.context";
import { ThemeProvider } from "@/context/Theme.context";
import { CartProvider } from "@/context/Cart.context";
import LayoutWrapper from "@/components/LayoutWrapper/LayoutWrapper";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TifinCart - Homemade Food Delivery",
  description: "Order fresh, homemade food from local sellers. Quality food delivered to your doorstep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Analytics />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <UserProvider>
            <CartProvider>
              <LayoutWrapper>
                {children}
              </LayoutWrapper>
            </CartProvider>
          </UserProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
