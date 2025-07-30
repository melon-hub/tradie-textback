import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Do I need a new number?",
      answer: "No. Keep your mobile. We only jump in when you can't answer. A new business number is optional (Pro plan)."
    },
    {
      question: "Is there any spam risk?",
      answer: "None. Only people who called you get one service SMS. They can reply STOP anytime to opt out."
    },
    {
      question: "Does it work on iPhone and Android?",
      answer: "Yes, works on both. We send SMS with web links - no app required. Works on any phone."
    },
    {
      question: "Will this replace my current invoicing software?",
      answer: "No. We don't replace Jobber, ServiceM8, etc. We're a bolt-on to catch missed leads and get you the info to quote faster."
    },
    {
      question: "What exactly do I see when I get a job?",
      answer: "A short SMS with who/where/what and links to call the customer, view photos, and update job status. Clean and simple."
    },
    {
      question: "How long does setup take?",
      answer: "About 30 minutes. We help you set up call forwarding on no-answer to our number. You keep your existing number and plan."
    },
    {
      question: "What if customers send too many photos?",
      answer: "We compress and limit photos automatically. Fair usage caps prevent abuse. We auto-delete photos after 30-60 days."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes, cancel anytime. No lock-in contracts. If you don't see value in the 14-day trial, just cancel."
    }
  ];

  return (
    <section id="faq" className="section-padding relative">
      <div className="container mx-auto container-padding">
        <div className="text-center space-y-4 lg:space-y-6 mb-12 lg:mb-16 fade-in-up">
          <h2 className="text-2xl lg:text-6xl font-bold">
            Common Questions
          </h2>
          <p className="text-lg lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about CallCatch
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4 lg:space-y-6">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="card-elevated px-6 lg:px-8 hover:shadow-lg transition-all duration-300">
                <AccordionTrigger className="text-left hover:no-underline py-6 lg:py-8 text-base lg:text-lg">
                  <span className="font-bold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 lg:pb-8 text-muted-foreground text-base lg:text-lg leading-relaxed">
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

export default FAQ;