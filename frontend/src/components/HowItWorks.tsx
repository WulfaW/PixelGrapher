import { Card } from '@/components/ui/card';
import { Palette, Github, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: <Palette className="w-8 h-8 text-green-500" />,
      title: "1. Design Your Art",
      description: "Use our drawing canvas, AI text generator, or pre-made templates to draw your masterpiece on the 52x7 GitHub contribution grid."
    },
    {
      icon: <Github className="w-8 h-8 text-green-500" />,
      title: "2. Connect & Select",
      description: "Sign in securely with your GitHub account and select a repository. We highly recommend creating a fresh, empty repository for this."
    },
    {
      icon: <Rocket className="w-8 h-8 text-green-500" />,
      title: "3. Generate Commits",
      description: "We automatically create and push backdated commits to your selected repository. Your GitHub profile graph instantly turns into art!"
    }
  ];

  return (
    <section id="how-it-works" className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground">Transform your GitHub contribution graph in three simple steps.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <Card key={index} className="p-6 text-center space-y-4 bg-white/50 dark:bg-card/50 backdrop-blur-sm border-dashed">
            <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-full flex items-center justify-center">
              {step.icon}
            </div>
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-muted-foreground">{step.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
