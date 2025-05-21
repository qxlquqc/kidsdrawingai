import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import TransformGallery from "@/components/TransformGallery";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-28 relative overflow-hidden -mt-20 pt-32">
        {/* Abstract Shapes Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-pink-100 opacity-30 blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-100 opacity-40 blur-3xl"></div>
          <div className="absolute top-40 right-20 w-40 h-40 rounded-full bg-blue-100 opacity-30 blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left mb-12 md:mb-0">
              <h1 className="font-bold mb-6">
                <span className="gradient-text block text-4xl md:text-5xl">Turn Kids' Drawings</span>
                <span className="gradient-text block text-4xl md:text-5xl mt-1">into Magical Creations</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mb-10">
                Bring their imagination to life with the power of AI — just upload their drawing and watch the magic happen.
              </p>
              <Link href="/transform/image">
                <Button variant="gradient" size="roundedLg" glow={true} className="shadow-lg bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] hover:shadow-xl btn-hover-effect">
                  Transform Drawings Now
                </Button>
              </Link>
              
              <div className="mt-8 flex flex-wrap items-center gap-6 text-gray-700 justify-center md:justify-start">
                <div className="glass-card p-3 px-4 rounded-xl flex items-center">
                  <span className="text-[#ff6b9d] font-bold mr-2">🏆</span>
                  <span className="font-semibold gradient-text">Leading Children's Art AI Platform</span>
                </div>
                <div className="glass-card p-3 px-4 rounded-xl flex items-center">
                  <span className="text-[#a17ef5] font-bold mr-2">🌟</span>
                  <span>Trusted by <span className="font-semibold gradient-text-alt">100,000+</span> families</span>
                </div>
              </div>
            </div>
            
            {/* Right Side Showcase - BeforeAfter Slider */}
            <div className="flex-1 relative">
              <div className="rounded-2xl p-6 overflow-hidden">
                <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff80ab] to-[#7c4dff] text-white text-xs rounded-full px-3 py-1 z-10">
                  Live Demo
                </div>
                
                {/* BeforeAfter Slider Component */}
                <BeforeAfterSlider
                  beforeImage="/images/slider/before.jpg"
                  afterImage="/images/slider/after.jpg"
                  beforeAlt="Child's original drawing"
                  afterAlt="AI enhanced artwork"
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="glass-card rounded-full px-3 py-1">
                    <span className="text-xs gradient-text font-medium">AI Magic ✨</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-pink-400"></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full blur-3xl opacity-30 z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 rounded-full bg-pink-100/20 blur-3xl"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full bg-purple-100/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16"><span className="gradient-text-harmony">How It Works</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl shine-effect h-full">
              <div className="bg-gradient-to-br from-pink-100 to-pink-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md float-animation">
                <span className="text-3xl font-bold text-[#ff6b9d]">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Capture Your Art</h3>
              <p className="text-gray-600 leading-relaxed px-2">
                Photograph or scan your child's artwork and upload it to our platform with a single click.
                <br />
                <span className="inline-block mt-2">Our system accepts common image formats and works with drawings of all skill levels.</span>
              </p>
            </div>
            <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl shine-effect h-full">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md float-animation">
                <span className="text-3xl font-bold text-[#a17ef5]">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Enhance with Context</h3>
              <p className="text-gray-600 leading-relaxed px-2">
                Give our AI a hint about the drawing's subject to guide the transformation process.
                <br />
                <span className="inline-block mt-2">More context helps our advanced algorithms understand the artistic intent behind the creation.</span>
              </p>
            </div>
            <div className="flex flex-col items-center text-center glass-card p-8 rounded-2xl shine-effect h-full">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md float-animation">
                <span className="text-3xl font-bold text-[#63a4ff]">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Witness the Transformation</h3>
              <p className="text-gray-600 leading-relaxed px-2">
                Our proprietary AI technology transforms the original artwork while preserving its unique character and charm.
                <br />
                <span className="inline-block mt-2">Save and share these special creations as digital keepsakes or print them as physical mementos.</span>
              </p>
            </div>
          </div>
          <div className="mt-12 text-center">
            <Link href="/transform/image">
              <Button variant="gradient" size="roundedLg" glow={true} className="shadow-lg bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] hover:shadow-xl btn-hover-effect">
                Try AI Transformation Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* The #1 AI for Kids' Drawings - Sample Gallery */}
      <section className="py-20 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-pink-100/30 blur-3xl"></div>
          <div className="absolute top-1/3 -right-20 w-60 h-60 rounded-full bg-purple-100/20 blur-3xl"></div>
          <div className="absolute -bottom-10 left-1/4 w-60 h-60 rounded-full bg-blue-100/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4"><span className="gradient-text-harmony">Premier AI Drawing Enhancement</span></h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Trusted by over 100,000 families to transform children's imagination into digital masterpieces!
            </p>
          </div>
          
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden hover-scale border border-white/30 p-6">
            <TransformGallery />
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 right-20 w-96 h-96 rounded-full bg-pink-100/30 blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-purple-100/20 blur-3xl"></div>
          <div className="absolute bottom-40 right-40 w-60 h-60 rounded-full bg-blue-100/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold mb-4"><span className="gradient-text">Transform Kids' Art with AI Magic</span></h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our powerful AI understands children's imagination and turns their simple drawings into stunning artwork they'll be proud of.
            </p>
          </div>
          
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden hover-scale border border-white/30 p-10">
            <div className="text-center mb-6">
              <div className="inline-block glass-card p-2 px-4 rounded-full border border-white/30 text-sm mb-3 bg-gradient-to-r from-[#ff80ab]/10 to-[#7c4dff]/10">
                <span className="gradient-text font-medium">Latest AI Technology</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 gradient-text">Magical Transformations</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex flex-col glass-card p-5 rounded-xl border border-white/30 shadow-sm h-full">
                <span className="text-[#ff6b9d] text-2xl mb-3">✨</span>
                <span className="text-lg font-medium gradient-text mb-2">10+ artistic styles</span>
                <p className="text-sm text-gray-600 flex-grow">From cartoons to fine art - choose the perfect style for any drawing</p>
              </div>
              
              <div className="flex flex-col glass-card p-5 rounded-xl border border-white/30 shadow-sm h-full">
                <span className="text-[#a17ef5] text-2xl mb-3">✨</span>
                <span className="text-lg font-medium gradient-text mb-2">Preserve originality</span>
                <p className="text-sm text-gray-600 flex-grow">Our AI maintains the essence and character of your child's creation</p>
              </div>
              
              <div className="flex flex-col glass-card p-5 rounded-xl border border-white/30 shadow-sm h-full">
                <span className="text-[#63a4ff] text-2xl mb-3">✨</span>
                <span className="text-lg font-medium gradient-text mb-2">Smart enhancement</span>
                <p className="text-sm text-gray-600 flex-grow">AI technology specifically trained to understand children's art</p>
              </div>
              
              <div className="flex flex-col glass-card p-5 rounded-xl border border-white/30 shadow-sm h-full">
                <span className="text-[#ff6b9d] text-2xl mb-3">✨</span>
                <span className="text-lg font-medium gradient-text mb-2">Create memories</span>
                <p className="text-sm text-gray-600 flex-grow">Easily download, share, or print the transformed artwork</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <Link href="/transform/image">
                <Button variant="gradient" size="roundedLg" glow={true} className="shadow-lg bg-gradient-to-r from-[#ff6b9d] to-[#a17ef5] hover:shadow-xl btn-hover-effect">
                  Transform Your First Drawing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative overflow-hidden">
        {/* Abstract Shapes Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-72 h-72 rounded-full bg-pink-100/20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blue-100/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <h2 className="text-4xl font-bold text-center mb-16"><span className="gradient-text-harmony">Frequently Asked Questions</span></h2>
          
          <div className="space-y-6">
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">What kinds of drawings work best with your AI?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Our AI works with a wide range of artistic styles and skill levels. While clearer drawings typically produce more recognizable results, our technology can interpret even abstract or simpler drawings. Adding a detailed description greatly enhances the transformation quality regardless of the original artwork's complexity.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">How does your AI interpret children's drawings?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Our proprietary AI model has been specifically trained on thousands of children's drawings to understand their unique characteristics. It recognizes common patterns, shapes, and themes in children's art that generic AI systems might miss. Your description helps further guide our system to capture the child's creative intent.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">What are my rights to the transformed images?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">You retain complete ownership and full commercial rights to both the original drawings and their AI-enhanced versions. KidsDrawingAI makes no claim to your artwork and you're free to use, print, share, or sell the transformed images however you wish.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">What image formats can I upload?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Our platform accepts JPG and PNG images. For best results, we recommend well-lit photographs or scans with the drawing clearly visible against a contrasting background. Most smartphone photos work perfectly, especially when taken in good lighting conditions.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">What can I do with the transformed artwork?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">The possibilities are endless! Many families create custom wall art by printing and framing both the original and transformed versions side by side. Others use the images for personalized gifts like custom t-shirts, mugs, or greeting cards. Some teachers even use our platform for creative classroom projects to inspire young artists.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">How quickly can I start using the service after purchase?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Access is instant! As soon as your payment is processed, you'll have immediate access to all platform features with no waiting period. Your account is activated automatically, and you can begin uploading and transforming artwork within seconds of completing your purchase.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">How secure are your payment systems?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">We implement bank-level security through trusted payment processors that use advanced encryption standards. We never store your complete payment information on our servers. All transactions are processed through PCI-compliant systems with fraud monitoring and secure authentication protocols to protect your financial data.</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 shadow-lg hover-scale transition-all">
              <CardHeader>
                <CardTitle className="text-xl font-bold mb-3 gradient-text">What is your refund policy?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">Due to the immediate resource allocation and computational costs associated with AI image processing, we maintain a limited refund policy. Once our AI systems have begun processing your images, we are unable to offer refunds as the computing resources have already been utilized. For subscription-based plans, you can cancel future renewals at any time through your account dashboard. Please review our full Terms of Service for detailed information about our refund and cancellation policies.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
