import { APP_CONFIG } from "@/lib/constants";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl font-bold text-white mb-8">Terms and Conditions</h1>
        
        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using {APP_CONFIG.name}, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials on {APP_CONFIG.name} 
              for personal, non-commercial transitory viewing only. This is the grant of a license, 
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p>
              When you create an account with us, you must provide information that is accurate, 
              complete, and current at all times. You are responsible for safeguarding the password 
              and for all activities that occur under your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Privacy Policy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs 
              your use of the service, to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Disclaimers</h2>
            <p>
              The materials on {APP_CONFIG.name} are provided on an 'as is' basis. {APP_CONFIG.name} makes no 
              warranties, expressed or implied, and hereby disclaims and negates all other warranties 
              including without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Limitations</h2>
            <p>
              In no event shall {APP_CONFIG.name} or its suppliers be liable for any damages arising 
              out of the use or inability to use the materials on the website, even if {APP_CONFIG.name} 
              or an authorized representative has been notified orally or in writing of the possibility 
              of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Revisions and Errata</h2>
            <p>
              The materials appearing on {APP_CONFIG.name} could include technical, typographical, 
              or photographic errors. {APP_CONFIG.name} does not warrant that any of the materials 
              on its website are accurate, complete, or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Links</h2>
            <p>
              {APP_CONFIG.name} has not reviewed all of the sites linked to its website and is not 
              responsible for the contents of any such linked site. The inclusion of any link does 
              not imply endorsement by {APP_CONFIG.name} of the site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Modifications</h2>
            <p>
              {APP_CONFIG.name} may revise these terms of service for its website at any time without 
              notice. By using this website, you are agreeing to be bound by the then current version 
              of these Terms and Conditions of Use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at 
              support@{APP_CONFIG.name.toLowerCase()}.com
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
