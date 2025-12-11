import Navbar from "./components/common/navbar";
import Hero from "./components/landingpage/hero";
import Stats from "./components/landingpage/stats";
import Features from "./components/landingpage/whyus";
import HowItWorks from "./components/landingpage/howitworks";
import Testimonials from "./components/landingpage/testimonials";
import Queries from "./components/landingpage/queries";
import Footer from "./components/common/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center w-full">
        <div id="home" className="w-full">
          <Hero />
        </div>

        <Stats />

        <div id="features" className="w-full">
          <Features />
        </div>

        <div id="howitworks" className="w-full">
          <HowItWorks />
        </div>

        <Testimonials />

        <div id="queries" className="w-full">
          <Queries />
        </div>


      </div>
      <Footer />
    </>
  );
}
