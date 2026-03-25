import { motion } from "framer-motion";
import { Search, Zap, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Discover",
    description: "Browse our curated marketplace of production-ready AI agents built for enterprise needs.",
  },
  {
    icon: Zap,
    title: "Evaluate",
    description: "Test agents with live demos, review documentation, and validate capabilities before purchase.",
  },
  {
    icon: Rocket,
    title: "Deploy",
    description: "One-click deployment to your infrastructure. Get up and running in under 60 seconds.",
  },
  {
    icon: BarChart3,
    title: "Scale",
    description: "Monitor performance, optimize configurations, and scale seamlessly with demand.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-40 bg-zinc-950/50 border-y border-foreground/5 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 lg:mb-24"
        >
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From discovery to deployment, we've simplified every step of the AI agent lifecycle.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-px bg-gradient-to-r from-primary/20 to-transparent" />
              )}

              <div className="relative p-8 rounded-4xl bg-secondary/30 border border-foreground/5 hover:border-primary/30 transition-all duration-500 hover:bg-secondary/50">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{index + 1}</span>
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>

                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
