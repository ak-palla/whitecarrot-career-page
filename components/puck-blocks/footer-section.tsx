import { Heart } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="w-full py-6 border-t border-border/40" style={{ backgroundColor: '#FAF9F5' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built with Lisco</span>
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </div>
      </div>
    </footer>
  );
}

