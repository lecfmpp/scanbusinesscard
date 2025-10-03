import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 md:mb-8">Privacy Policy</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Account information (email, password)</li>
              <li>Business card images you upload</li>
              <li>Extracted contact information from scanned cards</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Process and scan your business cards using AI technology</li>
              <li>Provide, maintain, and improve our services</li>
              <li>Communicate with you about updates and features</li>
              <li>Ensure the security and integrity of our platform</li>
            </ul>
          </section>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">3. Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your data. Your business card images and extracted information are stored securely and encrypted both in transit and at rest.
            </p>
          </section>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your data only:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>
          
          <section className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-3 md:mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@businesscardtosheets.com" className="text-primary hover:underline break-all">
                privacy@businesscardtosheets.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Privacy;
