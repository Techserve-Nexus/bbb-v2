import React from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund Policy | BBB Event',
  description: 'Refund Policy for BBB Event',
}

export default function RefundPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="grow bg-[#FFF8F0] py-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#8B4513] mb-8 text-center">
            Refund Policy
          </h1>

          <div className="prose prose-lg max-w-none text-gray-700">
            <h2 className="text-3xl font-semibold text-[#8B4513] mt-6 mb-4">
              No Refund Policy for Contributions Made
            </h2>
            
            <ul className="list-disc pl-6 mb-6 space-y-4">
              <li>
                <strong>a)</strong> We deeply value your contribution and thank you for supporting our cause. 
                Please note that all contributions made are final and non-refundable.
              </li>
              <li>
                <strong>b)</strong> Once a contribution is processed, it cannot be cancelled or refunded, 
                whether in full or in part. This policy ensures that we can maintain the integrity of our 
                programs, plan effectively, and use the funds to make the intended program.
              </li>
              <li>
                <strong>c)</strong> We encourage delegates to carefully review the contribution details, 
                including the amount, cause, and payment information before confirming the transaction.
              </li>
            </ul>

            <p className="mb-6 text-base">
              If you believe a transaction was made in error or you encounter any issues, please reach out 
              to our support team at{' '}
              <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                bbbshreeparashurama@gmail.com
              </a>{' '}
              within 24 hours. While refunds are not guaranteed, we will do our best to assist you.
            </p>

            <div className="bg-[#8B4513]/5 p-6 rounded-lg border border-[#8B4513]/20 mb-6 mt-10">
              <h3 className="text-xl font-semibold text-[#8B4513] mb-4">Contact Us</h3>
              <p className="mb-2">
                <strong>Email:</strong>{' '}
                <a href="mailto:bbbshreeparashurama@gmail.com" className="text-[#8B4513] hover:underline">
                  bbbshreeparashurama@gmail.com
                </a>
              </p>
              <p className="mb-2">
                <strong>Phone:</strong>{' '}
                <a href="tel:+919741477555" className="text-[#8B4513] hover:underline">
                  +91 97414 77555
                </a>
              </p>
              <p>
                <strong>Address:</strong> No 1432/2, SNR Arcade, Krishnadevaray, Vijayanagar Road, 
                Vijayanagar Bengaluru 560040
              </p>
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
