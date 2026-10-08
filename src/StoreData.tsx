import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product } from "./Catalog"

export type Drop = {
  name: string
  slug: string
  subtitle: string
  image: string
  label: string
  active: boolean
}

export type StockProduct = Product & {
  id?: string
  stock?: number
  collection?: string
}

export type Sale = {
  number: string
  date: string
  detail: string
  units: number
  subtotal: number
  tax: number
  total: number
}

const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=85`

const initialDrops: Drop[] = [
  {
    name: "The slow days",
    slug: "the-slow-days",
    subtitle: "NO PLANS. JUST TIDES.",
    image: photo("1636353990836-b20b196dd41e"),
    label: "COASTAL ESSENTIALS",
    active: true,
  },
  {
    name: "The blue",
    slug: "the-blue",
    subtitle: "LESS NOISE. MORE OCEAN.",
    image: photo("1559628234-d70bb7959a92"),
    label: "SURF CULTURE",
    active: true,
  },
  {
    name: "Off duty",
    slug: "off-duty",
    subtitle: "NOWHERE TO BE. EVERYTHING TO FEEL.",
    image: photo("1503341504253-dff4815485f1"),
    label: "STREET TO SHORE",
    active: true,
  },
  {
    name: "Golden hour",
    slug: "golden-hour",
    subtitle: "STAY UNTIL THE SUN GOES DOWN.",
    image: photo("1606072272503-fa96b4201679"),
    label: "THE SUMMER EDIT",
    active: true,
  },
  {
    name: "Regular",
    slug: "regular",
    subtitle: "EVERYDAY, OFFLINE.",
    image: photo("1636353990836-b20b196dd41e"),
    label: "CORE COLLECTION",
    active: false,
  },
]

// Normalizador universal de productos (compatibilidad español / inglés y admin)
function normalizeProduct(p: any, i: number): StockProduct {
  return {
    id: p.id || `prod-${i}`,
    name: p.name || p.nombre || "Prenda GONE SURFING",
    color: p.color || "Black / Wave",
    price: Number(p.price ?? p.precio ?? 0),
    image: p.image || p.imagenUrl || "/images/stay-real-cap.png",
    lifestyle:
      p.lifestyle ||
      p.imagenUrl ||
      p.image ||
      "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
    category: p.category || p.categoria || "Accesorios",
    size: p.size || "M",
    sizes: p.sizes || ["S", "M", "L", "XL"],
    isNew:
      p.isNew ??
      (p.categoria === "New Arrivals" || p.category === "Nuevos Ingresos"),
    bestseller: p.bestseller ?? false,
    stock: p.stock !== undefined ? Number(p.stock) : 15,
    collection: p.collection || p.coleccion || "",
  }
}

// Normalizador universal de colecciones
function normalizeDrop(d: any): Drop {
  return {
    name: d.name || d.nombre || "",
    slug:
      d.slug ||
      (d.name || d.nombre || "")
        .toLowerCase()
        .replace(/\s+/g, "-"),
    subtitle: d.subtitle || d.subtitulo || "",
    image: d.image || d.portadaUrl || photo("1636353990836-b20b196dd41e"),
    label: d.label || "COASTAL ESSENTIALS",
    active: d.active ?? d.activa ?? true,
  }
}

function loadProducts(initialProducts: Product[]): StockProduct[] {
  try {
    // 1. Intenta leer lo guardado por Admin.tsx
    const adminSaved = localStorage.getItem("gs_productos")
    if (adminSaved) {
      const parsed = JSON.parse(adminSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, i) => normalizeProduct(p, i))
      }
    }
    // 2. Intenta leer la clave del template
    const templateSaved = localStorage.getItem("gs-products-v1")
    if (templateSaved) {
      const parsed = JSON.parse(templateSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p, i) => normalizeProduct(p, i))
      }
    }
  } catch (e) {
    console.error("Error al cargar productos en StoreData:", e)
  }

  // 3. Fallback inicial
  return initialProducts.map((p, i) => ({
    ...p,
    id: `seed-${i}`,
    stock: 20,
    collection: [
      "the-slow-days",
      "off-duty",
      "golden-hour",
      "regular",
      "the-blue",
    ][i % 5],
  }))
}

function loadDrops(): Drop[] {
  try {
    const adminSaved = localStorage.getItem("gs_colecciones")
    if (adminSaved) {
      const parsed = JSON.parse(adminSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeDrop)
      }
    }

    const templateSaved = localStorage.getItem("gs-drops-v1")
    if (templateSaved) {
      const parsed = JSON.parse(templateSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeDrop)
      }
    }
  } catch (e) {
    console.error("Error al cargar colecciones en StoreData:", e)
  }

  return initialDrops
}

function loadSales(): Sale[] {
  try {
    const adminSaved = localStorage.getItem("gs_transacciones")
    if (adminSaved) {
      const parsed = JSON.parse(adminSaved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t: any) => ({
          number: t.id || t.number || "#GS-100",
          date: t.fecha || t.date || new Date().toLocaleString(),
          detail: t.detalle || t.detail || "Prendas surtidas",
          units: t.units || 1,
          subtotal: Number(t.subtotal || 0),
          tax: Number(t.igv || t.tax || 0),
          total: Number(t.total || 0),
        }))
      }
    }

    const templateSaved = localStorage.getItem("gs-sales-v1")
    if (templateSaved) {
      return JSON.parse(templateSaved)
    }
  } catch (e) {
    console.error("Error al cargar ventas en StoreData:", e)
  }

  return []
}

const Context = createContext<{
  products: StockProduct[]
  drops: Drop[]
  sales: Sale[]
  saveProducts: (value: StockProduct[]) => boolean
  saveDrops: (value: Drop[]) => boolean
  addSale: (value: Sale) => void
}>(null!)

export default function StoreData({
  initialProducts,
  children,
}: {
  initialProducts: Product[]
  children: ReactNode
}) {
  const [products, setProducts] = useState<StockProduct[]>(() =>
    loadProducts(initialProducts),
  )
  const [drops, setDrops] = useState<Drop[]>(() => loadDrops())
  const [sales, setSales] = useState<Sale[]>(() => loadSales())

  // Sincronización en caliente ante cualquier cambio en el almacenamiento local
  useEffect(() => {
    const handleStorageChange = () => {
      setProducts(loadProducts(initialProducts))
      setDrops(loadDrops())
      setSales(loadSales())
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [initialProducts])

  // Guarda en ambas claves para garantizar compatibilidad con Admin y StoreData
  function persistProducts(value: StockProduct[]): boolean {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem("gs_productos", serialized)
      localStorage.setItem("gs-products-v1", serialized)
      setProducts(value)
      return true
    } catch {
      return false
    }
  }

  function persistDrops(value: Drop[]): boolean {
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem("gs_colecciones", serialized)
      localStorage.setItem("gs-drops-v1", serialized)
      setDrops(value)
      return true
    } catch {
      return false
    }
  }

  function handleAddSale(value: Sale) {
    try {
      const updated = [...sales, value]
      const serialized = JSON.stringify(updated)
      localStorage.setItem("gs_transacciones", serialized)
      localStorage.setItem("gs-sales-v1", serialized)
      setSales(updated)
    } catch (e) {
      console.error("Error al registrar venta:", e)
    }
  }

  return (
    <Context.Provider
      value={{
        products,
        drops,
        sales,
        saveProducts: persistProducts,
        saveDrops: persistDrops,
        addSale: handleAddSale,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useStoreData = () => useContext(Context)