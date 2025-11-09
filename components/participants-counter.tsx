"use client"

import { useEffect, useState } from "react"

export default function ParticipantsCounter() {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const targetCount = 2847

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
      }
    })

    const element = document.getElementById("counter-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let currentCount = 0
    const increment = targetCount / 60
    const interval = setInterval(() => {
      currentCount += increment
      if (currentCount >= targetCount) {
        setCount(targetCount)
        clearInterval(interval)
      } else {
        setCount(Math.floor(currentCount))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isVisible])

  return (
    <section
      id="counter-section"
      className="py-20 px-4 md:px-6 bg-gradient-to-r from-primary/10 via-background to-secondary/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <p className="text-primary font-semibold mb-4">Live Update</p>
          <div className="mb-8">
            <p className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent animate-fade-in">
              {count.toLocaleString()}
            </p>
            <p className="text-2xl md:text-3xl text-foreground font-semibold mt-4">Participants Registered</p>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join thousands of chess enthusiasts from around the world at our premier event
          </p>
        </div>
      </div>
    </section>
  )
}
