import ContentEditor from "../components/ContentEditor";
import type { FieldDef } from "../components/ContentEditor";
import { Mail } from "lucide-react";

const fields: FieldDef[] = [
  { key: "address", label: "Address", type: "textarea", placeholder: "Company physical address", required: true },
  { key: "phone", label: "Phone", type: "text", placeholder: "8735045762", required: true },
  { key: "email", label: "Email", type: "email", placeholder: "sustain.process@gmail.com", required: true },
  { key: "googleMapsLink", label: "Google Maps Embed Link", type: "text", placeholder: "https://www.google.com/maps/embed/..." },
  { key: "officeHours", label: "Office Hours", type: "text", placeholder: "Monday - Friday: 9:00 AM - 6:00 PM" },
];

export default function ContactInfo() {
  return (
    <ContentEditor
      title="Contact Info"
      description="Update company contact info displayed on the contact page and website footer."
      icon={<Mail className="w-5 h-5 text-[var(--color-primary)]" />}
      apiEndpoint="/admin/contact-info"
      queryKey="contact-info"
      fields={fields}
    />
  );
}
