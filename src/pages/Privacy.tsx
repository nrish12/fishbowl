import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-parchment">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center text-forest-600 hover:text-forest-800 mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-forest-800 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-forest-700">
          <p className="text-sm text-forest-600">Last updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Introduction</h2>
            <p>
              Five Fold operates the fivefold.com website. This page informs you of our policies
              regarding the collection, use, and disclosure of personal data when you use our
              service and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Information Collection and Use</h2>
            <p>
              We collect several different types of information for various purposes to provide
              and improve our service to you.
            </p>
            <h3 className="text-xl font-semibold text-forest-800 mt-6 mb-3">Types of Data Collected</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> We collect information on how you interact with our game, including pages visited, time spent, and actions taken.</li>
              <li><strong>Session Data:</strong> We use session IDs to track your progress and provide a personalized experience.</li>
              <li><strong>Analytics Data:</strong> We use Google Analytics to understand user behavior and improve our service.</li>
              <li><strong>Cookies:</strong> We use cookies and similar tracking technologies to track activity on our service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Use of Data</h2>
            <p>Five Fold uses the collected data for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Advertising</h2>
            <p>
              We use Google AdSense to display advertisements on our website. Google may use
              cookies to serve ads based on your prior visits to our website or other websites.
              You may opt out of personalized advertising by visiting{' '}
              <a href="https://www.google.com/settings/ads" className="text-forest-600 underline" target="_blank" rel="noopener noreferrer">
                Ads Settings
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Data Security</h2>
            <p>
              The security of your data is important to us, but remember that no method of
              transmission over the Internet or method of electronic storage is 100% secure.
              While we strive to use commercially acceptable means to protect your personal data,
              we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Links to Other Sites</h2>
            <p>
              Our service may contain links to other sites that are not operated by us. If you
              click on a third party link, you will be directed to that third party's site. We
              strongly advise you to review the Privacy Policy of every site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Children's Privacy</h2>
            <p>
              Our service does not address anyone under the age of 13. We do not knowingly collect
              personally identifiable information from anyone under the age of 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the "Last
              updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-forest-800 mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through our
              website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
