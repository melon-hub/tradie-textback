import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Intake = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    suburb: "",
    jobType: "",
    description: "",
    urgency: "",
    preferredTime: "",
    photos: []
  });
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleSubmit = () => {
    toast({
      title: "Job submitted successfully!",
      description: "The tradie will call you back within 30 minutes.",
    });
    setStep(4);
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center card-elevated">
          <CardContent className="p-6 lg:p-8 space-y-6">
            <div className="bg-success/10 p-6 rounded-full w-fit mx-auto">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl lg:text-2xl font-bold">All Done!</h2>
              <p className="text-muted-foreground text-sm lg:text-base">
                Thanks for the details. The tradie will call you back within 30 minutes.
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg text-left">
              <p className="text-sm">
                <strong>What happens next:</strong><br />
                • You'll get a call back soon<br />
                • They'll have your photos and details<br />
                • Faster quote for you!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col">
      <div className="flex-1 flex items-center justify-center py-4 sm:py-6 lg:py-8 xl:py-12">
        <div className="container mx-auto container-padding max-w-2xl w-full">
          <div className="text-center space-y-3 lg:space-y-4 mb-6 lg:mb-8 fade-in-up">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium shadow-sm">
              Quick Job Details
            </Badge>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
              Help us get you a faster quote
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto">
              Just a few quick details and photos - takes 30 seconds
            </p>
          </div>

          {/* Optimized Progress bar */}
          <div className="mb-6 lg:mb-8">
            <div className="flex justify-between mb-2 lg:mb-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center ${i < 3 ? 'flex-1' : ''}`}>
                  <div className={`w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all duration-300 ${
                    step >= i 
                      ? 'bg-primary text-primary-foreground shadow-primary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`flex-1 h-1.5 sm:h-2 mx-2 sm:mx-3 rounded-full transition-all duration-500 ${
                      step > i ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium">
              <span>Contact</span>
              <span>Job Details</span>
              <span>Photos</span>
            </div>
          </div>

          <Card className="card-elevated hover:shadow-xl transition-all duration-300 max-h-[60vh] sm:max-h-[70vh] lg:max-h-[85vh] xl:max-h-none overflow-y-auto">
            <CardHeader className="pb-4 lg:pb-6">
              <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
              {step === 1 && (
                <>
                  <MapPin className="h-5 w-5" />
                  <span>Contact & Location</span>
                </>
              )}
              {step === 2 && (
                <>
                  <Clock className="h-5 w-5" />
                  <span>Job Details</span>
                </>
              )}
              {step === 3 && (
                <>
                  <Camera className="h-5 w-5" />
                  <span>Photos (Optional)</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    placeholder="0412 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suburb">Suburb</Label>
                  <Input 
                    id="suburb" 
                    placeholder="e.g. Thornbury, VIC"
                    value={formData.suburb}
                    onChange={(e) => setFormData({...formData, suburb: e.target.value})}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="jobType">What kind of job?</Label>
                  <Input 
                    id="jobType" 
                    placeholder="e.g. Plumbing, Electrical, Carpentry"
                    value={formData.jobType}
                    onChange={(e) => setFormData({...formData, jobType: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Describe the issue</Label>
                  <Textarea 
                    id="description" 
                    placeholder="e.g. Kitchen tap is leaking, need it fixed ASAP"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="urgency">How urgent?</Label>
                    <select 
                      id="urgency"
                      className="w-full p-2 border border-input rounded-md bg-background"
                      value={formData.urgency}
                      onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                    >
                      <option value="">Select urgency</option>
                      <option value="urgent">Urgent (today)</option>
                      <option value="soon">This week</option>
                      <option value="flexible">Next 2 weeks</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferredTime">Preferred time</Label>
                    <Input 
                      id="preferredTime" 
                      placeholder="e.g. Tue 10-12pm"
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-8">
                    <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Add photos to help the tradie quote accurately
                    </p>
                    <Button variant="outline">
                      Take Photos
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Photos help tradies give you a better quote faster. Optional but recommended.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 pt-4 lg:pt-6 sticky bottom-0 bg-card border-t border-border/50">
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full sm:w-auto">
                  Back
                </Button>
              )}
              <div className={step === 1 ? 'w-full' : 'w-full sm:w-auto sm:ml-auto'}>
                {step < 3 ? (
                  <Button onClick={handleNext} className="w-full sm:w-auto">
                    Next Step
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="w-full sm:w-auto btn-primary-gradient shadow-primary">
                    Submit Job Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
};

export default Intake;