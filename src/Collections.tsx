import { useState, useEffect } from "react"
import { Link } from "react-router"
import { useLanguage } from "./Language"
import { useStoreData } from "./StoreData"

interface DropCollection {
  name: string
  slug: string
  subtitle: string
  image: string
  label: string
  active: boolean
}

export default function Collections({
  embedded = false,
}: {
  embedded?: boolean
}) {
  const { drops } = useStoreData()
  const { translate } = useLanguage()
  const [active, setActive] = useState(0)

  // 1. Cargar y sincronizar con lo guardado en el Admin (localStorage)
  const [collections, setCollections] = useState<DropCollection[]>(() => {
    const saved = localStorage.getItem("gs_colecciones")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Filtrar solo las activas y mapear campos del Admin al formato del carrusel
        return parsed
          .filter((item: any) => item.activa ?? item.active ?? true)
          .map((item: any) => ({
            name: item.nombre || item.name,
            slug: item.slug || (item.nombre || item.name || "").toLowerCase().replace(/\s+/g, "-"),
            subtitle: item.subtitulo || item.subtitle || "",
            image: item.portadaUrl || item.image || "",
            label: item.label || "ESENCIALES DE LA COSTA",
            active: item.activa ?? item.active ?? true,
          }))
      } catch (e) {
        console.error("Error al cargar colecciones de localStorage:", e)
      }
    }
    // Fallback a los datos iniciales de StoreData
    return drops.filter((drop) => drop.active)
  })

  // 2. Escuchar cambios de StoreData o recargas
  useEffect(() => {
    const saved = localStorage.getItem("gs_colecciones")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const filtered = parsed
          .filter((item: any) => item.activa !== false && item.active !== false)
          .map((item: any) => ({
            name: item.nombre || item.name,
            slug: item.slug || (item.nombre || item.name || "").toLowerCase().replace(/\s+/g, "-"),
            subtitle: item.subtitulo || item.subtitle || "",
            image: item.portadaUrl || item.image || "",
            label: item.label || "ESENCIALES DE LA COSTA",
            active: item.activa ?? item.active ?? true,
          }))
        if (filtered.length > 0) {
          setCollections(filtered)
          return
        }
      } catch (e) {
        console.error(e)
      }
    }
    setCollections(drops.filter((drop) => drop.active))
  }, [drops])

  // Si no hay colecciones activas, no renderiza la sección
  if (!collections.length) return null

  // Control de índice seguro por si se desactiva una colección mientras está seleccionada
  const safeActiveIndex = active >= collections.length ? 0 : active

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
            (index - safeActiveIndex + collections.length) % collections.length
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
          {String(safeActiveIndex + 1).padStart(2, "0")} —{" "}
          {collections[safeActiveIndex]?.label || "ESENCIALES DE LA COSTA"}
        </span>
        <div>
          {collections.map((collection, index) => (
            <button
              key={collection.name}
              aria-label={`Ver ${collection.name}`}
              aria-pressed={index === safeActiveIndex}
              className={index === safeActiveIndex ? "active" : ""}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
        <span>DRIFT A LITTLE. FIND SOMETHING.</span>
      </div>
    </section>,
  )
}