import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg"></div>
            <span className="text-xl font-bold">BillBuster</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/services" className="text-sm font-medium">Services</Link>
            <Link href="/pricing" className="text-sm font-medium">Pricing</Link>
            <Link href="/about" className="text-sm font-medium">About</Link>
            <Link href="/login" className="text-sm font-medium">Login</Link>
            <Link href="/register" className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-md">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center py-20">
        <div className="container text-center">
          <h1 className="text-5xl font-bold mb-6">
            VTU & Bills Payment<br />
            <span className="text-primary">Made Easy</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Buy airtime, data bundles, and pay bills instantly. 
            With multi-provider support and reliable service.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium">
              Create Account
            </Link>
            <Link href="/services" className="px-6 py-3 border border-input rounded-md font-medium">
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-muted/50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Airtime</h3>
              <p className="text-muted-foreground">Buy airtime for MTN, Glo, Airtel, and 9mobile instantly.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Data Bundles</h3>
              <p className="text-muted-foreground">Get the best data plans for all networks at competitive prices.</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-2">Bills Payment</h3>
              <p className="text-muted-foreground">Pay electricity bills, TV subscriptions, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex items-center justify-between">
          <p className="text-sm text-muted-foreground">2024 BillBuster. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
