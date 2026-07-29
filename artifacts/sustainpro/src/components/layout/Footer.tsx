import { Link } from "wouter";
import { Mail, MapPin, Phone, Linkedin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch dynamic contact info
  const { data: contactInfo } = useQuery<any>({
    queryKey: ["content", "contact-info"],
    queryFn: async () => {
      const res = await fetch("/api/content/contact-info");
      if (!res.ok) throw new Error("Failed to fetch contact info");
      return res.json();
    }
  });

  // Fetch dynamic site settings
  const { data: settings } = useQuery<any>({
    queryKey: ["content", "settings"],
    queryFn: async () => {
      const res = await fetch("/api/content/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    }
  });

  const siteName = settings?.siteName || "SustainPro";
  const logoUrl = settings?.logoUrl || "/logo.jpeg";
  const linkedinUrl = settings?.socialLinks?.linkedin || "https://linkedin.com/company/sustainpro";
  const seoDescription = settings?.seoDescription || "Engineering a Greener Tomorrow. Premium global engineering consultancy specializing in chemical engineering, process optimization, and sustainable industrial innovation.";

  const address = contactInfo?.address || "100 Innovation Drive\nIndustrial Park, Tech City 10001";
  const phone = contactInfo?.phone || "8735045762";
  const email = contactInfo?.email || "sustain.process@gmail.com";

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg inline-block w-max">
              <img src={logoUrl} alt={`${siteName} Logo`} className="h-8 w-auto object-contain" />
            </div>
            <p className="text-gray-400 text-sm mt-4 leading-relaxed">
              {seoDescription}
            </p>
            {linkedinUrl && (
              <div className="flex space-x-4 pt-2">
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> About Us</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Services</Link></li>
              <li><Link href="/industries" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Industries Served</Link></li>
              <li><Link href="/research" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Research & Innovation</Link></li>
              <li><Link href="/software" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Software Solutions</Link></li>
              <li><Link href="/training" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight className="h-3 w-3"/> Training & Events</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Key Services</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/services" className="hover:text-primary transition-colors">Process Engineering</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Modeling & Simulation</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Optimization & Troubleshooting</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Sustainability & Green Engineering</Link></li>
              <li><Link href="/services" className="hover:text-primary transition-colors">Industrial R&D</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span className="whitespace-pre-line">{address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>{phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>{email}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>&copy; {currentYear} {siteName} Process Solutions™. All Rights Reserved.</p>
            <p className="text-xs text-gray-500">
              Developed by <span className="font-medium text-gray-400">Chinmay Vaghela</span> (9408088823) &amp; <span className="font-medium text-gray-400">Dev Patel</span> (9824004681)
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
