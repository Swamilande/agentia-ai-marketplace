import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Bot, Shield, Zap, Users, Globe, Award } from "lucide-react";

const stats = [
  { value: "500+", label: "AI Agents" },
  { value: "10K+", label: "Enterprises" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
];

const values = [
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "SOC 2 Type II certified with end-to-end encryption and advanced threat protection.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Sub-100ms response times with global edge deployment across 50+ regions.",
  },
  {
    icon: Users,
    title: "Customer First",
    description: "Dedicated success managers and 24/7 technical support for all enterprise clients.",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Serving millions of requests daily across 150+ countries worldwide.",
  },
  {
    icon: Award,
    title: "Industry Leader",
    description: "Recognized by Gartner and Forrester as a leader in AI agent marketplaces.",
  },
  {
    icon: Bot,
    title: "AI Excellence",
    description: "Rigorous vetting process ensures only the highest quality agents make it to our platform.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/5 rounded-full blur-[150px]" />
        <div className="bg-grid absolute inset-0 opacity-30" />
      </div>

      <Navbar />
      
      <main className="relative pt-32 pb-20">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
              <Bot className="h-4 w-4" />
              About Agentia
            </span>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6">
              Powering the Future of
              <br />
              <span className="text-gradient">Enterprise AI</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're building the world's most trusted marketplace for production-ready AI agents. 
              Our mission is to democratize access to enterprise-grade AI capabilities.
            </p>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl text-center"
              >
                <div className="text-4xl lg:text-5xl font-black text-gradient mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Story */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-4xl p-8 lg:p-16"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold tracking-tight mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    Founded in 2023, Agentia emerged from a simple observation: enterprises were struggling to 
                    find, evaluate, and deploy AI agents that actually work in production.
                  </p>
                  <p>
                    Our founders—veterans from Google, OpenAI, and Stripe—set out to create a marketplace that 
                    prioritizes quality, security, and seamless integration above all else.
                  </p>
                  <p>
                    Today, we're proud to serve over 10,000 enterprises worldwide, powering everything from 
                    customer support to complex data analysis workflows.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="w-32 h-32 rounded-3xl bg-primary/20 flex items-center justify-center border border-primary/30"
                  >
                    <Bot className="h-16 w-16 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Values */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we build.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-8 rounded-3xl group hover:border-primary/30 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-110 transition-transform duration-500">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
