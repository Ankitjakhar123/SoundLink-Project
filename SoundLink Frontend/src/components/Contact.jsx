import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaEnvelope, FaMapMarkerAlt, FaPhone, FaCheckCircle } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white pb-0">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-r from-fuchsia-900/30 to-blue-900/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-white/80 hover:text-white mb-6">
            <FaArrowLeft className="mr-2" size={16} />
            <span>Back to Home</span>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          
          <p className="text-xl text-white/80 max-w-2xl">
            Have questions, feedback, or need support? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
          </p>
        </div>
      </div>
      
      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-neutral-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            {submitSuccess ? (
              <div className="bg-green-900/30 text-green-400 p-4 rounded-lg flex items-center mb-6">
                <FaCheckCircle className="mr-2" size={20} />
                <span>Thank you! Your message has been sent successfully.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-900/30 text-red-400 p-4 rounded-lg">
                    {error}
                  </div>
                )}
                
                <div>
                  <label htmlFor="name" className="block text-white/80 mb-2">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white/80 mb-2">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-white/80 mb-2">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full py-3 px-4 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-white/80 mb-2">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full py-3 px-4 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500 text-white resize-none"
                    required
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-colors ${
                    isSubmitting 
                      ? 'bg-fuchsia-700 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-fuchsia-600 to-fuchsia-800 hover:from-fuchsia-700 hover:to-fuchsia-900'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            )}
          </div>
          
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            
            <div className="space-y-8">
              <div className="flex items-start">
                <div className="bg-fuchsia-900/30 p-3 rounded-lg mr-4">
                  <FaEnvelope className="text-fuchsia-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Email Us</h3>
                  <p className="text-white/70 mb-1">For general inquiries:</p>
                  <a href="mailto:info@soundlink.com" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    info@soundlink.com
                  </a>
                  
                  <p className="text-white/70 mt-3 mb-1">For support:</p>
                  <a href="mailto:support@soundlink.com" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    support@soundlink.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-fuchsia-900/30 p-3 rounded-lg mr-4">
                  <FaPhone className="text-fuchsia-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Call Us</h3>
                  <p className="text-white/70 mb-1">Customer Support:</p>
                  <a href="tel:+18001234567" className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
                    +1 (800) 123-4567
                  </a>
                  
                  <p className="text-white/70 mt-3 mb-1">Business Hours:</p>
                  <p className="text-white/80">
                    Monday - Friday: 9:00 AM - 6:00 PM (EST)
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-fuchsia-900/30 p-3 rounded-lg mr-4">
                  <FaMapMarkerAlt className="text-fuchsia-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Visit Us</h3>
                  <p className="text-white/80">
                    SoundLink Headquarters<br />
                    123 Music Avenue<br />
                    Suite 456<br />
                    New York, NY 10001<br />
                    United States
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-fuchsia-800 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-fuchsia-800 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-fuchsia-800 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                
                <a href="#" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-fuchsia-800 transition-colors">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div className="bg-neutral-900/30 rounded-xl overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-5 font-medium cursor-pointer list-none">
                <span>How quickly will I receive a response to my inquiry?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-white/70">
                We strive to respond to all inquiries within 24-48 hours during business days. For urgent matters, we recommend contacting our support team directly by phone.
              </div>
            </details>
          </div>
          
          <div className="bg-neutral-900/30 rounded-xl overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-5 font-medium cursor-pointer list-none">
                <span>How can I report a technical issue with the app?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-white/70">
                For technical issues, please use the contact form above and select "Technical Support" as your subject. Include details such as your device model, operating system version, and steps to reproduce the issue.
              </div>
            </details>
          </div>
          
          <div className="bg-neutral-900/30 rounded-xl overflow-hidden">
            <details className="group">
              <summary className="flex justify-between items-center p-5 font-medium cursor-pointer list-none">
                <span>Do you offer business partnerships or advertising opportunities?</span>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </summary>
              <div className="px-5 pb-5 text-white/70">
                Yes, we're open to business partnerships and advertising opportunities. Please contact us at partners@soundlink.com with your proposal, and our business development team will get back to you.
              </div>
            </details>
          </div>
        </div>
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

export default Contact; 