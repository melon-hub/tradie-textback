import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsOfService = () => {
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
          <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Effective Date: January 1, 2025</p>
          
          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using TradieText ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">2. Service Description</h2>
            <p className="mb-4">
              TradieText provides automated SMS response services for missed calls and job management tools for 
              Australian tradespeople and their customers.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">3. User Accounts</h2>
            <p className="mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all 
              activities that occur under your account. You must notify us immediately of any unauthorized use.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">4. Acceptable Use</h2>
            <p className="mb-4">You agree not to:</p>
            <ul className="list-disc ml-6 mb-4">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Send spam or unsolicited messages</li>
              <li>Attempt to interfere with or compromise the Service</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>

            <h2 className="text-xl font-semibold mt-6 mb-3">5. SMS and Communication</h2>
            <p className="mb-4">
              By using the Service, you consent to receiving SMS messages related to your jobs and account. 
              Standard message and data rates may apply. You can opt out at any time by contacting support.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">6. Payment Terms</h2>
            <p className="mb-4">
              Subscription fees are billed in advance on a monthly basis. All fees are non-refundable except 
              as required by law. We reserve the right to change pricing with 30 days notice.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">7. Intellectual Property</h2>
            <p className="mb-4">
              The Service and its original content, features, and functionality are owned by TradieText and 
              are protected by international copyright, trademark, and other intellectual property laws.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">8. Limitation of Liability</h2>
            <p className="mb-4">
              TradieText shall not be liable for any indirect, incidental, special, consequential, or punitive 
              damages resulting from your use or inability to use the Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">9. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your account immediately, without prior notice or liability, for any 
              reason, including breach of these Terms.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">10. Governing Law</h2>
            <p className="mb-4">
              These Terms shall be governed by the laws of Australia. Any disputes shall be resolved in the 
              courts of Victoria, Australia.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">11. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material 
              changes via email or through the Service.
            </p>

            <h2 className="text-xl font-semibold mt-6 mb-3">12. Contact Information</h2>
            <p className="mb-4">
              For questions about these Terms, please contact us at support@tradietext.com.au
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;