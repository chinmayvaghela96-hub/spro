import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { apiGet, apiPut } from "../lib/api";
import { PageHeader, Card, Button, Input, TextArea, Skeleton, Badge } from "../components/ui";
import { MediaPicker } from "../components/ui/MediaPicker";
import { 
  ArrowLeft, Save, Layout, Image, FileText, Settings, 
  Plus, Trash2, ArrowUp, ArrowDown, Type, HelpCircle, 
  Grid, Play, Eye, FileUp, UserCircle
} from "lucide-react";
import toast from "react-hot-toast";

type PageEditorProps = {
  params: { id: string };
};

type Section = {
  id: string;
  type: "rich-text" | "features-grid" | "cta-banner" | "accordion-faq";
  title: string;
  subtitle: string;
  content: string;
  buttonText: string;
  buttonLink: string;
  openInNewTab: boolean;
  items: any[];
};

type GalleryItem = {
  id: string;
  url: string;
  type: "image" | "video";
  title: string;
  description: string;
};

export default function PageEditor({ params }: PageEditorProps) {
  const pageId = Number(params.id);
  const [, setLocation] = useLocation();
  const queryClient = queryClientHook();
  
  const [activeTab, setActiveTab] = useState<"general" | "about-us" | "advisors" | "sections" | "gallery" | "seo">("general");

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showInMenu, setShowInMenu] = useState(true);
  const [order, setOrder] = useState(0);

  // About Page states (only populated if slug === "about")
  const [whoWeAreTitle, setWhoWeAreTitle] = useState("");
  const [whoWeAreText, setWhoWeAreText] = useState("");
  const [visionTitle, setVisionTitle] = useState("");
  const [visionText, setVisionText] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionText, setMissionText] = useState("");
  const [valuesTitle, setValuesTitle] = useState("");
  const [valuesText, setValuesText] = useState("");
  const [leadershipTitle, setLeadershipTitle] = useState("");
  const [leadershipText, setLeadershipText] = useState("");
  const [advisors, setAdvisors] = useState<any[]>([]);

  // SEO states
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Sections states
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Gallery states
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  // Fetch page details
  const { data: pageData, isLoading } = useQuery<any>({
    queryKey: ["admin-page", pageId],
    queryFn: () => apiGet(`/admin/pages/${pageId}`),
  });

  const isAboutPage = slug === "about" || (pageData && pageData.slug === "about");

  // Fetch About Page Content (only if slug === "about")
  const { data: aboutData } = useQuery<any>({
    queryKey: ["admin-about-content"],
    queryFn: () => apiGet("/admin/about"),
    enabled: !!isAboutPage,
  });

  // Populate states when data loads
  useEffect(() => {
    if (pageData) {
      setTitle(pageData.title || "");
      setSlug(pageData.slug || "");
      setSubtitle(pageData.subtitle || "");
      setDescription(pageData.description || "");
      setHeroImage(pageData.heroImage || "");
      setIsActive(pageData.isActive !== false);
      setShowInMenu(pageData.showInMenu !== false);
      setOrder(pageData.order || 0);

      setSeoTitle(pageData.seoTitle || "");
      setSeoDescription(pageData.seoDescription || "");
      setSeoKeywords(pageData.seoKeywords || "");

      const parsedSections = pageData.sections 
        ? (typeof pageData.sections === "string" ? JSON.parse(pageData.sections) : pageData.sections) 
        : [];
      setSections(parsedSections);
      
      const parsedGallery = pageData.gallery 
        ? (typeof pageData.gallery === "string" ? JSON.parse(pageData.gallery) : pageData.gallery) 
        : [];
      setGallery(parsedGallery);
    }
  }, [pageData]);

  useEffect(() => {
    if (aboutData) {
      setWhoWeAreTitle(aboutData.whoWeAreTitle || "");
      setWhoWeAreText(aboutData.whoWeAreText || "");
      setVisionTitle(aboutData.visionTitle || "");
      setVisionText(aboutData.visionText || "");
      setMissionTitle(aboutData.missionTitle || "");
      setMissionText(aboutData.missionText || "");
      setValuesTitle(aboutData.valuesTitle || "");
      setValuesText(aboutData.valuesText || "");
      setLeadershipTitle(aboutData.leadershipTitle || "");
      setLeadershipText(aboutData.leadershipText || "");
      
      const parsedAdvisors = aboutData.advisors
        ? (Array.isArray(aboutData.advisors)
          ? aboutData.advisors
          : (typeof aboutData.advisors === "string" ? JSON.parse(aboutData.advisors || "[]") : []))
        : [];
      setAdvisors(parsedAdvisors);
    }
  }, [aboutData]);

  function queryClientHook() {
    return useQueryClient();
  }

  // Save Mutation
  const saveMutation = useMutation({
    mutationFn: (body: any) => apiPut(`/admin/pages/${pageId}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      queryClient.invalidateQueries({ queryKey: ["admin-page", pageId] });
      if (!isAboutPage) {
        toast.success("Page changes saved successfully!");
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to save page changes"),
  });

  const saveAboutMutation = useMutation({
    mutationFn: (body: any) => apiPut("/admin/about", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-content"] });
      toast.success("Page and About Us content saved successfully!");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save About Us content changes"),
  });

  const handleSave = () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Title and Slug are required.");
      return;
    }
    saveMutation.mutate({
      title,
      slug,
      subtitle,
      description,
      heroImage,
      isActive,
      showInMenu,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      sections,
      gallery,
    });

    if (isAboutPage) {
      saveAboutMutation.mutate({
        heroTitle: title,
        heroSubtitle: subtitle,
        heroBgImage: heroImage,
        whoWeAreTitle,
        whoWeAreText,
        visionTitle,
        visionText,
        missionTitle,
        missionText,
        valuesTitle,
        valuesText,
        leadershipTitle,
        leadershipText,
        advisors,
      });
    }
  };

  // Section managers
  const addSection = (type: Section["type"]) => {
    const newSection: Section = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: `New ${type === "rich-text" ? "Rich Text" : type === "features-grid" ? "Features" : type === "cta-banner" ? "CTA" : "FAQ"} Section`,
      subtitle: "",
      content: "",
      buttonText: "",
      buttonLink: "",
      openInNewTab: false,
      items: type === "features-grid" ? [] : type === "accordion-faq" ? [] : [],
    };
    const updated = [...sections, newSection];
    setSections(updated);
    setSelectedSectionId(newSection.id);
    toast.success("Section added!");
  };

  const removeSection = (id: string) => {
    const updated = sections.filter((s) => s.id !== id);
    setSections(updated);
    if (selectedSectionId === id) setSelectedSectionId(null);
    toast.success("Section deleted!");
  };

  const updateSectionField = (id: string, field: keyof Section, value: any) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, [field]: value } : s));
    setSections(updated);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSections(updated);
  };

  // Gallery managers
  const addGalleryItem = () => {
    const newItem: GalleryItem = {
      id: Math.random().toString(36).substr(2, 9),
      url: "",
      type: "image",
      title: "",
      description: "",
    };
    setGallery([...gallery, newItem]);
  };

  const removeGalleryItem = (id: string) => {
    setGallery(gallery.filter((g) => g.id !== id));
  };

  const updateGalleryField = (id: string, field: keyof GalleryItem, value: any) => {
    setGallery(gallery.map((g) => (g.id === id ? { ...g, [field]: value } : g)));
  };

  const moveGalleryItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === gallery.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...gallery];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setGallery(updated);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="p-2" onClick={() => setLocation("/admin/pages")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[var(--color-text)]">Page Builder: {title || "Untitled Page"}</h1>
            <p className="text-xs text-[var(--color-text-muted)] font-mono">/{slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a href={`/${slug}?preview=true`} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <Eye className="w-4 h-4" /> Live Preview
            </Button>
          </a>
          <Button variant="primary" size="sm" onClick={handleSave} loading={saveMutation.isPending}>
            <Save className="w-4 h-4" /> Save Page Builder
          </Button>
        </div>
      </div>

      {/* Help Banner Helper for dynamic pages */}
      {(slug === "services" || slug === "industries" || slug === "software" || slug === "training" || slug === "home") && (
        <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-primary-light)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div>
            <h4 className="text-sm font-bold text-[var(--color-primary)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              Dynamic Page Content Manager Link
            </h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5 leading-relaxed">
              This page displays dynamic lists loaded directly from your database. To create, edit, or delete the individual items (cards, details, slides, or gallery photos), please use the dedicated content editor.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap shrink-0">
            {slug === "home" ? (
              <>
                <Link href="/admin/hero-slides">
                  <Button size="sm" variant="primary" className="shadow-sm">
                    Manage Homepage Slides ➜
                  </Button>
                </Link>
                <Link href="/admin/gallery">
                  <Button size="sm" variant="secondary" className="shadow-sm">
                    Manage Photo Gallery ➜
                  </Button>
                </Link>
              </>
            ) : (
              <Link href={
                slug === "services" ? "/admin/services" :
                slug === "industries" ? "/admin/industries" :
                slug === "software" ? "/admin/software" :
                "/admin/training"
              }>
                <Button size="sm" variant="primary" className="shadow-sm">
                  Manage {
                    slug === "services" ? "Services List" :
                    slug === "industries" ? "Industries List" :
                    slug === "software" ? "Software Solutions" :
                    "Training Programs"
                  } ➜
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Tabs Menu Header */}
      <div className="flex border-b border-[var(--color-border)] gap-2 bg-[var(--color-surface)] p-1 rounded-xl border">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "general"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Settings className="w-4 h-4" /> General Copy
        </button>
        {isAboutPage && (
          <>
            <button
              onClick={() => setActiveTab("about-us")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "about-us"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <FileText className="w-4 h-4" /> About Us Content
            </button>
            <button
              onClick={() => setActiveTab("advisors")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === "advisors"
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
              }`}
            >
              <UserCircle className="w-4 h-4" /> Faculty Advisors ({advisors.length})
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("sections")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "sections"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Layout className="w-4 h-4" /> Layout Sections ({sections.length})
        </button>
        <button
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "gallery"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <Image className="w-4 h-4" /> Gallery Media ({gallery.length})
        </button>
        <button
          onClick={() => setActiveTab("seo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "seo"
              ? "bg-[var(--color-primary)] text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)]"
          }`}
        >
          <FileText className="w-4 h-4" /> SEO & Visibility
        </button>
      </div>

      {/* General Copy Tab Content */}
      {activeTab === "general" && (
        <Card className="space-y-4">
          <h3 className="text-md font-semibold text-[var(--color-text)]">Hero Header Banner & Page Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Page Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Input label="Page Subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Hero Background Image</label>
            <MediaPicker 
              value={heroImage} 
              onChange={setHeroImage} 
              label="Select Hero Background Image"
            />
          </div>
          <TextArea 
            label="Page Primary Content Description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Enter primary copy or context details..."
          />
        </Card>
      )}

      {/* About Us Content Tab Content */}
      {activeTab === "about-us" && (
        <Card className="space-y-6">
          <h3 className="text-md font-semibold text-[var(--color-text)]">Who We Are & Core Philosophy</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Who We Are Title" value={whoWeAreTitle} onChange={(e) => setWhoWeAreTitle(e.target.value)} />
            </div>
            <TextArea label="Who We Are Text" value={whoWeAreText} onChange={(e) => setWhoWeAreText(e.target.value)} rows={4} />
          </div>

          <h3 className="text-md font-semibold text-[var(--color-text)] border-t border-[var(--color-border)] pt-4">Vision, Mission & Core Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Input label="Vision Section Title" value={visionTitle} onChange={(e) => setVisionTitle(e.target.value)} />
              <TextArea label="Vision Text" value={visionText} onChange={(e) => setVisionText(e.target.value)} rows={3} />
            </div>
            <div className="space-y-3">
              <Input label="Mission Section Title" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} />
              <TextArea label="Mission Text" value={missionText} onChange={(e) => setMissionText(e.target.value)} rows={3} />
            </div>
            <div className="space-y-3">
              <Input label="Core Values Section Title" value={valuesTitle} onChange={(e) => setValuesTitle(e.target.value)} />
              <TextArea label="Core Values Text" value={valuesText} onChange={(e) => setValuesText(e.target.value)} rows={3} />
            </div>
          </div>

          <h3 className="text-md font-semibold text-[var(--color-text)] border-t border-[var(--color-border)] pt-4">Leadership Section</h3>
          <div className="space-y-4">
            <Input label="Leadership Title" value={leadershipTitle} onChange={(e) => setLeadershipTitle(e.target.value)} />
            <TextArea label="Leadership Text" value={leadershipText} onChange={(e) => setLeadershipText(e.target.value)} rows={3} />
          </div>
        </Card>
      )}

      {/* Faculty Advisors Tab Content */}
      {activeTab === "advisors" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">Faculty Advisors Profiles</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">Add or remove professor profile cards appearing in the About Us section.</p>
            </div>
            <Button size="sm" type="button" onClick={() => {
              setAdvisors([...advisors, { name: "New Advisor", title: "", institution: "", photoUrl: "", bio: "", link: "" }]);
              toast.success("New advisor profile block added.");
            }}>
              <Plus className="w-4 h-4 mr-2" /> Add Advisor
            </Button>
          </div>

          {advisors.length === 0 ? (
            <Card className="text-center p-8 text-sm text-[var(--color-text-muted)]">
              No advisors defined. Click &ldquo;Add Advisor&rdquo; to add one.
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {advisors.map((advisor, idx) => (
                <Card key={idx} className="relative group border border-[var(--color-border)] p-6 bg-[var(--color-surface)]">
                  <button
                    type="button"
                    onClick={() => {
                      setAdvisors(advisors.filter((_, i) => i !== idx));
                      toast.success("Advisor removed. Remember to save changes.");
                    }}
                    className="absolute top-4 right-4 text-[var(--color-danger)] hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-all cursor-pointer z-10"
                    title="Remove Advisor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pr-8">
                    {/* Photo Picker Column */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center space-y-3 border-r border-[var(--color-border)]/60 pr-4">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-center">
                        Advisor Photo
                      </label>
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center relative">
                        {advisor.photoUrl ? (
                          <img src={advisor.photoUrl} alt={advisor.name} className="w-full h-full object-cover" />
                        ) : (
                          <UserCircle className="w-12 h-12 text-[var(--color-text-muted)]/50" />
                        )}
                      </div>
                      <MediaPicker
                        value={advisor.photoUrl || ""}
                        onChange={(url) => {
                          const updated = [...advisors];
                          updated[idx] = { ...updated[idx], photoUrl: url };
                          setAdvisors(updated);
                        }}
                      />
                    </div>

                    {/* Inputs Column */}
                    <div className="md:col-span-3 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={advisor.name}
                          onChange={(e) => {
                            const updated = [...advisors];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setAdvisors(updated);
                          }}
                          required
                        />
                        <Input
                          label="Title / Role"
                          placeholder="e.g. Associate Professor"
                          value={advisor.title}
                          onChange={(e) => {
                            const updated = [...advisors];
                            updated[idx] = { ...updated[idx], title: e.target.value };
                            setAdvisors(updated);
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Institution / Department"
                          placeholder="e.g. School of Engineering, AU"
                          value={advisor.institution}
                          onChange={(e) => {
                            const updated = [...advisors];
                            updated[idx] = { ...updated[idx], institution: e.target.value };
                            setAdvisors(updated);
                          }}
                        />
                        <Input
                          label="Profile Link / Website"
                          placeholder="e.g. https://ahduni.edu.in/..."
                          value={advisor.link}
                          onChange={(e) => {
                            const updated = [...advisors];
                            updated[idx] = { ...updated[idx], link: e.target.value };
                            setAdvisors(updated);
                          }}
                        />
                      </div>
                      <TextArea
                        label="Short Biography / Specialization details"
                        value={advisor.bio}
                        onChange={(e) => {
                          const updated = [...advisors];
                          updated[idx] = { ...updated[idx], bio: e.target.value };
                          setAdvisors(updated);
                        }}
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Layout Sections Tab Content */}
      {activeTab === "sections" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sections Tree */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
                <span className="text-sm font-bold text-[var(--color-text)]">Sections Structure</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="secondary" className="px-2" onClick={() => addSection("rich-text")} title="Add text section">
                    <Type className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="secondary" className="px-2" onClick={() => addSection("features-grid")} title="Add grid section">
                    <Grid className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="secondary" className="px-2" onClick={() => addSection("cta-banner")} title="Add banner section">
                    <Play className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {sections.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-6">No custom sections added yet. Click one of the buttons above to append a text, grid, or banner section.</p>
              ) : (
                <div className="space-y-2">
                  {sections.map((section, idx) => (
                    <div 
                      key={section.id} 
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-sm transition-all cursor-pointer ${
                        selectedSectionId === section.id 
                          ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)] text-[var(--color-primary)] font-medium" 
                          : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
                      }`}
                      onClick={() => setSelectedSectionId(section.id)}
                    >
                      <span className="truncate max-w-[150px]">{section.title}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button 
                          className="p-1 hover:bg-black/10 rounded cursor-pointer disabled:opacity-30" 
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "up"); }}
                          disabled={idx === 0}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1 hover:bg-black/10 rounded cursor-pointer disabled:opacity-30" 
                          onClick={(e) => { e.stopPropagation(); moveSection(idx, "down"); }}
                          disabled={idx === sections.length - 1}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          className="p-1 hover:bg-red-500/20 text-red-500 rounded cursor-pointer" 
                          onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Section Fields Editor */}
          <div className="lg:col-span-8">
            {selectedSection ? (
              <Card className="space-y-4">
                <div className="border-b border-[var(--color-border)] pb-3">
                  <Badge color="primary">{selectedSection.type.toUpperCase()}</Badge>
                  <h3 className="text-md font-semibold text-[var(--color-text)] mt-2">Edit Section: {selectedSection.title}</h3>
                </div>

                <Input 
                  label="Section Title" 
                  value={selectedSection.title} 
                  onChange={(e) => updateSectionField(selectedSection.id, "title", e.target.value)} 
                />

                <Input 
                  label="Section Subtitle" 
                  value={selectedSection.subtitle} 
                  onChange={(e) => updateSectionField(selectedSection.id, "subtitle", e.target.value)} 
                />

                <TextArea 
                  label="Section Main Content Description (Markdown / Text)" 
                  value={selectedSection.content} 
                  onChange={(e) => updateSectionField(selectedSection.id, "content", e.target.value)}
                  placeholder="You can write copy, description, or rich HTML tags here..."
                />

                {selectedSection.type === "cta-banner" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--color-border)] pt-4">
                    <Input 
                      label="CTA Button text" 
                      value={selectedSection.buttonText} 
                      onChange={(e) => updateSectionField(selectedSection.id, "buttonText", e.target.value)} 
                    />
                    <Input 
                      label="CTA Button Hyperlink" 
                      value={selectedSection.buttonLink} 
                      onChange={(e) => updateSectionField(selectedSection.id, "buttonLink", e.target.value)} 
                    />
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text)] select-none">
                      <input 
                        type="checkbox" 
                        checked={selectedSection.openInNewTab} 
                        onChange={(e) => updateSectionField(selectedSection.id, "openInNewTab", e.target.checked)} 
                      />
                      Open dynamic CTA link in a new browser tab
                    </label>
                  </div>
                )}
              </Card>
            ) : (
              <Card className="flex items-center justify-center p-12 text-[var(--color-text-muted)] text-sm">
                Select a layout section from the structure panel on the left to begin editing its text values, subtitle, or button links.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Gallery Media Tab Content */}
      {activeTab === "gallery" && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
            <h3 className="text-md font-semibold text-[var(--color-text)]">Page Multi-media Gallery</h3>
            <Button size="sm" onClick={addGalleryItem}>
              <Plus className="w-4 h-4" /> Add Media Asset
            </Button>
          </div>

          {gallery.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-8">No images or videos registered in this page's gallery yet. Click 'Add Media Asset' to display dynamic items.</p>
          ) : (
            <div className="space-y-4">
              {gallery.map((item, idx) => (
                <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-hover)]">
                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--color-text)]">Media File</label>
                        <MediaPicker 
                          value={item.url} 
                          onChange={(val) => updateGalleryField(item.id, "url", val)} 
                          label="Select Asset"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[var(--color-text)]">Media Type</label>
                        <select 
                          className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          value={item.type}
                          onChange={(e) => updateGalleryField(item.id, "type", e.target.value)}
                        >
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                        </select>
                      </div>

                      <Input 
                        label="Asset Title" 
                        placeholder="e.g. DES Research Lab Setup" 
                        value={item.title} 
                        onChange={(e) => updateGalleryField(item.id, "title", e.target.value)} 
                      />
                    </div>

                    <TextArea 
                      label="Asset Short Description" 
                      placeholder="Enter a brief text description shown on hover..." 
                      value={item.description} 
                      onChange={(e) => updateGalleryField(item.id, "description", e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>

                  <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-[var(--color-border)] pt-3 md:pt-0 md:pl-4">
                    <button 
                      className="p-2 hover:bg-black/10 rounded cursor-pointer disabled:opacity-30" 
                      onClick={() => moveGalleryItem(idx, "up")}
                      disabled={idx === 0}
                    >
                      <ArrowUp className="w-4 h-4 text-[var(--color-text)]" />
                    </button>
                    <button 
                      className="p-2 hover:bg-black/10 rounded cursor-pointer disabled:opacity-30" 
                      onClick={() => moveGalleryItem(idx, "down")}
                      disabled={idx === gallery.length - 1}
                    >
                      <ArrowDown className="w-4 h-4 text-[var(--color-text)]" />
                    </button>
                    <button 
                      className="p-2 hover:bg-red-500/20 text-red-500 rounded cursor-pointer" 
                      onClick={() => removeGalleryItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* SEO & Visibility Tab Content */}
      {activeTab === "seo" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <Card className="space-y-4">
              <h3 className="text-md font-semibold text-[var(--color-text)]">SEO Parameters</h3>
              <Input 
                label="Meta Title (SEO Title)" 
                value={seoTitle} 
                onChange={(e) => setSeoTitle(e.target.value)} 
                placeholder="defaults to Page Title if left empty"
              />
              <TextArea 
                label="Meta Description" 
                value={seoDescription} 
                onChange={(e) => setSeoDescription(e.target.value)} 
                placeholder="Summarize the page content for search engines..."
              />
              <Input 
                label="SEO Keywords (comma separated)" 
                value={seoKeywords} 
                onChange={(e) => setSeoKeywords(e.target.value)} 
                placeholder="e.g. chemical engineering, process flow, optimization"
              />
            </Card>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card className="space-y-4">
              <h3 className="text-md font-semibold text-[var(--color-text)]">Visibility Controls</h3>
              
              <div className="space-y-4 pt-2">
                <label className="flex items-center gap-3 text-sm text-[var(--color-text)] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={(e) => setIsActive(e.target.checked)} 
                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-semibold block">Publish Page</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Uncheck this draft to unpublish page from the web without deleting it.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 text-sm text-[var(--color-text)] cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={showInMenu} 
                    onChange={(e) => setShowInMenu(e.target.checked)} 
                    className="w-4 h-4 rounded text-[var(--color-primary)]"
                  />
                  <div>
                    <span className="font-semibold block">Show in Navigation Menu</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Check to display link dynamically in the header tab navigation menu.</span>
                  </div>
                </label>

                <Input 
                  label="Display/Sort Order value" 
                  type="number" 
                  value={order} 
                  onChange={(e) => setOrder(Number(e.target.value))} 
                />
              </div>
            </Card>

            <Card className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Danger Zone</h3>
              <p className="text-[10px] text-[var(--color-text-muted)]">Change page path (URL Slug). Warning: This breaks existing indexed search URLs.</p>
              <Input 
                value={slug} 
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-"))} 
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
