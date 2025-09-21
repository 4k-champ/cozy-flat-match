import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              © 2024 FlatFit. Made with ❤️ for better living.
            </span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <Link 
              to="/about" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              About
            </Link>
            <Link 
              to="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Terms
            </Link>
            <Link 
              to="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Privacy
            </Link>
            <Link 
              to="/contact" 
              className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
            >
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};