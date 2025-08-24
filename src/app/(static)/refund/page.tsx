import { APP_CONFIG } from "@/lib/constants";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">30-Day Money-Back Guarantee</h2>
            <p>
              We offer a 30-day money-back guarantee on all paid subscriptions. If you're not 
              completely satisfied with our service, you can request a full refund within 30 days 
              of your purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How to Request a Refund</h2>
            <p>
              To request a refund, please contact our support team at support@{APP_CONFIG.name.toLowerCase()}.com 
              with your account details and reason for the refund request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Processing Time</h2>
            <p>
              Refunds are typically processed within 5-7 business days and will be credited back 
              to your original payment method.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Exceptions</h2>
            <p>
              Refunds may not be available for enterprise plans or custom agreements. 
              Please refer to your specific contract terms.
            </p>
          </section>

          <div className="mt-12 p-6 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-gray-400">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
