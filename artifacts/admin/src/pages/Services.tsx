import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Briefcase } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "title", label: "Title", type: "text", placeholder: "e.g. Process Engineering", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "Details about this service", hideInTable: true },
  { key: "icon", label: "Icon Name", type: "text", placeholder: "e.g. Settings, Leaf, Cpu", required: true },
  { key: "link", label: "Redirect Hyperlink", type: "text", placeholder: "e.g. /custom-page or https://..." },
  { key: "order", label: "Order", type: "number", placeholder: "0" },
];

export default function Services() {
  return (
    <CrudList
      title="Services"
      description="Manage dynamic services listed on the homepage and services section."
      icon={<Briefcase className="w-5 h-5" />}
      apiEndpoint="/admin/services"
      queryKey="admin-services"
      columns={columns}
      itemName="Service"
    />
  );
}
