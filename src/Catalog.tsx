import { useSearchParams, useParams } from "react-router"
import { useStoreData } from "./StoreData"
import { useLanguage } from "./Language"
import { Fragment, useState, useEffect } from "react"

export interface Product {
  id?: string
  name: string
  color: string
  price: number
  image: string
  lifestyle: string
  category: string
  size: string
  sizes?: string[]
  isNew: boolean
  bestseller: boolean
  stock?: number
  collection?: string
  sizesStock?: Record<string, number>
}

export const money = (amount: number) => `S/. ${amount.toFixed(2)}`

// Función para normalizar cualquier prenda que venga de Admin o de StoreData
function normalizeProduct(p: any): Product {
  return {
    id: p.id || p.name,
    name: p.name || p.nombre || "Prenda GONE SURFING",
    color: p.color || "Black / Wave",
    price: Number(p.price || p.precio || 0),
    image: p.image || p.imagenUrl || "/images/stay-real-cap.png",
    lifestyle:
      p.lifestyle ||
      p.image ||
      p.imagenUrl ||
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
    category: p.category || p.categoria || "Accesorios",
    size: p.size || "M",
    sizes: p.sizes || ["S", "M", "L", "XL"],
    isNew:
      p.isNew ??
      (p.categoria === "New Arrivals" || p.category === "Nuevos Ingresos"),
    bestseller: p.bestseller ?? false,
    stock: p.stock !== undefined ? Number(p.stock) : 10,
    collection: p.collection || p.coleccion || "",
    sizesStock: p.sizesStock || undefined,
  }
}

export default function Catalog({
  products: propProducts,
  onSelect = () => {},
}: {
  products?: Product[]
  onSelect?: (index: number) => void
}) {
  const { translate } = useLanguage()
  const { slug } = useParams()
  const { drops: defaultDrops } = useStoreData()

  // 1. Sincronización de Colecciones (Drops) con el Admin
  const [drops, setDrops] = useState(() => {
    const saved = localStorage.getItem("gs_colecciones")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item: any) => ({
            name: item.nombre || item.name,
            slug:
              item.slug ||
              (item.nombre || item.name || "")
                .toLowerCase()
                .replace(/\s+/g, "-"),
            subtitle: item.subtitulo || item.subtitle || "",
            active: item.activa ?? item.active ?? true,
            image: item.portadaUrl || item.image || "",
          }))
        }
      } catch (e) {
        console.error(e)
      }
    }
    return defaultDrops
  })

  // 2. Sincronización de Productos con el Admin
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("gs_productos")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(normalizeProduct)
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (propProducts && propProducts.length > 0) {
      return propProducts.map(normalizeProduct)
    }
    return []
  })

  // 3. Efecto para escuchar recargas y eventos de almacenamiento
  useEffect(() => {
    const syncData = () => {
      // Sincronizar Colecciones
      const savedCols = localStorage.getItem("gs_colecciones")
      if (savedCols) {
        try {
          const parsedCols = JSON.parse(savedCols)
          if (Array.isArray(parsedCols) && parsedCols.length > 0) {
            setDrops(
              parsedCols.map((item: any) => ({
                name: item.nombre || item.name,
                slug:
                  item.slug ||
                  (item.nombre || item.name || "")
                    .toLowerCase()
                    .replace(/\s+/g, "-"),
                subtitle: item.subtitulo || item.subtitle || "",
                active: item.activa ?? item.active ?? true,
                image: item.portadaUrl || item.image || "",
              })),
            )
          }
        } catch (e) {
          console.error(e)
        }
      }

      // Sincronizar Productos
      const savedProds = localStorage.getItem("gs_productos")
      if (savedProds) {
        try {
          const parsedProds = JSON.parse(savedProds)
          if (Array.isArray(parsedProds) && parsedProds.length > 0) {
            setCatalogProducts(parsedProds.map(normalizeProduct))
            return
          }
        } catch (e) {
          console.error(e)
        }
      }
      if (propProducts && propProducts.length > 0) {
        setCatalogProducts(propProducts.map(normalizeProduct))
      }
    }

    syncData()
    window.addEventListener("storage", syncData)
    return () => window.removeEventListener("storage", syncData)
  }, [propProducts])

  const drop = drops.find((item: any) => item.slug === slug && item.active)
  const [params, setParams] = useSearchParams()

  const categories = [
    "Todos",
    "Nuevos Ingresos",
    "Accesorios",
    "Merch",
    "Wetsuits",
    "Best Sellers",
  ]

  const requestedCategory = (params.get("category") || "Todos").trim()

  // Reconoce tanto "Nuevos Ingresos" como "New Arrivals" de forma insensible a mayúsculas
  const matchedCategory = categories.find((cat) => {
    const cLower = cat.toLowerCase()
    const rLower = requestedCategory.toLowerCase()
    if (cLower === rLower) return true
    if (
      cat === "Nuevos Ingresos" &&
      (rLower === "new arrivals" || rLower === "new-arrivals")
    )
      return true
    return false
  })

  const filter = matchedCategory || "Todos"

  // Función para cambiar de categoría al hacer clic en los botones
  const setFilter = (category: string) =>
    setParams(category === "Todos" ? {} : { category }, {
      preventScrollReset: true,
    })

  // Filtrado compuesto:
  // - Si hay slug, sólo muestra los productos asignados a esa colección activa.
  // - Si no hay slug, muestra todas las prendas (incluidas las que no tienen colección).
  const visible = catalogProducts
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => {
      if (!slug) return true
      if (!drop) return false
      const prodCol = (product.collection || "").trim().toLowerCase()
      const dropSlug = (drop.slug || "").trim().toLowerCase()
      const dropName = (drop.name || "").trim().toLowerCase()
      return prodCol === dropSlug || prodCol === dropName
    })
    .filter(({ product }) => {
      if (filter === "Todos") return true
      if (filter === "Nuevos Ingresos") {
        return (
          product.isNew ||
          product.category === "New Arrivals" ||
          product.category === "Nuevos Ingresos"
        )
      }
      if (filter === "Best Sellers") return product.bestseller
      return (
        product.category.toLowerCase() === filter.toLowerCase() ||
        (filter === "Accesorios" &&
          product.category.toLowerCase() === "accesorios") ||
        (filter === "Merch" && product.category.toLowerCase() === "merch") ||
        (filter === "Wetsuits" && product.category.toLowerCase() === "wetsuits")
      )
    })

  return translate(
    <section className="catalog-page catalog-editorial">
      <span className="catalog-watermark" aria-hidden="true">
        OFFLINE
      </span>
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">THE OCEAN IS CALLING / DROP 026</p>
          <h1>
            {slug ? (
              drop?.name || "Colección no disponible"
            ) : (
              <>
                Off the grid.<span>On your terms.</span>
              </>
            )}
          </h1>
        </div>
        <p>
          De la ciudad al agua.
          <br />
          Esenciales para vivir a tu ritmo.
        </p>
      </div>
      <div className="catalog-filter">
        <div role="group" aria-label="Filtrar catálogo">
          {categories.map((category) => (
            <button
              key={category}
              className={filter === category ? "active" : ""}
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <span aria-live="polite">{visible.length} PRODUCTOS</span>
      </div>

      {/* Grid con clave reactiva para disparar la animación de entrada suave */}
      <div className="catalog-grid" key={`${slug || "shop"}-${filter}`}>
        {!visible.length && (
          <p className="catalog-empty">
            Esta colección todavía no tiene prendas disponibles.
          </p>
        )}
        {visible.map(({ product, index }, position) => (
          <Fragment key={product.id || `${product.name}-${index}`}>
            <button
              className={`product editorial-product ${
                position === 0 ? "editorial-featured" : ""
              }`}
              onClick={() => onSelect(index)}
            >
              <div className="product-photo">
                {product.isNew && <span className="new-tag">NEW</span>}
                {product.stock === 0 && (
                  <span
                    className="new-tag"
                    style={{
                      background: "#5c1313",
                      color: "#fff",
                      top: product.isNew ? "36px" : "12px",
                    }}
                  >
                    AGOTADO
                  </span>
                )}
                <img src={product.image} alt={product.name} loading="lazy" />
                <img
                  className="lifestyle"
                  src={product.lifestyle}
                  alt={`${product.name} en la costa`}
                  loading="lazy"
                />
                <span className="quick-add">
                  {product.stock === 0 ? "SIN STOCK" : "VER PRODUCTO"}{" "}
                  <span>+</span>
                </span>
              </div>
              <div className="product-name">
                <h3>{product.name}</h3>
                <span>{money(product.price)}</span>
              </div>
              <p>{product.color}</p>
            </button>

            {position === 2 && (
              <div className="catalog-surf-spread">
                <img
                  src="https://images.unsplash.com/photo-1636353990836-b20b196dd41e?auto=format&fit=crop&w=2200&q=85"
                  alt="Surfista caminando por la playa al atardecer"
                  loading="lazy"
                />
                <span className="spread-number">FIELD NOTES / 001</span>
                <div>
                  <p>NO SIGNAL. NO PROBLEM.</p>
                  <h2>
                    Outside is
                    <br />
                    the only place.
                  </h2>
                  <span>28°24′ N / 16°33′ W</span>
                </div>
                <span className="spread-caption">STAY SALTY. STAY REAL.</span>
              </div>
            )}
            {position === 6 && (
              <div className="catalog-surf-spread spread-blue">
                <img
                  src="https://images.unsplash.com/photo-1559628234-d70bb7959a92?auto=format&fit=crop&w=2200&q=85"
                  alt="Surfista entre olas turquesas"
                  loading="lazy"
                />
                <span className="spread-number">FIELD NOTES / 002</span>
                <div>
                  <p>LESS NOISE. MORE OCEAN.</p>
                  <h2>
                    Nothing else
                    <br />
                    comes close.
                  </h2>
                </div>
              </div>
            )}
          </Fragment>
        ))}
      </div>
      <div className="catalog-end">
        <span>YOU'VE FOUND YOUR WAY OUT.</span>
        <p>Menos cosas. Más vida.</p>
        <span>HECHO PARA LOS DÍAS SIN PLANES.</span>
      </div>
    </section>,
  )
}