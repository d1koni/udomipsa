import { PawPrint, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-primary font-bold">
          <PawPrint className="h-5 w-5" />
          Udomi Me
        </div>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/pretraga" className="hover:text-primary transition-colors">Pretraga</Link>
          <Link to="/donacije" className="hover:text-primary transition-colors">Donacije</Link>
          <Link to="/o-nama" className="hover:text-primary transition-colors">O nama</Link>
        </nav>
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Napravljeno sa <Heart className="h-3 w-3 text-destructive" /> za napuštene pse
        </p>
      </div>
    </div>
  </footer>
);
