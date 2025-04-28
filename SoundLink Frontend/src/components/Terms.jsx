import React from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const Terms = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white pb-0">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-fuchsia-900/30 to-blue-900/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" size={16} />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Terms of Service</h1>
          
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
              Welcome to SoundLink. These Terms of Service ("Terms") govern your access to and use of the SoundLink website, mobile application, and services (collectively, the "Service"). Please read these Terms carefully before using our Service.
            </p>
            <p className="mt-4">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the Terms, you may not access the Service.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">2. Accounts</h2>
            <p>
              When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="mt-4">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">3. Content</h2>
            <p>
              Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.
            </p>
            <p className="mt-4">
              By posting Content on or through the Service, You represent and warrant that: (i) the Content is yours (you own it) or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">4. Subscriptions</h2>
            <p>
              Some parts of the Service are billed on a subscription basis ("Subscription(s)"). You will be billed in advance on a recurring and periodic basis ("Billing Cycle"). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select when purchasing a Subscription.
            </p>
            <p className="mt-4">
              At the end of each Billing Cycle, your Subscription will automatically renew under the exact same conditions unless you cancel it or SoundLink cancels it. You may cancel your Subscription renewal either through your online account management page or by contacting SoundLink customer support team.
            </p>
            <p className="mt-4">
              A valid payment method, including credit card or PayPal, is required to process the payment for your Subscription. You shall provide SoundLink with accurate and complete billing information including full name, address, state, zip code, telephone number, and valid payment method information. By submitting such payment information, you automatically authorize SoundLink to charge all Subscription fees incurred through your account to any such payment instruments.
            </p>
            <p className="mt-4">
              Should automatic billing fail to occur for any reason, SoundLink will issue an electronic invoice indicating that you must proceed manually, within a certain deadline date, with the full payment corresponding to the billing period as indicated on the invoice.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">5. Free Trial</h2>
            <p>
              SoundLink may, at its sole discretion, offer a Subscription with a free trial for a limited period of time ("Free Trial").
            </p>
            <p className="mt-4">
              You may be required to enter your billing information in order to sign up for the Free Trial. If you do enter your billing information when signing up for the Free Trial, you will not be charged by SoundLink until the Free Trial has expired. On the last day of the Free Trial period, unless you cancelled your Subscription, you will be automatically charged the applicable Subscription fees for the type of Subscription you have selected.
            </p>
            <p className="mt-4">
              At any time and without notice, SoundLink reserves the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">6. Intellectual Property</h2>
            <p>
              The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of SoundLink and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of SoundLink.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">7. Links To Other Web Sites</h2>
            <p>
              Our Service may contain links to third-party web sites or services that are not owned or controlled by SoundLink.
            </p>
            <p className="mt-4">
              SoundLink has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that SoundLink shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">8. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>
            <p className="mt-4">
              Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">9. Limitation Of Liability</h2>
            <p>
              In no event shall SoundLink, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
            </p>
          </section>
          
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">10. Changes</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
            <p className="mt-4">
              By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, please stop using the Service.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4 text-fuchsia-400">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2 text-fuchsia-400">
              support@soundlink.com
            </p>
          </section>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-8 text-center border-t border-white/10">
        <Link to="/privacy" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
          Privacy Policy
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

export default Terms; 