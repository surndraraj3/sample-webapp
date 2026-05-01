import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export const SiteLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen flex-col bg-gradient-soft">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);
