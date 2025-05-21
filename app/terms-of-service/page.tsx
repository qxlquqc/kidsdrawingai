import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Terms of Service | KidsDrawingAI",
  description: "Terms and conditions for using KidsDrawingAI services, including refund policy.",
};

export default function TermsOfService() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Terms of Service</h1>
        <p className="text-gray-600">Last Updated: May 20, 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to KidsDrawingAI ("we," "us," or "our"), an AI-powered image transformation application designed for enhancing children's artwork. These Terms of Service ("Terms") constitute a legally binding agreement between you, the user ("you" or "user"), and KidsDrawingAI governing your use of our website, applications, and services (collectively, the "Service").
        </p>
        <p>
          By accessing or using KidsDrawingAI, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to all the terms and conditions, you must not use our Service.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">2. Eligibility</h2>
        <p>
          To use KidsDrawingAI, you must be at least 18 years of age or have the permission and supervision of a parent or legal guardian. Our Service is designed for families to enhance children's artwork, but account creation and payment processing require adult supervision and responsibility.
        </p>
        <p>
          By using our Service, you represent and warrant that you meet all eligibility requirements. If you are using the Service on behalf of a child, you confirm that you are the child's parent or legal guardian or have obtained appropriate permission.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">3. User Accounts</h2>
        <p>
          To access certain features of KidsDrawingAI, you may need to create an account. When you create an account, you agree to provide accurate, current, and complete information and to update this information to maintain its accuracy.
        </p>
        <p>
          You are solely responsible for:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Maintaining the confidentiality of your account and password</li>
          <li>Restricting access to your account</li>
          <li>All activities that occur under your account</li>
        </ul>
        <p>
          You must notify us immediately of any unauthorized use of your account or any other breach of security. We will not be liable for any loss or damage arising from your failure to comply with this section.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">4. Service Description</h2>
        <p>
          KidsDrawingAI provides an AI-powered platform that transforms children's drawings into enhanced digital artwork. Our Service allows users to upload images, provide descriptive prompts, and receive AI-generated transformations of the original drawings.
        </p>
        <p>
          We strive to provide high-quality transformations, but results may vary based on the quality and clarity of the uploaded images, the prompts provided, and the inherent limitations of AI technology. KidsDrawingAI does not guarantee specific results or that the Service will meet your specific requirements or expectations.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">5. Acceptable Use</h2>
        <p>
          You agree to use KidsDrawingAI only for lawful purposes and in accordance with these Terms. You specifically agree not to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Upload images that contain illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable content</li>
          <li>Upload images that infringe upon the intellectual property rights of others</li>
          <li>Use the Service to generate content that violates any applicable laws or regulations</li>
          <li>Attempt to interfere with, compromise the system integrity or security, or decipher any transmissions to or from the servers running our Service</li>
          <li>Use any robot, spider, crawler, scraper, or other automated means to access the Service</li>
          <li>Bypass measures we may use to prevent or restrict access to the Service</li>
          <li>Introduce malicious code or engage in activities that could disable, overburden, or impair the Service</li>
        </ul>
        <p>
          We reserve the right to terminate or suspend your access to the Service immediately, without prior notice or liability, for any violation of these Terms or for any other reason at our sole discretion.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">6. Intellectual Property Rights</h2>
        <p>
          <strong>Your Content:</strong> You retain ownership of any original images you upload to KidsDrawingAI. By uploading content to our Service, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, process, adapt, modify, and display your content solely for the purpose of providing and improving our Service.
        </p>
        <p>
          <strong>Transformed Images:</strong> You are granted full rights to use the AI-transformed images generated by KidsDrawingAI for personal, non-commercial, and commercial purposes. You may print, share, or use these images as you wish, subject to the limitations set forth in these Terms.
        </p>
        <p>
          <strong>Our Content:</strong> All content on KidsDrawingAI, including but not limited to text, graphics, logos, icons, images, and software, is the property of KidsDrawingAI or its content suppliers and is protected by copyright and other intellectual property laws. You may not use, reproduce, distribute, or create derivative works from this content without our express written permission.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">7. Payment and Subscription</h2>
        <p>
          KidsDrawingAI offers various subscription plans and one-time payment options for using our Service. By subscribing to or purchasing our Service, you agree to pay all fees associated with your selected plan.
        </p>
        <p>
          <strong>Billing:</strong> For subscription plans, we will bill your payment method on a recurring basis until you cancel. You authorize us to store your payment information and to automatically charge your payment method at the end of each subscription period.
        </p>
        <p>
          <strong>Price Changes:</strong> We reserve the right to change our prices at any time. If we change the pricing for your subscription, we will provide notice and the opportunity to cancel before the new pricing takes effect.
        </p>
        <p>
          <strong>Cancellation:</strong> You can cancel your subscription at any time through your account settings. Upon cancellation, you will continue to have access to the Service until the end of your current billing period, after which your access will be terminated.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">8. Refund Policy</h2>
        <p>
          Due to the digital nature of our Service and the immediate allocation of computing resources for AI processing, KidsDrawingAI maintains the following refund policy:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Subscription Plans:</strong> We do not provide refunds for subscription payments once the subscription period has begun. You may cancel your subscription at any time to prevent future charges, but you will not receive a refund for the current billing period.
          </li>
          <li>
            <strong>Image Transformations:</strong> Once our AI system has begun processing your images, we are unable to offer refunds as the computing resources have already been utilized. This includes cases where you are dissatisfied with the results of the transformation.
          </li>
          <li>
            <strong>Technical Issues:</strong> If you experience technical issues that prevent you from using our Service entirely and our support team is unable to resolve them, you may be eligible for a refund at our discretion. Please contact our support team to discuss your specific situation.
          </li>
          <li>
            <strong>Exceptional Circumstances:</strong> In certain exceptional circumstances, we may consider refund requests on a case-by-case basis. These decisions are made at the sole discretion of KidsDrawingAI management.
          </li>
        </ul>
        <p>
          To request a refund under the eligible circumstances described above, please contact our support team at <a href="mailto:support@kidsdrawingai.com" className="text-blue-600 hover:underline">support@kidsdrawingai.com</a> with your order details and the reason for your request.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, KidsDrawingAI and its officers, employees, agents, affiliates, and partners shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Your access to or use of or inability to access or use the Service</li>
          <li>Any conduct or content of any third party on the Service</li>
          <li>Unauthorized access, use, or alteration of your transmissions or content</li>
          <li>The quality or accuracy of AI-generated transformations</li>
        </ul>
        <p>
          In no event shall our total liability to you for all claims exceed the amount you paid to KidsDrawingAI during the past twelve months.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">10. Disclaimer of Warranties</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties of any kind, either express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, or non-infringement.
        </p>
        <p>
          We do not warrant that:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The Service will function uninterrupted, secure, or available at any particular time or location</li>
          <li>Any errors or defects will be corrected</li>
          <li>The Service is free of viruses or other harmful components</li>
          <li>The results of using the Service will meet your requirements or expectations</li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">11. Indemnification</h2>
        <p>
          You agree to defend, indemnify, and hold harmless KidsDrawingAI and its licensors, service providers, and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Service.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">12. Modifications to the Service and Terms</h2>
        <p>
          We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.
        </p>
        <p>
          We may revise these Terms from time to time. The most current version will always be posted on our website. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">13. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including, without limitation, if you breach these Terms.
        </p>
        <p>
          Upon termination, your right to use the Service will cease immediately. If you wish to terminate your account, you may simply discontinue using the Service or contact us to request account deletion.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">14. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">15. Dispute Resolution</h2>
        <p>
          Any disputes arising out of or relating to these Terms or the Service shall first be attempted to be resolved through informal negotiation. If the dispute cannot be resolved through negotiation, both parties agree to submit to binding arbitration in accordance with the rules of the American Arbitration Association.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">16. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please contact us at:
        </p>
        <p className="mt-2">
          Email: <a href="mailto:support@kidsdrawingai.com" className="text-blue-600 hover:underline">support@kidsdrawingai.com</a>
        </p>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" className="mr-4">Back to Home</Button>
          </Link>
          <Link href="/privacy-policy">
            <Button variant="outline">Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 