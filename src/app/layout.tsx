import { type ReactNode } from "react";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "Next.js & Hono & OpenAPI Qraft",
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
