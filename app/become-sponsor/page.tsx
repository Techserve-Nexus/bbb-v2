import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import SponsorRequestForm from "@/components/sponsor-request-form"
import { Card } from "@/components/ui/card"

const sponsorCategories = [
  {
    name: "Tamaram",
    price: 25000,
    color: "bg-gray-100 dark:bg-gray-800",
    textColor: "text-gray-800 dark:text-gray-200",
  },
  {
    name: "Tamaram+",
    price: 50000,
    color: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-800 dark:text-blue-200",
  },
  {
    name: "Rajatham",
    price: 100000,
    color: "bg-green-100 dark:bg-green-900/30",
    textColor: "text-green-800 dark:text-green-200",
  },
  {
    name: "Suvarnam",
    price: 200000,
    color: "bg-yellow-100 dark:bg-yellow-900/30",
    textColor: "text-yellow-800 dark:text-yellow-200",
  },
  {
    name: "Vajram",
    price: 300000,
    color: "bg-purple-100 dark:bg-purple-900/30",
    textColor: "text-purple-800 dark:text-purple-200",
  },
  {
    name: "Pradhan Poshak",
    price: 500000,
    color: "bg-red-100 dark:bg-red-900/30",
    textColor: "text-red-800 dark:text-red-200",
  },
]

export default function BecomeSponsorPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <div className="py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Become a Sponsor
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Partner with us to make this event a grand success. Choose from our sponsorship categories 
              and gain valuable exposure for your brand.
            </p>
          </div>

          {/* Sponsorship Categories */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Sponsorship Categories
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorCategories.map((category) => (
                <Card
                  key={category.name}
                  className={`p-6 ${category.color} border-2 border-border hover:shadow-lg transition-shadow`}
                >
                  <h3 className={`text-2xl font-bold mb-3 ${category.textColor}`}>
                    {category.name}
                  </h3>
                  <div className={`text-3xl font-bold mb-4 ${category.textColor}`}>
                    ₹{category.price.toLocaleString("en-IN")}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Premium sponsorship package with exclusive benefits and brand visibility
                  </p>
                </Card>
              ))}
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Final sponsorship category will be assigned by our team based on your 
                requested amount and availability. All sponsors receive prominent brand placement and recognition.
              </p>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Sponsorship Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Brand Visibility</h3>
                    <p className="text-muted-foreground">
                      Your logo prominently displayed on event website, banners, and promotional materials
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Networking Opportunities</h3>
                    <p className="text-muted-foreground">
                      Connect with industry leaders, participants, and potential clients
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📢</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Social Media Coverage</h3>
                    <p className="text-muted-foreground">
                      Featured on our social media channels reaching thousands of engaged followers
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Recognition & Awards</h3>
                    <p className="text-muted-foreground">
                      Special recognition during the event and certificate of appreciation
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Request Form */}
          <div className="mb-16">
            <SponsorRequestForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
