import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Factory } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "name", label: "Industry Name", type: "text", placeholder: "e.g. Petrochemical", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "Details about operations in this industry", hideInTable: true },
  { key: "icon", label: "Icon Name", type: "text", placeholder: "e.g. Factory, Flame, Droplet", required: true },
  { key: "link", label: "Redirect Hyperlink", type: "text", placeholder: "e.g. /custom-page or https://..." },
  { key: "order", label: "Order", type: "number", placeholder: "0" },
];

export default function Industries() {
  return (
    <CrudList
      title="Industries"
      description="Manage dynamic industries listed on the industries section."
      icon={<Factory className="w-5 h-5" />}
      apiEndpoint="/admin/industries"
      queryKey="admin-industries"
      columns={columns}
      itemName="Industry"
    />
  );
}
