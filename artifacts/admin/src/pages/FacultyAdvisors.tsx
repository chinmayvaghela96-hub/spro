import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiGet } from "../lib/api";
import { Card, Skeleton, EmptyState, Button } from "../components/ui";
import { UserCircle } from "lucide-react";

interface AdminPage {
  id: number;
  slug: string;
}

/**
 * Faculty Advisors are stored on the About page content, and the editor for them lives
 * in the Page Builder's About page. This shortcut resolves the About page id and jumps
 * straight to that tab, so the section is reachable from the sidebar instead of only
 * being findable by digging through the Page Builder.
 */
export default function FacultyAdvisors() {
  const [, navigate] = useLocation();

  const { data: pages, isLoading, isError } = useQuery<AdminPage[]>({
    queryKey: ["admin-pages"],
    queryFn: () => apiGet("/admin/pages"),
  });

  const aboutPage = pages?.find((p) => p.slug === "about");

  useEffect(() => {
    if (aboutPage) {
      navigate(`/admin/pages/${aboutPage.id}?tab=advisors`, { replace: true });
    }
  }, [aboutPage, navigate]);

  if (isLoading) {
    return (
      <Card>
        <Skeleton className="h-8 w-56 mb-4" />
        <Skeleton className="h-24 rounded-xl" />
      </Card>
    );
  }

  if (isError || !aboutPage) {
    return (
      <Card>
        <EmptyState
          icon={<UserCircle className="w-8 h-8" />}
          title="About page not found"
          description="Faculty Advisors are stored on the About page. Create a page with the slug “about” in the Page Builder first."
          action={<Button onClick={() => navigate("/admin/pages")}>Open Page Builder</Button>}
        />
      </Card>
    );
  }

  return null;
}
