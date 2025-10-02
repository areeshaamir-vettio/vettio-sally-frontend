import { Rocket, Target, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-background via-muted/30 to-muted/50 text-foreground">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center px-6 py-28">
        <h1 className="text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6 animate-fade-in">
          Meet <span className="text-primary">Sally</span> — <br />
          Your Autonomous Recruitment Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 animate-fade-in">
          Cut time-to-first shortlist from <strong className="text-foreground">days → hours</strong>.  
          Sally partners with hiring managers and recruiters to source, calibrate, 
          and reach the best candidates across multiple channels — 
          all bias-aware and compliant.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in">
          <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 py-24">
        <FeatureCard
          icon={Rocket}
          iconColor="primary"
          title="Rapid Intake"
          description="Structured, conversational role intake that generates a machine-readable spec, success rubric, and JD instantly."
        />
        <FeatureCard
          icon={Target}
          iconColor="success"
          title="Calibrated Sourcing"
          description="Validate fit with 3 high-precision profiles before scaling to 15+ ranked candidates — saving hours of manual screening."
        />
        <FeatureCard
          icon={Satellite}
          iconColor="automation"
          title="Multi-Channel Outreach"
          description="Orchestrate compliant outreach across Email, SMS, WhatsApp, Voice, and LinkedIn — with reply intent detection built in."
        />
      </section>

      {/* CTA Section */}
      <section className="text-center px-6 py-24 bg-muted/50 border-t border-border">
        <h2 className="text-4xl font-bold mb-6 text-foreground">
          Ready to accelerate your hiring?
        </h2>
        <p className="text-lg text-muted-foreground mb-8">
          Get your first shortlist in under <strong className="text-foreground">2 hours</strong>.
        </p>
        <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
          Start Now
        </Button>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-muted-foreground text-sm border-t border-border">
        © {new Date().getFullYear()} Sally — Autonomous Recruitment Agent. All rights reserved.
      </footer>
    </main>
  );
}
