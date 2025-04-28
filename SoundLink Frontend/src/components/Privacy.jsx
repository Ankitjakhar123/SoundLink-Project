import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white pb-0">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-fuchsia-900/30 to-blue-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" size={16} />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
          
          <p className="text-white/80">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">1. Introduction</h2>
            <p>
              SoundLink ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and mobile application (collectively, the "Service").
            </p>
            <p className="mt-4">
              We reserve the right to make changes to this Privacy Policy at any time and for any reason. We will alert you about any changes by updating the "Last Updated" date of this Privacy Policy. You are encouraged to periodically review this Privacy Policy to stay informed of updates.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">2. Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
            <p>
              We may collect personal information that you voluntarily provide to us when you register for the Service, express an interest in obtaining information about us or our products and Services, participate in activities on the Service, or otherwise contact us. The personal information we collect may include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Account username and password</li>
              <li>Billing information, including credit card details</li>
              <li>Profile information, such as profile picture and bio</li>
              <li>User content, such as comments, playlists, and favorites</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3 mt-6">Automatically Collected Information</h3>
            <p>
              When you access our Service, we may automatically collect certain information about your device and usage of the Service. This information may include:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Device information (e.g., IP address, browser type, operating system)</li>
              <li>Usage data (e.g., pages visited, time spent on pages)</li>
              <li>Location data (if you allow location services)</li>
              <li>Music listening preferences and behavior</li>
            </ul>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">3. How We Use Your Information</h2>
            <p>
              We may use the information we collect for various purposes, including to:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process transactions and manage your account</li>
              <li>Send you service and administrative emails</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Personalize your experience and provide content recommendations</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our Service</li>
              <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">4. Sharing Your Information</h2>
            <p>
              We may share your information with third parties in the following situations:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>
                <strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, contractors, or agents who perform services for us or on our behalf.
              </li>
              <li>
                <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.
              </li>
              <li>
                <strong>With Your Consent:</strong> We may disclose your personal information for any other purpose with your consent.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose your information where we are legally required to do so to comply with applicable law, governmental requests, judicial proceedings, court orders, or legal processes.
              </li>
            </ul>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">5. Your Privacy Rights</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>The right to access personal information we hold about you</li>
              <li>The right to request the correction of inaccurate personal information</li>
              <li>The right to request deletion of your personal information</li>
              <li>The right to withdraw consent to the processing of your information</li>
              <li>The right to request restrictions on processing of your personal information</li>
              <li>The right to data portability</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us using the contact information provided at the end of this Privacy Policy.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">6. Data Security</h2>
            <p>
              We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">7. Cookies and Tracking Technologies</h2>
            <p>
              We may use cookies, web beacons, tracking pixels, and other tracking technologies on our Service to help customize the Service and improve your experience. When you access our Service, your personal information may be collected through the use of these technologies.
            </p>
            <p className="mt-4">
              Most browsers are set to accept cookies by default. You can remove or reject cookies, but be aware that such action could affect the availability and functionality of the Service.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">8. Third-Party Websites</h2>
            <p>
              Our Service may contain links to third-party websites and applications of interest, including advertisers and social media sites. Once you have used these links to leave our Service, any information you provide to these third parties is not covered by this Privacy Policy, and we cannot guarantee the safety and privacy of your information.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">9. Children's Privacy</h2>
            <p>
              Our Service is not intended for individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take appropriate action.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">10. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mt-2 text-fuchsia-400">
              privacy@soundlink.com
            </p>
            <p className="mt-2">
              SoundLink Privacy Team<br />
              123 Music Avenue<br />
              Suite 456<br />
              New York, NY 10001<br />
              United States
            </p>
          </section>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-white/10">
        <Link to="/terms" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
          Terms of Service
        </Link>
      </div>
      
      {/* Footer */}
      <footer className="w-full bg-black/70 backdrop-blur-sm border-t border-white/10 mt-8 py-10 -mx-2 md:-mx-8 px-2 md:px-8">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="text-center">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} SoundLink Music Streaming Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy; 