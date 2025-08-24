import { APP_CONFIG } from "@/lib/constants";

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-8">Cancellation Policy</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Cancellation at Any Time</h2>
            <p>
              You can cancel your subscription at any time. There are no cancellation fees or 
              penalties. Your access will continue until the end of your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">How to Cancel</h2>
            <p>
              You can cancel your subscription through your account settings or by contacting 
              our support team at support@{APP_CONFIG.name.toLowerCase()}.com
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Access After Cancellation</h2>
            <p>
              After cancellation, you'll continue to have access to your plan features until 
              the end of your current billing period. No new charges will be made.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Reactivation</h2>
            <p>
              You can reactivate your subscription at any time by logging into your account 
              and resuming your plan.
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
