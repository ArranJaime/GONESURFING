import { useSearchParams, useParams } from "react-router"
import { useStoreData } from "./StoreData"
import { useLanguage } from "./Language"
import { Fragment } from "react"

export interface Product {
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
}

export const money = (amount: number) => `S/. ${amount.toFixed(2)}`

export default function Catalog({
  products,
  onSelect,
}: {
  products: Product[]
  onSelect: (index: number) => void
}) {
  const { translate } = useLanguage()
  const { slug } = useParams()
  const { drops } = useStoreData()
  const drop = drops.find((item) => item.slug === slug && item.active)
  const [params, setParams] = useSearchParams()
  const categories = [
    "Todos",
    "Nuevos Ingresos",
    "Accesorios",
    "Merch",
    "Wetsuits",
    "Best Sellers",
  ]
  const requestedCategory = params.get("category") || "Todos"
  const filter = categories.includes(requestedCategory)
    ? requestedCategory
    : "Todos"
  const setFilter = (category: string) =>
    setParams(category === "Todos" ? {} : { category }, {
      preventScrollReset: true,
    })
  const visible = products
    .map((product, index) => ({ product, index }))
    .filter(
      ({ product }) =>
        !slug ||
        (!!drop &&
          (product as Product & { collection?: string }).collection === slug),
    )
    .filter(
      ({ product }) =>
        filter === "Todos" ||
        (filter === "Nuevos Ingresos"
          ? product.isNew
          : filter === "Best Sellers"
            ? product.bestseller
            : product.category === filter),
    )
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
          {[
            "Todos",
            "Nuevos Ingresos",
            "Accesorios",
            "Merch",
            "Wetsuits",
            "Best Sellers",
          ].map((category) => (
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
      <div className="catalog-grid">
        {!visible.length && (
          <p className="catalog-empty">
            Esta colección todavía no tiene prendas disponibles.
          </p>
        )}
        {visible.map(({ product, index }, position) => (
          <Fragment key={product.name}>
            <button
              className={`product editorial-product ${
                position === 0 ? "editorial-featured" : ""
              }`}
              onClick={() => onSelect(index)}
            >
              <div className="product-photo">
                {product.isNew && <span className="new-tag">NEW</span>}
                <img src={product.image} alt={product.name} loading="lazy" />
                <img
                  className="lifestyle"
                  src={product.lifestyle}
                  alt={`${product.name} en la costa`}
                  loading="lazy"
                />
                <span className="quick-add">
                  VER PRODUCTO <span>+</span>
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
