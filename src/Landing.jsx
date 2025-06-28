import { 
  MessageCircle, 
  Zap, 
  Users, 
  Brain, 
  Mic, 
  BarChart3, 
  Globe, 
  Check, 
  ArrowRight, 
  Mail,
  ChevronDown
} from 'lucide-react';
import Nav from './Nav';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
export default function Landing() {
    const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
    const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [location]);


  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden">

      
      {/* Navigation */}
      <Nav/>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative z-10 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="flex items-end justify-center mb-12 gap-4">
              <img
                src="/logo.png"
                alt="Conversarium logo"
                className="h-[6em] w-auto"
                style={{ marginBottom: '-1.0em' }} // tweak as needed
              />
              <span className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                    style= {{ marginLeft: '-1.8rem'}}>
                onversarium
              </span>
            </div>

            <p className="text-lg sm:text-xl text-slate-400 mb-2">
              The AI-powered, deterministic dialogue engine
            </p>
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 leading-tight">
            Build any conversation.<br />
            Engage with natural dialogue.<br />
            <span className="text-blue-400">Level up.</span>
          </h2>
          
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Master sales calls based on your product, generate procedural NPC dialogue, practice legal depositions, and more. </p>
          <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
           Structured & deterministic conversation trees, powered by generative AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => scrollToSection('waitlist')}
              className="bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Early Access</span>
              <ChevronDown className="w-5 h-5" />
            </button>
            <Link to="/demo"
            className="relative bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 overflow-hidden"
            >
            <span className="relative z-10">Live Demo</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-pulse z-0 rounded-lg"></div>
            </Link>

          </div>
          
          <button 
            onClick={() => scrollToSection('features')}
            className="mt-12 text-slate-400 hover:text-white transition-colors flex items-center mx-auto space-x-2"
          >
            <span>See how it works</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
                  </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 relative z-10 bg-gradient-to-bl from-slate-950 via-slate-900/70 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Real talk. Not just talk.
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <Brain className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Modular Graph-Based Flows</h3>
              <p className="text-slate-300">Build conversation trees that branch based on responses. Practice every possible scenario.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <Zap className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Instant AI Feedback</h3>
              <p className="text-slate-300">Get real-time analysis of your responses. Tone, clarity, persuasiveness – we measure what matters.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <Users className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Build The Flow You Need</h3>
              <p className="text-slate-300">SPIN selling, therapy sessions, legal cross-examination. Practice the conversations that matter.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <Mic className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Voice Input</h3>
              <p className="text-slate-300">Practice how you'll speak. Full voice recognition with natural speech patterns.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <BarChart3 className="w-12 h-12 text-red-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Analytics & Reporting</h3>
              <p className="text-slate-300">Track progress over time. Perfect for training teams, onboarding, and measuring improvement.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50 hover:border-blue-500/30 transition-all">
              <Globe className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Works in Browser</h3>
              <p className="text-slate-300">No downloads, no installs. Just open and start speaking. Works on any device.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot/Mockup Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">See it in action</h2>
          <div className="relative backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-8 mb-4 text-left space-y-4 shadow-lg max-w-200">
  <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
  <h3 className="text-2xl font-semibold mb-3 text-white text-center">SPIN Selling Flow Example</h3>
  <p className="text-lg text-slate-100 text-center mb-4">
    Selling <span className="font-semibold text-blue-200">AI Sales Practice Software</span> to <span className="font-semibold text-blue-200">Dr. Emily Carter</span>, State School Administrator
  </p>
  <ul className="text-base text-slate-200 space-y-2">
    <li>
      <span className="font-semibold text-blue-300">Persona:</span> Dr. Carter is a pragmatic, analytical administrator with 10+ years' experience and a Ph.D. in Educational Leadership. She is known for integrating technology to improve student outcomes.
    </li>
    <li>
      <span className="font-semibold text-blue-300">Objectives:</span> Improve education quality, implement cost-effective tech solutions, and ensure alignment with budget and curriculum goals.
    </li>
    <li>
      <span className="font-semibold text-blue-300">Motivations:</span> Enhance student engagement, protect the school’s reputation, and innovate while staying within budget.
    </li>
    <li>
      <span className="font-semibold text-blue-300">Constraints:</span> Limited budget, need for user-friendly software, and demand for measurable impact on learning.
    </li>
    <li>
      <span className="font-semibold text-blue-300">Scenario:</span> Formal meeting to demonstrate the value of AI Sales Practice Software. Key goals: address budget concerns, prove educational benefits, and show fit with existing curriculum.
    </li>
  </ul>
</div>

              <Link to="/demo" 
              className="text-white relative bg-blue-500 hover:bg-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2 overflow-hidden">
                Try Now!
              </Link>
            </div>
            <div className="absolute inset-0 rounded-2xl pointer-events-none"></div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 relative z-10 bg-gradient-to-bl from-slate-950 via-slate-900/70 to-slate-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Choose your mastery level
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-slate-400 mb-6">Get started with the basics</p>
              <div className="text-3xl font-bold mb-6">$0<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>No custom generation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Limited flows</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Basic scoring</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Powered by Browser APIs</span>
                </li>
              </ul>
              <button className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium transition-colors">
                {/*Start Free*/}
                Coming Soon
              </button>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 px-4 py-1 rounded-full text-sm font-medium">
                Most Flexible
              </div>
              <h3 className="text-2xl font-bold mb-2">API Access</h3>
              <p className="text-slate-400 mb-2">Get the raw graph & flows as JSON, traverse them any way you want. Your app, your UX, our conversation brains.</p>
              <div className="text-3xl font-bold mb-6">$15<span className="text-lg text-slate-400">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Create and manage flows</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Export to JSON</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Implement directly in your app</span>
                  
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Manage session & traversal <p>logic locally</p></span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Choose models for audio & narrative</span>
                </li>
              </ul>
              <button className="w-full bg-blue-500 hover:bg-blue-600 py-3 rounded-lg font-medium transition-colors">
                {/*Go Pro*/}
                Coming Soon
              </button>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50">
              <h3 className="text-2xl font-bold mb-2">Team/Org</h3>
              <p className="text-slate-400 mb-6">Scale conversation mastery</p>
              <div className="text-3xl font-bold mb-6">Contact us</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Bulk seats & billing</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Organization management</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>Custom templates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-400" />
                  <span>SSO integration</span>
                </li>
              </ul>
              <form>
              <button formAction="mailto:contact@conversarium.app" className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-medium transition-colors">
                
                  Contact Sales
                  
                
              </button>
              <div className="flex items-center justify-center gap-2 mt-20">
                <Mail />
                <span>: contact@conversarium.app</span>
              </div>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16">
            Questions? We've got answers.
          </h2>
          
          <div className="space-y-8">
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-xl font-semibold mb-3">What exactly is Conversarium?</h3>
              <p className="text-slate-300">Conversarium is a conversation engine that uses generative AI to create structured dialogue flows. Input a scenario, desired conversational topic count, and naturally talk through a deterministic conversation. </p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-xl font-semibold mb-3">What can this be used for?</h3>
              <p className="text-slate-300">Conversarium enables many use cases from sales training to procedural RPG NPC generation. Create and traverse conversarium flows through our web app, or instantiate and generate flows through our API and implement your own custom scoring and traversal logic.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-xl font-semibold mb-3">Do you support my specific use case?</h3>
              <p className="text-slate-300">We're building templates for sales (SPIN, Challenger), therapy (CBT, motivational interviewing), legal (depositions, cross-examination), medical (patient interviews), and more. Custom flows let you create any conversation structure you need.</p>
            </div>
            
            <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800/50">
              <h3 className="text-xl font-semibold mb-3">When will it be ready?</h3>
              <p className="text-slate-300">The very early demo is live above, more features will be added progressively. Contact us at contact@conversarium.app with any questions or inquiries.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 relative z-10 bg-gradient-to-bl from-slate-950 via-slate-900/70 to-slate-950">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to master every conversation?
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 mb-8">
            Join our waitlist! Be the first to access the determinstic conversation platform when we officially launch.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <form action="https://formsubmit.co/contact@conversarium.app" method="POST">
              <input type="email" name="email" required placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"/>
              <button type="submit" className="bg-blue-500 hover:bg-blue-600 disabled:bg-green-500 px-8 py-4 rounded-lg font-semibold transition-colors whitespace-nowrap">Join Waitlist</button>
              </form>

          </div>
          
          <p className="text-sm text-slate-500 mt-4">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-950 via-slate-900/70 to-slate-950 relative z-10">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">About Conversarium</h2>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            Originally inspired by the need for sales students to get repetitions mastering their process in a determinstic way, Conversarium 
            offers a structured, and gameified conversation flow graph for any context, without having to trust leaky LLMs to manage the structure,
            pacing, or topics of conversation. Each conversation is a traversable graph with paramaters you can configure at generation to ensure
            it fits your intended use. From practicing for an upcoming business deal, to filling an open world with lively and realistic characters.
          </p>
          
          <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-slate-800/50 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-center">Coming Soon</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm justify-center w-fit mx-auto text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>More Flows</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>API Access</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Custom Integrations</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-slate-800/50 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <MessageCircle className="w-6 h-6 text-blue-400" />
            <span className="font-semibold">Conversarium</span>
          </div>
          <div className="w-full md:w-auto flex justify-center">
            <div className="flex items-center space-x-8">
              <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Privacy</span>
              </a>
              <a href="mailto:contact@conversarium.app" className="text-slate-400 hover:text-white transition-colors flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Contact: contact@conversarium.app</span>
              </a>
            </div>
          </div>
          <div className="text-sm text-slate-500 mt-4 md:mt-0">
            © 2025 Conversarium. All rights reserved.
          </div>
        </div>
      </footer>


    </div>
  );
}