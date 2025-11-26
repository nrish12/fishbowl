import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-forest-600 hover:text-forest-800 mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-forest-800 mb-8">Terms of Service</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-forest-700">
          <p className="text-sm text-forest-600">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Agreement to Terms</h2>
            <p>
              By accessing and using Mystle, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Use License</h2>
            <p>
              Permission is granted to temporarily access Mystle for personal,
              non-commercial use only. This is the grant of a license, not a transfer of title,
              and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on Mystle</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or mirror the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">User Accounts</h2>
            <p>
              You are responsible for safeguarding any account information and for any activities
              or actions under your session. You agree to immediately notify us of any
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Content</h2>
            <p>
              Our service allows you to create and share puzzle challenges. You retain all rights
              to any content you submit, post or display on or through the service. By submitting
              content, you grant us a worldwide, non-exclusive, royalty-free license to use,
              copy, reproduce, process, adapt, modify, publish, transmit, display and distribute
              such content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Prohibited Uses</h2>
            <p>You may not use Mystle:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>In any way that violates any applicable national or international law or regulation</li>
              <li>To transmit, or procure the sending of, any advertising or promotional material without our prior written consent</li>
              <li>To impersonate or attempt to impersonate Mystle, a Mystle employee, another user, or any other person or entity</li>
              <li>In any way that infringes upon the rights of others, or in any way is illegal, threatening, fraudulent, or harmful</li>
              <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Disclaimer</h2>
            <p>
              The materials on Mystle are provided on an 'as is' basis. Mystle makes no
              warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Limitations</h2>
            <p>
              In no event shall Mystle or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use Mystle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Revisions</h2>
            <p>
              The materials appearing on Mystle could include technical, typographical, or
              photographic errors. Mystle does not warrant that any of the materials on its
              website are accurate, complete or current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Links</h2>
            <p>
              Mystle has not reviewed all of the sites linked to its website and is not
              responsible for the contents of any such linked site. The inclusion of any link
              does not imply endorsement by Mystle. Use of any such linked website is at the
              user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Modifications</h2>
            <p>
              Mystle may revise these terms of service at any time without notice. By using
              this website you are agreeing to be bound by the then current version of these
              terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through
              our website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
