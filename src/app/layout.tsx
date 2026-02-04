import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LocaleProvider } from "@/context/LocaleContext";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Victoria Families Community Library",
  description: "Share books among neighbors. Build community through reading.",
};

async function getInitialLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value;
  if (locale === "zh-Hans" || locale === "en") return locale;
  return "zh-Hans";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await getInitialLocale();

  return (
    <html lang={initialLocale}>
      <body className={`${inter.className} antialiased`}>
        <LocaleProvider initialLocale={initialLocale}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
