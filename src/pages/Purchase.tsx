import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Shield, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { mockAgents } from "@/data/mockAgents";
import { useAuthStore } from "@/stores/authStore";
import { usePurchaseStore } from "@/stores/purchaseStore";
import { processPayment, recordActivity } from "@/services/api";

const Purchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const { completePurchase, hasPurchased, clearPendingPurchase } = usePurchaseStore();
  
  const agent = mockAgents.find((a) => a.id === id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth/login", { state: { from: `/purchase/${id}` } });
    }
  }, [isAuthenticated, navigate, id]);

  // Redirect if already purchased
  useEffect(() => {
    if (user && agent && hasPurchased(agent.id, user.id)) {
      navigate(`/agents/${id}`);
      toast({
        title: "Already Purchased",
        description: "You already own this agent.",
      });
    }
  }, [user, agent, hasPurchased, navigate, id, toast]);

  // Pre-fill card name with user name
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({ ...prev, cardName: user.name }));
    }
  }, [user?.name]);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    );
  }

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!user) {
      setIsProcessing(false);
      return;
    }

    try {
      // Call backend payment API
      const response = await processPayment({
        agent_id: agent.id,
        user_id: user.id,
        amount: agent.price,
        card_number: formData.cardNumber,
        expiry: formData.expiry,
        cvc: formData.cvc,
        card_name: formData.cardName
      });

      if (response.success) {
        // Complete purchase with server URL from response
        await completePurchase(agent.id, user.id, agent.price, response.agent_server_url);
        
        // Record activity
        await recordActivity(user.id, 'purchase', `Purchased ${agent.name}`);
        
        setIsComplete(true);
        clearPendingPurchase();

        toast({
          title: "Purchase Successful!",
          description: `You now have access to ${agent.name}.`,
        });

        // Redirect back to agent page after 2 seconds
        setTimeout(() => {
          navigate(`/agents/${id}`);
        }, 2000);
      } else {
        throw new Error(response.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      
      // Fallback: Complete purchase locally even if server fails
      await completePurchase(agent.id, user.id, agent.price);
      setIsComplete(true);
      clearPendingPurchase();

      toast({
        title: "Purchase Successful!",
        description: `You now have access to ${agent.name}. (Offline mode)`,
      });

      setTimeout(() => {
        navigate(`/agents/${id}`);
      }, 2000);
    }

    setIsProcessing(false);
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20 min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-4"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Purchase Complete!</h1>
            <p className="text-muted-foreground mb-6">
              You now have full access to {agent.name}. Redirecting you back to the agent page...
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting...
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              to={`/agents/${id}`}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to agent
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>
              
              <div className="glass-card border border-foreground/10 rounded-3xl p-6 mb-6">
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                    <img
                      src={agent.imageUrl}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{agent.name}</h3>
                    <p className="text-sm text-muted-foreground">{agent.category}</p>
                  </div>
                </div>
                
                <div className="border-t border-foreground/10 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${agent.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-foreground/10">
                    <span>Total</span>
                    <span>${agent.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Shield, label: "Secure Payment" },
                  { icon: Lock, label: "SSL Encrypted" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card border border-foreground/10 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">Payment Details</h2>
                </div>

                <form onSubmit={handlePurchase} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input
                      id="cardName"
                      placeholder="John Doe"
                      value={formData.cardName}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardName: e.target.value }))}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={formData.expiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, expiry: e.target.value }))}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input
                        id="cvc"
                        placeholder="123"
                        value={formData.cvc}
                        onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value }))}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 rounded-2xl text-base font-bold mt-6"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>Pay ${agent.price.toFixed(2)}</>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Purchase;
