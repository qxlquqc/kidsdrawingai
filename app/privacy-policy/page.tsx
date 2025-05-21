import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Privacy Policy | KidsDrawingAI",
  description: "Information about how KidsDrawingAI collects, uses, and protects your personal information.",
};

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Privacy Policy</h1>
        <p className="text-gray-600">Last Updated: May 20, 2025</p>
      </div>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">1. Introduction</h2>
        <p>
          Welcome to KidsDrawingAI. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI image transformation services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
        </p>
        <p>
          We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">2. Information We Collect</h2>
        <p>We collect the following types of information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Uploaded Images:</strong> We collect and process the images that you upload to our platform for the purpose of AI transformation.
          </li>
          <li>
            <strong>Text Prompts:</strong> Any descriptive text you provide to guide the AI transformation process is collected and processed.
          </li>
          <li>
            <strong>Account Information:</strong> When you create an account, we collect your email address, name, and any other information you provide during registration.
          </li>
          <li>
            <strong>Payment Information:</strong> If you make purchases through our platform, payment information is processed by our secure payment processors. We do not store complete credit card information on our servers.
          </li>
          <li>
            <strong>Usage Data:</strong> We collect information about how you interact with our website, including pages visited, time spent on pages, and other analytical data to improve our services.
          </li>
          <li>
            <strong>Device Information:</strong> Information about your device, such as IP address, browser type, operating system, and other technical identifiers may be collected automatically when you visit our site.
          </li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">3. How We Use Your Information</h2>
        <p>The information we collect is used for the following purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Image Transformation:</strong> Your uploaded images and text prompts are used to generate transformed artwork through our AI technology.
          </li>
          <li>
            <strong>AI Model Improvement:</strong> With your explicit consent, we may use anonymized data from your uploads to improve our AI models and enhance the quality of transformations.
          </li>
          <li>
            <strong>Account Management:</strong> To create and maintain your account, verify your identity, and provide customer support.
          </li>
          <li>
            <strong>Service Optimization:</strong> To analyze usage patterns and improve the functionality, quality, and user experience of our platform.
          </li>
          <li>
            <strong>Communication:</strong> To send you updates about our services, respond to inquiries, and provide customer support.
          </li>
          <li>
            <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes.
          </li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">4. Data Storage and Security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of your personal information:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Image Storage:</strong> Uploaded images are securely stored on our servers for as long as necessary to provide our services.
          </li>
          <li>
            <strong>Data Encryption:</strong> All data transmitted between your browser and our servers is encrypted using SSL technology.
          </li>
          <li>
            <strong>Access Controls:</strong> We restrict access to personal information to authorized personnel only and maintain strict access controls.
          </li>
          <li>
            <strong>Data Retention:</strong> We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.
          </li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">5. Data Sharing and Disclosure</h2>
        <p>We may share your information with third parties in the following circumstances:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Service Providers:</strong> We may share information with third-party service providers who help us operate our business, such as cloud storage providers, payment processors, and analytics services.
          </li>
          <li>
            <strong>AI Processing Partners:</strong> To process your images and generate transformations, we may utilize third-party AI processing services.
          </li>
          <li>
            <strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.
          </li>
          <li>
            <strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.
          </li>
          <li>
            <strong>With Your Consent:</strong> We may share your information with third parties when we have your explicit consent to do so.
          </li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">6. Your Rights</h2>
        <p>Depending on your location, you may have certain rights regarding your personal information:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Access:</strong> You can request access to the personal information we have about you.
          </li>
          <li>
            <strong>Correction:</strong> You can request that we correct inaccurate or incomplete information.
          </li>
          <li>
            <strong>Deletion:</strong> You can request that we delete your personal information.
          </li>
          <li>
            <strong>Data Portability:</strong> You can request a copy of your personal information in a structured, commonly used, and machine-readable format.
          </li>
          <li>
            <strong>Objection and Restriction:</strong> You can object to or request restriction of the processing of your personal information.
          </li>
          <li>
            <strong>Withdrawal of Consent:</strong> You can withdraw your consent at any time where processing is based on your consent.
          </li>
        </ul>
        <p>
          To exercise these rights, please contact us using the information provided in the "Contact Us" section.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">7. Children's Privacy</h2>
        <p>
          Our service is designed for use by families, including children with parental supervision. While we do not intentionally collect personal information from children under 13 without parental consent, our service is designed to transform children's artwork. We encourage parents and guardians to monitor their children's internet usage and to help enforce this policy by instructing their children never to provide personal information through our website without their permission.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">8. Cookies and Tracking Technologies</h2>
        <p>
          We use cookies and similar tracking technologies to track activity on our website and store certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
        </p>
        <p>
          Types of cookies we use:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Essential Cookies:</strong> Necessary for the operation of our website.
          </li>
          <li>
            <strong>Analytical/Performance Cookies:</strong> Allow us to recognize and count the number of visitors and see how visitors move around our website.
          </li>
          <li>
            <strong>Functionality Cookies:</strong> Used to recognize you when you return to our website.
          </li>
          <li>
            <strong>Targeting Cookies:</strong> Record your visit to our website, the pages you have visited, and the links you have followed.
          </li>
        </ul>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">9. International Data Transfers</h2>
        <p>
          Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. If you are located outside the United States and choose to provide information to us, please note that we transfer the data to the United States and process it there.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">10. Third-Party Links</h2>
        <p>
          Our website may contain links to third-party websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.
        </p>

        <h2 className="text-2xl font-bold gradient-text mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-2">
          Email: <a href="mailto:support@kidsdrawingai.com" className="text-blue-600 hover:underline">support@kidsdrawingai.com</a>
        </p>

        <div className="mt-12 text-center">
          <Link href="/">
            <Button variant="outline" className="mr-4">Back to Home</Button>
          </Link>
          <Link href="/terms-of-service">
            <Button variant="outline">Terms of Service</Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 