import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | BBB Event',
  description: 'Privacy Policy for BBB Event',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-[#FFF8F0]  py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 border border-orange-500">
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-8 text-center">
            Privacy Policy
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-lg mb-6">
              <strong className="text-[#8B4513]">Shree Parashurama</strong> is committed to protecting your privacy. 
              This Privacy Policy outlines how we collect, use, and safeguard your personal information when you 
              visit our website{' '}
              <a href="https://www.shreeparashurama.com/" className="text-[#8B4513] hover:underline">
                https://www.shreeparashurama.com/
              </a>{' '}
              or use our services.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              1. Information We Collect
            </h2>
            <p className="mb-4">We may collect the following information:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>a) Personal Information:</strong> Name, email address, phone number, and other 
                details you provide during checkout, or service requests.
              </li>
              <li>
                <strong>b) Payment Information:</strong> We use reputed payment gateway to process 
                all our donations.
              </li>
              <li>
                <strong>c) Usage Data:</strong> Information about how you use our website, including IP 
                address, browser type, pages visited, and time spent on pages.
              </li>
              <li>
                <strong>d) Cookies:</strong> We use cookies to enhance your browsing experience. You 
                can choose to disable cookies through your browser settings.
              </li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="mb-4">We use the collected information to:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>a) Process and fulfil orders and deliver services.</li>
              <li>b) Communicate with you about your orders, inquiries, or other requests.</li>
              <li>c) Improve our website and services.</li>
              <li>d) Send promotional emails or newsletters, if you have opted in.</li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              3. Sharing Your Information
            </h2>
            <p className="mb-4">
              We do not sell or rent your personal information to third parties. We may share your information with:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>Service Providers:</strong> Third-party vendors who assist us in operating our website, 
                conducting our business, or servicing you.
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law, we may disclose your information to 
                comply with legal obligations or protect our rights.
              </li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              4. Data Security
            </h2>
            <p className="mb-6">
              We implement appropriate security measures to protect your personal information from unauthorized 
              access, alteration, disclosure, or destruction.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              5. Data Retention
            </h2>
            <p className="mb-6">
              We retain your personal information only as long as necessary to fulfil the purposes described 
              in this policy or to comply with legal requirements. Afterward, data is securely deleted or anonymized.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              6. Changes to This Policy
            </h2>
            <p className="mb-6">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page 
              with an updated effective date.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              7. Your Rights
            </h2>
            <p className="mb-6">
              You have the right to access, correct, or delete your personal information. To exercise these 
              rights, please contact us at{' '}
              <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                bbbshreeparashurama@gmail.com
              </a>
              . We will respond within 3-5 business days.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              8. Your Privacy Matters to Us
            </h2>
            <p className="mb-4">
              In accordance with the Information Technology Act, 2000 and applicable rules, we are committed 
              to addressing any concerns or feedback you may have regarding this Privacy Policy or the handling 
              of your personal information. For any privacy-related questions, concerns, or feedback, please contact us at:
            </p>
            <div className="bg-[#8B4513]/5 p-6 rounded-lg border border-[#8B4513]/20 mb-6">
              <ul className="space-y-2">
                <li>
                  <strong>i. Email us:</strong>{' '}
                  <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                    bbbshreeparashurama@gmail.com
                  </a>
                </li>
                <li>
                  <strong>ii. Contact:</strong>{' '}
                  <a href="tel:+919741477555" className="text-[#8B4513] hover:underline">
                    +91 97414 77555
                  </a>
                </li>
                <li>
                  <strong>iii. Address:</strong> No 1432/2, SNR Arcade, Krishnadevaray, Vijayanagar Road, 
                  Vijayanagar Bengaluru 560040
                </li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 mt-10 border-t pt-6">
              <strong>Last Updated:</strong> November 15, 2025
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
