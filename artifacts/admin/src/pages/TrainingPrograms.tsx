import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { GraduationCap } from "lucide-react";

const columns: ColumnDef[] = [
  { key: "name", label: "Program Name", type: "text", placeholder: "e.g. Advanced Distillation Control", required: true },
  {
    key: "description",
    label: "Short Description",
    type: "textarea",
    placeholder: "One or two lines summarising the programme",
    hideInTable: true,
  },
  { key: "duration", label: "Duration", type: "text", placeholder: "e.g. 6 weeks" },
  {
    key: "mode",
    label: "Mode",
    type: "select",
    options: [
      { label: "Online", value: "Online" },
      { label: "Offline", value: "Offline" },
      { label: "Hybrid", value: "Hybrid" },
    ],
  },
  { key: "startDate", label: "Start Date", type: "date", placeholder: "Optional" },
  { key: "eligibility", label: "Eligibility", type: "text", placeholder: "Optional, e.g. B.E. / B.Tech students" },
  {
    key: "registrationUrl",
    label: "Registration Link",
    type: "text",
    placeholder: "https://forms.gle/... — where the Register button sends users",
    hideInTable: true,
  },
  { key: "coverImage", label: "Cover Image", type: "image", hideInTable: true },
  { key: "order", label: "Order", type: "number", placeholder: "0" },
  { key: "isActive", label: "Enabled (visible on website)", type: "boolean" },
];

export default function TrainingPrograms() {
  return (
    <CrudList
      title="Training Programs"
      description="Manage the training programmes listed on the public /training page. Changes appear on the website immediately."
      icon={<GraduationCap className="w-5 h-5" />}
      apiEndpoint="/admin/training-programs"
      queryKey="admin-training-programs"
      columns={columns}
      itemName="Program"
    />
  );
}
