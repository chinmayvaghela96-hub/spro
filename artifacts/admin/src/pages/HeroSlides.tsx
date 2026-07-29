import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Sliders } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "imageUrl", label: "Image Background", type: "image", required: true },
  { key: "title", label: "Image Label / Name", type: "text", placeholder: "e.g. Industrial Plant Close-up" },
  { key: "isActive", label: "Enable / Rotate Image", type: "boolean" },
  { key: "order", label: "Sort Order", type: "number", placeholder: "0" },
];

export default function HeroSlides() {
  return (
    <CrudList
      title="Homepage Hero Slides"
      description="Manage the carousel image slides shown at the top of the homepage."
      icon={<Sliders className="w-5 h-5" />}
      apiEndpoint="/admin/hero-slides"
      queryKey="admin-hero-slides"
      columns={columns}
      itemName="Hero Slide"
    />
  );
}
