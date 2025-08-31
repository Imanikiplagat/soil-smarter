import { useState } from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { MapPin, User, Phone, Sprout, BarChart3, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  phone: string;
  location: string;
  crop: string;
  area: string;
  soilPh: string;
  soilMoisture: string;
  organicMatter: string;
}

interface PredictionFormProps {
  onPrediction: (result: any) => void;
}

const PredictionForm = ({ onPrediction }: PredictionFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    location: "",
    crop: "",
    area: "",
    soilPh: "",
    soilMoisture: "",
    organicMatter: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validation
    if (!formData.name || !formData.phone || !formData.location || !formData.crop) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Simulate API call with realistic delay
    setTimeout(() => {
      const mockResult = {
        yield: (Math.random() * 3 + 2).toFixed(2), // 2-5 t/ha
        weather: {
          temperature: (Math.random() * 10 + 18).toFixed(1), // 18-28°C
          rainfall: (Math.random() * 60 + 30).toFixed(0), // 30-90mm
        },
        confidence: (Math.random() * 20 + 80).toFixed(0), // 80-100%
        farmData: formData,
      };
      
      onPrediction(mockResult);
      setIsLoading(false);
      
      toast({
        title: "Prediction Complete!",
        description: "Your yield prediction has been generated successfully.",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12">
      <div className="container mx-auto px-6 max-w-2xl">
        <Card className="shadow-medium border-border/50">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-primary mb-2">
              Crop Yield Prediction
            </CardTitle>
            <CardDescription className="text-lg">
              Enter your farm details to get an accurate yield prediction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Farmer Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Farmer Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+254 123 456 789"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Farm Location & Crop */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-lg">Farm Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (City/Town) *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Eldoret, Nakuru"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crop">Crop Type *</Label>
                    <Select value={formData.crop} onValueChange={(value) => handleInputChange("crop", value)}>
                      <SelectTrigger className="shadow-soft">
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maize">Maize</SelectItem>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="beans">Beans</SelectItem>
                        <SelectItem value="potatoes">Potatoes</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="barley">Barley</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Farm Area (Hectares)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 1.5"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    className="shadow-soft"
                  />
                </div>
              </div>

              <Separator />

              {/* Soil Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <TestTube className="w-5 h-5 text-success" />
                  <h3 className="font-semibold text-lg">Soil Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="soilPh">pH Level</Label>
                    <Input
                      id="soilPh"
                      type="number"
                      step="0.1"
                      min="3"
                      max="9"
                      placeholder="e.g., 6.5"
                      value={formData.soilPh}
                      onChange={(e) => handleInputChange("soilPh", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soilMoisture">Soil Moisture (%)</Label>
                    <Input
                      id="soilMoisture"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="e.g., 22.0"
                      value={formData.soilMoisture}
                      onChange={(e) => handleInputChange("soilMoisture", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organicMatter">Organic Matter (%)</Label>
                    <Input
                      id="organicMatter"
                      type="number"
                      step="0.1"
                      min="0"
                      max="20"
                      placeholder="e.g., 2.1"
                      value={formData.organicMatter}
                      onChange={(e) => handleInputChange("organicMatter", e.target.value)}
                      className="shadow-soft"
                    />
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Analyzing Data...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Predict Yield
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PredictionForm;