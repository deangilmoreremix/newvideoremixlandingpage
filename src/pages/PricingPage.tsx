import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PricingSection } from '../components/PricingSection';
import { FinalCTA } from '../components/FinalCTA';
import { FAQSection } from '../components/FAQSection';

const PricingPage: React.FC = () => {
  return (
    <main className="w-full">
      <Helmet>
        <title>Pricing | VideoRemix.vip</title>
        <meta name="description" content="Choose from 14 powerful AI apps at $99/year each. Mix and match marketing, content creation, and productivity tools to build your perfect AI toolkit." />
      </Helmet>
      
      <section id="pricing-hero" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 gradient-text">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Choose from 14 powerful AI apps at $99/year each. Mix and match to build your perfect toolkit.
            </p>
          </div>
        </div>
      </section>
      
      <PricingSection />
      
      <FAQSection 
        title="Pricing FAQ"
        subtitle="Common questions about our pricing plans"
        faqs={[
          {
            question: "How much does VideoRemix.vip cost?",
            answer: "VideoRemix.vip offers 14 powerful AI apps at $99/year each. You can mix and match any combination of apps to build your perfect AI toolkit. Annual subscriptions are billed yearly for maximum value."
          },
          {
            question: "Can I change my app selection at any time?",
            answer: "Yes, you can add or remove apps from your subscription at any time. Changes take effect at the start of your next billing cycle. You can manage your app selection from your account dashboard."
          },
          {
            question: "Do you offer refunds?",
            answer: "We offer a 14-day money-back guarantee if you're not satisfied with our service for any reason. Contact our support team within 14 days of purchase for a full refund."
          },
          {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards, PayPal, and Apple Pay. For Enterprise plans, we can also arrange invoicing and purchase orders."
          },
          {
            question: "Are there any hidden fees?",
            answer: "No hidden fees ever! The $99/year per app price you see is the price you pay. All taxes and fees are clearly displayed during checkout."
          },
          {
            question: "Do you offer discounts for teams or enterprises?",
            answer: "Yes, we offer volume discounts for multiple apps and custom enterprise solutions. Contact our sales team for pricing tailored to your organization's needs."
          }
        ]}
      />
      
      <FinalCTA />
    </main>
  );
};

export default PricingPage;