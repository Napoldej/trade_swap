import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <span className="text-sm font-bold text-primary-foreground">T</span>
              </div>
              <span className="text-xl font-bold">TradeSwap</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The modern way to swap items without money. Trade what you have for what you want.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-primary transition-colors">Browse Items</Link></li>
              <li><Link to="/create-item" className="hover:text-primary transition-colors">List an Item</Link></li>
              <li><Link to="/my-trades" className="hover:text-primary transition-colors">My Trades</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TradeSwap. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
