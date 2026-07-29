import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Bell } from "lucide-react";
import { Badge } from "../components/ui";

const columns: ColumnDef[] = [
  { key: "title", label: "Title", type: "text", placeholder: "Notice title", required: true },
  { key: "description", label: "Content", type: "textarea", placeholder: "Notice content", required: true },
  { key: "fileUrl", label: "Attachment URL", type: "url", placeholder: "https://...", hideInTable: true },
  {
    key: "expiryDate",
    label: "Expiry Date",
    type: "date",
    placeholder: "YYYY-MM-DD",
    render: (val: string) => val ? new Date(val).toLocaleDateString() : "No expiry",
  },
  {
    key: "isPinned",
    label: "Pinned",
    type: "select",
    options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }],
    render: (val: any) => {
      const pinned = val === true || val === "true";
      return <Badge color={pinned ? "success" : "muted"}>{pinned ? "Pinned" : "No"}</Badge>;
    },
  },
];

export default function Notices() {
  return (
    <CrudList
      title="Notices"
      description="Manage notices and announcements."
      icon={<Bell className="w-5 h-5" />}
      apiEndpoint="/admin/notices"
      queryKey="admin-notices"
      columns={columns}
      itemName="Notice"
    />
  );
}

