import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Link2 } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "label", label: "Link Label", type: "text", placeholder: "e.g. Services", required: true },
  { key: "href", label: "Target URL / Path", type: "text", placeholder: "e.g. /services or https://external-link.com", required: true },
  { key: "order", label: "Sort Order", type: "number", placeholder: "0" },
];

export default function NavItems() {
  return (
    <CrudList
      title="Header Navigation Menu"
      description="Manage the main navigation links shown in the top header. You can add new links, edit their destinations, reorder, or delete them."
      icon={<Link2 className="w-5 h-5" />}
      apiEndpoint="/admin/nav-items"
      queryKey="admin-nav-items"
      columns={columns}
      itemName="Navigation Link"
    />
  );
}
