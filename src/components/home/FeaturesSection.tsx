import { motion } from "framer-motion";
import { Shield, BarChart3, Bot } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "Military-grade encryption and compliance built-in. Your data and agent logic remain completely secure and isolated.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Monitor agent performance, API usage, and costs in real-time with comprehensive dashboards and alerts.",
  },
  {
    icon: Bot,
    title: "AI Agent Marketplace",
    description:
      "Access thousands of pre-trained agents. One-click deployment for customer support, coding, analysis, and more.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block glass-card rounded-full px-5 py-1.5 text-xs font-medium tracking-widest uppercase text-primary mb-6">
            Platform Features
          </span>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build and scale your AI infrastructure securely.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12, duration: 0.5 }}
              className="glass-card rounded-3xl p-8 hover:border-primary/30 transition-all duration-500 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
