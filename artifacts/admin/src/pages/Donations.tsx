import ContentEditor from "../components/ContentEditor";
import type { FieldDef } from "../components/ContentEditor";
import { Heart } from "lucide-react";

const fields: FieldDef[] = [
  { key: "bankName", label: "Bank Name", type: "text", placeholder: "e.g. State Bank of India", required: true },
  { key: "accountHolder", label: "Account Holder Name", type: "text", placeholder: "e.g. SustainPro Solutions", required: true },
  { key: "accountNumber", label: "Account Number", type: "text", placeholder: "e.g. 1234567890", required: true },
  { key: "ifscCode", label: "IFSC Code", type: "text", placeholder: "e.g. SBIN0001234", required: true },
  { key: "upiId", label: "UPI ID", type: "text", placeholder: "e.g. sustainpro@sbi" },
  { key: "qrCodeUrl", label: "UPI QR Code Image URL", type: "text", placeholder: "e.g. /uploads/qr.png" },
];

export default function Donations() {
  return (
    <ContentEditor
      title="Donations & Bank Details"
      description="Update bank details, UPI ID, and QR code for receiving payments or contributions."
      icon={<Heart className="w-5 h-5 text-[var(--color-primary)]" />}
      apiEndpoint="/admin/donations"
      queryKey="donations"
      fields={fields}
    />
  );
}
