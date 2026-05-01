import logo from "@/assets/msi-logo.png";
import { Link } from "react-router-dom";

export const Logo = ({ className = "h-10" }: { className?: string }) => (
  <Link to="/" className="flex items-center gap-2 group" aria-label="MSI Innovations Home">
    <img src={logo} alt="MSI Innovations logo" className={`${className} w-auto object-contain transition-smooth group-hover:scale-105`} />
  </Link>
);
