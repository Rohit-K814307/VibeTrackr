import { Navbar1, Hero151, Features, HowItWorks, WhyJournal, AIMentor, CTA } from "@/components";

function  Landing() {
  return (
    <div>
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
            <Navbar1 />
        </div>

        <div className="bg-sky-100">
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
                <Hero151 />
            </div>
        </div>

        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
            <WhyJournal />
        </div>

        <div className="bg-gradient-to-br from-[#e6f6ff] via-white to-[#e6f6ff]">
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
                <Features />
            </div>
        </div>

        
        <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
            <HowItWorks />
        </div>

        <div className="bg-gradient-to-br from-white via-[#e6f6ff] to-white">
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
                <AIMentor />
            </div>
        </div>

        <div className="bg-violet-600 text-white p-12 w-full">
            <div className="mx-4 sm:mx-6 md:mx-8 lg:mx-12 xl:mx-16 2xl:mx-20">
                <CTA />
            </div>
        </div>

     </div>
  );
};

export default Landing;
