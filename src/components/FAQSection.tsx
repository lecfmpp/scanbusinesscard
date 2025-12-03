import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What's included in the free trial?",
    answer: "You get 7 days to try the service with 1 scan (up to 20 business cards). No credit card required to start."
  },
  {
    question: "How many cards can I scan at once?",
    answer: "Each scan can process up to 20 business cards simultaneously. With the Pro plan, you get 30 scans per month – that's up to 600 cards! Perfect for trade shows and networking events."
  },
  {
    question: "What's the WhatsApp support benefit?",
    answer: "Yearly subscribers get lifetime access to our WhatsApp support channel for priority assistance, feature requests, and direct communication with our team."
  },
  {
    question: "How accurate is the data extraction?",
    answer: "Our AI-powered OCR technology achieves over 95% accuracy on standard business cards. It extracts names, job titles, companies, emails, phone numbers, and websites automatically."
  },
  {
    question: "Can I export to my CRM?",
    answer: "Yes! You can export your scanned contacts directly to Google Sheets, HubSpot, or Slack. CSV export is also available for any other CRM system."
  },
  {
    question: "What happens to my scanned cards after an event?",
    answer: "All your contacts are saved in your account permanently. You'll never lose a lead again – access them anytime, export when ready, and follow up when it matters most."
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use enterprise-grade encryption for all data transmission and storage. Your business contacts are private and never shared with third parties."
  },
];

export const FAQSection = () => {
  return (
    <section className="py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-display tracking-tight sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about ScanBusinessCard
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
