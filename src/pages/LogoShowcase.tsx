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
          <p className="text-neutral-400 text-lg">Premium Logo Concepts</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">

          <div className="bg-neutral-800 rounded-2xl p-12 border-2 border-amber-500 relative">
            <div className="absolute -top-3 right-6 bg-gradient-to-r from-amber-400 to-amber-600 text-white px-3 py-1 rounded text-xs font-bold tracking-wider">
              LUXURY
            </div>
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold Foil Emboss
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-36 h-44 bg-gradient-to-br from-white to-neutral-100 rounded-lg relative shadow-2xl">
                <div className="absolute inset-4 border-2 border-amber-400/30 rounded"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl font-bold bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent"
                       style={{ fontFamily: 'Georgia, serif', textShadow: '2px 2px 4px rgba(217, 119, 6, 0.3)' }}>
                    3
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Embossed gold foil effect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Premium & luxurious</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Elegant white base</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>High-end feel</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Wax Seal
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-40 h-32 bg-gradient-to-br from-amber-50 to-white rounded relative shadow-2xl">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-xl flex items-center justify-center border-4 border-amber-300">
                  <div className="text-5xl font-bold text-white drop-shadow-lg">3</div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Classic wax seal design</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Trust & authenticity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Old-world elegance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Memorable & unique</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Champagne Card
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-40 bg-gradient-to-br from-amber-50 via-white to-amber-50 rounded relative shadow-2xl border border-amber-200">
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-transparent border-r-[40px] border-r-amber-500 border-b-[40px] border-b-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-light text-amber-700" style={{ fontFamily: 'Georgia, serif' }}>
                    3
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Warm champagne tones</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Gold corner accent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Sophisticated & clean</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Celebration vibes</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold Line Art
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-32 bg-white rounded-full relative shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-thin bg-gradient-to-br from-amber-400 to-amber-600 bg-clip-text text-transparent">
                    3
                  </div>
                </div>
                <div className="absolute inset-2 rounded-full border-2 border-amber-400"></div>
                <div className="absolute inset-5 rounded-full border border-amber-300"></div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Minimalist gold rings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Delicate & refined</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Modern luxury</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Works anywhere</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold Ribbon
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-28 h-40 bg-white rounded relative shadow-2xl">
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 shadow-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-semibold text-neutral-800">3</div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Gold ribbon bookmark</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Gift-wrapped feel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Special & thoughtful</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Friendly luxury</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Marble & Gold
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-36 h-36 bg-gradient-to-br from-neutral-50 via-white to-neutral-100 rounded-lg relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(45deg, transparent 40%, #d1d5db 50%, transparent 60%)',
                  backgroundSize: '20px 20px'
                }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl font-light bg-gradient-to-br from-amber-400 via-amber-600 to-amber-500 bg-clip-text text-transparent"
                       style={{ fontFamily: 'Georgia, serif' }}>
                    3
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>White marble texture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Luxe gold number</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Timeless elegance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Premium materials</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Art Deco Frame
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-36 h-36 bg-white relative shadow-2xl">
                <div className="absolute inset-0 border-4 border-amber-500"></div>
                <div className="absolute inset-2 border border-amber-300"></div>
                <div className="absolute top-0 left-0 w-8 h-8 bg-amber-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 bg-amber-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-light text-amber-700" style={{ fontFamily: 'Georgia, serif' }}>
                    3
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>1920s Art Deco style</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Geometric gold frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Vintage glamour</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Bold & confident</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Origami Fold
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-36 h-36 bg-white relative shadow-2xl rounded">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white via-neutral-50 to-white"></div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-transparent border-r-[60px] border-r-amber-400 border-b-[60px] border-b-transparent"></div>
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[50px] border-t-transparent border-r-[50px] border-r-amber-500 border-b-[50px] border-b-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-light text-neutral-700">3</div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Layered gold fold</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Paper craft aesthetic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Playful yet elegant</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Depth & dimension</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold Gradient
            </div>
            <div className="flex items-center justify-center mb-8 h-40">
              <div className="text-9xl font-bold bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 bg-clip-text text-transparent">
                3
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Pure gold gradient</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Ultra modern</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Simple but striking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Tech-meets-luxury</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold on Cream
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-44 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg relative shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl font-semibold text-amber-600">3</div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Warm cream background</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Soft & inviting</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Cozy elegance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Like aged paper</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Minimalist Foil
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-32 h-40 bg-white rounded relative shadow-2xl">
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-7xl font-light bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent"
                       style={{ fontFamily: 'Georgia, serif' }}>
                    3
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Subtle gold accent line</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Ultra refined</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Less is more</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Understated luxury</span>
              </li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-2xl p-12 border border-neutral-700">
            <div className="text-xs text-neutral-500 tracking-widest uppercase text-center mb-8 font-semibold">
              Gold & Shadows
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-36 h-40 bg-white rounded-lg relative shadow-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="text-8xl font-bold text-amber-500" style={{
                      textShadow: '4px 4px 8px rgba(217, 119, 6, 0.4), -2px -2px 4px rgba(255, 255, 255, 0.8)'
                    }}>
                      3
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 border-t border-neutral-700 pt-6">
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>3D embossed effect</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Depth with shadows</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Tactile feel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500">★</span>
                <span>Stands out</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="text-center text-neutral-500 pt-12 border-t border-neutral-800">
          <p className="leading-relaxed max-w-2xl mx-auto">
            <span className="text-amber-400 font-semibold">Gold & White:</span> Premium, elegant, timeless<br />
            <span className="text-amber-400 font-semibold">Inspiration:</span> Luxury stationery, gold foil invitations, high-end branding<br />
            <span className="text-amber-400 font-semibold">Feel:</span> Sophisticated yet approachable, special but not overdone
          </p>
        </div>
      </div>
    </div>
  );
}
