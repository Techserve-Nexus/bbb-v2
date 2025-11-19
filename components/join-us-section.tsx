"use client"

import { Trophy, Users, Lightbulb, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function JoinUsSection() {
    const benefits = [
        {
            icon: Trophy,
            title: "Strategic Competition",
            description: "Apply chess principles—strategy, foresight, and resilience—in competition with fellow executives.",
            color: "text-amber-600",
            bgColor: "bg-amber-50 dark:bg-amber-900/20",
            borderColor: "border-amber-200 dark:border-amber-800",
        },
        {
            icon: Users,
            title: "Meaningful Partnerships",
            description: "Move beyond networking to build meaningful, growth-oriented partnerships with a select group of leaders.",
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-900/20",
            borderColor: "border-blue-200 dark:border-blue-800",
        },
        {
            icon: Lightbulb,
            title: "Expert Masterclasses",
            description: "Gain expert insights through a masterclass series on the key drivers of modern business: startup dynamics, emerging technology, financial strategy, and spiritually-grounded leadership.",
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-900/20",
            borderColor: "border-purple-200 dark:border-purple-800",
        },
        {
            icon: Sparkles,
            title: "Vibrant Entertainment",
            description: "The Vibrant Fashion Show. Be captivated by a dynamic and stylish presentation. Share laughs, cheer on new friends, and create moments of pure, unscripted joy in the Lively Karaoke Night.",
            color: "text-pink-600",
            bgColor: "bg-pink-50 dark:bg-pink-900/20",
            borderColor: "border-pink-200 dark:border-pink-800",
        },
    ]

    return (
        <section className="py-20 px-4 md:px-6 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                        Join Us
                    </h2>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className={`group p-6 rounded-xl border-2 ${benefit.borderColor} ${benefit.bgColor} transition-all duration-300 hover:shadow-xl hover:-translate-y-2`}
                        >
                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-lg ${benefit.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <benefit.icon className={`w-7 h-7 ${benefit.color}`} />
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold text-foreground mb-3">
                                {benefit.title}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="w-full mb-12">
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Whether you are an entrepreneur looking to expand your network, a chess enthusiast eager to test your skills, or an organization wishing to support a meaningful cause, you have a place with us.
                    </p>

                    <p className="text-xl md:text-2xl font-bold text-foreground mt-8 max-w-3xl mx-auto">
                        Together, let&apos;s build a legacy of strategic excellence and collaborative success.
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/register" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Register for the Event
                        </Button>
                    </Link>
                    <Link href="/about" className="w-full sm:w-auto">
                        <Button
                            size="lg"
                            variant="outline"
                            className="w-full sm:w-auto border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300"
                        >
                            Contact Us
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
