import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Monitor } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "title", label: "Software Title", type: "text", placeholder: "e.g. ModelPro Simulation Suite", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "Details about this software tool", hideInTable: true },
  { key: "icon", label: "Icon Name", type: "text", placeholder: "e.g. Monitor, Play, Cpu", required: true },
  { key: "link", label: "Redirect Hyperlink", type: "text", placeholder: "e.g. /custom-page or https://..." },
  { key: "order", label: "Order", type: "number", placeholder: "0" },
];

export default function Software() {
  return (
    <CrudList
      title="Software Solutions"
      description="Manage process modeling and software solution offerings."
      icon={<Monitor className="w-5 h-5" />}
      apiEndpoint="/admin/software"
      queryKey="admin-software"
      columns={columns}
      itemName="Software Item"
    />
  );
}
