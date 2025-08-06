import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Effective Date: January 1, 2025</p>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Introduction</h2>
            <p className="mb-4">
              TradieText ("we", "our", or "us") is committed to protecting your privacy in accordance with 
              the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). This Privacy Policy 
              explains how we collect, use, disclose, and protect your personal information.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Information We Collect</h2>
            <p className="mb-4">We collect the following types of personal information:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Contact information (name, email, phone number, business address)</li>
              <li>Business details (ABN, trade license numbers)</li>
              <li>Job and service information</li>
              <li>Communication records (SMS messages, call logs)</li>
              <li>Payment and billing information</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. How We Collect Information</h2>
            <p className="mb-4">
              We collect information directly from you when you register, use our services, or communicate 
              with us. We also collect information automatically through your use of the Service, including 
              through cookies and similar technologies.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Use of Information</h2>
            <p className="mb-4">We use your personal information to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Provide and improve our services</li>
              <li>Send automated SMS responses to missed calls</li>
              <li>Process payments and manage subscriptions</li>
              <li>Communicate with you about your account and services</li>
              <li>Comply with legal obligations</li>
              <li>Protect against fraud and security threats</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. Disclosure of Information</h2>
            <p className="mb-4">
              We may disclose your personal information to:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Service providers (such as Twilio for SMS, Stripe for payments)</li>
              <li>Your customers (when they submit job requests)</li>
              <li>Law enforcement or government agencies as required by law</li>
              <li>Professional advisers and insurers</li>
            </ul>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information to third parties for marketing purposes.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Cross-Border Data Transfers</h2>
            <p className="mb-4">
              Some of our service providers may be located outside Australia. We ensure that any cross-border 
              transfers comply with the Australian Privacy Principles, including ensuring recipients are subject 
              to similar privacy protections.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, loss, misuse, or alteration. This includes encryption, secure servers, 
              and regular security assessments.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Data Retention</h2>
            <p className="mb-4">
              We retain your personal information for as long as necessary to provide our services and comply 
              with legal obligations. When information is no longer needed, we securely delete or anonymize it.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Your Rights</h2>
            <p className="mb-4">Under Australian privacy law, you have the right to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your information (subject to legal requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with us or the Office of the Australian Information Commissioner (OAIC)</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar technologies to improve your experience, analyze usage, and provide 
              personalized content. You can manage cookie preferences through your browser settings.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Children's Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for individuals under 18 years of age. We do not knowingly collect 
              personal information from children.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">12. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. We will notify you of material changes 
              through the Service or via email. Your continued use after changes indicates acceptance.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">13. Complaints and Contact</h2>
            <p className="mb-4">
              If you have questions, concerns, or complaints about our privacy practices, please contact us at:
            </p>
            <p className="mb-4">
              Email: privacy@tradietext.com.au<br />
              Phone: 1300 XXX XXX<br />
              Address: [Your Business Address]
            </p>
            <p className="mb-4">
              If you are not satisfied with our response, you can lodge a complaint with the Office of the 
              Australian Information Commissioner (OAIC) at www.oaic.gov.au or call 1300 363 992.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">14. Notifiable Data Breaches</h2>
            <p className="mb-4">
              In the event of an eligible data breach that is likely to result in serious harm, we will notify 
              affected individuals and the OAIC as required under the Notifiable Data Breaches scheme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;