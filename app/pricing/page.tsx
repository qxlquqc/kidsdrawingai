"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  // 添加切换年度/月度计划的状态
  const [isYearly, setIsYearly] = useState(false);
  
  // 计划数据 - 包含月度和年度价格
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: {
        monthly: "$7.99",
        yearly: "$5",
        yearlyRaw: "$95.88",
        yearlyBilled: "$59"
      },
      description: "Perfect for beginners exploring the magic of AI art transformation",
      features: [
        "Transform up to 50 drawings per month"
      ],
      popularFeature: false,
      ctaText: "Start with Starter"
    },
    {
      id: "explorer",
      name: "Explorer",
      price: {
        monthly: "$14.99",
        yearly: "$9",
        yearlyRaw: "$179.88",
        yearlyBilled: "$99"
      },
      description: "Our most popular choice for families and creative enthusiasts",
      features: [
        "Transform up to 200 drawings per month"
      ],
      popularFeature: true,
      ctaText: "Choose Explorer"
    },
    {
      id: "creator",
      name: "Creator",
      price: {
        monthly: "$30",
        yearly: "$17",
        yearlyRaw: "$360",
        yearlyBilled: "$199"
      },
      description: "Unlimited creativity for serious artists and educators",
      features: [
        "Transform up to 500 drawings per month"
      ],
      popularFeature: false,
      ctaText: "Go Creator"
    }
  ];

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Abstract Shapes Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-100 opacity-30 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-100 opacity-40 blur-3xl"></div>
        <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Choose the Best Plan for Your Child's Creativity</span>
          </h1>
          <div className="text-center text-lg text-gray-700 font-medium mb-2 flex flex-col items-center">
            <div className="flex flex-row gap-6 justify-center mt-2">
              <span className="flex items-center text-base text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Honest Pricing
              </span>
              <span className="flex items-center text-base text-gray-700">
                <svg className="w-5 h-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#22c55e"/><path d="M6 10.5l2 2 4-4" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Cancel Anytime
              </span>
            </div>
          </div>
        </div>
        
        {/* 年度优惠标签 */}
        <div className="text-center mb-2">
          <span className="bg-gradient-to-r from-[#7c4dff] to-[#63a4ff] text-white text-sm rounded-full px-4 py-1 shadow-lg">
            Yearly Plans - Save up to 45%
          </span>
        </div>
        
        {/* Monthly/Yearly Toggle */}
        <div className="flex justify-center mb-8">
          <div className="relative inline-flex bg-gray-100 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`relative z-10 px-6 py-2 rounded-full transition-all duration-300 ${
                !isYearly 
                  ? "text-white font-medium" 
                  : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`relative z-10 px-6 py-2 rounded-full transition-all duration-300 ${
                isYearly 
                  ? "text-white font-medium" 
                  : "text-gray-500"
              }`}
            >
              Yearly
            </button>
            <div 
              className="absolute left-1 top-1 h-[calc(100%-8px)] transition-all duration-300 rounded-full bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5]"
              style={{
                width: "calc(50% - 4px)",
                transform: isYearly ? "translateX(100%)" : "translateX(0)",
              }}
            ></div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <div key={plan.id} className="relative">
              {plan.popularFeature && (
                <div className="absolute -top-4 inset-x-0 flex justify-center z-10">
                  <span className="bg-gradient-to-r from-[#7c4dff] to-[#63a4ff] text-white text-sm rounded-full px-4 py-1 shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <Card className={`glass-card shadow-lg h-full overflow-hidden transition-all duration-300 ${plan.popularFeature ? 'border-[#7c4dff] border-2' : 'border-white/30'}`}>
                <CardHeader className="text-center pb-4">
                  <CardTitle className={`text-2xl ${plan.popularFeature ? 'gradient-text-harmony' : 'gradient-text'}`}>
                    {plan.name}
                  </CardTitle>
                  <div className="mt-2">
                    {isYearly ? (
                      <>
                        <span className="text-4xl font-bold gradient-text">{plan.price.yearly}</span>
                        <span className="text-gray-500 ml-1">/ month</span>
                        <div className="text-xs text-gray-400 mt-1">
                          <span className="line-through mr-1">{plan.price.yearlyRaw}</span>
                          <span>{plan.price.yearlyBilled} billed yearly</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold gradient-text">{plan.price.monthly}</span>
                        <span className="text-gray-500 ml-1">/ month</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-0 pb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#a17ef5] mt-1">✓</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={plan.popularFeature ? "gradientAlt" : "gradient"} 
                    glow={true} 
                    size="roundedLg" 
                    className="w-full hover:shadow-xl btn-hover-effect"
                  >
                    {plan.ctaText}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
        
        {/* Features Section */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">
              <span className="gradient-text-harmony">All Plans Include</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-4 text-4xl">✨</div>
              <h3 className="text-xl font-medium mb-2 gradient-text">Unlimited Downloads</h3>
              <p className="text-gray-600">Download all your transformed images in high resolution</p>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-4 text-4xl">🔒</div>
              <h3 className="text-xl font-medium mb-2 gradient-text">Full Ownership</h3>
              <p className="text-gray-600">You retain 100% ownership of all created images</p>
            </div>
            
            <div className="flex flex-col items-center p-4 text-center">
              <div className="mb-4 text-4xl">🎨</div>
              <h3 className="text-xl font-medium mb-2 gradient-text">Multiple Styles</h3>
              <p className="text-gray-600">Choose from various artistic styles for transformations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 