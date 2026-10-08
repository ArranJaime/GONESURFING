import { useState } from "react"
import { Link } from "react-router"
import { useLanguage } from "./Language"
import { useStoreData } from "./StoreData"

export default function Collections({
  embedded = false,
}: {
  embedded?: boolean
}) {
  const { drops } = useStoreData()
  const collections = drops.filter((drop) => drop.active)
  const { translate } = useLanguage()
  const [active, setActive] = useState(0)
  if (!collections.length) return null
  const move = (direction: number) =>
    setActive(
      (current) =>
        (current + direction + collections.length) % collections.length,
    )
  return translate(
    <section
      id={embedded ? "collections" : undefined}
      className={`collection-page ${embedded ? "collection-embedded" : ""}`}
      aria-label="Colecciones"
    >
      <div className="collection-intro">
        <p className="eyebrow">DIFFERENT PLACES. SAME MINDSET.</p>
        <h1>Our collections.</h1>
        <span>DIFFERENT WAYS TO GET LOST.</span>
      </div>
      <div
        className="coverflow"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Colecciones de Gone Surfing"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault()
            move(-1)
          }
          if (event.key === "ArrowRight") {
            event.preventDefault()
            move(1)
          }
        }}
      >
        {collections.map((collection, index) => {
          const offset =
            (index - active + collections.length) % collections.length
          const position =
            offset === 0
              ? "center"
              : offset === 1
                ? "right"
                : offset === collections.length - 1
                  ? "left"
                  : "hidden"
          return (
            <div
              key={collection.name}
              className={`coverflow-card ${position}`}
              aria-hidden={position !== "center"}
            >
              <img src={collection.image} alt={collection.name} />
              <div className="collection-card-top">
                <span>{collection.label}</span>
                <span>
                  {String(index + 1).padStart(2, "0")} /{" "}
                  {String(collections.length).padStart(2, "0")}
                </span>
              </div>
              <div className="collection-card-copy">
                <p>{collection.subtitle}</p>
                <h2>{collection.name}</h2>
                {position === "center" ? (
                  <Link to={`/colecciones/${collection.slug}`}>
                    EXPLORAR COLECCIÓN <span>↗</span>
                  </Link>
                ) : null}
              </div>
            </div>
          )
        })}
        <button
          className="coverflow-arrow previous"
          aria-label="Colección anterior"
          onClick={() => move(-1)}
        >
          ←
        </button>
        <button
          className="coverflow-arrow next"
          aria-label="Colección siguiente"
          onClick={() => move(1)}
        >
          →
        </button>
      </div>
      <div className="collection-pagination">
        <span aria-live="polite">
          0{active + 1} — {collections[active].label}
        </span>
        <div>
          {collections.map((collection, index) => (
            <button
              key={collection.name}
              aria-label={`Ver ${collection.name}`}
              aria-pressed={index === active}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <span>DRIFT A LITTLE. FIND SOMETHING.</span>
      </div>
    </section>,
  )
}
