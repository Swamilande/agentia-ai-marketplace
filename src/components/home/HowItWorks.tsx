import { motion } from "framer-motion";
import { Search, Settings, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: 1,
    title: "Discover AI Agents",
    description: "Browse our curated marketplace or connect to public repositories to find the perfect agent.",
  },
  {
    icon: Settings,
    step: 2,
    title: "Customize & Deploy",
    description: "Configure agent parameters, connect your data sources securely, and deploy with one click.",
  },
  {
    icon: BarChart3,
    step: 3,
    title: "Scale with Analytics",
    description: "Monitor interactions, optimize latency and spend, and scale automatically as demand grows.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block glass-card rounded-full px-5 py-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-6">
            How It Works
          </span>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Deploy intelligent agents to your infrastructure in minutes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
              className="glass-card rounded-3xl p-8 relative group hover:border-primary/30 transition-all duration-500"
            >
              {/* Step badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  Step {step.step}
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <step.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
