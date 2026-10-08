import { createContext, useContext, useState, type ReactNode } from "react"
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
function load<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
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
    load(
      "gs-products-v1",
      initialProducts.map((p, i) => ({
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
      })),
    ),
  )
  const [drops, setDrops] = useState<Drop[]>(() =>
    load("gs-drops-v1", initialDrops),
  )
  const [sales, setSales] = useState<Sale[]>(() => load("gs-sales-v1", []))
  function persist<T>(key: string, value: T, setter: (value: T) => void) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setter(value)
      return true
    } catch {
      return false
    }
  }
  return (
    <Context.Provider
      value={{
        products,
        drops,
        sales,
        saveProducts: (v) => persist("gs-products-v1", v, setProducts),
        saveDrops: (v) => persist("gs-drops-v1", v, setDrops),
        addSale: (v) => {
          persist("gs-sales-v1", [...sales, v], setSales)
        },
      }}
    >
      {children}
    </Context.Provider>
  )
}
export const useStoreData = () => useContext(Context)
