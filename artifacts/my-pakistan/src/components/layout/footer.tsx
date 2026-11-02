import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2" data-testid="link-footer-home">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Mera Pakistan Logo" className="h-6 w-6 grayscale opacity-70" />
              <span className="font-bold text-lg text-foreground">Mera Pakistan</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Discover the hidden gems, rich culture, and breathtaking landscapes of Pakistan.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2">
              <li><Link href="/explore" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-explore">All Locations</Link></li>
              <li><Link href="/provinces" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-provinces">Provinces</Link></li>
              <li><Link href="/explore?category=nature" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-nature">Nature & Landscapes</Link></li>
              <li><Link href="/explore?category=monument" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-heritage">Heritage & Monuments</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Provinces</h3>
            <ul className="space-y-2">
              <li><Link href="/provinces/punjab" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-punjab">Punjab</Link></li>
              <li><Link href="/provinces/sindh" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-sindh">Sindh</Link></li>
              <li><Link href="/provinces/kpk" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-kpk">Khyber Pakhtunkhwa</Link></li>
              <li><Link href="/provinces/balochistan" className="text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-footer-balochistan">Balochistan</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Terms of Service</span></li>
              <li><span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact Us</span></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Mera Pakistan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
