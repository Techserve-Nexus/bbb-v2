import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | BBB Event',
  description: 'Terms and Conditions for BBB Event',
}

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="grow bg-[#FFF8F0] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-8 text-center">
            Terms & Conditions
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-base mb-6 bg-[#8B4513]/5 p-4 rounded-lg border border-[#8B4513]/20">
              This document is an electronic record generated under the provisions of the Information Technology 
              Act, 2000 and the applicable rules, including any amendments. This document is published in line 
              with Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011, which mandates 
              the publication of the website's terms of use, privacy policy, and rules for user access and 
              interaction on{' '}
              <a href="https://www.shreeparashurama.com/" className="text-[#8B4513] hover:underline">
                https://www.shreeparashurama.com/
              </a>
              .
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              1. Introduction
            </h2>
            <p className="mb-4">These terms and conditions shall govern your use of our website.</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>a)</strong> By using our website, you accept these terms and conditions in full; 
                accordingly, if you disagree with these terms and conditions or any part of these terms and 
                conditions, you must not use our website.
              </li>
              <li>
                <strong>b)</strong> If you register with our website, submit any material to our website or 
                use any of our website services, we will ask you to expressly agree to these terms and conditions.
              </li>
              <li>
                <strong>c)</strong> By using our website or agreeing to these terms and conditions, you warrant 
                and represent to us that you are at least 18 years of age.
              </li>
              <li>
                <strong>d)</strong> Our website uses cookies; by using our website or agreeing to these terms 
                and conditions, you consent to our use of cookies in accordance with the terms of our Privacy Policy.
              </li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              2. Acceptable Use
            </h2>
            <p className="mb-4">You must not:</p>
            <ul className="list-disc pl-6 mb-6 space-y-2">
              <li>
                <strong>a)</strong> use our website in any way or take any action that causes, or may cause, 
                damage to the website or impairment of the performance, availability or accessibility of the website;
              </li>
              <li>
                <strong>b)</strong> use our website in any way that is unlawful, illegal, fraudulent or harmful, 
                or in connection with any unlawful, illegal, fraudulent or harmful purpose or activity;
              </li>
              <li>
                <strong>c)</strong> use our website to copy, store, host, transmit, send, use, publish or distribute 
                any material which consists of (or is linked to) any spyware, computer virus, Trojan horse, worm, 
                keystroke logger, rootkit or other malicious computer software;
              </li>
              <li>
                <strong>d)</strong> conduct any systematic or automated data collection activities (including 
                without limitation scraping, data mining, data extraction and data harvesting) on or in relation 
                to our website without our express written consent;
              </li>
              <li>
                <strong>e)</strong> access or otherwise interact with our website using any robot, spider or 
                other automated means except for the purpose of search engine indexing;
              </li>
              <li>
                <strong>f)</strong> use data collected from our website for any direct marketing activity 
                (including without limitation email marketing, SMS marketing, telemarketing and direct mailing);
              </li>
              <li>
                <strong>g)</strong> You must ensure that all the information you supply to us through our website, 
                or in relation to our website, is true, accurate, current, complete and non-misleading;
              </li>
              <li>
                <strong>h)</strong> You agree to use this website only for lawful purposes and in a way that does 
                not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the site. 
                Prohibited behaviour includes transmitting offensive or unlawful content or disrupting the normal 
                operation of the site.
              </li>
            </ul>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              3. User Accounts
            </h2>
            <p className="mb-4">
              To access certain features, you may need to create an account. You are responsible for maintaining 
              the confidentiality of your account details and are fully responsible for all activities that occur 
              under your account. We may:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>suspend your account;</li>
              <li>cancel your account; and/or</li>
              <li>edit your account details</li>
            </ul>
            <p className="mb-6">
              at any time in our sole discretion without notice or explanation. You may cancel your account on 
              our website by reaching out to us via{' '}
              <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                bbbshreeparashurama@gmail.com
              </a>
              .
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              4. Product & Service Information
            </h2>
            <p className="mb-6">
              We aim to provide accurate descriptions and pricing of our products and services on the website. 
              However, we do not guarantee that the information, including availability and pricing, is always 
              accurate, complete, or current. We reserve the right to correct errors and update information 
              without prior notice.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              5. No Refund Policy for Contributions Made
            </h2>
            <p className="mb-4">
              We deeply value your contribution and thank you for supporting our cause. Please note that all 
              contributions made are final and non-refundable.
            </p>
            <p className="mb-4">
              Once a contribution is processed, it cannot be cancelled or refunded, whether in full or in part. 
              This policy ensures that we can maintain the integrity of our programs, plan effectively, and use 
              the funds to make the intended program.
            </p>
            <p className="mb-4">
              We encourage delegates to carefully review the contribution details, including the amount, cause, 
              and payment information before confirming the transaction.
            </p>
            <p className="mb-6">
              If you believe a transaction was made in error or you encounter any issues, please reach out to 
              our support team at{' '}
              <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                bbbshreeparashurama@gmail.com
              </a>{' '}
              within 24 hours. While refunds are not guaranteed, we will do our best to assist you.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              6. Third-Party Links
            </h2>
            <p className="mb-6">
              Our website may contain links to third-party websites that are not under our control. We are not 
              responsible for the content, policies, or practices of these external sites. Accessing third-party 
              links is at your own risk.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              7. Intellectual Property Rights
            </h2>
            <p className="mb-6">
              All content on this site — including text, images, graphics, logos, and software — is owned or 
              licensed by Shree Parashurama and its parent BBB Trust and protected by applicable intellectual 
              property laws. You may not reproduce, distribute, or use our content without our prior written consent.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="mb-6">
              To the extent permitted by law, Shree Parashurama shall not be liable for any indirect, incidental, 
              or consequential damages arising out of or related to your use of the website, including but not 
              limited to damages for loss of profits, data, or other intangible losses.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              9. Disclaimer of Warranties
            </h2>
            <p className="mb-6">
              This website is provided "as is" and "as available" without any warranties of any kind, either 
              express or implied. We do not guarantee that the site will always be available, secure, or free 
              from errors or viruses.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              10. Indemnity
            </h2>
            <p className="mb-6">
              You agree to indemnify, defend, and hold harmless BBB Trust Mysore or Shree Parashurama and its 
              affiliates, members, directors, officers, employees, and agents from and against all claims, 
              liabilities, damages, losses, or expenses, including reasonable legal fees, arising out of your 
              use of the website or your violation of these Terms & Conditions.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              11. Changes to Terms
            </h2>
            <p className="mb-6">
              We reserve the right to modify or update these Terms & Conditions at any time without prior notice. 
              Changes will be effective once posted on this page. We recommend checking this page periodically 
              for updates.
            </p>
            <p className="mb-6">
              <strong>Governing Law:</strong> These Terms & Conditions shall be governed by and interpreted in 
              accordance with the laws of India, without regard to its conflict of law principles. Any disputes 
              arising from or relating to these terms, your use of the website, or our services shall be subject 
              to the exclusive jurisdiction of the courts located in Bangalore, Karnataka, India.
            </p>

            <h2 className="text-3xl font-semibold text-[#8B4513] mt-10 mb-4">
              12. Contact Us
            </h2>
            <p className="mb-6">
              If you have any questions or concerns about these Terms & Conditions, please contact us at:
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
