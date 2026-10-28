import { About } from "@/components/landing/About";
import { CtaBanner } from "@/components/landing/CtaBanner";
import { Environment } from "@/components/landing/Environment";
import { FeatureVideos } from "@/components/landing/FeatureVideos";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Team } from "@/components/landing/Team";

// No bottom padding: CtaBanner carries its own mb-16 above the footer stripe.
const Index = () => (
  <div className="flex flex-col gap-16 pt-4 lg:gap-24 lg:pt-6">
    <Hero />
    <Environment />
    <Services />
    <FeatureVideos />
    <About />
    <Team />
    <CtaBanner />
  </div>
);

export default Index;
