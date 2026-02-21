import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "./redux-provider";

const inter = Inter({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "Tottho Vandar - Treasure of Information",
  description: "A platform where you can post your own content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={inter.className}>
          <ReduxProvider>
            <AntdRegistry>
              {children}
            </AntdRegistry>
          </ReduxProvider>
      </body>
    </html>
  );
}
