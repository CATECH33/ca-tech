import { useState } from 'react'
import { Search, Heart, ShoppingCart, User, ChevronDown, Star } from 'lucide-react'
import { MockupFrame, T, Badge, SectionLabel } from './PortfolioMockupShell'
import { PF03_DATA } from './portfolioMockupData'

// SHOPCA uses a full-width e-commerce layout (no sidebar)

function ProductImage({ color, name }) {
  return (
    <div
      aria-hidden="true"
      style={{
        width: '100%',
        aspectRatio: '4 / 3',
        background: `linear-gradient(145deg, ${color} 0%, ${color}88 100%)`,
        borderRadius: `${T.radius.md} ${T.radius.md} 0 0`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Abstract shape representing the product */}
      <div style={{
        width: '40%', height: '50%',
        background: 'rgba(255,255,255,0.18)',
        borderRadius: T.radius.md,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }} />
    </div>
  )
}

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={9}
          fill={i <= Math.floor(rating) ? T.colors.accent : 'none'}
          color={i <= Math.floor(rating) ? T.colors.accent : T.colors.border}
          aria-hidden="true"
        />
      ))}
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <article
      style={{
        background: T.colors.surface,
        border: `1px solid ${T.colors.border}`,
        borderRadius: T.radius.md,
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      <div style={{ position: 'relative' }}>
        <ProductImage color={product.color} name={product.name} />
        <button
          aria-label={`Ajouter ${product.name} aux favoris`}
          style={{
            position: 'absolute', top: '8px', right: '8px',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'rgba(5,16,30,0.60)', border: `1px solid ${T.colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'default',
          }}
        >
          <Heart size={12} color={T.colors.silver} aria-hidden="true" />
        </button>
        <Badge
          color={T.colors.accent}
          bg={T.colors.accentSurface}
          style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '9px' }}
        >
          {product.category}
        </Badge>
      </div>

      <div style={{ padding: '12px 14px' }}>
        <h3 style={{
          fontFamily: T.fonts.display, fontSize: '13px', fontWeight: 600,
          color: T.colors.coolWhite, margin: '0 0 5px',
        }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <StarRating rating={product.rating} />
          <span style={{ fontFamily: T.fonts.body, fontSize: '10px', color: T.colors.silver }}>
            ({product.reviews})
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: T.fonts.mono, fontSize: '15px', fontWeight: 700, color: T.colors.coolWhite }}>
            {product.price}
          </span>
          <button
            aria-label={`Ajouter ${product.name} au panier`}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '5px 10px',
              background: T.colors.accent, border: 'none', borderRadius: T.radius.xs,
              fontFamily: T.fonts.body, fontSize: '11px', fontWeight: 500,
              color: '#fff', cursor: 'default',
            }}
          >
            <ShoppingCart size={11} aria-hidden="true" />
            Ajouter
          </button>
        </div>
      </div>
    </article>
  )
}

function FilterSection({ filter }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ fontFamily: T.fonts.body, fontSize: '11px', fontWeight: 600, color: T.colors.coolWhite }}>
          {filter.label}
        </span>
        <ChevronDown size={12} color={T.colors.silver} aria-hidden="true" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {filter.options.map((opt, i) => (
          <label
            key={opt}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'default' }}
          >
            <div style={{
              width: '13px', height: '13px', borderRadius: '3px', flexShrink: 0,
              border: `1px solid ${i === 0 ? T.colors.accent : T.colors.borderMid}`,
              background: i === 0 ? T.colors.accentSurface : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {i === 0 && <div style={{ width: '5px', height: '5px', borderRadius: '1px', background: T.colors.accent }} />}
            </div>
            <span style={{ fontFamily: T.fonts.body, fontSize: '11px', color: i === 0 ? T.colors.coolWhite : T.colors.silver }}>
              {opt}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export function ShopcaMockup() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  return (
    <MockupFrame style={{ display: "flex", flexDirection: "column" }}>
      {/* Top navigation bar */}
      <header style={{
        height: '56px', flexShrink: 0,
        background: T.colors.navy,
        borderBottom: `1px solid ${T.colors.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: T.fonts.display, fontSize: '18px', fontWeight: 800,
          color: T.colors.coolWhite, letterSpacing: '-0.03em',
        }}>
          SHOP<span style={{ color: T.colors.accent }}>CA</span>
        </div>

        {/* Search */}
        <div style={{
          flex: 1, maxWidth: '440px', margin: '0 40px',
          display: 'flex', alignItems: 'center', gap: '10px',
          background: T.colors.surfaceDeep,
          border: `1px solid ${T.colors.borderMid}`,
          borderRadius: T.radius.sm, padding: '8px 14px',
        }}>
          <Search size={14} color={T.colors.silver} aria-hidden="true" />
          <span style={{ fontFamily: T.fonts.body, fontSize: '13px', color: 'rgba(165,172,181,0.45)' }}>
            Rechercher un produit…
          </span>
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button aria-label="Favoris" style={{ background: 'none', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Heart size={18} color={T.colors.silver} aria-hidden="true" />
            <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.silver }}>Favoris</span>
          </button>
          <button aria-label="Panier" style={{ background: 'none', border: 'none', cursor: 'default', display: 'flex', alignItems: 'center', gap: '5px', position: 'relative' }}>
            <ShoppingCart size={18} color={T.colors.coolWhite} aria-hidden="true" />
            <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.coolWhite }}>Panier</span>
            <div style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '16px', height: '16px', borderRadius: '50%',
              background: T.colors.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: T.fonts.mono, fontSize: '9px', color: '#fff', fontWeight: 700 }}>3</span>
            </div>
          </button>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: T.colors.techBlue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User size={15} color={T.colors.coolWhite} aria-hidden="true" />
          </div>
        </div>
      </header>

      {/* Category bar */}
      <div style={{
        height: '44px', flexShrink: 0,
        background: T.colors.deepNavy,
        borderBottom: `1px solid ${T.colors.border}`,
        display: 'flex', alignItems: 'center',
        padding: '0 32px', gap: '4px',
      }}>
        <span style={{
          fontFamily: T.fonts.body, fontSize: '11px', color: T.colors.silver,
          marginRight: '12px', letterSpacing: '0.03em',
        }}>
          Catégories :
        </span>
        {PF03_DATA.categories.map((cat) => {
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '5px 14px',
                borderRadius: T.radius.sm,
                background: isActive ? T.colors.accent : 'transparent',
                border: `1px solid ${isActive ? T.colors.accent : T.colors.border}`,
                fontFamily: T.fonts.body, fontSize: '12px', fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : T.colors.silver,
                cursor: 'default',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Main content: filter sidebar + product grid */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
        {/* Filter sidebar */}
        <aside
          style={{
            width: '200px', flexShrink: 0,
            background: T.colors.navy,
            borderRight: `1px solid ${T.colors.border}`,
            padding: '20px 16px',
            overflowY: 'auto',
          }}
          aria-label="Filtres de recherche"
        >
          <div style={{
            fontFamily: T.fonts.body, fontSize: '12px', fontWeight: 600,
            color: T.colors.coolWhite, marginBottom: '16px',
          }}>
            Filtres
          </div>
          {PF03_DATA.filters.map((filter) => (
            <FilterSection key={filter.label} filter={filter} />
          ))}
        </aside>

        {/* Product grid */}
        <main style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h1 style={{
              fontFamily: T.fonts.display, fontSize: '16px', fontWeight: 600,
              color: T.colors.coolWhite, margin: 0,
            }}>
              Découvrez votre prochain produit
            </h1>
            <span style={{ fontFamily: T.fonts.body, fontSize: '12px', color: T.colors.silver }}>
              {PF03_DATA.products.length} produits
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
          }}>
            {PF03_DATA.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </MockupFrame>
  )
}
