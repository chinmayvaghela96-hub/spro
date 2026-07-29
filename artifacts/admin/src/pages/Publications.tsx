import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { BookOpen } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "title", label: "Publication Title", type: "text", placeholder: "e.g. Sustainable Optimization of Chemical Processes Vol 1", required: true },
  { key: "authors", label: "Authors", type: "text", placeholder: "e.g. Dr. John Smith, Dr. Jane Doe", required: true },
  { key: "journal", label: "Journal / Venue", type: "text", placeholder: "e.g. Journal of Green Engineering", required: true },
  { key: "year", label: "Year", type: "number", placeholder: "e.g. 2024", required: true },
  { key: "pdfUrl", label: "PDF Attachment URL", type: "text", placeholder: "e.g. /uploads/publication1.pdf or external link" },
  { key: "link", label: "External Article / Publisher Link", type: "text", placeholder: "e.g. DOI URL or publisher website" },
  {
    key: "openInNewTab",
    label: "Open in New Tab",
    type: "select",
    options: [
      { label: "Yes (New Tab)", value: "true" },
      { label: "No (Same Tab)", value: "false" },
    ],
  },
  { key: "order", label: "Sort Order", type: "number", placeholder: "0" },
];

export default function Publications() {
  return (
    <CrudList
      title="Research Publications"
      description="Manage published papers, journals, patents, and scientific literature."
      icon={<BookOpen className="w-5 h-5" />}
      apiEndpoint="/admin/research/publications"
      queryKey="admin-publications"
      columns={columns}
      itemName="Publication"
    />
  );
}
