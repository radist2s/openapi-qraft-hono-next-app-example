import { Providers } from "@/components/Providers";
import { type ReactNode } from "react";

export const metadata = {
  title: "OpenAPI Qraft ❤️ Hono 🫶 Next.js",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
