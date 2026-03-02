import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Menu, PawPrint, LogOut, MessageSquare, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { to: "/", label: "Početna" },
  { to: "/pretraga", label: "Pretraga" },
  { to: "/blog", label: "Blog" },
  { to: "/donacije", label: "Donacije" },
  { to: "/o-nama", label: "O nama" },
];

export const Navbar = () => {
  const { user, role, roles, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ["unread-count", user?.id],
    queryFn: async () => {
      // Get user's conversations
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .or(`adopter_id.eq.${user!.id},shelter_id.eq.${user!.id}`);
      if (!convs || convs.length === 0) return 0;
      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .in("conversation_id", convs.map((c) => c.id))
        .eq("is_read", false)
        .neq("sender_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const MessagesLink = ({ mobile }: { mobile?: boolean }) => (
    <Link to="/poruke" onClick={mobile ? () => setOpen(false) : undefined}>
      <Button
        variant={location.pathname === "/poruke" ? "default" : "ghost"}
        size={mobile ? "default" : "sm"}
        className={mobile ? "w-full justify-start gap-2" : "gap-1"}
      >
        <MessageSquare className="h-4 w-4" />
        Poruke
        {!!unreadCount && unreadCount > 0 && (
          <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1 text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>
    </Link>
  );

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
          {roles.includes("shelter") && (
            <Link to="/dashboard">
              <Button variant={location.pathname === "/dashboard" ? "default" : "ghost"} size="sm">
                Moji psi
              </Button>
            </Link>
          )}
          {(roles.includes("adopter") || role === "admin") && (
            <Link to="/omiljeni">
              <Button variant={location.pathname === "/omiljeni" ? "default" : "ghost"} size="sm">
                Omiljeni
              </Button>
            </Link>
          )}
          {role === "admin" && (
            <Link to="/blog/admin">
              <Button variant={location.pathname === "/blog/admin" ? "default" : "ghost"} size="sm">
                Blog Admin
              </Button>
            </Link>
          )}
          {user && <MessagesLink />}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
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
              {roles.includes("shelter") && (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Moji psi</Button>
                </Link>
              )}
              {(roles.includes("adopter") || role === "admin") && (
                <Link to="/omiljeni" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Omiljeni</Button>
                </Link>
              )}
              {role === "admin" && (
                <Link to="/blog/admin" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Blog Admin</Button>
                </Link>
              )}
              {user && <MessagesLink mobile />}
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Svetla tema" : "Tamna tema"}
              </Button>
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
