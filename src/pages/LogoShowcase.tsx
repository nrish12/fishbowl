import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function LogoShowcase() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={20} />
          <span>Back to Home</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-light tracking-wider mb-4">THREEFOLD</h1>
          <p className="text-neutral-400 text-lg">Simple & Clean Logo Concepts</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          <div className="bg-neutral-800 rounded-2xl p-12 border-2 border-blue-500 relative">
            <div className="absolute -top-3 right-6 bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold tracking-wider">
              RECOMMENDED
            </div>
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Folded Note
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-40 bg-gradient-to-br from-neutral-50 to-neutral-200 rounded relative shadow-2xl">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-transparent border-r-[40px] border-r-blue-500 border-b-[40px] border-b-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold text-neutral-800">
                  3
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Like passing a secret note</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Blue corner fold = hint reveal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Simple, clean, recognizable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Perfect for app icon</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Just the Number
            </div>
            <div className="flex items-center justify-center mb-8 h-40">
              <div className="text-8xl font-light text-white" style={{ fontFamily: 'Georgia, serif' }}>
                3
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Ultra minimal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Elegant serif font</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Easy to remember</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Timeless design</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Sealed Letter
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-40 h-28 bg-neutral-50 rounded relative shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-blue-500 to-blue-600"
                     style={{ clipPath: 'polygon(0 0, 100% 0, 50% 60%)' }}>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-4xl font-semibold text-neutral-800">
                  3
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Mystery/reveal concept</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Blue triangle = opening flap</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Friendly, approachable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Like getting mail</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Clean Card
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-28 h-40 bg-white rounded-lg shadow-2xl border-2 border-neutral-200 flex items-center justify-center">
                <div className="text-7xl font-light text-blue-500" style={{ fontFamily: 'Georgia, serif' }}>
                  3
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Simple white card</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>One number, centered</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Professional, trustworthy</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Not overdone</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Text + Number
            </div>
            <div className="flex items-center justify-center mb-8 h-40">
              <div className="flex items-baseline gap-1">
                <span className="text-7xl font-light text-white">3</span>
                <span className="text-4xl font-light text-neutral-500 tracking-wide">fold</span>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Readable combination</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>No confusion on pronunciation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Lightweight design</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Works at any size</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Corner Fold
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 bg-white rounded relative shadow-2xl">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[50px] border-t-transparent border-r-[50px] border-r-blue-500 border-b-[50px] border-b-transparent rounded-tr"></div>
                <div className="absolute inset-0 flex items-center justify-center text-7xl font-semibold text-neutral-800">
                  3
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Like a bookmark or tag</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Blue fold = discovery</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Square format for icons</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-neutral-600">→</span>
                <span>Clean and balanced</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="text-center text-neutral-500 pt-12 border-t border-neutral-800">
          <p className="leading-relaxed max-w-2xl mx-auto">
            <span className="text-white font-semibold">All designs:</span> Simple, clean, easy to look at<br />
            <span className="text-white font-semibold">Inspiration:</span> Passing notes, Christmas cards, secret messages<br />
            <span className="text-white font-semibold">Not overdone:</span> Minimal elements, maximum impact
          </p>
        </div>
      </div>
    </div>
  );
}
