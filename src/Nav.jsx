import { Link } from 'react-router-dom';
export default function Nav () {
    return (
        <nav className="fixed top-0 w-full z-[100] backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/">
          <div className="flex items-center space-x-2">
            <img
              src="/favicon.ico"
              alt="Conversarium logo"
              className="w-8 h-8"
              style={{ display: 'inline-block', verticalAlign: 'middle' }}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  style={{marginLeft: '-0.8rem'}}>
                    onversarium</span>
          </div>
        </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-slate-300 hover:text-white transition-colors">
                Features
            </Link>
            <Link to="/#pricing" className="text-slate-300 hover:text-white transition-colors">
                Pricing
            </Link>
            <Link to="/#faq" className="text-slate-300 hover:text-white transition-colors">
                FAQ
            </Link>
            <Link to="/#waitlist" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                Join Waitlist
            </Link>
          </div>
          <div className="md:hidden">
            <Link to="/#waitlist" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                Join Waitlist
            </Link>
          </div>
        </div>
      </nav>
    );
} 