import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Section } from '@/features/landing/Section';

export const FAQ = () => {
  const faqs = [
    {
      question: "How long can I access my photo album?",
      answer: "Your photo album remains accessible for 6 months from the date of purchase. During this time, you can upload unlimited photos, share with guests, and download high-resolution images."
    },
    {
      question: "How do guests access the photo album?",
      answer: "Guests can easily access the album through a unique QR code that's generated when you create your album. They can scan this code with their smartphone camera to instantly view and upload photos. You can also share a direct link if preferred."
    },
    {
      question: "Can guests upload their own photos?",
      answer: "Yes! Guests can upload their photos directly to the album using either the QR code or shared link. All uploads are instantly visible to everyone with access to the album, creating a collaborative collection of memories."
    },
    {
      question: "What happens to my photos after 6 months?",
      answer: "Before your access period ends, you'll receive notifications reminding you to download your photos. We recommend downloading all photos to your personal storage before the access period expires. You can also choose to extend your access period if needed."
    },
    {
      question: "Are my photos stored securely?",
      answer: "Absolutely! We use industry-standard encryption and secure cloud storage to protect your photos. All uploads are automatically backed up, and our systems are regularly monitored for security and performance."
    },
    {
      question: "What photo formats are supported?",
      answer: "We support all major image formats including JPEG, PNG, HEIC, and RAW files. Photos are stored in their original quality, and you can download them in full resolution at any time."
    }
  ];

  return (
    <Section>
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <Accordion type="multiple" className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
};