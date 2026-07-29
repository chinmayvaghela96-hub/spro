import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { GraduationCap } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "title", label: "Program Title", type: "text", placeholder: "e.g. Advanced Distillation Control", required: true },
  { key: "description", label: "Description", type: "textarea", placeholder: "Details about this training course", hideInTable: true },
  { key: "icon", label: "Icon Name", type: "text", placeholder: "e.g. GraduationCap, Award, BookOpen", required: true },
  { key: "link", label: "Redirect Hyperlink", type: "text", placeholder: "e.g. /custom-page or https://..." },
  { key: "order", label: "Order", type: "number", placeholder: "0" },
];

export default function Training() {
  return (
    <CrudList
      title="Training Programs"
      description="Manage educational training modules and engineering courses."
      icon={<GraduationCap className="w-5 h-5" />}
      apiEndpoint="/admin/training"
      queryKey="admin-training"
      columns={columns}
      itemName="Training Program"
    />
  );
}
