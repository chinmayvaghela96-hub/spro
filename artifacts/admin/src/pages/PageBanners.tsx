import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Image } from "lucide-react";

const columns: ColumnDef[] = [
  {
    key: "pageSlug",
    label: "Page Slug",
    type: "select",
    required: true,
    options: [
      { label: "About Page (/about)", value: "about" },
      { label: "Services Page (/services)", value: "services" },
      { label: "Industries Page (/industries)", value: "industries" },
      { label: "Research Page (/research)", value: "research" },
      { label: "Software Page (/software)", value: "software" },
      { label: "Training Page (/training)", value: "training" },
      { label: "Contact Page (/contact)", value: "contact" },
    ],
  },
  { key: "title", label: "Banner Title", type: "text", placeholder: "e.g. Our Services", required: true },
  { key: "subtitle", label: "Banner Subtitle", type: "textarea", placeholder: "e.g. World-class engineering solutions..." },
  { key: "imageUrl", label: "Banner Background Image", type: "image" },
  { key: "isActive", label: "Enable / Show Banner", type: "boolean" },
];

export default function PageBanners() {
  return (
    <CrudList
      title="Page Static Banners"
      description="Manage the title, subtitle, and background hero image for each main page of the website."
      icon={<Image className="w-5 h-5" />}
      apiEndpoint="/admin/page-banners"
      queryKey="admin-page-banners"
      columns={columns}
      itemName="Page Banner"
    />
  );
}
