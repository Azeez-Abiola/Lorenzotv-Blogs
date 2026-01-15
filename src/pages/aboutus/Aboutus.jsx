import React from 'react';
import Navigation from '../../components/Navigation/Navigation';
import Footer from '../../components/Footer/Footer';
import About3 from '../../assets/about3.jpeg';
import Flower from '../../assets/flower.png';
import Write from '../../assets/write.png';
import Member from '../../assets/member.png';
import { AiOutlineLinkedin, AiOutlineTwitter } from "react-icons/ai";
import ScrollReveal from '../../components/ScrollReveal/ScrollReveal';

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
  const benefits = [
    {
      title: "Curated Intelligence",
      description: "Save time with expertly summarized insights on global and local trends, so you stay informed without the noise.",
      icon: "01"
    },
    {
      title: "A Roadmap to Success",
      description: "Gain access to the 'Founder's Playbook' through our exclusive interviews, learning the exact strategies used by industry leaders.",
      icon: "02"
    },
    {
      title: "Holistic Growth",
      description: "Our dual focus on professional fields and personal well-being ensures you grow as a complete individual.",
      icon: "03"
    },
    {
      title: "Networking & Community",
      description: "Engage with a like-minded community of thinkers. Your perspectives help shape a larger, collective dialogue.",
      icon: "04"
    },
    {
      title: "Inspiration on Demand",
      description: "Whenever you feel stuck, our stories of resilience and innovation are designed to reignite your drive.",
      icon: "05"
    }
  ];

  return (
    <div className='min-h-screen bg-white overflow-x-hidden max-w-full'>
      <Navigation />

      {/* Hero */}
      <section className='relative min-h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden bg-gray-900 pt-32 md:pt-0'>
        <img src={About3} alt="About Us" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <ScrollReveal direction="bottom">
            <h1 className="text-4xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-[1.1] md:leading-none">
              Where <span className="text-[#8C0202]">Information</span> Meets Inspiration.
            </h1>
            <p className="text-white/80 text-base md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Welcome to Lorenzo Blog, your premium digital sanctuary for insightful stories, trend-setting ideas, and deep-dive explorations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Main Mission */}
      <section className="py-24 md:py-40 px-6 max-w-7xl mx-auto">
        <ScrollReveal direction="bottom">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center">
            <div className="flex-1 space-y-6 md:space-y-10">
              <div className="inline-block px-4 py-1.5 bg-red-50 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">Our Story</div>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight">We are more than a publishing platform.</h2>
              <p className="text-lg md:text-2xl text-gray-400 leading-relaxed font-medium">
                We are a community-driven ecosystem dedicated to curating high-quality, thought-provoking content that fuels curiosity and sparks the conversations that define our generation.
              </p>
              <div className="space-y-4 md:space-y-8 text-gray-500 leading-relaxed text-sm md:text-lg">
                <p>
                  Our editorial lens spans across a diverse and rich spectrum of categories designed to keep you at the forefront of change. Whether it’s navigating the cutting edge of Technology, understanding the landscape of Finance and wealth creation, or immersing yourself in the vibrant heartbeat of Entertainment—we’ve got you covered.
                </p>
                <p>
                  For those who seek the wisdom of pioneers, our exclusive <span className="text-gray-900 font-bold italic">Founder's Series</span> takes you behind the curtains, revealing the raw, unvarnished journeys of visionaries.
                </p>
              </div>
            </div>
            <div className="flex-1 w-full order-first md:order-last">
              <div className="relative">
                <div className="absolute -inset-4 bg-gray-50 rounded-2xl md:rounded-[4rem] rotate-2"></div>
                <img src={Write} alt="Lorenzo Blog" className="relative z-10 rounded-2xl md:rounded-[3rem] shadow-2xl w-full h-auto" />
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Benefits */}
      <section className="py-24 md:py-40 bg-gray-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#8C0202]/10 blur-[120px] rounded-full translate-x-1/2 translate-y-[-20%] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal>
            <div className="mb-16 md:mb-24">
              <div className="inline-block px-4 py-1.5 bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg mb-6 border border-white/10 italic">Your Advantage</div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight md:leading-none">What You Stand <br /><span className="text-[#8C0202]">to Benefit</span></h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={index} direction="bottom" delay={index * 100}>
                <div className="group p-8 md:p-12 bg-white/5 border border-white/10 rounded-2xl md:rounded-[3rem] hover:bg-white/10 transition-all duration-500 hover:-translate-y-2 h-full">
                  <div className="text-5xl font-black text-white/5 group-hover:text-[#8C0202]/20 transition-colors mb-6">{benefit.icon}</div>
                  <h4 className="text-xl md:text-2xl font-bold mb-4">{benefit.title}</h4>
                  <p className="text-white/50 text-sm md:text-base leading-relaxed font-medium group-hover:text-white/70 transition-colors">
                    {benefit.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}

            <ScrollReveal direction="bottom" delay={500}>
              <div className="p-8 md:p-12 bg-[#8C0202] rounded-2xl md:rounded-[3rem] flex flex-col justify-center items-center text-center">
                <h4 className="text-2xl md:text-3xl font-black mb-4 leading-tight text-white">Ready to evolve?</h4>
                <p className="text-white/80 text-sm md:text-base mb-8 font-medium italic">Join our community of visionaries today.</p>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#8C0202] shadow-xl">
                  <svg className="w-8 h-8 rotate-[-45deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-32 px-6 max-w-4xl mx-auto text-center">
        <ScrollReveal direction="bottom">
          <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
            At Lorenzo Blog, we don’t just report the news; we translate complexity into clarity, making every read an investment in your personal and professional evolution.
          </p>
          <div className="w-20 h-1.5 bg-[#8C0202] mx-auto mt-12 rounded-full"></div>
          <h5 className="text-lg font-black mt-8 uppercase tracking-widest text-[#8C0202]">Welcome to the future of storytelling.</h5>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  )
}

export default Aboutus;
