import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Phone, ArrowLeft, ShieldCheck, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
};

export const AuthModal = ({ open, onOpenChange, onSuccess }: Props) => {
  const { t } = useI18n();
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setStep("mobile"); setMobile(""); setOtp(""); };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) { toast.error("Enter a valid 10-digit mobile number"); return; }
    setLoading(true);
    await sendOtp(mobile);
    setLoading(false);
    setStep("otp");
    toast.success("OTP sent! Use 123456 for demo.");
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    const ok = await verifyOtp(mobile, otp);
    setLoading(false);
    if (ok) {
      toast.success("Welcome to MSI Innovations!");
      onOpenChange(false);
      reset();
      onSuccess?.();
    } else {
      toast.error("Invalid OTP. Use 123456.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-cta shadow-elegant">
            <ShieldCheck className="h-7 w-7 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl">{t("auth.title")}</DialogTitle>
          <DialogDescription className="text-center">{t("auth.sub")}</DialogDescription>
        </DialogHeader>

        {step === "mobile" ? (
          <form onSubmit={handleSend} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="mobile">{t("auth.mobile")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+91</span>
                <Input
                  id="mobile"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="pl-16 h-12 text-base"
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-cta" disabled={loading}>
              {loading ? "..." : t("auth.send")}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 mt-2">
            <div className="text-center text-sm text-muted-foreground">
              {t("auth.otp")} • +91 {mobile}
            </div>
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button onClick={handleVerify} className="w-full h-12 bg-gradient-cta" disabled={loading || otp.length !== 6}>
              {loading ? "..." : t("auth.verify")}
            </Button>
            <Button variant="ghost" onClick={() => setStep("mobile")} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" /> {t("auth.back")}
            </Button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-border/60 text-center text-sm">
          <Link
            to="/staff-login"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-smooth"
          >
            <ShieldAlert className="h-4 w-4" />
            Dealer / Admin Login
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};
