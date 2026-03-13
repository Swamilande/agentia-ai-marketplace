import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© 2026 AgentMarket. All rights reserved.</p>
        <nav className="flex gap-6">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <Link to="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
          <Link to="/auth/login" className="hover:text-foreground transition-colors">Login</Link>
          <Link to="/auth/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
        </nav>
      </div>
    </footer>
  );
}
