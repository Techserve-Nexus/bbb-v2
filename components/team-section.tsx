import TeamCarousel from "./team-carousel"

async function fetchChairTeam() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/chair-team`, {
    cache: "no-store",
  })
  return res.json()
}

async function fetchMCTeam() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/admin/mc-team`, {
    cache: "no-store",
  })
  return res.json()
}

export default async function TeamSection() {
  const [chairTeam, mcTeam] = await Promise.all([
    fetchChairTeam(),
    fetchMCTeam()
  ])

  return (
    <>
      <TeamCarousel
        members={Array.isArray(chairTeam) ? chairTeam : chairTeam.members || []}
        title="Chaturanga Manthana Chair Team"
        description="Chair team overseeing the Chaturanga Manthana event."
        bgClass="bg-muted/30"
      />

      <TeamCarousel
        members={Array.isArray(mcTeam) ? mcTeam : mcTeam.members || []}
        title="MC Team"
        description="Core MC team managing chapter operations."
        bgClass="bg-background"
      />
    </>
  )
}
