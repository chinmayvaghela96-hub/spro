import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918735045762"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex items-center justify-center"
      aria-label="Chat on WhatsApp"
      data-testid="button-whatsapp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute right-full mr-4 bg-gray-900 text-white text-sm py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with an Expert
        <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-8 border-transparent border-l-gray-900"></span>
      </span>
    </a>
  );
}
