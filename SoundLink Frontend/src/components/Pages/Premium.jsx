import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowLeft, FaMusic, FaDownload, FaVolumeMute, FaRandom, FaHeadphones, FaCrown, FaUserFriends, FaChartLine, FaBolt } from 'react-icons/fa';

const Premium = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = {
    monthly: [
      {
        id: 'basic',
        name: 'Basic',
        price: '₹399',
        period: 'month',
        features: [
          'Ad-free listening',
          'High quality audio',
          'Unlimited skips',
          'Listen offline'
        ],
        icon: <FaMusic className="mr-2" />,
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '₹699',
        period: 'month',
        features: [
          'All Basic features',
          'Exclusive content access',
          'Early access to new releases',
          'No listening restrictions',
          'HD audio quality'
        ],
        icon: <FaCrown className="mr-2" />,
        popular: true
      },
      {
        id: 'family',
        name: 'Family',
        price: '₹999',
        period: 'month',
        features: [
          'All Pro features',
          'Up to 6 accounts',
          'Parental controls',
          'Shared playlists',
          'Individual recommendations'
        ],
        icon: <FaUserFriends className="mr-2" />,
        popular: false
      }
    ],
    yearly: [
      {
        id: 'basic',
        name: 'Basic',
        price: '₹3,999',
        period: 'year',
        features: [
          'Ad-free listening',
          'High quality audio',
          'Unlimited skips',
          'Listen offline'
        ],
        icon: <FaMusic className="mr-2" />,
        popular: false
      },
      {
        id: 'pro',
        name: 'Pro',
        price: '₹6,999',
        period: 'year',
        features: [
          'All Basic features',
          'Exclusive content access',
          'Early access to new releases',
          'No listening restrictions',
          'HD audio quality'
        ],
        icon: <FaCrown className="mr-2" />,
        popular: true
      },
      {
        id: 'family',
        name: 'Family',
        price: '₹9,999',
        period: 'year',
        features: [
          'All Pro features',
          'Up to 6 accounts',
          'Parental controls',
          'Shared playlists',
          'Individual recommendations'
        ],
        icon: <FaUserFriends className="mr-2" />,
        popular: false
      }
    ]
  };

  const features = [
    {
      id: 1,
      icon: <FaVolumeMute className="text-pink-500" size={24} />,
      title: 'Ad-Free Experience',
      description: 'Enjoy uninterrupted music without any advertisements.'
    },
    {
      id: 2,
      icon: <FaHeadphones className="text-indigo-500" size={24} />,
      title: 'HD Audio Quality',
      description: 'Experience music in crystal clear high-definition sound quality.'
    },
    {
      id: 3,
      icon: <FaDownload className="text-blue-500" size={24} />,
      title: 'Offline Listening',
      description: 'Download your favorite tracks and listen without an internet connection.'
    },
    {
      id: 4,
      icon: <FaRandom className="text-green-500" size={24} />,
      title: 'Unlimited Skips',
      description: 'Skip as many tracks as you want with no limitations.'
    },
    {
      id: 5,
      icon: <FaChartLine className="text-yellow-500" size={24} />,
      title: 'Advanced Analytics',
      description: 'Get detailed insights about your listening habits and preferences.'
    },
    {
      id: 6,
      icon: <FaBolt className="text-orange-500" size={24} />,
      title: 'Early Access',
      description: 'Be the first to experience new features and content releases.'
    }
  ];

  const faqItems = [
    {
      question: 'How will I be billed?',
      answer: 'Your subscription will automatically renew each month or year depending on your chosen plan. You can cancel anytime before the next billing period.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will take effect on your next billing cycle.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription from your account settings page. Your premium benefits will continue until the end of your current billing period.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes, new premium users get a 7-day free trial to experience all the premium features before being charged.'
    },
    {
      question: 'How many devices can I use?',
      answer: 'You can log in to your account on unlimited devices, but you can only stream on one device at a time (three devices simultaneously with Family plan).'
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // In a real app, this would navigate to payment processing
    setTimeout(() => {
      window.scrollTo({
        top: document.getElementById('payment').offsetTop - 100,
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-neutral-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        {/* Decorative circles */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-fuchsia-900/10 blur-3xl -z-10"></div>
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-900/10 blur-3xl -z-10"></div>
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-900/10 blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          {/* <Link to="/" className="inline-flex items-center text-white/80 hover:text-white py-4">
            <MdArrowBack className="mr-2" size={20} />
            <span>Back to Home</span>
          </Link> */}
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="transform transition-all duration-500 animate-fade-in-up">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                Elevate Your Music Experience
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Unlock premium features and enjoy ad-free, high-quality music with SoundLink Premium.
              </p>
            </div>
            
            {/* Toggle between Monthly and Yearly */}
            <div className="inline-flex items-center bg-neutral-800 p-1 rounded-full mb-12">
              <button
                className={`px-6 py-2 rounded-full transition ${billingCycle === 'monthly' ? 'bg-fuchsia-700 text-white' : 'text-white/60 hover:text-white'}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-2 rounded-full transition ${billingCycle === 'yearly' ? 'bg-fuchsia-700 text-white' : 'text-white/60 hover:text-white'}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly <span className="text-xs font-bold text-green-400 ml-1">Save 15%</span>
              </button>
            </div>
          </div>
          
          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans[billingCycle].map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-neutral-800 rounded-2xl shadow-xl overflow-hidden border border-neutral-700 ${plan.popular ? 'md:-mt-4 md:mb-4' : ''} transition-all duration-300 transform hover:scale-105 animate-fade-in`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {plan.popular && (
                  <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-pink-500 to-fuchsia-500 text-center py-1 text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center text-lg font-bold mb-4">
                    {plan.icon}
                    <span>{plan.name}</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-white/60 ml-1">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <FaCheck className="text-green-400 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        plan.popular
                          ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:from-pink-600 hover:to-fuchsia-600'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      Select Plan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 px-4 bg-black/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Premium Features</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Enjoy these exclusive features when you upgrade to SoundLink Premium.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Payment Section - Shown only when a plan is selected */}
      {selectedPlan && (
        <section className="py-16 px-4">
          <div className="max-w-2xl mx-auto bg-neutral-800 rounded-2xl p-8 border border-neutral-700">
            <h2 className="text-2xl font-bold mb-8 pb-4 border-b border-neutral-700">Complete Your Subscription</h2>
            
            <div className="mb-6 p-4 bg-neutral-700/30 rounded-lg">
              <h3 className="font-medium mb-2">Order Summary</h3>
              <div className="flex justify-between mb-1">
                <span className="text-white/70">Plan:</span>
                <span>{selectedPlan.name} ({billingCycle})</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-white/70">Price:</span>
                <span>{selectedPlan.price}/{selectedPlan.period}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-neutral-600 mt-2">
                <span className="font-medium">Total:</span>
                <span className="font-medium">{selectedPlan.price}</span>
              </div>
            </div>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Card Information</label>
                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full py-3 px-4 bg-neutral-700/30 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full py-3 px-4 bg-neutral-700/30 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-full py-3 px-4 bg-neutral-700/30 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-white/80">Name on Card</label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full py-3 px-4 bg-neutral-700/30 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                />
              </div>
              
              <div className="flex items-center pt-4">
                <input
                  id="terms"
                  type="checkbox"
                  className="w-4 h-4 bg-neutral-700 border-neutral-600 rounded focus:ring-fuchsia-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-white/70">
                  I agree to the <span className="text-fuchsia-400 cursor-pointer">Terms of Service</span> and <span className="text-fuchsia-400 cursor-pointer">Privacy Policy</span>
                </label>
              </div>
              
              <div className="pt-4">
                <button
                  type="button"
                  className="w-full py-3 font-bold rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white hover:from-pink-600 hover:to-fuchsia-600 transition"
                >
                  Subscribe Now
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-full py-3 font-medium text-white/70 hover:text-white mt-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      )}
      
      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-white/60">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="bg-neutral-800/50 border border-neutral-700/50 rounded-xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <details className="group">
                  <summary className="flex justify-between items-center p-5 font-medium cursor-pointer list-none">
                    <span>{item.question}</span>
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" width="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-white/70">
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <section className="px-4 py-8 text-center text-white/60 text-sm">
        <p>&copy; {new Date().getFullYear()} SoundLink Premium. All rights reserved.</p>
      </section>
    </div>
  );
};

// Add the required keyframe animations for our component
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);

export default Premium; 