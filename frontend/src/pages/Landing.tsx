import { ArrowRight, Package, Repeat, Star, UserPlus, List, ShieldCheck, Handshake, Monitor, BookOpen, Shirt, Trophy, Dumbbell, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/layout/Footer";

const categories = [
  { name: "Electronics", icon: Monitor },
  { name: "Books", icon: BookOpen },
  { name: "Fashion", icon: Shirt },
  { name: "Collectibles", icon: Trophy },
  { name: "Sports", icon: Dumbbell },
  { name: "Home", icon: Home },
];

const features = [
  { title: "List Your Items", desc: "Upload photos and describe items you want to trade.", icon: Package },
  { title: "Propose a Trade", desc: "Find items you want and propose a swap with yours.", icon: Repeat },
  { title: "Swap & Rate", desc: "Complete trades and rate your experience.", icon: Star },
];

const steps = [
  { title: "Sign Up", desc: "Create your free account in seconds.", icon: UserPlus },
  { title: "List Items", desc: "Add items you'd like to trade.", icon: List },
  { title: "Get Verified", desc: "Our verifiers approve your listings.", icon: ShieldCheck },
  { title: "Trade", desc: "Propose trades and swap items!", icon: Handshake },
];

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <span className="text-sm font-bold text-primary-foreground">T</span>
            </div>
            <span className="text-xl font-bold">TradeSwap</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/browse"><Button variant="ghost">Browse</Button></Link>
            <Link to="/login"><Button variant="ghost">Log In</Button></Link>
            <Link to="/register"><Button className="gradient-primary text-primary-foreground border-0 hover:opacity-90">Sign Up</Button></Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Swap What You Have,<br />Get What You Want
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
            The modern platform for trading items without money. List, propose, and swap with people near you.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 text-lg px-8 py-6">
              Start Trading <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How Trading Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5">
                    <f.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Get Started in 4 Steps</h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-4 max-w-4xl mx-auto">
            {steps.map((s, i) => (
              <div key={s.title} className="flex-1 flex flex-col items-center text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mb-4">
                    <s.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block h-5 w-5 text-primary mt-4 rotate-0 md:absolute md:right-0 md:top-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {categories.map((c) => (
              <Link to="/browse" key={c.name}>
                <Card className="text-center hover:border-primary hover:shadow-md transition-all cursor-pointer group">
                  <CardContent className="pt-6 pb-4">
                    <c.icon className="h-8 w-8 mx-auto mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium">{c.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-lg opacity-90 mb-6">Join thousands of traders swapping items every day.</p>
          <Link to="/register">
            <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8">
              Create Free Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
