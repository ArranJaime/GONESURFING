import { useRef, useState, type FormEvent } from "react"
import { Link, Navigate, useLocation, useNavigate } from "react-router"
import { money } from "./Catalog"
import { useStoreData } from "./StoreData"
import "./admin.css"

function Glyph({
  name,
}: {
  name: "upload" | "eye" | "box" | "arrow" | "download"
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "upload" ? (
        <path d="M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6" />
      ) : name === "eye" ? (
        <>
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : name === "box" ? (
        <>
          <path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5m-9 5v9M8 5l9 5" />
        </>
      ) : name === "download" ? (
        <path d="M12 3v13m-5-5 5 5 5-5M4 18v3h16v-3" />
      ) : (
        <path d="M4 12h16m-5-5 5 5-5 5" />
      )}
    </svg>
  )
}
function Upload({
  image,
  onChange,
  cover = false,
}: {
  image: string
  onChange: (value: string) => void
  cover?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState("")
  const [drag, setDrag] = useState(false)
  function receive(file?: File) {
    if (!file) return
    if (
      !(
        cover ? ["image/png", "image/jpeg", "image/webp"] : ["image/png"]
      ).includes(file.type)
    ) {
      setError(
        cover
          ? "Selecciona una imagen PNG, JPG o WebP."
          : "Selecciona una imagen PNG.",
      )
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Máximo 2 MB por imagen para esta demo local.")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      onChange(String(reader.result))
      setError("")
    }
    reader.readAsDataURL(file)
  }
  return (
    <div>
      <button
        type="button"
        className={`admin-upload ${drag ? "dragging" : ""} ${
          image ? "has-image" : ""
        }`}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDrag(true)
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDrag(false)
          receive(e.dataTransfer.files[0])
        }}
      >
        {image ? (
          <img src={image} alt="Vista previa de la imagen seleccionada" />
        ) : (
          <>
            <span className="upload-icon">
              <Glyph name="upload" />
            </span>
            <strong>
              {cover
                ? "Una portada para el próximo capítulo."
                : "Arrastra aquí el PNG de la prenda"}
            </strong>
            <span>o haz clic para explorar</span>
            <small>
              {cover ? "PNG, JPG, WEBP" : "PNG CON FONDO TRANSPARENTE"} · MÁX. 2
              MB
            </small>
          </>
        )}
        {image && <span className="replace-image">Cambiar imagen</span>}
      </button>
      <input
        ref={input}
        type="file"
        accept={cover ? "image/png,image/jpeg,image/webp" : "image/png"}
        hidden
        onChange={(e) => receive(e.target.files?.[0])}
      />
      {error && (
        <p role="alert" className="admin-error">
          {error}
        </p>
      )}
    </div>
  )
}
const slugify = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
export default function Admin() {
  const { products, drops, sales, saveProducts, saveDrops } = useStoreData()
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(
    () => sessionStorage.getItem("gs-admin-demo") || "",
  )
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState("catalog")
  const [image, setImage] = useState("")
  const [cover, setCover] = useState("")
  const [name, setName] = useState("")
  const [notice, setNotice] = useState("")
  const collections = location.pathname === "/admin/collections"
  const today = sales.filter(
    (sale) => new Date(sale.date).toDateString() === new Date().toDateString(),
  )
  if (!session && location.pathname !== "/admin/login")
    return <Navigate to="/admin/login" replace />
  function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = String(new FormData(e.currentTarget).get("email"))
    sessionStorage.setItem("gs-admin-demo", email)
    setSession(email)
    navigate("/admin")
  }
  function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!image) {
      setNotice("Sube el PNG de la prenda antes de publicar.")
      return
    }
    const data = new FormData(e.currentTarget)
    const category = String(data.get("category"))
    const saved = saveProducts([
      ...products,
      {
        id: crypto.randomUUID(),
        name: String(data.get("name")).trim(),
        price: Number(data.get("price")),
        stock: Number(data.get("stock")),
        category,
        collection: String(data.get("drop")),
        image,
        lifestyle: image,
        color: "Nuevo drop",
        size: category === "Accesorios" ? "Única" : "M",
        sizes: category === "Accesorios" ? ["Única"] : ["S", "M", "L", "XL"],
        isNew: true,
        bestseller: false,
      },
    ])
    setNotice(
      saved
        ? "Prenda publicada. Ya está disponible en la tienda."
        : "No hay espacio local suficiente. Prueba una imagen más pequeña.",
    )
    if (saved) {
      e.currentTarget.reset()
      setImage("")
    }
  }
  function createDrop(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const slug = slugify(name)
    if (!slug || !cover) {
      setNotice("Añade un nombre válido y una imagen de portada.")
      return
    }
    if (drops.some((drop) => drop.slug === slug)) {
      setNotice("Ya existe una colección con ese identificador.")
      return
    }
    const data = new FormData(e.currentTarget)
    const saved = saveDrops([
      ...drops,
      {
        name: name.trim(),
        slug,
        subtitle: String(data.get("subtitle")),
        image: cover,
        label: "SEASONAL DROP",
        active: data.get("active") === "on",
      },
    ])
    setNotice(
      saved
        ? "Colección creada y sincronizada con el catálogo."
        : "No hay espacio local suficiente. Prueba una portada más pequeña.",
    )
    if (saved) {
      e.currentTarget.reset()
      setName("")
      setCover("")
    }
  }
  function exportCSV() {
    const safe = (value: string | number) =>
      `"${String(value)
        .replace(/^[=+@-]/, "'$&")
        .replaceAll('"', '""')}"`
    const rows = [
      [
        "Ticket",
        "Fecha",
        "Prendas",
        "Subtotal",
        "IGV demo 18%",
        "Total",
        "Estado",
      ],
      ...sales.map((s) => [
        s.number,
        s.date,
        s.detail,
        s.subtotal.toFixed(2),
        s.tax.toFixed(2),
        s.total.toFixed(2),
        "Simulado — sin cobro",
      ]),
    ]
    const url = URL.createObjectURL(
      new Blob(
        ["\uFEFF" + rows.map((row) => row.map(safe).join(";")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      ),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `gone-surfing-caja-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }
  if (location.pathname === "/admin/login")
    return (
      <main className="admin-root admin-login">
        <Link to="/" className="admin-login-brand">
          GONE SURFING<span>INTERNAL STUDIO</span>
        </Link>
        <section className="admin-login-card">
          <span className="admin-kicker">SOLO PARA EL EQUIPO</span>
          <h1>Acceso Administrativo</h1>
          <p>Un espacio para lo que viene después.</p>
          <form onSubmit={login}>
            <label className="admin-field">
              Correo corporativo
              <input
                name="email"
                type="email"
                placeholder="nombre@gonesurfing.pe"
                required
                autoComplete="username"
              />
            </label>
            <label className="admin-field">
              Contraseña
              <span className="admin-password">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Glyph name="eye" />
                </button>
              </span>
            </label>
            <button className="admin-primary" type="submit">
              Ingresar al Panel
              <Glyph name="arrow" />
            </button>
          </form>
          <p className="admin-demo-note">
            Acceso de demostración: usa un correo y cualquier contraseña de 6
            caracteres. No autentica usuarios reales.
          </p>
        </section>
        <span className="admin-login-bottom">LESS NOISE. MORE CONTROL.</span>
      </main>
    )
  return (
    <div className="admin-root">
      <header className="admin-header">
        <Link to="/" className="admin-brand">
          GONE SURFING<span>ADMINISTRATION / STUDIO</span>
        </Link>
        <div className="admin-header-right">
          <span className="admin-status">
            <i />
            Tienda en línea
          </span>
          <Link to="/">Ver tienda ↗</Link>
          <span className="admin-avatar">{session[0]?.toUpperCase()}</span>
          <div className="admin-user">
            <strong>Administrador</strong>
            <small>{session}</small>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("gs-admin-demo")
              setSession("")
              navigate("/admin/login")
            }}
          >
            Salir
          </button>
        </div>
      </header>
      <nav className="admin-tabs" aria-label="Secciones administrativas">
        <button
          className={tab === "catalog" ? "active" : ""}
          onClick={() => {
            setTab("catalog")
            setNotice("")
          }}
        >
          <Glyph name="box" />
          Gestión de Catálogo
        </button>
        <button
          className={tab === "cash" ? "active" : ""}
          onClick={() => {
            setTab("cash")
            setNotice("")
          }}
        >
          <Glyph name="download" />
          Control de Caja
        </button>
        <span>WORKSPACE 01 / PERÚ</span>
      </nav>
      <main className="admin-main">
        <div className="admin-page-heading">
          <div>
            <p className="admin-kicker">
              BACK OFFICE /{" "}
              {tab === "cash"
                ? "VENTAS"
                : collections
                  ? "COLECCIONES"
                  : "CATÁLOGO"}
            </p>
            <h1>
              {tab === "cash"
                ? "Cada venta, en orden."
                : collections
                  ? "El próximo capítulo."
                  : "Todo empieza con un drop."}
            </h1>
            <p>
              {tab === "cash"
                ? "Una mirada clara a los movimientos de tu tienda."
                : collections
                  ? "Crea historias que conecten tus prendas con el océano."
                  : "Publica prendas, organiza colecciones y mantén todo al día."}
            </p>
          </div>
          {tab === "catalog" ? (
            <Link
              className="admin-outline"
              to={collections ? "/admin" : "/admin/collections"}
            >
              {collections ? "Volver a productos" : "Gestionar colecciones"}
              <Glyph name="arrow" />
            </Link>
          ) : (
            <button className="admin-outline" onClick={exportCSV}>
              <Glyph name="download" />
              Descargar Reporte (CSV)
            </button>
          )}
        </div>
        <div className="admin-demo-banner">
          <span className="admin-dot" />
          MODO DEMOSTRACIÓN
          <span>
            Datos guardados solo en este navegador. Sin autenticación, Stripe ni
            cálculo fiscal backend.
          </span>
        </div>
        {notice && (
          <p className="admin-notice" role="status">
            {notice}
          </p>
        )}
        {tab === "catalog" && !collections && (
          <>
            <form className="admin-panel admin-product-form" onSubmit={publish}>
              <div className="admin-panel-title">
                <span className="admin-step">01</span>
                <div>
                  <h2>Nueva prenda</h2>
                  <p>Del estudio a la tienda, en un solo paso.</p>
                </div>
                <span className="admin-kicker">PRODUCT UPLOAD</span>
              </div>
              <div className="admin-product-columns">
                <Upload image={image} onChange={setImage} />
                <div className="admin-fields">
                  <label className="admin-field wide">
                    Nombre de la Prenda
                    <input
                      name="name"
                      required
                      maxLength={100}
                      placeholder="Ej. Shorebreak Heavy Tee"
                    />
                  </label>
                  <label className="admin-field">
                    Precio en Soles
                    <span className="admin-price">
                      <span>S/.</span>
                      <input
                        name="price"
                        type="number"
                        min="0.01"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </span>
                  </label>
                  <label className="admin-field">
                    Stock disponible
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      required
                      placeholder="0"
                    />
                  </label>
                  <label className="admin-field">
                    Categoría Principal
                    <select name="category">
                      {["Accesorios", "Merch", "Wetsuits", "New Arrivals"].map(
                        (c) => (
                          <option key={c}>{c}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="admin-field">
                    Colección / Drop de Temporada
                    <select name="drop">
                      {drops.map((d) => (
                        <option key={d.slug} value={d.slug}>
                          {d.name}
                          {!d.active ? " · Borrador" : ""}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="admin-form-bottom wide">
                    <small>
                      Los cambios se reflejan en la tienda al publicar.
                    </small>
                    <button className="admin-primary" type="submit">
                      Publicar en la Tienda
                      <Glyph name="arrow" />
                    </button>
                  </div>
                </div>
              </div>
            </form>
            <section className="admin-panel">
              <div className="admin-panel-title">
                <span className="admin-step">02</span>
                <div>
                  <h2>
                    Inventario de prendas{" "}
                    <span className="admin-count">{products.length}</span>
                  </h2>
                  <p>Tu catálogo actual. Edita el stock directamente.</p>
                </div>
                <span className="admin-kicker">LIVE INVENTORY</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>PRODUCTO</th>
                      <th>COLECCIÓN</th>
                      <th>CATEGORÍA</th>
                      <th>PRECIO</th>
                      <th>STOCK</th>
                      <th>ESTADO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .map((p, index) => ({ p, index }))
                      .reverse()
                      .map(({ p, index }) => (
                        <tr key={p.id || index}>
                          <td>
                            <div className="admin-product-cell">
                              <img src={p.image} alt="" />
                              <div>
                                <strong>{p.name}</strong>
                                <small>
                                  {p.id?.startsWith("seed")
                                    ? "CORE ESSENTIAL"
                                    : "NEW DROP"}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            {drops.find((d) => d.slug === p.collection)?.name ||
                              "Regular"}
                          </td>
                          <td>
                            <span className="admin-category">{p.category}</span>
                          </td>
                          <td>{money(p.price)}</td>
                          <td>
                            <input
                              className="admin-stock"
                              aria-label={`Stock de ${p.name}`}
                              type="number"
                              min="0"
                              step="1"
                              value={p.stock ?? 0}
                              onChange={(e) => {
                                const stock = Number(e.target.value)
                                if (
                                  Number.isInteger(stock) &&
                                  stock >= 0 &&
                                  !saveProducts(
                                    products.map((item, i) =>
                                      i === index ? { ...item, stock } : item,
                                    ),
                                  )
                                )
                                  setNotice(
                                    "No se pudo guardar el stock: almacenamiento lleno.",
                                  )
                              }}
                            />
                          </td>
                          <td>
                            <span
                              className={`admin-badge ${
                                p.stock === 0 ? "muted" : ""
                              }`}
                            >
                              <i />
                              {p.stock === 0 ? "Sin stock" : "Publicado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
        {tab === "catalog" && collections && (
          <>
            <form
              className="admin-panel admin-product-form"
              onSubmit={createDrop}
            >
              <div className="admin-panel-title">
                <span className="admin-step">01</span>
                <div>
                  <h2>Nueva colección</h2>
                  <p>Una portada. Una historia. Un nuevo drop.</p>
                </div>
              </div>
              <div className="admin-product-columns">
                <Upload image={cover} onChange={setCover} cover />
                <div className="admin-fields">
                  <label className="admin-field wide">
                    Nombre de la Colección
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={80}
                      placeholder="Winter Swell 2026"
                    />
                  </label>
                  <label className="admin-field wide">
                    Identificador / Slug
                    <input
                      readOnly
                      value={`/colecciones/${slugify(name)}`}
                      aria-describedby="slug-help"
                    />
                    <small id="slug-help">
                      Generado automáticamente a partir del nombre.
                    </small>
                  </label>
                  <label className="admin-field wide">
                    Subtítulo / Micro-copy
                    <input
                      name="subtitle"
                      required
                      maxLength={120}
                      placeholder="Cold water, heavy sets"
                    />
                  </label>
                  <label className="admin-switch wide">
                    <input type="checkbox" name="active" defaultChecked />
                    <span>
                      Activa en tienda
                      <small>Desactívala para guardar como borrador.</small>
                    </span>
                  </label>
                  <button className="admin-primary wide" type="submit">
                    Crear Colección
                    <Glyph name="arrow" />
                  </button>
                </div>
              </div>
            </form>
            <section className="admin-panel">
              <div className="admin-panel-title">
                <h2>Colecciones / {drops.length}</h2>
                <span className="admin-kicker">THE NEXT CHAPTER</span>
              </div>
              <div className="admin-drop-grid">
                {drops.map((d) => (
                  <article className="admin-drop-card" key={d.slug}>
                    <img src={d.image} alt={d.name} />
                    <div>
                      <small>{d.subtitle}</small>
                      <h3>{d.name}</h3>
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={d.active}
                          onChange={(e) => {
                            if (
                              !saveDrops(
                                drops.map((item) =>
                                  item.slug === d.slug
                                    ? { ...item, active: e.target.checked }
                                    : item,
                                ),
                              )
                            )
                              setNotice("No se pudo guardar el cambio.")
                          }}
                        />
                        {d.active ? "Activa en tienda" : "Borrador (Oculta)"}
                      </label>
                      {d.active && (
                        <Link to={`/colecciones/${d.slug}`}>
                          Ver colección ↗
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
        {tab === "cash" && (
          <>
            <div className="admin-kpis">
              {[
                {
                  label: "Ventas Totales del Día",
                  value: money(today.reduce((sum, s) => sum + s.total, 0)),
                  note: "TOTAL SIMULADO / PEN",
                },
                {
                  label: "Tickets Emitidos Hoy",
                  value: String(today.length).padStart(2, "0"),
                  note: "PEDIDOS DE DEMOSTRACIÓN",
                },
                {
                  label: "Prendas Despachadas",
                  value: String(
                    today.reduce((sum, s) => sum + s.units, 0),
                  ).padStart(2, "0"),
                  note: "UNIDADES / DESPACHO SIMULADO",
                },
              ].map((k, i) => (
                <section className="admin-panel admin-kpi" key={k.label}>
                  <div>
                    <span>{k.label}</span>
                    <span className="admin-step">0{i + 1}</span>
                  </div>
                  <strong>{k.value}</strong>
                  <small>
                    <i />
                    {k.note}
                  </small>
                </section>
              ))}
            </div>
            <section className="admin-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>Registro de transacciones</h2>
                  <p>Pedidos de prueba realizados desde el checkout.</p>
                </div>
                <span className="admin-category">{sales.length} tickets</span>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      {[
                        "ID DE TICKET",
                        "FECHA Y HORA",
                        "PRENDAS VENDIDAS",
                        "SUBTOTAL",
                        "IGV (18%)",
                        "TOTAL COBRADO",
                        "ESTADO",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...sales].reverse().map((s) => (
                      <tr key={s.number}>
                        <td>
                          <strong>#{s.number}</strong>
                        </td>
                        <td>{new Date(s.date).toLocaleString("es-PE")}</td>
                        <td className="admin-sale-detail">{s.detail}</td>
                        <td>{money(s.subtotal)}</td>
                        <td>{money(s.tax)}</td>
                        <td>
                          <strong>{money(s.total)}</strong>
                        </td>
                        <td>
                          <span className="admin-badge">
                            Simulado · sin cobro
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!sales.length && (
                  <div className="admin-empty">
                    <Glyph name="box" />
                    <h3>Todo tranquilo por aquí.</h3>
                    <p>
                      Los pedidos de prueba del checkout aparecerán en este
                      registro.
                    </p>
                    <Link to="/shop">Explorar la tienda →</Link>
                  </div>
                )}
              </div>
              <p className="admin-table-note">
                El total de prueba incluye envío. El IGV es estimado; no se han
                emitido boletas ni recibido pagos por Stripe.
              </p>
            </section>
          </>
        )}
        <footer className="admin-footer">
          <span>GONE SURFING / INTERNAL USE ONLY</span>
          <span>MENOS RUIDO. MÁS CONTROL.</span>
        </footer>
      </main>
    </div>
  )
}
