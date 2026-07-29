import CrudList from "../components/CrudList";
import type { ColumnDef } from "../components/CrudList";
import { Calendar } from "lucide-react";
import { Badge } from "../components/ui";

const columns: ColumnDef[] = [
  { key: "title", label: "Title", type: "text", placeholder: "Event name", required: true },
  {
    key: "date",
    label: "Date",
    type: "date",
    placeholder: "YYYY-MM-DD",
    required: true,
    render: (val: string) => val ? new Date(val).toLocaleDateString() : "—",
  },
  { key: "venue", label: "Venue", type: "text", placeholder: "Event location" },
  {
    key: "type",
    label: "Type",
    type: "select",
    required: true,
    options: [
      { label: "Upcoming", value: "upcoming" },
      { label: "Ongoing", value: "ongoing" },
      { label: "Completed", value: "completed" },
      { label: "Cancelled", value: "cancelled" },
    ],
    render: (val: string) => {
      const colors: Record<string, "success" | "info" | "muted" | "danger"> = {
        upcoming: "info",
        ongoing: "success",
        completed: "muted",
        cancelled: "danger",
      };
      return <Badge color={colors[val] || "muted"}>{val || "upcoming"}</Badge>;
    },
  },
  { key: "description", label: "Description", type: "textarea", placeholder: "Event details", hideInTable: true },
  { key: "registrationLink", label: "Registration Link", type: "url", placeholder: "https://...", hideInTable: true },
];

export default function Events() {
  return (
    <CrudList
      title="Events"
      description="Manage events, workshops, and seminars."
      icon={<Calendar className="w-5 h-5" />}
      apiEndpoint="/admin/events"
      queryKey="admin-events"
      columns={columns}
      itemName="Event"
    />
  );
}
