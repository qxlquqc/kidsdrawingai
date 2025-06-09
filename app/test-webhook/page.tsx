"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestWebhookPage() {
  const [testResult, setTestResult] = useState<string>("");
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [portalTestResult, setPortalTestResult] = useState<string>("");
  const [isTestingPortal, setIsTestingPortal] = useState<boolean>(false);
  
  // 测试产品ID映射
  const testProductMapping = () => {
    console.log('🧪 ===============================');
    console.log('🧪 Testing Product ID Mapping');
    
    const PRODUCT_IDS = {
      starter_monthly: 'prod_26evbPr0Zr5QG2pGpFk4bp',
      starter_yearly: 'prod_4a4q9p3YvIKMHzNOJPi7Nq',
      explorer_monthly: 'prod_7U5RHQv7Y3DCRJIjUpHYys',
      explorer_yearly: 'prod_45t1uz4PrLPOoMmWzWibQm',
      creator_monthly: 'prod_Nh7ancB1Ers53vaef8cmp',
      creator_yearly: 'prod_3RpckwBWoPja9pWZl7EOAc',
    };

    console.log('📋 Product ID Mappings:', PRODUCT_IDS);
    
    // 生成所有测试链接
    const links: Record<string, string> = {};
    
    Object.entries(PRODUCT_IDS).forEach(([planType, productId]) => {
      const baseUrl = 'https://creem.io/pay';
      const successUrl = encodeURIComponent('https://dev.kidsdrawingai.com/dashboard');
      const cancelUrl = encodeURIComponent('https://dev.kidsdrawingai.com/pricing');
      
      const paymentUrl = new URL(`${baseUrl}/${productId}`);
      paymentUrl.searchParams.set('success_url', successUrl);
      paymentUrl.searchParams.set('cancel_url', cancelUrl);
      paymentUrl.searchParams.set('metadata[internal_user_id]', 'test_user_123');
      paymentUrl.searchParams.set('metadata[plan_type]', planType);
      paymentUrl.searchParams.set('metadata[username]', 'testuser');
      paymentUrl.searchParams.set('metadata[source]', 'kidsdrawingai_test');
      
      links[planType] = paymentUrl.toString();
      
      console.log(`🔗 ${planType}:`);
      console.log(`   Product ID: ${productId}`);
      console.log(`   Link: ${paymentUrl.toString()}`);
    });

    setGeneratedLinks(links);
    setTestResult(`Generated ${Object.keys(links).length} payment links. Check console for details.`);
    console.log('🧪 ===============================');
  };
  
  // 测试单个链接
  const testSingleLink = (planType: string) => {
    console.log(`🧪 Testing single link for: ${planType}`);
    const link = generatedLinks[planType];
    if (link) {
      console.log(`🔗 Opening link: ${link}`);
      window.open(link, '_blank');
    } else {
      console.error('❌ No link found for plan type:', planType);
    }
  };
  
  // 测试其他可能的域名
  const testAlternativeDomains = () => {
    console.log('🧪 Testing alternative Creem domains...');
    
    const testDomains = [
      'https://creem.io/pay',
      'https://test-creem.io/pay',
      'https://checkout.creem.io/pay',
      'https://pay.creem.io',
    ];
    
    const productId = 'prod_26evbPr0Zr5QG2pGpFk4bp'; // starter_monthly for testing
    
    testDomains.forEach(domain => {
      const testUrl = `${domain}/${productId}`;
      console.log(`🔗 Testing domain: ${testUrl}`);
    });
    
    setTestResult(`Tested ${testDomains.length} alternative domains. Check console for URLs.`);
  };

  const testCustomerPortal = async () => {
    setIsTestingPortal(true);
    try {
      const response = await fetch('/api/test-customer-portal');
      const data = await response.json();
      setPortalTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error testing customer portal:', error);
      setPortalTestResult('Error testing customer portal. Please check the console for details.');
    } finally {
      setIsTestingPortal(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <span className="gradient-text">Payment Link Test Suite</span>
        </h1>
        
        <div className="grid gap-6">
          {/* Test Product Mapping */}
          <Card>
            <CardHeader>
              <CardTitle>Product ID Mapping Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testProductMapping} className="w-full">
                Generate All Payment Links
              </Button>
              
              {Object.entries(generatedLinks).length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Generated Links:</h3>
                  {Object.entries(generatedLinks).map(([planType, link]) => (
                    <div key={planType} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{planType}</span>
                        <Button 
                          size="sm" 
                          onClick={() => testSingleLink(planType)}
                        >
                          Test Link
                        </Button>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 break-all">{link}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Test Alternative Domains */}
          <Card>
            <CardHeader>
              <CardTitle>Domain Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testAlternativeDomains} variant="outline" className="w-full">
                Test Alternative Creem Domains
              </Button>
            </CardContent>
          </Card>
          
          {/* Current Test URLs */}
          <Card>
            <CardHeader>
              <CardTitle>Manual Test URLs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">Standard Creem.io (Production):</h4>
                  <p className="text-sm text-blue-600 break-all">
                    https://creem.io/pay/prod_26evbPr0Zr5QG2pGpFk4bp
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Test Environment (if different):</h4>
                  <p className="text-sm text-blue-600 break-all">
                    https://test-creem.io/pay/prod_26evbPr0Zr5QG2pGpFk4bp
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Test Results */}
          {testResult && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-600">{testResult}</p>
              </CardContent>
            </Card>
          )}
          
          {/* Customer Portal Test */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Portal Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Test the Customer Portal API for managing subscriptions.</p>
                <p><strong>Note:</strong> This will only work for users with real payment events that contain customer IDs.</p>
              </div>
              
              <Button 
                onClick={testCustomerPortal} 
                disabled={isTestingPortal}
                className="w-full"
              >
                {isTestingPortal ? 'Testing...' : 'Test Customer Portal API'}
              </Button>
              
              {portalTestResult && (
                <div className="mt-4">
                  <h4 className="font-semibold text-sm mb-2">Customer Portal Test Result:</h4>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-32">
                    {portalTestResult}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 