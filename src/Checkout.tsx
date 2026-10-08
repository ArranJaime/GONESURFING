import { useState } from 'react'
import { Link } from 'react-router'
import { money, type Product } from './Catalog'
import { useLanguage } from './Language'

export type CartItem = { index: number; size: string }
export interface DemoOrder {
  number: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export default function Checkout({ products, cart, onComplete }: { products: Product[]; cart: CartItem[]; onComplete: (order: DemoOrder) => void }) {
  const { translate, t } = useLanguage()
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [documentType, setDocumentType] = useState('DNI')
  const [loginNotice, setLoginNotice] = useState(false)
  const subtotalCents = cart.reduce((sum, item) => sum + Math.round(products[item.index].price * 100), 0)
  const shippingCents = shippingMethod === 'express' ? 3000 : subtotalCents >= 30000 ? 0 : 1500
  const taxCents = Math.round(subtotalCents * .18)
  const totalCents = subtotalCents + shippingCents + taxCents

  if (!cart.length) return translate(<section className="checkout-empty"><span className="eyebrow">TU PRÓXIMA OLA TE ESPERA</span><h1>Tu bolsa está vacía.</h1><p>Añade tus favoritos antes de continuar al checkout.</p><Link className="dark-button" to="/shop">EXPLORAR EL DROP <span>→</span></Link></section>)

  return translate(<section className="checkout-page">
    <div className="checkout-form-column">
      <Link className="checkout-back" to="/shop">← VOLVER A LA TIENDA</Link>
      <div className="checkout-heading"><p className="eyebrow">UN PASO MÁS CERCA DEL OCÉANO</p><h1>Tu próxima ola.</h1><div className="checkout-steps"><span>01 CONTACTO</span><span>02 ENVÍO</span><span>03 PAGO</span></div></div>
      <div className="demo-notice"><span>PROTOTIPO / SIN COBROS</span><p>No ingreses datos reales. Este checkout usa una tarjeta de prueba y no procesa pagos ni envía correos.</p></div>
      <form id="checkout-form" onSubmit={event => {
        event.preventDefault()
        onComplete({ number: `GS-${Date.now().toString(36).toUpperCase()}`, items: cart.map(item => ({ ...item })), subtotal: subtotalCents / 100, shipping: shippingCents / 100, tax: taxCents / 100, total: totalCents / 100 })
      }}>
        <section className="checkout-form-section"><div className="checkout-section-title"><span>01</span><h2>Información de Contacto</h2></div>
          <label className="checkout-field contact-email">Correo electrónico<input type="email" name="email" placeholder="tu@email.com" autoComplete="off" required aria-describedby="email-help"/></label>
          <p className="field-help" id="email-help">Aquí enviaremos tu boleta electrónica y el tiempo estimado de envío</p>
          <button className="login-link" type="button" onClick={() => setLoginNotice(!loginNotice)}>¿Ya tienes cuenta? Inicia sesión <span>↗</span></button>
          {loginNotice && <p className="login-notice" role="status">El inicio de sesión no está conectado en este prototipo. Puedes continuar sin crear una cuenta.</p>}
        </section>
        <section className="checkout-form-section"><div className="checkout-section-title"><span>02</span><h2>Dirección de Envío</h2></div>
          <div className="checkout-fields-grid">
            <label className="checkout-field">Nombre<input name="firstName" placeholder="Tu nombre" autoComplete="off" required maxLength={60}/></label>
            <label className="checkout-field">Apellidos<input name="lastName" placeholder="Tus apellidos" autoComplete="off" required maxLength={90}/></label>
            <label className="checkout-field">Tipo de Documento<select value={documentType} onChange={event => setDocumentType(event.target.value)} name="documentType"><option value="DNI">DNI</option><option value="CE">CE</option></select></label>
            <label className="checkout-field">Número de Documento<input name="documentNumber" inputMode="numeric" placeholder={documentType === 'DNI' ? '8 dígitos' : '9 a 12 dígitos'} pattern={documentType === 'DNI' ? '[0-9]{8}' : '[0-9]{9,12}'} maxLength={documentType === 'DNI' ? 8 : 12} autoComplete="off" required/></label>
            <label className="checkout-field full-width">Dirección completa<input name="address" placeholder="Calle, número, departamento o referencia" autoComplete="off" required maxLength={180}/></label>
            <label className="checkout-field">Distrito / Provincia<input name="district" placeholder="Ej. Miraflores, Lima" autoComplete="off" required maxLength={100}/></label>
            <label className="checkout-field">Teléfono<input name="phone" type="tel" inputMode="tel" placeholder="Ej. 999 999 999" pattern="[0-9+ ()-]{9,16}" maxLength={16} autoComplete="off" required/></label>
          </div>
          <fieldset className="shipping-options"><legend>Métodos de Envío</legend>
            <label className={shippingMethod === 'standard' ? 'selected' : ''}><input type="radio" name="shipping" value="standard" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')}/><span><strong>Envío Estándar</strong><small>3-5 días hábiles</small></span><strong>{subtotalCents >= 30000 ? t('Gratis') : money(15)}</strong></label>
            <label className={shippingMethod === 'express' ? 'selected' : ''}><input type="radio" name="shipping" value="express" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')}/><span><strong>Envío Express</strong><small>24 horas</small></span><strong>{money(30)}</strong></label>
          </fieldset>
        </section>
        <section className="checkout-form-section payment-section"><div className="checkout-section-title"><span>03</span><h2>Pago con Tarjeta</h2><span className="payment-brands">VISA / MC</span></div><p className="field-help">Tarjeta de prueba. No se enviarán ni guardarán estos datos.</p>
          <div className="checkout-fields-grid"><label className="checkout-field full-width">Número de Tarjeta<input inputMode="numeric" defaultValue="4242 4242 4242 4242" pattern="4242 ?4242 ?4242 ?4242" maxLength={19} required autoComplete="off" aria-label="Número de Tarjeta"/></label><label className="checkout-field">Fecha de Vencimiento<input defaultValue="12/30" inputMode="numeric" pattern="(0[1-9]|1[0-2])/[0-9]{2}" maxLength={5} placeholder="MM/AA" required autoComplete="off" aria-label="Fecha de Vencimiento (MM/AA)"/></label><label className="checkout-field">Código CVC<input defaultValue="123" inputMode="numeric" pattern="[0-9]{3,4}" maxLength={4} required autoComplete="off" aria-label="Código CVC"/></label><label className="checkout-field full-width">Nombre del Titular<input defaultValue="SURF DEMO" required maxLength={100} autoComplete="off" aria-label="Nombre del Titular"/></label></div>
        </section>
      </form>
      <div className="checkout-bottom-note"><span>GONE SURFING</span><span>MENOS RUIDO. MÁS OCÉANO.</span></div>
    </div>
    <aside className="checkout-summary-column"><div className="checkout-summary"><p className="eyebrow">THE GOOD STUFF</p><h2>Tu pedido.</h2><div className="checkout-summary-items">{cart.map((item, position) => <div className="checkout-summary-item" key={position}><div className="checkout-thumbnail"><img src={products[item.index].image} alt={products[item.index].name}/><span>1</span></div><div><h3>{products[item.index].name}</h3><p>Talla: {item.size}</p><small>Precio unitario</small></div><strong>{money(products[item.index].price)}</strong></div>)}</div><div className="checkout-totals"><div><span>Subtotal</span><strong>{money(subtotalCents / 100)}</strong></div><div><span>Costo de Envío</span><strong>{money(shippingCents / 100)}</strong></div><div><span>IGV (18%)</span><strong>{money(taxCents / 100)}</strong></div><div className="checkout-grand-total"><span>Total a Pagar</span><strong>{money(totalCents / 100)}</strong></div></div><button className="pay-order" type="submit" form="checkout-form">Pagar Pedido <span>→</span></button><p className="checkout-disclaimer">Resumen estimado de demostración. El cobro y el cálculo fiscal definitivo requieren una pasarela y un backend conectados.</p><div className="summary-signoff"><span>stay real</span><p>BUILT FOR THE DAYS IN BETWEEN.</p></div></div></aside>
  </section>)
}

export function Confirmation({ order, products }: { order: DemoOrder | null; products: Product[] }) {
  const { translate, t } = useLanguage()
  if (!order) return translate(<section className="checkout-empty"><h1>Aún no hay un pedido confirmado.</h1><Link className="dark-button" to="/shop">VOLVER A LA TIENDA <span>→</span></Link></section>)
  return translate(<section className="order-confirmation cinematic-confirmation">
    <img className="confirmation-ocean" src="https://images.unsplash.com/photo-1636353990836-b20b196dd41e?auto=format&fit=crop&w=2400&q=85" alt="Océano y playa al atardecer"/>
    <div className="confirmation-vignette"/>
    <div className="cinematic-title"><p className="eyebrow">GONE SURFING / CONFIRMACIÓN DE PRUEBA</p><div className="cinematic-check"><svg viewBox="0 0 32 32" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m7 16 6 6L25 10"/></svg></div><h1>El ruido se apaga.</h1><p>{t('Tu orden')} <strong>#{order.number}</strong> {t('está confirmada.')}</p></div>
    <div className="surf-pass-glass">
      <div className="surf-pass"><div className="pass-header"><span className="pass-brand">GONE SURFING</span><span className="pass-type">COASTAL BOARDING PASS<br/><span>ONE WAY / OFFLINE</span></span></div>
        <div className="pass-destination"><div><span>ORIGEN</span><strong>LIM</strong><p>EL RUIDO</p></div><span className="pass-route-arrow">⟶</span><div><span>DESTINO</span><strong>SBT</strong><p>SAN BARTOLO</p></div><div className="pass-barcode" aria-hidden="true"><span/></div></div>
        <div className="pass-metadata"><div><span>ORDEN</span><strong>{order.number}</strong></div><div><span>ACCESO</span><strong>SURF CULTURE</strong></div><div><span>ESTADO</span><strong>CONFIRMADO / DEMO</strong></div></div>
        <div className="pass-perforation"><span>YOUR NEXT CHAPTER STARTS HERE</span></div>
        <div className="pass-items">{order.items.map((item, position) => <div key={position}><span>{products[item.index].name}<small>{t('Talla:')} {item.size}</small></span><strong>{money(products[item.index].price)}</strong></div>)}</div>
        <div className="pass-total"><span>Total de prueba</span><strong>{money(order.total)}</strong></div>
      </div>
      <div className="tracking-panel"><div className="tracking-header"><span>RUMBO A LA COSTA</span><span>RUTA ILUSTRATIVA</span></div>
        <div className="tracking-map" role="img" aria-label="Mapa ilustrativo de una ruta desde Lima a San Bartolo, sin rastreo en vivo">
          <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><pattern id="map-grid" width="35" height="35" patternUnits="userSpaceOnUse"><path d="M35 0H0V35" fill="none" stroke="#ffffff" strokeOpacity=".045"/></pattern></defs><rect width="600" height="220" fill="#171e1d"/><path d="M0 0H182L191 24 177 55 215 90 201 119 234 152 224 177 253 220H0Z" fill="#0c1518"/><rect width="600" height="220" fill="url(#map-grid)"/><g fill="none" stroke="#5d685f" strokeOpacity=".3" strokeWidth="1"><path d="M200 0 280 62 305 124 383 156 402 220M250 0 338 60 350 140 437 192 460 220M350 0 385 70 437 115 488 220M175 40 600 62M210 93 600 123M230 170 600 193"/><path d="M500 0 445 56 515 110 480 178 538 220M290 8 260 52 299 103 273 172 320 220"/></g><path d="m253 45 31 30 3 30 34 23 9 26 57 24" fill="none" stroke="#b7c4ad" strokeWidth="2" strokeDasharray="5 5"/><circle cx="253" cy="45" r="4" fill="#b7c4ad"/><circle className="map-pin-halo" cx="387" cy="178" r="15" fill="#b7c4ad" fillOpacity=".15"/><circle cx="387" cy="178" r="5" fill="#d6e0cd"/><g fill="#abb2ab" fontFamily="Inter, sans-serif" fontSize="9" letterSpacing="1.5"><text x="270" y="35">LIMA</text><text x="403" y="180">SAN BARTOLO</text><text x="32" y="115" fill="#72838a" fontSize="8">PACIFIC OCEAN</text></g></svg>
          <div className="map-status"><span/><p>Tus olas están en camino</p></div>
        </div>
      </div>
      <div className="pass-demo-note"><span>ESTADO DE ÉXITO SIMULADO</span><p>No se ha realizado ningún cobro ni se ha enviado una boleta o correo real.</p></div>
      <Link className="pass-explore" to="/shop">SEGUIR EXPLORANDO <span>↗</span></Link>
    </div>
    <div className="cinematic-footer"><span>LESS CONNECTED. MORE ALIVE.</span><span className="cinematic-signature">stay real</span><span>THE OCEAN IS CALLING.</span></div>
  </section>)
}
