import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, PawPrint, LogOut } from "lucide-react";

const navItems = [
  { to: "/", label: "Početna" },
  { to: "/pretraga", label: "Pretraga" },
  { to: "/donacije", label: "Donacije" },
  { to: "/o-nama", label: "O nama" },
];

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <PawPrint className="h-6 w-6" />
          <span className="hidden sm:inline">Udomi Me</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to}>
              <Button
                variant={location.pathname === item.to ? "default" : "ghost"}
                size="sm"
              >
                {item.label}
              </Button>
            </Link>
          ))}
          {role === "shelter" && (
            <Link to="/dashboard">
              <Button variant={location.pathname === "/dashboard" ? "default" : "ghost"} size="sm">
                Moji psi
              </Button>
            </Link>
          )}
          {role === "adopter" && (
            <Link to="/omiljeni">
              <Button variant={location.pathname === "/omiljeni" ? "default" : "ghost"} size="sm">
                Omiljeni
              </Button>
            </Link>
          )}
          {user ? (
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Odjavi se
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">Prijavi se</Button>
            </Link>
          )}
        </nav>

        {/* Mobile nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-2 mt-8">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setOpen(false)}>
                  <Button variant={location.pathname === item.to ? "default" : "ghost"} className="w-full justify-start">
                    {item.label}
                  </Button>
                </Link>
              ))}
              {role === "shelter" && (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Moji psi</Button>
                </Link>
              )}
              {role === "adopter" && (
                <Link to="/omiljeni" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Omiljeni</Button>
                </Link>
              )}
              {user ? (
                <Button variant="outline" onClick={() => { signOut(); setOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Odjavi se
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setOpen(false)}>
                  <Button className="w-full">Prijavi se</Button>
                </Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
