import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { ImageIcon } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "imageUrl", label: "Photo", type: "image", required: true },
  { key: "title", label: "Title / Caption", type: "text", placeholder: "e.g. Office Interior" },
  { key: "description", label: "Description", type: "textarea", placeholder: "Short description of the photo..." },
  { key: "isActive", label: "Visible on Website", type: "boolean" },
  { key: "order", label: "Sort Order", type: "number", placeholder: "0" },
];

export default function Gallery() {
  return (
    <CrudList
      title="Photo Gallery"
      description="Manage the photos displayed in the gallery section on the homepage."
      icon={<ImageIcon className="w-5 h-5" />}
      apiEndpoint="/admin/gallery"
      queryKey="admin-gallery"
      columns={columns}
      itemName="Photo"
    />
  );
}
