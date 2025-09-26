import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Shield } from "lucide-react";

interface SliderCaptchaProps {
  onVerified: (verified: boolean) => void;
  isReset?: boolean;
}

export const SliderCaptcha = ({ onVerified, isReset }: SliderCaptchaProps) => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [currentValue, setCurrentValue] = useState([0]);
  const [isVerified, setIsVerified] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Generate random target number between 10-90
    setTargetNumber(Math.floor(Math.random() * 81) + 10);
  }, []);

  useEffect(() => {
    if (isReset) {
      setIsVerified(false);
      setHasInteracted(false);
      setCurrentValue([0]);
      setTargetNumber(Math.floor(Math.random() * 81) + 10);
      onVerified(false);
    }
  }, [isReset, onVerified]);

  const handleSliderChange = (value: number[]) => {
    setCurrentValue(value);
    setHasInteracted(true);
    
    const tolerance = 3; // Allow ±3 points tolerance
    const isCorrect = Math.abs(value[0] - targetNumber) <= tolerance;
    
    if (isCorrect && !isVerified) {
      setIsVerified(true);
      onVerified(true);
    } else if (!isCorrect && isVerified) {
      setIsVerified(false);
      onVerified(false);
    }
  };

  return (
    <Card className="p-4 bg-background/50 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Human Verification</span>
          {isVerified && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        </div>
        
        <div className="space-y-3">
          <div className="text-center">
            <span className="text-lg font-semibold text-primary">
              Move the slider to: {targetNumber}
            </span>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={currentValue}
              onValueChange={handleSliderChange}
              max={100}
              min={0}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span className={`font-semibold ${isVerified ? 'text-green-500' : hasInteracted ? 'text-primary' : 'text-muted-foreground'}`}>
                Current: {currentValue[0]}
              </span>
              <span>100</span>
            </div>
          </div>
          
          {hasInteracted && (
            <div className="text-center text-sm">
              {isVerified ? (
                <span className="text-green-500 font-medium">✓ Verified! You're human</span>
              ) : (
                <span className="text-muted-foreground">
                  Keep adjusting... (target: {targetNumber})
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};