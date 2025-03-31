import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anywhere in Israel",
  description: "Connect with Shabbat hosts around Israel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
