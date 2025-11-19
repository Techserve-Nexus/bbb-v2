import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-[#FFF8F0] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-8 text-center">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              <strong className="text-[#8B4513]">The Bodhi Tree</strong> is committed to protecting your privacy. 
              This Privacy Policy outlines how we collect, use, and safeguard your personal information when you 
              visit our website{' '}
              <a href="https://www.thebodhitree.in" className="text-[#8B4513] hover:underline">
                https://www.thebodhitree.in
              </a>{' '}
              or use our services.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">We may collect the following information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Personal Information:</strong> Name, email address, phone number, and other 
                details you provide during checkout, or service requests.
              </li>
              <li>
                <strong>Payment Information:</strong> We use CCAvenue payment gateway to process 
                all our donations.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you use our website, including IP 
                address, browser type, pages visited, and time spent on pages.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your browsing experience. You 
                can choose to disable cookies through your browser settings.
              </li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Process your donations and service requests</li>
              <li>Send confirmation emails and receipts</li>
              <li>Improve our website and services</li>
              <li>Communicate with you about updates and offerings</li>
              <li>Ensure security and prevent fraud</li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              3. Data Security
            </h2>
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              4. Third-Party Services
            </h2>
            <p className="mb-6">
              We use CCAvenue for payment processing. Please refer to their privacy policy 
              for information on how they handle your data.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              5. Your Rights
            </h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              6. Contact Us
            </h2>
            <p className="mb-6">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:info@thebodhitree.in" className="text-[#8B4513] hover:underline">
                info@thebodhitree.in
              </a>
            </p>

            <p className="text-sm text-gray-600 mt-10 border-t pt-6">
              <strong>Last Updated:</strong> November 14, 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}