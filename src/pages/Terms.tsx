import { motion } from 'framer-motion'

export default function Terms() {
  return (
    <section className="max-w-[720px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-serif-display text-3xl sm:text-4xl text-ink mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-ink-muted mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose-terms space-y-6 text-[15px] leading-relaxed text-ink-muted">
          <p>
            These Terms & Conditions govern your use of Essayz (the "Service"), a platform for
            browsing writing and assignment-support services and connecting with our team via
            WhatsApp. By creating an account or using the Service, you agree to these terms.
          </p>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">1. What Essayz Provides</h2>
            <p>
              Essayz lists services offered by our team — including essay writing, assignment
              support, and related writing help. Browsing the site does not create an order;
              orders are arranged directly with us over WhatsApp, where scope, price, and delivery
              timelines are agreed between you and us for each request.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">2. Accounts</h2>
            <p>
              Creating an account lets you keep track of your assignment requests and reviews in
              one place. You're responsible for keeping your login details secure and for
              activity that happens under your account. You may optionally add and verify a phone
              number to receive SMS updates; you can remove or change it at any time from your
              account page.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">3. Orders &amp; Payment</h2>
            <p>
              Pricing shown on the site is indicative. Final pricing, payment method, and delivery
              timelines are confirmed directly between you and our team over WhatsApp before work
              begins. Essayz is not a payment processor — no payments are collected through this
              website.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">4. Intended Use</h2>
            <p>
              Work delivered through Essayz is intended as a reference, study aid, and model
              example to support your own learning and writing process. You are responsible for
              how you use any delivered work, including complying with your institution's academic
              integrity policies.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">5. Reviews</h2>
            <p>
              Reviews you submit should reflect your genuine experience. We moderate reviews before
              they appear publicly as testimonials, and may decline to publish reviews that are
              abusive, spam, or unrelated to our services.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">6. Communications</h2>
            <p>
              If you verify a phone number, you consent to receiving SMS messages from Essayz
              related to your account and, where you've opted in, service updates. If you enable
              browser notifications, you'll receive push notifications for updates you've
              subscribed to. You can opt out of either at any time.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">7. Limitation of Liability</h2>
            <p>
              The Service is provided on an "as is" basis. While we aim for accuracy and
              reliability, we don't guarantee the site will be uninterrupted or error-free, and we
              aren't liable for indirect or consequential loss arising from your use of it.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">8. Changes to These Terms</h2>
            <p>
              We may update these terms from time to time as the Service evolves. Continued use of
              Essayz after changes take effect means you accept the updated terms.
            </p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">9. Governing Law</h2>
            <p>These terms are governed by the laws of Kenya.</p>
          </div>

          <div>
            <h2 className="font-serif-display text-xl text-ink mb-2">10. Contact</h2>
            <p>Questions about these terms can be sent to us directly via the Contact Seller page.</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
