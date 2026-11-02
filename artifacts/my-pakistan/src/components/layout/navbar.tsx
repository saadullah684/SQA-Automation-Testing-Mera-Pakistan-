import { Link, useLocation } from "wouter";
import { UserButton, useUser, Show } from "@clerk/react";
import { Compass, Map, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" data-testid="link-home">
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Mera Pakistan Logo" className="h-8 w-8" />
          <span className="font-bold text-xl tracking-tight text-primary">Mera Pakistan</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/explore" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/explore' ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-nav-explore">
            <span className="flex items-center gap-2"><Compass className="w-4 h-4" /> Explore</span>
          </Link>
          <Link href="/provinces" className={`text-sm font-medium transition-colors hover:text-primary ${location.startsWith('/provinces') ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-nav-provinces">
            <span className="flex items-center gap-2"><Map className="w-4 h-4" /> Provinces</span>
          </Link>
          
          <Show when="signed-in">
            <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-nav-dashboard">
              <span className="flex items-center gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</span>
            </Link>
            <Link href="/profile" className={`text-sm font-medium transition-colors hover:text-primary ${location === '/profile' ? 'text-primary' : 'text-muted-foreground'}`} data-testid="link-nav-profile">
              <span className="flex items-center gap-2"><User className="w-4 h-4" /> Profile</span>
            </Link>
          </Show>
        </div>

        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <Link href="/sign-in" data-testid="link-sign-in">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/sign-up" data-testid="link-sign-up">
              <Button size="sm">Sign Up</Button>
            </Link>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
