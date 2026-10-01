import { HeroSection }               from '../components/sections/HeroSection'
import { PositionnementSection }     from '../components/sections/PositionnementSection'
import { AIShowcaseSection }         from '../components/sections/AIShowcaseSection'
import { AutomationSection }         from '../components/sections/AutomationSection'
import { LLMSection }                from '../components/sections/LLMSection'
import { DigitalExperiencesSection } from '../components/sections/DigitalExperiencesSection'
import { SystemsSection }            from '../components/sections/SystemsSection'
import { PortfolioSection }          from '../components/sections/PortfolioSection'
import { ProcessSection }            from '../components/sections/ProcessSection'
import { ExpertiseSection }          from '../components/sections/ExpertiseSection'
import { CTASection }                from '../components/sections/CTASection'

export default function Home() {
  return (
    <>
      <HeroSection />
      <PositionnementSection />
      <AIShowcaseSection />
      <AutomationSection />
      <LLMSection />
      <DigitalExperiencesSection />
      <SystemsSection />
      <PortfolioSection />
      <ProcessSection />
      <ExpertiseSection />
      <CTASection />
    </>
  )
}
