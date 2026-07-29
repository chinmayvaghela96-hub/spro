import { Link } from "wouter";
import { Menu, X, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultLinks = [
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/industries", label: "Industries" },
    { href: "/research", label: "Research" },
    { href: "/software", label: "Software" },
    { href: "/training", label: "Training" },
    { href: "/careers", label: "Careers" },
  ];

  // Fetch dynamic navigation links from database
  const { data: dynamicLinks = [] } = useQuery<any[]>({
    queryKey: ["content", "nav-items"],
    queryFn: async () => {
      const res = await fetch("/api/content/nav-items");
      if (!res.ok) throw new Error("Failed to fetch navigation items");
      return res.json();
    }
  });

  // Fetch active custom pages that should appear in menu
  const { data: dynamicPages = [] } = useQuery<any[]>({
    queryKey: ["content", "pages"],
    queryFn: async () => {
      const res = await fetch("/api/content/pages");
      if (!res.ok) throw new Error("Failed to fetch custom pages list");
      return res.json();
    }
  });

  const pageLinks = dynamicPages
    .filter(p => p.showInMenu !== false && p.slug !== "home")
    .map(p => ({
      href: `/${p.slug}`,
      label: p.title
    }));

  const activeLinks = dynamicLinks.length > 0
    ? dynamicLinks.map(link => ({ href: link.href, label: link.label }))
    : dynamicPages.length > 0
    ? pageLinks
    : defaultLinks;

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-white py-4"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.jpeg" 
                alt="SustainPro Logo" 
                className={`w-auto object-contain transition-all duration-300 group-hover:scale-105 ${scrolled ? "h-16" : "h-20"}`} 
              />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-1 lg:space-x-4">
            {activeLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-md hover:bg-gray-50">
                {link.label}
              </Link>
            ))}
            <Link href="/contact" className="ml-4">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-medium shadow-sm">
                Contact Us <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 p-2 focus:outline-none">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b shadow-lg animate-in slide-in-from-top-2">
          <div className="px-2 pt-2 pb-4 space-y-1">
            {activeLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              href="/contact" 
              className="block px-3 py-2 mt-4 text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-md text-center"
              onClick={() => setIsOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
