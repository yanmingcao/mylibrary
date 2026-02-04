"use client";

import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";

export default function Home() {
  const { t } = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
      <main className="flex min-h-screen w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-gray-900 sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-full">
          <h1 className="text-4xl font-bold leading-10 tracking-tight text-gray-900 dark:text-white mb-4">
            {t("homeTitle")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl">
            {t("homeSubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
            <Link 
              href="/books"
              className="block p-8 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <div className="text-blue-900 font-semibold text-lg mb-2">{t("homeCtaBrowse")}</div>
              <div className="text-blue-700">{t("booksSubtitle")}</div>
            </Link>
            
            <Link 
              href="/families"
              className="block p-8 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <div className="text-green-900 font-semibold text-lg mb-2">{t("familiesTitle")}</div>
              <div className="text-green-700">{t("familiesSubtitle")}</div>
            </Link>
            
            <Link 
              href="/dashboard"
              className="block p-8 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <div className="text-purple-900 font-semibold text-lg mb-2">{t("dashboardTitle")}</div>
              <div className="text-purple-700">{t("dashboardSubtitle")}</div>
            </Link>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/login"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              {t("homeCtaLogin")}
            </Link>
            <p className="mt-3 text-sm text-gray-500">
              {t("homeNoAccount")}{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                {t("homeCtaRegister")}
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
