import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import * as Icons from "lucide-react";
import { Play, X, ArrowRight, ExternalLink, BookOpen, FileText, Download, ExternalLinkIcon, Mail, Phone, MapPin, CheckCircle, Briefcase, Clock, CalendarDays, UserCheck, MonitorPlay } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageBanner } from "../components/layout/PageBanner";
import { HeroSlider } from "../components/layout/HeroSlider";

type Section = {
  id: string;
  type: "rich-text" | "features-grid" | "cta-banner" | "accordion-faq";
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  openInNewTab?: boolean;
};

type GalleryItem = {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  description?: string;
};

type PageData = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  sections?: Section[] | string;
  gallery?: GalleryItem[] | string;
};

// ─── Card Wrapper Helper ───────────────────────────────────────────────────
function CardWrapper({ link, children, className }: { link?: string; children: React.ReactNode; className?: string }) {
  if (!link) {
    return <section className={className}>{children}</section>;
  }
  const isExternal = link.startsWith("http://") || link.startsWith("https://") || link.startsWith("//");
  if (isExternal) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block no-underline group">
        <section className={className}>{children}</section>
      </a>
    );
  }
  return (
    <Link href={link} className="block no-underline group">
      <section className={className}>{children}</section>
    </Link>
  );
}

// ─── About Page Section ────────────────────────────────────────────────────
function AboutSection() {
  const { data: about } = useQuery<any>({
    queryKey: ["content", "about"],
    queryFn: () => fetch("/api/content/about").then(r => r.json()),
  });

  if (!about) return null;

  return (
    <div className="space-y-8">
      {/* Who We Are */}
      <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-4">{about.whoWeAreTitle || "Who We Are"}</h2>
        <p className="text-gray-600 leading-relaxed text-lg">{about.whoWeAreText}</p>
      </section>

      {/* Vision / Mission / Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: about.visionTitle || "Our Vision", text: about.visionText, icon: "Eye" },
          { title: about.missionTitle || "Our Mission", text: about.missionText, icon: "Target" },
          { title: about.valuesTitle || "Core Values", text: about.valuesText, icon: "Heart" },
        ].map((item) => {
          const LucideIcon = (Icons as any)[item.icon] || Icons.Star;
          return (
            <div key={item.title} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4">
                <LucideIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed flex-1">{item.text}</p>
            </div>
          );
        })}
      </div>

      {/* Leadership */}
      {about.leadershipText && (
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 p-8 md:p-12 rounded-2xl border border-primary/20">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{about.leadershipTitle || "Leadership"}</h2>
          <p className="text-gray-700 leading-relaxed text-lg">{about.leadershipText}</p>
        </section>
      )}

      {/* Faculty Advisors */}
      {(() => {
        const advisors = about.advisors
          ? (Array.isArray(about.advisors)
            ? about.advisors
            : (typeof about.advisors === "string" ? JSON.parse(about.advisors || "[]") : []))
          : [];
        if (advisors.length === 0) return null;
        return (
          <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm mt-8">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2 text-center">Faculty Advisors</h2>
            <p className="text-gray-500 text-sm text-center mb-10 max-w-xl mx-auto">Guided by leading academic professors specializing in chemical engineering, catalysis, process modeling, and sustainability.</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {advisors.map((advisor: any, idx: number) => (
                <a 
                  key={idx} 
                  href={advisor.link || "#"} 
                  target={advisor.link ? "_blank" : undefined} 
                  rel={advisor.link ? "noopener noreferrer" : undefined} 
                  className="group block bg-gray-50 hover:bg-gray-100/70 p-6 rounded-2xl border border-gray-200/80 transition-all duration-300 hover:shadow-md text-left no-underline"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <img 
                      src={advisor.photoUrl || "/placeholder-avatar.png"} 
                      alt={advisor.name} 
                      className="w-28 h-28 object-cover rounded-xl shadow-sm border border-gray-200 shrink-0 group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors flex items-center gap-1.5">
                        {advisor.name}
                        {advisor.link && <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100" />}
                      </h3>
                      <p className="text-sm font-semibold text-primary/95 mt-1">{advisor.title}</p>
                      <p className="text-xs text-gray-500 font-medium">{advisor.institution}</p>
                      <p className="text-sm text-gray-600 leading-relaxed mt-3">
                        {advisor.bio}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        );
      })()}
    </div>
  );
}

// ─── Careers Page Section ─────────────────────────────────────────────────
function CareersSection() {
  const { data: positions = [], isLoading } = useQuery<any[]>({
    queryKey: ["content", "careers"],
    queryFn: () => fetch("/api/careers").then(r => r.json()),
  });

  const [applicationModal, setApplicationModal] = useState<{ isOpen: boolean; jobTitle: string }>({
    isOpen: false,
    jobTitle: "",
  });

  const [form, setForm] = useState<{
    name: string;
    email: string;
    phone: string;
    city: string;
    address: string;
    message: string;
    cv: File | null;
  }>({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    message: "",
    cv: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("city", form.city);
      formData.append("address", form.address);
      formData.append("jobTitle", applicationModal.jobTitle);
      formData.append("message", form.message);
      if (form.cv) {
        formData.append("cv", form.cv);
      }

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Submission failed");
      }
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", city: "", address: "", message: "", cv: null });
      setTimeout(() => {
        setSuccess(false);
        setApplicationModal({ isOpen: false, jobTitle: "" });
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {positions.length === 0 ? (
        <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm text-center">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Open Positions</h2>
          <p className="text-gray-600 max-w-md mx-auto">
            We don't have any job openings right now. However, we're always looking for outstanding talent. Feel free to send your CV to <span className="font-semibold text-primary">sustain.process@gmail.com</span>.
          </p>
        </section>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {positions.map((job) => (
            <div key={job.id} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5" /> Open Position
                </span>
                <p className="text-gray-500 text-sm mt-4">
                  We are looking for a dedicated {job.title} to join our consulting team and help engineer sustainable solutions.
                </p>
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => setApplicationModal({ isOpen: true, jobTitle: job.title })}
                  className="bg-primary hover:bg-primary/90 text-white font-medium w-full"
                >
                  Apply Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Modal */}
      {applicationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-md w-full border border-gray-200 shadow-xl relative animate-in zoom-in duration-200">
            <button 
              type="button"
              onClick={() => setApplicationModal({ isOpen: false, jobTitle: "" })}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Apply for {applicationModal.jobTitle}</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Introduce yourself and our team will get in touch shortly.</p>
            {success ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-center font-medium">
                Application submitted successfully! Thank you.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[70vh] overflow-y-auto px-1 scrollbar-thin">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Number</label>
                  <input 
                    type="text" 
                    value={form.phone} 
                    onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input 
                    type="text" 
                    value={form.city} 
                    onChange={(e) => setForm({ ...form, city: e.target.value })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input 
                    type="text" 
                    value={form.address} 
                    onChange={(e) => setForm({ ...form, address: e.target.value })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Upload CV (PDF, Word) (Optional)</label>
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setForm({ ...form, cv: e.target.files?.[0] || null })} 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Letter / Introduction</label>
                  <textarea 
                    value={form.message} 
                    onChange={(e) => setForm({ ...form, message: e.target.value })} 
                    placeholder="Tell us about your background and experience..." 
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-900 bg-white h-24"
                    required 
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white mt-2">
                  {submitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Services Page Section ─────────────────────────────────────────────────
function ServicesSection() {
  const { data: servicesList = [] } = useQuery<any[]>({
    queryKey: ["content", "services"],
    queryFn: () => fetch("/api/content/services").then(r => r.json()),
  });

  if (servicesList.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {servicesList.map((service) => {
        const LucideIcon = (Icons as any)[service.icon] || Icons.Settings;
        const details: string[] = Array.isArray(service.details)
          ? service.details
          : (typeof service.details === "string" ? JSON.parse(service.details || "[]") : []);
        return (
          <CardWrapper key={service.id} link={service.link} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <LucideIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
            <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
            {details.length > 0 && (
              <ul className="space-y-2 mt-4 border-t border-gray-100 pt-4">
                {details.map((d: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardWrapper>
        );
      })}
    </div>
  );
}

// ─── Industries Page Section ───────────────────────────────────────────────
function IndustriesSection() {
  const { data: industriesList = [] } = useQuery<any[]>({
    queryKey: ["content", "industries"],
    queryFn: () => fetch("/api/content/industries").then(r => r.json()),
  });

  if (industriesList.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {industriesList.map((industry) => {
        const LucideIcon = (Icons as any)[industry.icon] || Icons.Factory;
        return (
          <CardWrapper key={industry.id} link={industry.link} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <LucideIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{industry.name}</h3>
            <p className="text-gray-600 leading-relaxed">{industry.description}</p>
          </CardWrapper>
        );
      })}
    </div>
  );
}

// ─── Research Page Section ─────────────────────────────────────────────────
function ResearchSection() {
  const { data: research } = useQuery<any>({
    queryKey: ["content", "research"],
    queryFn: () => fetch("/api/content/research").then(r => r.json()),
  });

  const areas: any[] = research?.areas || [];
  const pubs: any[] = research?.publications || [];

  return (
    <div className="space-y-12">
      {areas.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6">Research Areas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {areas.map((area) => (
              <section key={area.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                {area.imageUrl && (
                  <div className="aspect-[16/7] overflow-hidden">
                    <img src={area.imageUrl} alt={area.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{area.title}</h3>
                  {area.description && <p className="text-gray-600 text-sm leading-relaxed">{area.description}</p>}
                  {area.link && (
                    <a href={area.link} target={area.openInNewTab ? "_blank" : "_self"} rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary font-medium text-sm mt-4 hover:underline">
                      Learn more <ExternalLinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {pubs.length > 0 && (
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary" /> Publications
          </h2>
          <div className="space-y-4">
            {pubs.map((pub) => (
              <section key={pub.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 mb-1">{pub.title}</h3>
                    <p className="text-sm text-primary font-medium">{pub.authors}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="italic">{pub.journal}</span> · {pub.year}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {pub.pdfUrl && (
                      <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-primary/10 hover:border-primary/20 transition-colors" title="Download PDF">
                        <Download className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                    {pub.link && (
                      <a href={pub.link} target={pub.openInNewTab ? "_blank" : "_self"} rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-primary/10 hover:border-primary/20 transition-colors" title="View Publication">
                        <ExternalLinkIcon className="w-4 h-4 text-gray-600" />
                      </a>
                    )}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Software Page Section ─────────────────────────────────────────────────
function SoftwareSection() {
  const { data: softwareList = [] } = useQuery<any[]>({
    queryKey: ["content", "software"],
    queryFn: () => fetch("/api/content/software").then(r => r.json()),
  });

  if (softwareList.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {softwareList.map((item) => {
        const LucideIcon = (Icons as any)[item.icon] || Icons.Monitor;
        return (
          <CardWrapper key={item.id} link={item.link} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <LucideIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          </CardWrapper>
        );
      })}
    </div>
  );
}

// ─── Training Page Section ─────────────────────────────────────────────────
function TrainingSection() {
  const { data: trainingList = [] } = useQuery<any[]>({
    queryKey: ["content", "training"],
    queryFn: () => fetch("/api/content/training").then(r => r.json()),
  });

  const { data: programs = [] } = useQuery<any[]>({
    queryKey: ["content", "training-programs"],
    queryFn: () => fetch("/api/content/training-programs").then(r => r.json()),
  });

  if (trainingList.length === 0 && programs.length === 0) return null;

  return (
    <div className="space-y-16">
      {/* Available programmes — the list users come here for */}
      {programs.length > 0 && (
        <section>
          <div className="text-center mb-10">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm mb-2">Enroll Now</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Available Training Programs</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Browse our current programmes and register directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program: any) => (
              <TrainingProgramCard key={program.id} program={program} />
            ))}
          </div>
        </section>
      )}

      {/* Training categories overview */}
      {trainingList.length > 0 && (
        <section>
          {programs.length > 0 && (
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">What We Offer</h2>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingList.map((item) => {
              const LucideIcon = (Icons as any)[item.icon] || Icons.GraduationCap;
              return (
                <CardWrapper key={item.id} link={item.link} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group h-full cursor-pointer">
                  <div className="w-14 h-14 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <LucideIcon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </CardWrapper>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function TrainingProgramCard({ program }: { program: any }) {
  const meta: { icon: typeof Clock; label: string; value: string }[] = [];
  if (program.duration) meta.push({ icon: Clock, label: "Duration", value: program.duration });
  if (program.mode) meta.push({ icon: MonitorPlay, label: "Mode", value: program.mode });
  if (program.startDate) meta.push({ icon: CalendarDays, label: "Starts", value: formatProgramDate(program.startDate) });
  if (program.eligibility) meta.push({ icon: UserCheck, label: "Eligibility", value: program.eligibility });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">
      {program.coverImage && (
        <div className="aspect-video w-full bg-gray-100 overflow-hidden">
          <img
            src={program.coverImage}
            alt={program.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-7 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">{program.name}</h3>

        {program.description && (
          <p className="text-gray-600 text-sm leading-relaxed mb-5">{program.description}</p>
        )}

        {meta.length > 0 && (
          <dl className="space-y-2.5 mb-6">
            {meta.map(({ icon: MetaIcon, label, value }) => (
              <div key={label} className="flex items-start gap-2.5 text-sm">
                <MetaIcon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <dt className="sr-only">{label}</dt>
                <dd className="text-gray-700">
                  <span className="text-gray-400">{label}: </span>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-auto pt-2">
          {program.registrationUrl ? (
            <a
              href={program.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors cursor-pointer"
            >
              Register Now <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <span className="inline-flex w-full items-center justify-center gap-2 bg-gray-100 text-gray-400 font-semibold px-6 py-3 rounded-full text-sm cursor-not-allowed">
              Registration Opening Soon
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Start dates are stored as free text so admins can type "Rolling intake" as well as
// a real date; only reformat when it actually parses as one.
function formatProgramDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// ─── Contact Page Section ──────────────────────────────────────────────────
function ContactSection() {
  const { data: info } = useQuery<any>({
    queryKey: ["content", "contact-info"],
    queryFn: () => fetch("/api/content/contact-info").then(r => r.json()),
  });

  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      // silent fail
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Contact Info Panel */}
      <div className="space-y-6">
        {info && (
          <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
            {info.email && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                  <a href={`mailto:${info.email}`} className="text-gray-800 hover:text-primary transition-colors font-medium">{info.email}</a>
                </div>
              </div>
            )}
            {info.phone && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                  <a href={`tel:${info.phone}`} className="text-gray-800 hover:text-primary transition-colors font-medium">{info.phone}</a>
                </div>
              </div>
            )}
            {info.address && (
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Address</p>
                  <p className="text-gray-800 font-medium whitespace-pre-line">{info.address}</p>
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Contact Form */}
      <section className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        {submitted ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
            <p className="text-gray-500">Thank you for reaching out. We'll get back to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="john@company.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm" placeholder="Project Inquiry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea required rows={5} value={formData.message} onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm resize-none" placeholder="Tell us about your project..." />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 cursor-pointer">
              {submitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </section>
    </div>
  );
}

// ─── Homepage Photo Gallery ─────────────────────────────────────────────────
// Rendered both as a section on the home page and as the whole /gallery page. The
// dedicated page already gets its title from the PageBanner, so it hides the header.
function HomepageGallery({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [lightboxPhoto, setLightboxPhoto] = useState<any>(null);

  const { data: photos = [] } = useQuery<any[]>({
    queryKey: ["content", "gallery-photos"],
    queryFn: async () => {
      const res = await fetch("/api/content/gallery-photos");
      if (!res.ok) throw new Error("Failed to fetch gallery");
      return res.json();
    },
  });

  if (photos.length === 0) return null;

  // Group photos under their Event / Category heading, preserving the order the API
  // returned. Photos with no category collapse into one trailing ungrouped set, so a
  // gallery where nobody has set a category renders exactly as it did before.
  const groups: { category: string; items: any[] }[] = [];
  for (const photo of photos) {
    const category = (photo.category || "").trim();
    const existing = groups.find(g => g.category === category);
    if (existing) {
      existing.items.push(photo);
    } else {
      groups.push({ category, items: [photo] });
    }
  }
  groups.sort((a, b) => (a.category === "" ? 1 : 0) - (b.category === "" ? 1 : 0));

  const hasCategories = groups.some(g => g.category !== "");

  return (
    <>
      <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
        {showHeader && (
          <div className="text-center mb-10">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm mb-2">Our Gallery</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Photo Gallery</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">A glimpse into our projects, facilities, and team in action.</p>
          </div>
        )}

        <div className="space-y-12">
          {groups.map((group) => (
            <div key={group.category || "__ungrouped"}>
              {hasCategories && (
                <div className="flex items-center gap-4 mb-5">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 shrink-0">
                    {group.category || "More Photos"}
                  </h3>
                  <span className="text-xs font-medium text-gray-400 shrink-0">
                    {group.items.length} {group.items.length === 1 ? "photo" : "photos"}
                  </span>
                  <div className="h-px bg-gray-200 flex-grow" />
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {group.items.map((photo: any, idx: number) => (
                  <div
                    key={photo.id || idx}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onClick={() => setLightboxPhoto(photo)}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.title || "Gallery photo"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {(photo.title || photo.description) && (
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        {photo.title && <h4 className="font-bold text-sm truncate">{photo.title}</h4>}
                        {photo.description && <p className="text-[11px] text-gray-300 line-clamp-2 mt-0.5">{photo.description}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); setLightboxPhoto(null); }}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={lightboxPhoto.imageUrl}
              alt={lightboxPhoto.title || "Gallery photo"}
              className="max-w-full max-h-[75vh] rounded-lg shadow-2xl object-contain"
            />
            {(lightboxPhoto.title || lightboxPhoto.description) && (
              <div className="text-center text-white mt-4 max-w-xl">
                {lightboxPhoto.title && <h3 className="font-bold text-lg">{lightboxPhoto.title}</h3>}
                {lightboxPhoto.description && <p className="text-sm text-gray-400 mt-1">{lightboxPhoto.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Home Page Sections (stats + services preview) ─────────────────────────
function HomeSection() {
  const { data: homeContent } = useQuery<any>({
    queryKey: ["content", "home"],
    queryFn: () => fetch("/api/content/home").then(r => r.json()),
  });
  const { data: servicesList = [] } = useQuery<any[]>({
    queryKey: ["content", "services"],
    queryFn: () => fetch("/api/content/services").then(r => r.json()),
  });

  const stats = homeContent?.stats || [
    { value: "10+", label: "Global Projects" },
    { value: "50%", label: "Efficiency" },
    { value: "100%", label: "Sustainable Focus" },
  ];

  const displayServices = servicesList.slice(0, 3);

  return (
    <div className="space-y-16">
      {/* Stats bar */}
      <section className="bg-primary text-white py-12 rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center divide-x divide-white/20 px-8">
          {stats.map((stat: any, i: number) => (
            <div key={i}>
              <div className="text-4xl font-bold font-serif mb-2">{stat.value}</div>
              <div className="text-sm text-white/80 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services preview */}
      {displayServices.length > 0 && (
        <section>
          <div className="text-center mb-10">
            <p className="text-primary font-semibold tracking-wider uppercase text-sm mb-2">Our Expertise</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
              {homeContent?.servicesTitle || "Comprehensive Engineering Solutions"}
            </h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">{homeContent?.servicesSubtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayServices.map((service: any) => {
              const LucideIcon = (Icons as any)[service.icon] || Icons.Settings;
              return (
                <CardWrapper key={service.id} link={service.link} className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <LucideIcon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                </CardWrapper>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Link href="/services">
              <Button className="bg-primary hover:bg-primary/90 text-white cursor-pointer">
                View All Services <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Sustainability CTA */}
      {homeContent?.sustainabilityTitle && (
        <section className="bg-gradient-to-r from-primary/5 to-primary/10 p-10 md:p-14 rounded-2xl border border-primary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{homeContent.sustainabilityTitle}</h2>
              <p className="text-gray-600 leading-relaxed">{homeContent.sustainabilityText}</p>
            </div>
            <ul className="space-y-3">
              {(homeContent.sustainabilityItems || []).map((item: string, i: number) => (
                <li key={i} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Photo Gallery */}
      <HomepageGallery />

      {/* Final CTA */}
      {homeContent?.ctaTitle && (
        <section className="text-center bg-primary text-white p-10 md:p-14 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">{homeContent.ctaTitle}</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-6">{homeContent.ctaSubtitle}</p>
          <Link href="/contact">
            <Button className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-3 cursor-pointer">
              Get in Touch <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}

// ─── Slug → Renderer map ────────────────────────────────────────────────────
const SLUG_CONTENT_MAP: Record<string, React.ComponentType> = {
  home: HomeSection,
  about: AboutSection,
  services: ServicesSection,
  industries: IndustriesSection,
  research: ResearchSection,
  software: SoftwareSection,
  training: TrainingSection,
  contact: ContactSection,
  careers: CareersSection,
  gallery: GalleryPageSection,
};

// The /gallery page is the full photo gallery; its title comes from the PageBanner.
function GalleryPageSection() {
  return <HomepageGallery showHeader={false} />;
}

// Core pages render from their own database tables, so they must stay reachable even
// if the CMS "pages" row is missing or an admin unpublished it. Without this, a blank
// pages table turns every built-in route (notably /contact) into a 404.
const DEFAULT_PAGE_META: Record<string, { title: string; subtitle: string; heroImage: string }> = {
  home: { title: "Home", subtitle: "SustainPro Homepage", heroImage: "/hero-bg.png" },
  about: { title: "About Us", subtitle: "Engineering a greener tomorrow", heroImage: "/about-bg.png" },
  services: { title: "Our Services", subtitle: "Comprehensive Engineering Solutions", heroImage: "/hero-bg.png" },
  industries: { title: "Industries We Serve", subtitle: "Global Industrial Expertise", heroImage: "/about-bg.png" },
  research: { title: "Research & Development", subtitle: "Pioneering Sustainable Innovation", heroImage: "/research-bg.png" },
  software: { title: "Software Solutions", subtitle: "Advanced Process Modeling Tools", heroImage: "/about-bg.png" },
  training: { title: "Training Programs", subtitle: "Empowering Your Engineering Team", heroImage: "/about-bg.png" },
  careers: { title: "Careers", subtitle: "Join Our Dynamic Team", heroImage: "/about-bg.png" },
  contact: { title: "Contact Us", subtitle: "Get in touch with our experts", heroImage: "/about-bg.png" },
  gallery: { title: "Photo Gallery", subtitle: "Moments from our projects, training programs and events", heroImage: "/about-bg.png" },
};

// ─── Main DynamicPage Component ─────────────────────────────────────────────
export default function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [selectedMedia, setSelectedMedia] = useState<GalleryItem | null>(null);

  const { data: fetchedPage, isLoading } = useQuery<PageData | null>({
    queryKey: ["public-page", slug, window.location.search],
    queryFn: async () => {
      const res = await fetch(`/api/content/page/${slug}${window.location.search}`);
      // 404 means the admin deliberately unpublished this page — keep it hidden
      // rather than letting the built-in fallback below resurrect it.
      if (res.status === 404) return { __unpublished: true } as unknown as PageData;
      if (!res.ok) throw new Error("Page not found");
      return res.json();
    },
  });

  // A null body means there is simply no CMS row for this slug. Built-in pages then
  // fall back to their default metadata and still render their own content section,
  // so a missing row no longer turns /contact (or any core route) into a 404.
  const isUnpublished = (fetchedPage as unknown as { __unpublished?: boolean })?.__unpublished === true;
  const fallbackMeta = DEFAULT_PAGE_META[slug];
  const page: PageData | null = isUnpublished
    ? null
    : fetchedPage ??
      (fallbackMeta ? ({ ...fallbackMeta, description: "", sections: [], gallery: [] } as unknown as PageData) : null);

  useEffect(() => {
    if (page) {
      document.title = page.seoTitle || `${page.title} | SustainPro`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", page.seoDescription || page.description || "");
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", page.seoKeywords || "");
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 text-sm">Loading page content...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="pt-32 pb-20 text-center min-h-[60vh] bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
        <p className="text-gray-600 mb-8 max-w-md">The page you are looking for does not exist or has been unpublished by the administrator.</p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer">Return to Homepage</Button>
        </Link>
      </div>
    );
  }

  const sectionsList: Section[] = page.sections
    ? (typeof page.sections === "string" ? JSON.parse(page.sections) : page.sections)
    : [];

  const galleryList: GalleryItem[] = page.gallery
    ? (typeof page.gallery === "string" ? JSON.parse(page.gallery) : page.gallery)
    : [];

  // Pick the specific section renderer (if slug matches a known type)
  const SlugContentSection = SLUG_CONTENT_MAP[slug];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero: slider for home, banner for all others */}
      {slug === "home" ? (
        <HeroSlider />
      ) : (
        <PageBanner
          slug={slug}
          defaultTitle={page.title}
          defaultSubtitle={page.subtitle}
          defaultImage={page.heroImage || "/banners/default.png"}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-16 pb-8">
        {/* CMS description text (if provided by admin) */}
        {page.description && (
          <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm leading-relaxed text-gray-700 text-lg">
            <p className="whitespace-pre-line">{page.description}</p>
          </section>
        )}

        {/* SLUG-SPECIFIC RICH CONTENT (from database tables) */}
        {SlugContentSection && <SlugContentSection />}

        {/* CMS Layout Sections (added via Page Builder) */}
        {sectionsList.length > 0 && sectionsList.map((section) => {
          const isButtonExternal = section.buttonLink?.startsWith("http") || section.openInNewTab;
          return (
            <section
              key={section.id}
              className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in duration-500"
            >
              {section.title && (
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">{section.title}</h2>
              )}
              {section.subtitle && (
                <p className="text-sm font-medium text-primary tracking-wider uppercase mb-6">{section.subtitle}</p>
              )}
              {section.content && (
                <div
                  className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-line text-base mb-6"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              )}
              {section.type === "cta-banner" && section.buttonText && section.buttonLink && (
                <div className="pt-4">
                  {isButtonExternal ? (
                    <a href={section.buttonLink} target="_blank" rel="noopener noreferrer">
                      <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg cursor-pointer">
                        {section.buttonText} <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  ) : (
                    <Link href={section.buttonLink}>
                      <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg cursor-pointer">
                        {section.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* Gallery Grid */}
        {galleryList.length > 0 && (
          <section className="bg-white p-8 md:p-12 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
              Page Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {galleryList.map((item) => {
                const isVideo = item.type === "video";
                return (
                  <div
                    key={item.id}
                    className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-gray-950">
                        {item.url ? (
                          <video src={item.url} className="w-full h-full object-cover opacity-60" muted playsInline />
                        ) : (
                          <div className="w-full h-full bg-gray-900 opacity-60" />
                        )}
                        <div className="absolute h-12 w-12 rounded-full bg-primary/90 text-white flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                          <Play className="h-6 w-6 ml-0.5 fill-white text-white" />
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url || "/placeholder-gallery.png"}
                        alt={item.title || "Gallery photo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/95 via-gray-900/60 to-transparent p-4 text-white translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <h4 className="font-bold text-sm truncate">{item.title || "Untitled"}</h4>
                      {item.description && <p className="text-[10px] text-gray-300 line-clamp-2 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <button
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full flex flex-col items-center">
            {selectedMedia.type === "video" ? (
              <video src={selectedMedia.url} className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" controls autoPlay />
            ) : (
              <img src={selectedMedia.url} alt={selectedMedia.title} className="max-w-full max-h-[70vh] rounded-lg shadow-2xl object-contain" />
            )}
            {(selectedMedia.title || selectedMedia.description) && (
              <div className="text-center text-white mt-4 max-w-xl">
                {selectedMedia.title && <h3 className="font-bold text-lg">{selectedMedia.title}</h3>}
                {selectedMedia.description && <p className="text-sm text-gray-400 mt-1">{selectedMedia.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
