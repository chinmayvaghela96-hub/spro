import { useQuery } from "@tanstack/react-query";

interface PageBannerProps {
  slug: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultImage: string;
}

export function PageBanner({ slug, defaultTitle, defaultSubtitle, defaultImage }: PageBannerProps) {
  const { data } = useQuery<any>({
    queryKey: ["page-banner", slug],
    queryFn: async () => {
      const res = await fetch(`/api/content/page-banner/${slug}`);
      if (!res.ok) throw new Error("Failed to fetch page banner");
      return res.json();
    }
  });

  const title = data?.title || defaultTitle;
  const subtitle = data?.subtitle || defaultSubtitle;
  const imageUrl = data?.imageUrl || defaultImage;

  return (
    <section className="bg-gray-900 text-white py-20 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover opacity-35"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/60 to-gray-900/80"></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">{title}</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
