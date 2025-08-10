import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Phone, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          
          {/* Left Column - Content */}
          <div className="flex flex-col justify-center space-y-6 lg:space-y-8">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl">
                Never Miss Another 
                <span className="text-blue-600"> Lead</span> Again
              </h1>
              <p className="text-lg text-gray-600 sm:text-xl lg:text-lg xl:text-xl">
                Transform your tradie business with automated text responses that convert 
                leads into customers 24/7, even when you're on the tools.
              </p>
            </div>

            {/* Feature Checkmarks */}
            <div className="space-y-3">
              {[
                'Instant automated responses to missed calls',
                'Smart lead qualification and booking',
                'Integrates with your existing phone system'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="border-gray-300">
                <Phone className="mr-2 h-4 w-4" />
                Schedule Demo
              </Button>
            </div>
          </div>

          {/* Right Column - Image Container */}
          <div className="relative order-first lg:order-last">
            {/* Main Image Container */}
            <div className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl bg-gray-100 shadow-2xl lg:max-w-none">
              {/* Placeholder for your hero image */}
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                <div className="text-center text-white">
                  <Phone className="mx-auto h-16 w-16 mb-4 opacity-80" />
                  <p className="text-lg font-medium">Your Hero Image Here</p>
                  <p className="text-sm opacity-80">Mobile/Desktop App Screenshot</p>
                </div>
              </div>
              
              {/* Desktop/Tablet Stats Overlay - Hidden on mobile */}
              <Card className="absolute -bottom-4 -right-4 hidden bg-white/95 backdrop-blur-sm shadow-xl sm:block lg:-bottom-6 lg:-right-6">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 lg:h-12 lg:w-12">
                      <TrendingUp className="h-5 w-5 text-green-600 lg:h-6 lg:w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600 lg:text-sm">Never miss a lead</p>
                      <p className="text-xl font-bold text-green-600 lg:text-2xl">+127%</p>
                      <p className="text-xs text-gray-500 lg:text-sm">More callbacks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Stats Card - Shown only on mobile, positioned closer to image */}
            <Card className="mx-auto mt-4 max-w-xs bg-white shadow-lg sm:hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Never miss a lead</p>
                    <p className="text-2xl font-bold text-green-600">+127%</p>
                    <p className="text-sm text-gray-500">More callbacks</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-blue-200/50 blur-xl"></div>
            <div className="absolute -bottom-6 -left-8 h-32 w-32 rounded-full bg-purple-200/30 blur-2xl"></div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-indigo-200/20 blur-3xl"></div>
      </div>
    </section>
  );
};

export default HeroSection;