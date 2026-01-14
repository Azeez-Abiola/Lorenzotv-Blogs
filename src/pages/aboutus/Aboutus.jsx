import React from 'react';
import Navigation from '../../components/Navigation/Navigation';
import Footer from '../../components/Footer/Footer';
import About3 from '../../assets/about3.jpeg';
import Flower from '../../assets/flower.png';
import Write from '../../assets/write.png';
import Member from '../../assets/member.png';
import { AiOutlineLinkedin, AiOutlineTwitter } from "react-icons/ai";

const MemberCard = ({ name, role, image }) => (
  <div className="group flex flex-col items-center">
    <div className="relative w-48 h-48 mb-6 overflow-hidden rounded-3xl">
      <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
        <button className="text-white hover:text-[#8C0202] transition-colors"><AiOutlineLinkedin size={24} /></button>
        <button className="text-white hover:text-[#8C0202] transition-colors"><AiOutlineTwitter size={24} /></button>
      </div>
    </div>
    <div className="text-center">
      <h4 className="text-lg font-bold text-gray-900">{name}</h4>
      <p className="text-sm text-[#8C0202] font-bold uppercase tracking-widest mt-1">{role}</p>
    </div>
  </div>
);

function Aboutus() {
  return (
    <div className='min-h-screen bg-white'>
      <Navigation />

      {/* Hero */}
      <section className='relative h-[65vh] flex items-center justify-center overflow-hidden bg-gray-900'>
        <img src={About3} alt="About Us" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 tracking-tighter animate-fade-in">
            We are <span className="text-[#8C0202]">Lorenzo TV.</span>
          </h1>
          <p className="text-white/90 text-xl md:text-2xl font-light leading-relaxed animate-fade-in [animation-delay:200ms] [animation-fill-mode:forwards]">
            A sanctuary for stories that matter, voices that resonate, and ideas that shape the future.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-32 px-6 max-w-7xl mx-auto space-y-32">
        <div className="flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-red-50 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Our Genesis</div>
            <h2 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">From a spark of curiosity to a roaring flame.</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Lorenzo TV didn't start in a boardroom. It began with a simple question: <span className="text-gray-900 font-bold italic">"Where do the untold stories go?"</span>
              </p>
              <p>
                In a world saturated with noise, we noticed a silence. The stories of resilience, the nuances of culture, and the raw, unfiltered truth of the human experience were being drowned out. We decided to build an amplifier.
              </p>
              <p className="border-l-4 border-[#8C0202] pl-6 py-2 italic text-gray-800 font-medium">
                "We aren't just a blog. We are a digital tapestry, weaving together the diverse threads of technology, lifestyle, and thought leadership into a single, cohesive narrative."
              </p>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <div className="relative group">
              <div className="absolute -inset-4 bg-[#8C0202]/20 rounded-[2.5rem] rotate-3 transition-transform group-hover:rotate-6 duration-500"></div>
              <img className="w-full rounded-[2rem] shadow-2xl relative z-10" src={Write} alt="Genesis" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row-reverse items-center gap-20">
          <div className="flex-1 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-red-50 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Our Purpose</div>
            <h2 className="text-5xl font-black text-gray-900 leading-[1.1] tracking-tight">More than media. We are a movement.</h2>
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                Our mission is to democratize inspiration. We believe that insight shouldn't be gated behind exclusivity. Whether it's the latest in tech innovation or the subtle art of living well, we bring clarity to complexity.
              </p>
              <p>
                Every article, every interview, and every visual piece is crafted with obsessive attention to detail. We respect your time, and we honor your intelligence.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-red-100 transition-colors">
                <span className="block text-4xl font-black text-[#8C0202] mb-2">150k+</span>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Monthly Readers</span>
              </div>
              <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:border-red-100 transition-colors">
                <span className="block text-4xl font-black text-[#8C0202] mb-2">Global</span>
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Community Reach</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gray-100 rounded-[2.5rem] -rotate-3 transition-transform group-hover:-rotate-6 duration-500"></div>
              <img className="w-full rounded-[2rem] shadow-2xl relative z-10" src={Flower} alt="Mission" />
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  )
}

export default Aboutus;
