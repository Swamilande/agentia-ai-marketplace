import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Bot, LogOut } from "lucide-react";

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Bot className="h-6 w-6" />
          AgentMarket
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Marketplace
          </Link>
          {user ? (
            <>
              <Link to="/workspace" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Workspace
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/auth/login")}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/auth/signup")}>
                Sign Up
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
