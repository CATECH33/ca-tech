import { useRef } from 'react'
import { useScrollSlide } from './useScrollSlide'
import './StorySection.css'

/**
 * Reusable scroll-driven storytelling section.
 *
 * The outer wrapper is tall (slideCount * 45dvh + 55dvh).
 * The inner panel sticks at the nav bottom while the user scrolls through,
 * advancing the active slide index based on scroll progress.
 *
 * Uses a render prop so the parent controls all visual content:
 *
 *   <StorySection id="expertise-ia" theme="dark" label="IA" slideCount={5}>
 *     {(activeSlide) => <MySlideContent slide={activeSlide} />}
 *   </StorySection>
 *
 * Mobile / prefers-reduced-motion: non-sticky, timer-based fallback.
 */
export function StorySection({ id, theme = 'dark', label, slideCount, children, className }) {
  const ref = useRef(null)
  const activeSlide = useScrollSlide(ref, slideCount)

  // Wrapper height: one viewport to enter + 45dvh per additional slide
  // Formula: slideCount * 45dvh + 55dvh  (= 1*100dvh when count=1)
  const wrapHeight = `calc(${slideCount * 45}dvh + 55dvh)`

  return (
    <div
      className={`story-wrap story-wrap--${theme}${className ? ` ${className}` : ''}`}
      ref={ref}
      id={id}
      style={{ height: wrapHeight }}
    >
      <section
        className={`story-sticky story-sticky--${theme}`}
        aria-label={label}
      >
        {children(activeSlide)}
      </section>
    </div>
  )
}
