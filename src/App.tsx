import { useEffect, useRef, useState } from "react"
import {
  createBrowserRouter,
  Link,
  NavLink,
  RouterProvider,
  useLocation,
  useNavigate,
} from "react-router"
import Catalog, { money, type Product } from "./Catalog"
import Collections from "./Collections"
import LanguageProvider, { useLanguage } from "./Language"
import Checkout, { Confirmation, type DemoOrder } from "./Checkout"
import StoreData, { useStoreData } from "./StoreData"
import Admin from "./Admin"

const photo = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`
const surf = photo("1636353990836-b20b196dd41e", 2400)

const defaultProducts: Product[] = [
  {
    name: "The Everyday Cap",
    color: "Stone / Unstructured",
    price: 100,
    category: "Accesorios",
    size: "Única · Ajustable",
    isNew: true,
    bestseller: true,
    image: "/images/everyday-cap.png",
    lifestyle: "/images/everyday-cap.png",
    sizesStock: { "Única": 25 },
  },
  {
    name: "Off Duty Tee",
    color: "Washed black / Relaxed fit",
    price: 120,
    category: "Merch",
    size: "M · Relaxed fit",
    isNew: true,
    bestseller: true,
    image: "/images/off-duty-tee.png",
    lifestyle: "/images/off-duty-tee.png",
    sizesStock: { S: 10, M: 15, L: 15, XL: 5 },
  },
  {
    name: "Stay Real Cap",
    color: "Chalk / Unstructured",
    price: 100,
    category: "Accesorios",
    size: "Única · Ajustable",
    isNew: true,
    bestseller: false,
    image: "/images/stay-real-cap.png",
    lifestyle: "/images/stay-real-cap.png",
    sizesStock: { "Única": 24 },
  },
]

// Conversor dinámico para enlaces o IDs de YouTube
function getYouTubeEmbed(input: string): string {
  const fallbackId = "9Jbam0F4Jj8" // Film oficial WSL
  if (!input) return `https://www.youtube.com/embed/${fallbackId}?autoplay=1&rel=0`
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = input.match(regExp)
  const videoId = match && match[2].length === 11 ? match[2] : input.trim()
  return `https://www.youtube.com/embed/${videoId || fallbackId}?autoplay=1&rel=0`
}

// Función para despachar correos (soporta EmailJS real o simulación en consola)
async function despacharCorreoNotificacion({
  toEmail,
  customerName,
  orderNumber,
  total,
  tipoCorreo,
}: {
  toEmail: string
  customerName: string
  orderNumber?: string
  total?: number
  tipoCorreo: "boleta" | "bienvenida"
}) {
  const correoLimpio = toEmail.trim().toLowerCase()
  if (!correoLimpio) return

  const serviceId = localStorage.getItem("gs_emailjs_service_id") || "TU_SERVICE_ID"
  const templateId = localStorage.getItem("gs_emailjs_template_id") || "TU_TEMPLATE_ID"
  const publicKey = localStorage.getItem("gs_emailjs_public_key") || "TU_PUBLIC_KEY"

  if (
    serviceId !== "TU_SERVICE_ID" &&
    templateId !== "TU_TEMPLATE_ID" &&
    publicKey !== "TU_PUBLIC_KEY"
  ) {
    try {
      await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            to_email: correoLimpio,
            to_name: customerName,
            order_number: orderNumber || "N/A",
            total_amount: total ? `S/. ${total.toFixed(2)}` : "S/. 0.00",
            subject:
              tipoCorreo === "boleta"
                ? `Confirmación de Compra #${orderNumber} — Gone Surfing`
                : "Bienvenido a la familia Gone Surfing (Cupón 10% OFF)",
            message:
              tipoCorreo === "boleta"
                ? `Hola ${customerName}, tu compra #${orderNumber} por S/. ${total?.toFixed(2)} ha sido confirmada.`
                : "¡Bienvenido a Gone Surfing! Tu código de bienvenida es STAYREAL10.",
          },
        }),
      })
      console.info(`%c[EMAILJS REAL] Correo ${tipoCorreo} enviado a: ${correoLimpio}`, "color: #7A8B7B; font-weight: bold;")
    } catch (err) {
      console.error("[EMAILJS ERROR]", err)
    }
  } else {
    console.info(
      `%c[CORREO ${tipoCorreo.toUpperCase()}] Despachado a: ${correoLimpio} | Cliente: ${customerName}`,
      tipoCorreo === "bienvenida" ? "color: #eab308; font-weight: bold;" : "color: #22c55e; font-weight: bold;"
    )
  }
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "search" ? (
        <>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </>
      ) : name === "bag" ? (
        <>
          <path d="M5 7h14l1 14H4L5 7Z" />
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
        </>
      ) : name === "user" ? (
        <>
          <circle cx="12" cy="7" r="3.5" />
          <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
        </>
      ) : name === "close" ? (
        <path d="m5 5 14 14M19 5 5 19" />
      ) : name === "menu" ? (
        <path d="M3 8h18M3 16h18" />
      ) : (
        <path d="M4 12h16m-6-6 6 6-6 6" />
      )}
    </svg>
  )
}

function Storefront() {
  const { products, addSale } = useStoreData()
  const { language, setLanguage, translate, t } = useLanguage()
  const [selectedSize, setSelectedSize] = useState("")
  const location = useLocation()
  const navigate = useNavigate()

  const home = location.pathname === "/"
  const isCollections = location.pathname === "/collections"
  const isCheckout =
    location.pathname === "/checkout" || location.pathname === "/confirmation"

  const [order, setOrder] = useState<DemoOrder | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [panel, setPanel] = useState<string | null>(null)
  const [cart, setCart] = useState<{ index: number; size: string }[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [query, setQuery] = useState("")
  const [subscribed, setSubscribed] = useState(false)
  const [video, setVideo] = useState(false)

  // URL del video de YouTube (soporta enlace dinámico o guardado)
  const [youtubeSource] = useState<string>(() => {
    return (
      localStorage.getItem("gs_youtube_video") ||
      "https://www.youtube.com/watch?v=9Jbam0F4Jj8"
    )
  })

  const rail = useRef<HTMLDivElement>(null)
  const heroImage = useRef<HTMLImageElement>(null)

  const subtotalCents = cart.reduce(
    (sum, item) => sum + Math.round(products[item.index]?.price * 100 || 0),
    0,
  )
  const subtotal = subtotalCents / 100

  // Opciones de talla según el desglose de stock configurado
  const currentProduct = selected !== null ? products[selected] : null
  const sizeOptions =
    selected === null || !currentProduct
      ? []
      : currentProduct.sizesStock
        ? Object.keys(currentProduct.sizesStock)
        : currentProduct.sizes ||
          (currentProduct.category === "Merch" ||
          currentProduct.category === "Wetsuits" ||
          currentProduct.category === "New Arrivals"
            ? ["S", "M", "L", "XL"]
            : ["Única"])

  useEffect(() => {
    setSelectedSize("")
  }, [selected])

  useEffect(() => {
    setPanel(null)
    setSelected(null)
    if (location.hash) {
      requestAnimationFrame(() =>
        document.getElementById(location.hash.slice(1))?.scrollIntoView(),
      )
    } else window.scrollTo({ top: 0, behavior: "instant" })
  }, [location.pathname, location.hash])

  useEffect(() => {
    const scroll = () => {
      setScrolled(window.scrollY > 60)
      if (
        heroImage.current &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        heroImage.current.style.transform = `translateY(${Math.min(
          window.scrollY * 0.18,
          200,
        )}px) scale(1.05)`
      }
    }
    window.addEventListener("scroll", scroll, { passive: true })
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
            observer.unobserve(entry.target)
          }
        }),
      { threshold: 0.08 },
    )
    document
      .querySelectorAll(".reveal")
      .forEach((element) => observer.observe(element))
    return () => {
      window.removeEventListener("scroll", scroll)
      observer.disconnect()
    }
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow =
      panel || selected !== null || video ? "hidden" : ""
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanel(null)
        setSelected(null)
        setVideo(false)
      }
    }
    window.addEventListener("keydown", escape)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", escape)
    }
  }, [panel, selected, video])

  // FILTRADO DINÁMICO: Todos los accesorios reales
  const accessoryProducts = products
    .map((product, index) => ({ product, index }))
    .filter(
      ({ product }) =>
        (product.category || "").trim().toLowerCase() === "accesorios",
    )

  return translate(
    <>
      <header
        className={`header ${scrolled || !home ? "solid" : ""} ${
          location.pathname === "/confirmation" ? "confirmation-header" : ""
        }`}
      >
        <nav className="desktop-nav">
          <NavLink to="/shop" viewTransition>
            SHOP
          </NavLink>
          <NavLink to="/collections" viewTransition>
            COLLECTIONS
          </NavLink>
          <NavLink to="/about" viewTransition>
            ABOUT
          </NavLink>
        </nav>
        <button
          className="mobile-menu"
          aria-label="Abrir menú"
          onClick={() => setPanel("menu")}
        >
          <Icon name="menu" />
        </button>
        <Link className="wordmark" to="/" viewTransition>
          GONE SURFING<span>OFFLINE IS THE NEW LUXURY</span>
        </Link>
        <div className="utilities">
          <label className="language-switch">
            <span className="sr-only">{t("Idioma")}</span>
            <select
              aria-label={t("Idioma")}
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as "ES" | "EN" | "FR")
              }
            >
              <option value="ES">ES</option>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
            </select>
            <span aria-hidden="true">⌄</span>
          </label>
          <button aria-label="Buscar" onClick={() => setPanel("search")}>
            <Icon name="search" />
          </button>
          <button
            className="account"
            aria-label="Cuenta"
            onClick={() => setPanel("account")}
          >
            <Icon name="user" />
          </button>
          <button
            className="bag"
            aria-label={`Carrito, ${cart.length} artículos`}
            onClick={() => setPanel("cart")}
          >
            <Icon name="bag" />
            <span>{cart.length}</span>
          </button>
        </div>
      </header>

      <main>
        {home && (
          <>
            <section className="hero">
              <img
                ref={heroImage}
                className="hero-photo hero-photo--natural"
                src={surf}
                alt="Surfista caminando hacia el océano al atardecer"
              />
              <div className="hero-shade" />
              <div className="hero-center">
                <p className="eyebrow">LESS NOISE. MORE OCEAN.</p>
                <h1>stay real</h1>
                <Link className="ghost" to="/shop" viewTransition>
                  NEW WAVES <Icon name="arrow" size={17} />
                </Link>
              </div>
              <div className="hero-bottom">
                <span>BUILT FOR THE DAYS IN BETWEEN.</span>
                <a href="#collections">
                  SCROLL TO EXPLORE <span>↓</span>
                </a>
                <span>EST. BY THE OCEAN · 2024</span>
              </div>
            </section>

            <div className="manifesto-strip">
              <span>NO SIGNAL. NO PROBLEM.</span>
              <span className="little-star">✳</span>
              <span>MADE TO GO NOWHERE.</span>
              <span className="little-star">✳</span>
              <span>STAY SALTY. STAY REAL.</span>
              <span className="little-star">✳</span>
              <span>GONE SURFING.</span>
            </div>

            <section className="home-drops reveal" id="arrivals">
              <Link
                className="drop-block"
                to="/shop?category=Nuevos%20Ingresos"
                viewTransition
              >
                <img
                  src={surf}
                  alt="Nueva colección de surf junto a la costa"
                  loading="lazy"
                />
                <span className="eyebrow">THE LATEST DROP / 026</span>
                <div>
                  <h2>New arrivals</h2>
                  <span>
                    FRESH OUT OF THE WATER <Icon name="arrow" />
                  </span>
                </div>
              </Link>

              <Link
                className="drop-block merch-drop"
                to="/shop?category=Merch"
                viewTransition
              >
                <img
                  src={photo("1526342256246-b67e94be5c79")}
                  alt="Modelo con wetsuit surfeando una ola"
                  loading="lazy"
                />
                <span className="eyebrow">WEAR THE MINDSET</span>
                <div>
                  <h2>Merch</h2>
                  <span>
                    MADE FOR THE DAYS IN BETWEEN <Icon name="arrow" />
                  </span>
                </div>
              </Link>
            </section>

            {/* SECCIÓN ACCESORIOS PARA DESCONECTAR */}
            <section className="shop-section reveal" id="shop">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">FRESH OUT OF THE WATER</p>
                  <h2>
                    Accesorios para desconectar
                    <span className="sage-dot" />
                  </h2>
                </div>
                <div className="shop-controls">
                  <Link to="/shop?category=Accesorios" viewTransition>
                    SHOP ALL <Icon name="arrow" size={17} />
                  </Link>
                  <button
                    aria-label="Productos anteriores"
                    onClick={() =>
                      rail.current?.scrollBy({ left: -360, behavior: "smooth" })
                    }
                  >
                    ←
                  </button>
                  <button
                    aria-label="Más productos"
                    onClick={() =>
                      rail.current?.scrollBy({ left: 360, behavior: "smooth" })
                    }
                  >
                    →
                  </button>
                </div>
              </div>

              <div className="product-rail" id="products" ref={rail}>
                {accessoryProducts.map(({ product, index }) => (
                  <button
                    className="product"
                    key={product.id || `${product.name}-${index}`}
                    onClick={() => setSelected(index)}
                  >
                    <div className="product-photo">
                      {product.isNew && <span className="new-tag">NEW</span>}
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                      <img
                        className="lifestyle"
                        src={product.lifestyle}
                        alt={`${product.name}: inspiración lifestyle`}
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
                ))}
              </div>
            </section>

            <Collections embedded />

            {/* SECCIÓN STORIES CON EL VIDEO DE YOUTUBE */}
            <section className="stories reveal" id="stories">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">POSTCARDS FROM OUT THERE</p>
                  <h2>Beyond the shore.</h2>
                </div>
                <span className="small-label">
                  STORIES / FILMS / GOOD TIMES
                </span>
              </div>
              <div className="story-grid">
                <button className="story" onClick={() => setPanel("story")}>
                  <div className="story-photo">
                    <img
                      src={surf}
                      alt="Un viaje de surf en una playa tranquila"
                      loading="lazy"
                    />
                    <span className="story-pill">SURF TRIPS</span>
                    <span className="story-arrow">↗</span>
                  </div>
                  <p>ON THE ROAD · 5 MIN READ</p>
                  <h3>A ningún sitio. Y a todas partes.</h3>
                </button>
                <button className="story" onClick={() => setVideo(true)}>
                  <div className="story-photo">
                    <img
                      src={photo("1606072272503-fa96b4201679")}
                      alt="Atardecer dorado sobre el océano"
                      loading="lazy"
                    />
                    <span className="story-pill">GONE SURFING FILMS</span>
                    <span className="play">▶</span>
                  </div>
                  <p>YOUTUBE · THE SLOW DAYS</p>
                  <h3>Una pausa. Una ola. Repetir.</h3>
                </button>
              </div>
            </section>
          </>
        )}

        {(location.pathname === "/shop" ||
          location.pathname.startsWith("/colecciones/")) && (
          <Catalog products={products} onSelect={setSelected} />
        )}

        {isCollections && <Collections />}

        {location.pathname === "/checkout" && (
          <Checkout
            products={products}
            cart={cart}
            onComplete={(confirmed) => {
              const correoCliente = (confirmed.customerEmail || "").trim().toLowerCase()
              const nombreCliente = confirmed.customerName || "Cliente Gone Surfing"

              // Consulta de clientes registrados para decidir envío de correos
              const registrados: string[] = JSON.parse(
                localStorage.getItem("gs_clientes_registrados") || "[]"
              )
              const esPrimeraCompra = Boolean(correoCliente && !registrados.includes(correoCliente))

              if (esPrimeraCompra && correoCliente) {
                // PRIMERA COMPRA: Registrar cliente y enviar 2 correos
                registrados.push(correoCliente)
                localStorage.setItem("gs_clientes_registrados", JSON.stringify(registrados))

                despacharCorreoNotificacion({
                  toEmail: correoCliente,
                  customerName: nombreCliente,
                  orderNumber: confirmed.number,
                  total: confirmed.total,
                  tipoCorreo: "boleta",
                })
                despacharCorreoNotificacion({
                  toEmail: correoCliente,
                  customerName: nombreCliente,
                  orderNumber: confirmed.number,
                  total: confirmed.total,
                  tipoCorreo: "bienvenida",
                })
              } else if (correoCliente) {
                // SEGUNDA COMPRA (O RECURRENTE): Enviar únicamente la boleta
                despacharCorreoNotificacion({
                  toEmail: correoCliente,
                  customerName: nombreCliente,
                  orderNumber: confirmed.number,
                  total: confirmed.total,
                  tipoCorreo: "boleta",
                })
              }

              // Registrar en caja con todos los datos detallados
              addSale({
                number: confirmed.number,
                date: new Date().toISOString(),
                detail: confirmed.items
                  .map((item) => `${products[item.index]?.name} (${item.size})`)
                  .join(", "),
                units: confirmed.items.length,
                subtotal: confirmed.subtotal,
                tax: confirmed.tax,
                total: confirmed.total,
                distrito: confirmed.district || "San Bartolo",
                direccion: confirmed.address || "Dirección de entrega",
                cliente: nombreCliente,
              })

              setOrder(confirmed)
              setCart([])
              navigate("/confirmation")
            }}
          />
        )}

        {location.pathname === "/confirmation" && (
          <Confirmation products={products} order={order} />
        )}

        {location.pathname === "/about" && (
          <div className="about-page">
            <section className="culture reveal" id="culture">
              <div className="culture-copy">
                <p className="eyebrow">NOT JUST A BRAND. A WAY OUT.</p>
                <h2>
                  Somewhere
                  <br />
                  with no
                  <br />
                  <em>signal.</em>
                </h2>
                <p>
                  No hacemos planes. Seguimos la marea. Ropa para los que
                  prefieren perderse, encontrar una ola y quedarse un poco más.
                </p>
                <Link className="text-link" to="/#stories">
                  THIS IS GONE SURFING <Icon name="arrow" />
                </Link>
                <span className="coordinates">
                  28°24′ N &nbsp; 16°33′ W &nbsp; / &nbsp; ALWAYS WANDERING
                </span>
              </div>
              <div className="culture-photo">
                <img
                  src={photo("1559628234-d70bb7959a92")}
                  alt="Surfista buscando su próxima ola"
                  loading="lazy"
                />
                <span>LESS CONNECTED. MORE ALIVE.</span>
              </div>
            </section>
          </div>
        )}

        {![
          "/",
          "/shop",
          "/collections",
          "/about",
          "/checkout",
          "/confirmation",
        ].includes(location.pathname) &&
          !location.pathname.startsWith("/colecciones/") && (
            <section className="not-found">
              <p className="eyebrow">OFF THE MAP</p>
              <h1>Esta ola no existe.</h1>
              <Link to="/" viewTransition>
                VOLVER AL INICIO →
              </Link>
            </section>
          )}

        {!isCollections && !isCheckout && (
          <section className="newsletter">
            <div>
              <p className="eyebrow">LET'S KEEP IN TOUCH. SOMETIMES.</p>
              <h2>
                Good waves.
                <br />
                Better company.
              </h2>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                const form = event.currentTarget
                const input = form.elements.namedItem("email") as HTMLInputElement
                const emailVal = input?.value.trim().toLowerCase()

                if (emailVal) {
                  const registrados: string[] = JSON.parse(
                    localStorage.getItem("gs_clientes_registrados") || "[]"
                  )

                  if (!registrados.includes(emailVal)) {
                    registrados.push(emailVal)
                    localStorage.setItem("gs_clientes_registrados", JSON.stringify(registrados))

                    despacharCorreoNotificacion({
                      toEmail: emailVal,
                      customerName: "Miembro de la Comunidad",
                      tipoCorreo: "bienvenida",
                    })
                  }

                  form.reset()
                  setSubscribed(true)
                }
              }}
            >
              <label htmlFor="email">
                Nuevos drops, historias y alguna que otra escapada.
              </label>
              <p className="newsletter-success" role="status">
                {subscribed ? "Ya estás en la lista. Nos vemos en el agua." : ""}
              </p>
              <div className="email-field">
                <input
                  id="email"
                  type="email"
                  placeholder={subscribed ? "" : "Tu email"}
                  required
                  aria-label="Tu email"
                  disabled={subscribed}
                />
                <button aria-label="Suscribirme" disabled={subscribed}>
                  <Icon name="arrow" size={24} />
                </button>
              </div>
              <p>SIN SPAM. SIN RUIDO. SOLO LO BUENO.</p>
            </form>
          </section>
        )}
      </main>

      {!isCollections && !isCheckout && (
        <footer>
          <Link className="footer-brand" to="/" viewTransition>
            GONE SURFING
          </Link>
          <div>
            <Link to="/shop" viewTransition>
              Shop
            </Link>
            <Link to="/about" viewTransition>
              Nuestra historia
            </Link>
            <button onClick={() => setPanel("help")}>
              Envíos y devoluciones
            </button>
            <button onClick={() => setPanel("contact")}>Contacto</button>
          </div>
          <div className="footer-bottom">
            <span>© 2026 GONE SURFING. STAY REAL.</span>
            <span>HECHO PARA DESCONECTAR.</span>
            <span>PERÚ / PEN S/.</span>
          </div>
        </footer>
      )}

      {/* OVERLAY Y DRAWER MODALES */}
      {panel && (
        <div className="overlay" onClick={() => setPanel(null)}>
          <aside
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={panel === "cart" ? "Tu carrito" : panel}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-title">
              <h2>
                {panel === "cart"
                  ? `Tu bolsa (${cart.length})`
                  : panel === "search"
                    ? "Encuentra tu próxima ola."
                    : panel === "menu"
                      ? "GONE SURFING"
                      : panel === "account"
                        ? "La comunidad."
                        : panel === "story"
                          ? "A ningún sitio."
                          : panel === "contact"
                            ? "Hablemos."
                            : "Sin complicaciones."}
              </h2>
              <button
                autoFocus
                aria-label="Cerrar"
                onClick={() => setPanel(null)}
              >
                <Icon name="close" />
              </button>
            </div>

            {panel === "cart" ? (
              <>
                <p className="shipping">
                  {subtotal >= 300
                    ? "Tu envío es gratis."
                    : `Te faltan ${money(300 - subtotal)} para envío gratis.`}
                </p>
                <progress max={300} value={Math.min(subtotal, 300)} />
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <Icon name="bag" size={40} />
                      <h3>Tu próxima aventura empieza aquí.</h3>
                      <p>Tu bolsa está vacía. Vamos a cambiar eso.</p>
                      <button
                        className="dark-button"
                        onClick={() => {
                          setPanel(null)
                          navigate("/shop")
                        }}
                      >
                        EXPLORAR EL DROP <Icon name="arrow" />
                      </button>
                    </div>
                  ) : (
                    cart.map(({ index, size }, position) => (
                      <div className="cart-item" key={position}>
                        <img
                          src={products[index]?.image}
                          alt={products[index]?.name}
                        />
                        <div>
                          <h3>{products[index]?.name}</h3>
                          <p>{products[index]?.color}</p>
                          <p>
                            Talla: {size} · Cantidad: 1
                          </p>
                          <strong>
                            {money(products[index]?.price || 0)}
                          </strong>
                          <button
                            onClick={() =>
                              setCart(
                                cart.filter((_, item) => item !== position),
                              )
                            }
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {cart.length > 0 && (
                  <div className="cart-total">
                    <div>
                      <span>Subtotal</span>
                      <strong>{money(subtotal)}</strong>
                    </div>
                    <button
                      className="dark-button"
                      onClick={() => {
                        setPanel(null)
                        navigate("/checkout")
                      }}
                    >
                      CONTINUAR AL CHECKOUT <span>→</span>
                    </button>
                  </div>
                )}
              </>
            ) : panel === "search" ? (
              <>
                <input
                  autoFocus
                  className="search-input"
                  placeholder="Buscar gorras, camisetas…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {products
                  .map((product, index) => ({ product, index }))
                  .filter(({ product }) =>
                    `${product.name} ${product.color}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map(({ product, index }) => (
                    <button
                      className="search-result"
                      key={product.name}
                      onClick={() => {
                        setPanel(null)
                        setSelected(index)
                      }}
                    >
                      <img src={product.image} alt={product.name} />
                      <span>{product.name}</span>
                      <span>{money(product.price)}</span>
                    </button>
                  ))}
              </>
            ) : panel === "menu" ? (
              <nav className="drawer-nav">
                {[
                  ["SHOP", "/shop"],
                  ["COLLECTIONS", "/collections"],
                  ["ABOUT", "/about"],
                  ["STORIES", "/#stories"],
                ].map(([label, path]) => (
                  <Link
                    key={path}
                    to={path}
                    viewTransition
                    onClick={() => setPanel(null)}
                  >
                    {label}
                    <Icon name="arrow" />
                  </Link>
                ))}
              </nav>
            ) : (
              <div className="info-copy">
                {panel === "account" ? (
                  <>
                    <p>
                      No necesitas una cuenta para formar parte. Suscríbete y
                      entérate primero de los nuevos drops.
                    </p>
                    <button
                      className="dark-button"
                      onClick={() => {
                        setPanel(null)
                        navigate("/#email")
                        setTimeout(() => {
                          const input = document.getElementById("email") as HTMLInputElement
                          if (input) {
                            input.focus()
                            input.scrollIntoView({ behavior: "smooth", block: "center" })
                          }
                        }, 200)
                      }}
                    >
                      UNIRME A LA LISTA <Icon name="arrow" />
                    </button>
                  </>
                ) : panel === "story" ? (
                  <>
                    <img src={surf} alt="Surf trip al atardecer" />
                    <p>
                      Una carretera sin destino, dos tablas y todo el tiempo del
                      mundo. Hay viajes que no se miden en kilómetros, sino en
                      olas.
                    </p>
                  </>
                ) : (
                  <>
                    <h3>Contacto y Envíos</h3>
                    <p>hello@gonesurfing.com</p>
                    <p>Envíos gratis a partir de S/. 300.00.</p>
                  </>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* MODAL DETALLE DE PRODUCTO */}
      {selected !== null && products[selected] && (
        <div
          className="overlay modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-label={products[selected].name}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              autoFocus
              aria-label="Cerrar"
              onClick={() => setSelected(null)}
            >
              <Icon name="close" />
            </button>
            <img src={products[selected].image} alt={products[selected].name} />
            <div>
              <span className="new-tag">NEW DROP</span>
              <h2>{products[selected].name}</h2>
              <p>{products[selected].color}</p>
              <h3>{money(products[selected].price)}</h3>
              <p>
                Para los días sin planes. Esencial costero confeccionado para
                durar.
              </p>
              <fieldset className="size-selector">
                <legend>Elige tu talla</legend>
                <div>
                  {sizeOptions.map((size) => {
                    const currentProd = products[selected]
                    const stockDisponible =
                      currentProd?.sizesStock?.[size] ??
                      (size === "Única" ? currentProd?.stock ?? 10 : 10)
                    const isAgotada = stockDisponible <= 0

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isAgotada}
                        aria-pressed={selectedSize === size}
                        className={`${selectedSize === size ? "selected" : ""} ${
                          isAgotada ? "opacity-30 line-through cursor-not-allowed" : ""
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size === "Única" ? t("Talla única") : size}
                        {isAgotada ? " (Agotada)" : ""}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
              <button
                className="dark-button"
                disabled={!selectedSize}
                onClick={() => {
                  if (!selectedSize) return
                  setCart([...cart, { index: selected, size: selectedSize }])
                  setSelected(null)
                  setPanel("cart")
                }}
              >
                AÑADIR A LA BOLSA <Icon name="arrow" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DEL VIDEO DE YOUTUBE */}
      {video && (
        <div className="overlay modal-overlay" onClick={() => setVideo(false)}>
          <div
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Película de surf"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              autoFocus
              aria-label="Cerrar video"
              onClick={() => setVideo(false)}
            >
              <Icon name="close" />
            </button>
            <iframe
              src={getYouTubeEmbed(youtubeSource)}
              title="Surf film"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  )
}

const router = createBrowserRouter([
  { path: "/admin", Component: Admin },
  { path: "/admin/login", Component: Admin },
  { path: "/admin/collections", Component: Admin },
  {
    Component: Storefront,
    children: [
      { index: true, element: null },
      { path: "shop", element: null },
      { path: "collections", element: null },
      { path: "colecciones/:slug", element: null },
      { path: "about", element: null },
      { path: "checkout", element: null },
      { path: "confirmation", element: null },
      { path: "*", element: null },
    ],
  },
])

export default function App() {
  return (
    <LanguageProvider>
      <StoreData initialProducts={defaultProducts}>
        <RouterProvider router={router} />
      </StoreData>
    </LanguageProvider>
  )
}