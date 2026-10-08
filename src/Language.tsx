import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useState, type ReactElement, type ReactNode } from 'react'

type Locale = 'ES' | 'EN' | 'FR'
const rows: [string, string, string][] = [
  ['El ruido se apaga.', 'The noise fades away.', 'Le bruit s’éteint.'], ['Tu orden', 'Your order', 'Votre commande'], ['está confirmada.', 'is confirmed.', 'est confirmée.'],
  ['ORIGEN', 'ORIGIN', 'ORIGINE'], ['DESTINO', 'DESTINATION', 'DESTINATION'], ['EL RUIDO', 'THE NOISE', 'LE BRUIT'], ['ACCESO', 'ACCESS', 'ACCÈS'], ['ESTADO', 'STATUS', 'STATUT'],
  ['CONFIRMADO / DEMO', 'CONFIRMED / DEMO', 'CONFIRMÉ / DÉMO'], ['RUMBO A LA COSTA', 'BOUND FOR THE COAST', 'EN ROUTE VERS LA CÔTE'], ['RUTA ILUSTRATIVA', 'ILLUSTRATIVE ROUTE', 'ITINÉRAIRE ILLUSTRATIF'],
  ['Tus olas están en camino', 'Your waves are on the way', 'Vos vagues sont en chemin'], ['ESTADO DE ÉXITO SIMULADO', 'SIMULATED SUCCESS STATE', 'ÉTAT DE RÉUSSITE SIMULÉ'],
  ['Mapa ilustrativo de una ruta desde Lima a San Bartolo, sin rastreo en vivo', 'Illustrative route map from Lima to San Bartolo, without live tracking', 'Carte illustrative de Lima à San Bartolo, sans suivi en temps réel'],
  ['Océano y playa al atardecer', 'Ocean and beach at sunset', 'Océan et plage au coucher du soleil'], ['Surfista caminando por la playa al atardecer', 'Surfer walking on the beach at sunset', 'Surfeur marchant sur la plage au coucher du soleil'], ['Surfista entre olas turquesas', 'Surfer among turquoise waves', 'Surfeur parmi les vagues turquoise'],
  ['Ahí fuera es', 'Outside is', 'Dehors est'], ['el único lugar.', 'the only place.', 'le seul endroit.'], ['Nada más', 'Nothing else', 'Rien d’autre'], ['se le parece.', 'comes close.', 'ne s’en approche.'],
  ['PASE DE EMBARQUE A LA COSTA', 'COASTAL BOARDING PASS', 'CARTE D’EMBARQUEMENT CÔTIER'], ['SOLO IDA / OFFLINE', 'ONE WAY / OFFLINE', 'ALLER SIMPLE / OFFLINE'], ['TU PRÓXIMO CAPÍTULO EMPIEZA AQUÍ', 'YOUR NEXT CHAPTER STARTS HERE', 'VOTRE PROCHAIN CHAPITRE COMMENCE ICI'], ['EL OCÉANO TE LLAMA.', 'THE OCEAN IS CALLING.', 'L’OCÉAN VOUS APPELLE.'],
  ['CONTINUAR AL CHECKOUT', 'CONTINUE TO CHECKOUT', 'PASSER AU PAIEMENT'],
  ['Checkout de demostración. Sin cobros reales.', 'Demo checkout. No real charges.', 'Paiement de démonstration. Aucun débit réel.'],
  ['← VOLVER A LA TIENDA', '← BACK TO SHOP', '← RETOUR À LA BOUTIQUE'], ['VOLVER A LA TIENDA', 'BACK TO SHOP', 'RETOUR À LA BOUTIQUE'],
  ['UN PASO MÁS CERCA DEL OCÉANO', 'ONE STEP CLOSER TO THE OCEAN', 'UN PAS DE PLUS VERS L’OCÉAN'], ['Tu próxima ola.', 'Your next wave.', 'Votre prochaine vague.'],
  ['01 CONTACTO', '01 CONTACT', '01 CONTACT'], ['02 ENVÍO', '02 SHIPPING', '02 LIVRAISON'], ['03 PAGO', '03 PAYMENT', '03 PAIEMENT'],
  ['PROTOTIPO / SIN COBROS', 'PROTOTYPE / NO CHARGES', 'PROTOTYPE / AUCUN DÉBIT'],
  ['No ingreses datos reales. Este checkout usa una tarjeta de prueba y no procesa pagos ni envía correos.', 'Do not enter real information. This checkout uses a test card and does not process payments or send emails.', 'Ne saisissez pas de données réelles. Ce paiement utilise une carte de test et ne traite aucun paiement ni e-mail.'],
  ['Información de Contacto', 'Contact Information', 'Coordonnées'], ['Correo electrónico', 'Email address', 'Adresse e-mail'],
  ['Aquí enviaremos tu boleta electrónica y el tiempo estimado de envío', 'We will send your electronic receipt and estimated delivery time here', 'Nous enverrons ici votre reçu électronique et le délai de livraison estimé'],
  ['¿Ya tienes cuenta? Inicia sesión', 'Already have an account? Sign in', 'Déjà un compte ? Connectez-vous'],
  ['El inicio de sesión no está conectado en este prototipo. Puedes continuar sin crear una cuenta.', 'Sign-in is not connected in this prototype. You can continue without an account.', 'La connexion n’est pas activée dans ce prototype. Continuez sans créer de compte.'],
  ['Dirección de Envío', 'Shipping Address', 'Adresse de livraison'], ['Nombre', 'First name', 'Prénom'], ['Apellidos', 'Last name', 'Nom'],
  ['Tu nombre', 'Your first name', 'Votre prénom'], ['Tus apellidos', 'Your last name', 'Votre nom'],
  ['Tipo de Documento', 'Document type', 'Type de document'], ['Número de Documento', 'Document number', 'Numéro de document'],
  ['8 dígitos', '8 digits', '8 chiffres'], ['9 a 12 dígitos', '9 to 12 digits', '9 à 12 chiffres'],
  ['Dirección completa', 'Full address', 'Adresse complète'], ['Calle, número, departamento o referencia', 'Street, number, apartment or reference', 'Rue, numéro, appartement ou indication'],
  ['Distrito / Provincia', 'District / Province', 'District / Province'], ['Ej. Miraflores, Lima', 'E.g. Miraflores, Lima', 'Ex. Miraflores, Lima'], ['Teléfono', 'Phone', 'Téléphone'], ['Ej. 999 999 999', 'E.g. 999 999 999', 'Ex. 999 999 999'],
  ['Métodos de Envío', 'Shipping Methods', 'Modes de livraison'], ['Envío Estándar', 'Standard Shipping', 'Livraison standard'], ['Envío Express', 'Express Shipping', 'Livraison express'],
  ['3-5 días hábiles', '3–5 business days', '3–5 jours ouvrés'], ['24 horas', '24 hours', '24 heures'], ['Gratis', 'Free', 'Offert'],
  ['Pago con Tarjeta', 'Card Payment', 'Paiement par carte'], ['Tarjeta de prueba. No se enviarán ni guardarán estos datos.', 'Test card. These details will not be sent or saved.', 'Carte de test. Ces données ne seront ni envoyées ni enregistrées.'],
  ['Número de Tarjeta', 'Card Number', 'Numéro de carte'], ['Fecha de Vencimiento', 'Expiry Date', 'Date d’expiration'], ['Fecha de Vencimiento (MM/AA)', 'Expiry Date (MM/YY)', 'Date d’expiration (MM/AA)'],
  ['Código CVC', 'CVC Code', 'Code CVC'], ['Nombre del Titular', 'Cardholder Name', 'Nom du titulaire'],
  ['THE GOOD STUFF', 'THE GOOD STUFF', 'LES BONNES CHOSES'], ['Tu pedido.', 'Your order.', 'Votre commande.'], ['Precio unitario', 'Unit price', 'Prix unitaire'],
  ['Costo de Envío', 'Shipping Cost', 'Frais de livraison'], ['IGV (18%)', 'IGV Tax (18%)', 'Taxe IGV (18%)'], ['Total a Pagar', 'Total to Pay', 'Total à payer'], ['Pagar Pedido', 'Pay for Order', 'Payer la commande'],
  ['Resumen estimado de demostración. El cobro y el cálculo fiscal definitivo requieren una pasarela y un backend conectados.', 'Estimated demo summary. Payments and final tax calculations require a connected payment gateway and backend.', 'Récapitulatif estimatif de démonstration. Le paiement et le calcul fiscal définitif nécessitent une passerelle et un backend connectés.'],
  ['TU PRÓXIMA OLA TE ESPERA', 'YOUR NEXT WAVE AWAITS', 'VOTRE PROCHAINE VAGUE VOUS ATTEND'], ['Tu bolsa está vacía.', 'Your bag is empty.', 'Votre panier est vide.'], ['Añade tus favoritos antes de continuar al checkout.', 'Add your favorites before continuing to checkout.', 'Ajoutez vos favoris avant de passer au paiement.'],
  ['Aún no hay un pedido confirmado.', 'No order has been confirmed yet.', 'Aucune commande n’a encore été confirmée.'],
  ['GONE SURFING / CONFIRMACIÓN DE PRUEBA', 'GONE SURFING / TEST CONFIRMATION', 'GONE SURFING / CONFIRMATION DE TEST'],
  ['Olas en camino.', 'Waves on the way.', 'Les vagues arrivent.'], ['ORDEN', 'ORDER', 'COMMANDE'],
  ['Tu pedido está confirmado. Hemos enviado tu boleta y los detalles de seguimiento a tu correo.', 'Your order is confirmed. We have sent your receipt and tracking details to your email.', 'Votre commande est confirmée. Nous avons envoyé votre reçu et les détails de suivi par e-mail.'],
  ['Estado de éxito simulado', 'Simulated success state', 'État de réussite simulé'],
  ['No se ha realizado ningún cobro ni se ha enviado una boleta o correo real.', 'No payment has been charged and no actual receipt or email has been sent.', 'Aucun paiement n’a été débité et aucun reçu ou e-mail réel n’a été envoyé.'],
  ['Total de prueba', 'Test total', 'Total de test'], ['SEGUIR EXPLORANDO', 'KEEP EXPLORING', 'CONTINUER À EXPLORER'],
  ['Idioma', 'Language', 'Langue'], ['HISTORIAS', 'STORIES', 'HISTOIRES'], ['Única', 'One size', 'Taille unique'],
  ['Surfista caminando hacia el océano al atardecer', 'Surfer walking toward the ocean at sunset', 'Surfeur marchant vers l’océan au coucher du soleil'],
  ['Nueva colección de surf junto a la costa', 'New surf collection along the coast', 'Nouvelle collection surf au bord de la côte'],
  ['Modelo con wetsuit surfeando una ola', 'Surfer riding a wave in a wetsuit', 'Surfeur en combinaison sur une vague'],
  ['Surfista buscando su próxima ola en aguas turquesas', 'Surfer finding the next wave in turquoise water', 'Surfeur cherchant sa prochaine vague dans une eau turquoise'],
  ['Un viaje de surf en una playa tranquila', 'A surf trip on a quiet beach', 'Un voyage surf sur une plage tranquille'],
  ['Atardecer dorado sobre el océano', 'Golden sunset over the ocean', 'Coucher de soleil doré sur l’océan'],
  ['Surf trip al atardecer', 'Surf trip at sunset', 'Voyage surf au coucher du soleil'],
  ['Envío gratis a partir de S/. 300.00 de subtotal. Los plazos y tarifas finales se confirmarán cuando abramos la compra online.', 'Free shipping on a subtotal of S/. 300.00 or more. Final rates and delivery times will be confirmed when online checkout opens.', 'Livraison offerte à partir de S/. 300.00 de sous-total. Les délais et tarifs définitifs seront confirmés à l’ouverture du paiement en ligne.'],
  ['TIENDA', 'SHOP', 'BOUTIQUE'], ['COLECCIONES', 'COLLECTIONS', 'COLLECTIONS'], ['NOSOTROS', 'ABOUT', 'À PROPOS'],
  ['DESCONECTAR ES EL NUEVO LUJO', 'OFFLINE IS THE NEW LUXURY', 'DÉCONNECTER EST LE NOUVEAU LUXE'],
  ['MENOS RUIDO. MÁS OCÉANO.', 'LESS NOISE. MORE OCEAN.', 'MOINS DE BRUIT. PLUS D’OCÉAN.'],
  ['NUEVAS OLAS', 'NEW WAVES', 'NOUVELLES VAGUES'], ['PARA LOS DÍAS SIN PLANES.', 'BUILT FOR THE DAYS IN BETWEEN.', 'POUR LES JOURS SANS PROGRAMME.'],
  ['EXPLORA', 'SCROLL TO EXPLORE', 'EXPLORER'], ['JUNTO AL OCÉANO · 2024', 'EST. BY THE OCEAN · 2024', 'AU BORD DE L’OCÉAN · 2024'],
  ['SIN SEÑAL. SIN PROBLEMA.', 'NO SIGNAL. NO PROBLEM.', 'PAS DE RÉSEAU. PAS DE PROBLÈME.'],
  ['HECHO PARA IR A NINGÚN SITIO.', 'MADE TO GO NOWHERE.', 'FAIT POUR ALLER NULLE PART.'],
  ['SAL EN LA PIEL. SÉ TÚ MISMO.', 'STAY SALTY. STAY REAL.', 'DU SEL SUR LA PEAU. RESTEZ VOUS-MÊME.'],
  ['EL ÚLTIMO DROP / 026', 'THE LATEST DROP / 026', 'LE DERNIER DROP / 026'],
  ['Nuevos ingresos', 'New arrivals', 'Nouveautés'], ['RECIÉN SALIDOS DEL AGUA', 'FRESH OUT OF THE WATER', 'TOUT JUSTE SORTIS DE L’EAU'],
  ['LLEVA LA ACTITUD', 'WEAR THE MINDSET', 'PORTEZ L’ESPRIT'],
  ['PARA LOS DÍAS SIN PLANES', 'MADE FOR THE DAYS IN BETWEEN', 'POUR LES JOURS SANS PROGRAMME'],
  ['VER TODO', 'SHOP ALL', 'TOUT VOIR'], ['VER PRODUCTO', 'VIEW PRODUCT', 'VOIR LE PRODUIT'], ['NUEVO', 'NEW', 'NOUVEAU'], ['NUEVO DROP', 'NEW DROP', 'NOUVEAU DROP'],
  ['Accesorios para desconectar', 'Accessories for going offline', 'Accessoires pour déconnecter'],
  ['Accesorios', 'Accessories', 'Accessoires'], ['Todos', 'All', 'Tous'], ['Nuevos Ingresos', 'New Arrivals', 'Nouveautés'], ['Más vendidos', 'Best Sellers', 'Meilleures ventes'],
  ['EL OCÉANO TE LLAMA / DROP 026', 'THE OCEAN IS CALLING / DROP 026', 'L’OCÉAN VOUS APPELLE / DROP 026'],
  ['Sin conexión.', 'Off the grid.', 'Hors réseau.'], ['A tu manera.', 'On your terms.', 'À votre rythme.'],
  ['De la ciudad al agua.', 'From the city to the water.', 'De la ville à l’océan.'], ['Esenciales para vivir a tu ritmo.', 'Essentials for living at your own pace.', 'Des essentiels pour vivre à votre rythme.'],
  ['YA ENCONTRASTE TU ESCAPADA.', "YOU'VE FOUND YOUR WAY OUT.", 'VOUS AVEZ TROUVÉ VOTRE ÉCHAPPÉE.'],
  ['Menos cosas. Más vida.', 'Less stuff. More life.', 'Moins de choses. Plus de vie.'],
  ['HECHO PARA LOS DÍAS SIN PLANES.', 'MADE FOR UNPLANNED DAYS.', 'POUR LES JOURS SANS PROGRAMME.'],
  ['Distintos lugares. La misma actitud.', 'DIFFERENT PLACES. SAME MINDSET.', 'DIFFÉRENTS LIEUX. LE MÊME ESPRIT.'],
  ['Nuestras colecciones.', 'Our collections.', 'Nos collections.'], ['CUATRO FORMAS DE PERDERSE.', 'FOUR WAYS TO GET LOST.', 'QUATRE FAÇONS DE SE PERDRE.'],
  ['SIN PLANES. SOLO MAREAS.', 'NO PLANS. JUST TIDES.', 'SANS PLANS. JUSTE LES MARÉES.'],
  ['ESENCIALES DE LA COSTA', 'COASTAL ESSENTIALS', 'ESSENTIELS DE LA CÔTE'], ['CULTURA SURF', 'SURF CULTURE', 'CULTURE SURF'],
  ['SIN LUGAR AL QUE IR. TODO POR SENTIR.', 'NOWHERE TO BE. EVERYTHING TO FEEL.', 'NULLE PART OÙ ALLER. TOUT À RESSENTIR.'],
  ['DE LA CALLE A LA COSTA', 'STREET TO SHORE', 'DE LA RUE AU RIVAGE'],
  ['QUÉDATE HASTA EL ATARDECER.', 'STAY UNTIL THE SUN GOES DOWN.', 'RESTEZ JUSQU’AU COUCHER DU SOLEIL.'],
  ['LA EDICIÓN DE VERANO', 'THE SUMMER EDIT', 'L’ÉDITION ESTIVALE'], ['EXPLORAR COLECCIÓN', 'EXPLORE COLLECTION', 'EXPLORER LA COLLECTION'],
  ['DÉJATE LLEVAR. ENCUENTRA ALGO.', 'DRIFT A LITTLE. FIND SOMETHING.', 'LAISSEZ-VOUS PORTER. DÉCOUVREZ.'],
  ['POSTALES DE AHÍ FUERA', 'POSTCARDS FROM OUT THERE', 'CARTES POSTALES D’AILLEURS'],
  ['Más allá de la costa.', 'Beyond the shore.', 'Au-delà du rivage.'], ['HISTORIAS / PELÍCULAS / BUENOS MOMENTOS', 'STORIES / FILMS / GOOD TIMES', 'HISTOIRES / FILMS / BONS MOMENTS'],
  ['VIAJES DE SURF', 'SURF TRIPS', 'VOYAGES SURF'], ['EN LA CARRETERA · 5 MIN DE LECTURA', 'ON THE ROAD · 5 MIN READ', 'SUR LA ROUTE · 5 MIN DE LECTURE'],
  ['A ningún sitio. Y a todas partes.', 'Nowhere. And everywhere.', 'Nulle part. Et partout.'], ['Una pausa. Una ola. Repetir.', 'One break. One wave. Repeat.', 'Une pause. Une vague. Recommencer.'],
  ['HABLEMOS. DE VEZ EN CUANDO.', "LET'S KEEP IN TOUCH. SOMETIMES.", 'RESTONS EN CONTACT. PARFOIS.'],
  ['Buenas olas.', 'Good waves.', 'De belles vagues.'], ['Mejor compañía.', 'Better company.', 'Encore mieux ensemble.'],
  ['Nuevos drops, historias y alguna que otra escapada.', 'New drops, stories and the occasional escape.', 'Nouveaux drops, histoires et quelques escapades.'],
  ['Ya estás en la lista. Nos vemos en el agua.', "You're on the list. See you in the water.", 'Vous êtes sur la liste. À bientôt dans l’eau.'],
  ['Tu email', 'Your email', 'Votre e-mail'], ['Suscribirme', 'Subscribe', 'S’abonner'],
  ['SIN SPAM. SIN RUIDO. SOLO LO BUENO.', 'NO SPAM. NO NOISE. JUST THE GOOD STUFF.', 'PAS DE SPAM. PAS DE BRUIT. JUSTE LE MEILLEUR.'],
  ['Nuestra historia', 'Our story', 'Notre histoire'], ['Envíos y devoluciones', 'Shipping & returns', 'Livraison et retours'], ['Contacto', 'Contact', 'Contact'],
  ['HECHO PARA DESCONECTAR.', 'MADE TO DISCONNECT.', 'FAIT POUR DÉCONNECTER.'], ['PERÚ / PEN S/.', 'PERU / PEN S/.', 'PÉROU / PEN S/.'],
  ['Abrir menú', 'Open menu', 'Ouvrir le menu'], ['Buscar', 'Search', 'Rechercher'], ['Cuenta', 'Account', 'Compte'], ['Tu carrito', 'Your cart', 'Votre panier'],
  ['Encuentra tu próxima ola.', 'Find your next wave.', 'Trouvez votre prochaine vague.'], ['La comunidad.', 'The community.', 'La communauté.'],
  ['A ningún sitio.', 'Nowhere.', 'Nulle part.'], ['Hablemos.', "Let's talk.", 'Parlons-en.'], ['Sin complicaciones.', 'Keep it simple.', 'Tout simplement.'],
  ['Cerrar', 'Close', 'Fermer'], ['Tu envío es gratis.', 'Your shipping is free.', 'Votre livraison est offerte.'],
  ['Progreso hacia envío gratis', 'Progress toward free shipping', 'Progression vers la livraison offerte'],
  ['Tu próxima aventura empieza aquí.', 'Your next adventure starts here.', 'Votre prochaine aventure commence ici.'],
  ['Tu bolsa está vacía. Vamos a cambiar eso.', "Your bag is empty. Let's change that.", 'Votre panier est vide. Changeons cela.'],
  ['EXPLORAR EL DROP', 'EXPLORE THE DROP', 'EXPLORER LE DROP'], ['Eliminar', 'Remove', 'Supprimer'], ['Subtotal', 'Subtotal', 'Sous-total'],
  ['Los impuestos se confirman únicamente en el checkout final.', 'Taxes are confirmed only at final checkout.', 'Les taxes sont confirmées uniquement à la validation finale.'],
  ['Selección guardada durante esta visita. La compra online estará disponible próximamente.', 'Your selection is saved for this visit. Online checkout is coming soon.', 'Votre sélection est conservée pour cette visite. Le paiement en ligne arrive bientôt.'],
  ['Buscar gorras, camisetas…', 'Search caps, tees…', 'Rechercher casquettes, t-shirts…'], ['Busca por nombre o color del producto.', 'Search by product name or color.', 'Recherchez par nom ou couleur.'],
  ['UNIRME A LA LISTA', 'JOIN THE LIST', 'REJOINDRE LA LISTE'],
  ['No necesitas una cuenta para formar parte. Suscríbete y entérate primero de los nuevos drops.', 'No account needed to belong. Subscribe for first access to new drops.', 'Pas besoin de compte pour nous rejoindre. Abonnez-vous pour découvrir les nouveaux drops en premier.'],
  ['Para preguntas, colaboraciones o simplemente compartir una buena ola.', 'For questions, collaborations or simply sharing a good wave.', 'Pour des questions, collaborations ou simplement partager une belle vague.'],
  ['Envíos', 'Shipping', 'Livraison'], ['Devoluciones', 'Returns', 'Retours'],
  ['¿Necesitas ayuda con tu pedido? Escríbenos a hello@gonesurfing.com.', 'Need help with your order? Write to hello@gonesurfing.com.', 'Besoin d’aide avec votre commande ? Écrivez à hello@gonesurfing.com.'],
  ['Cerrar producto', 'Close product', 'Fermer le produit'], ['Elige tu talla', 'Choose your size', 'Choisissez votre taille'],
  ['Selecciona una talla para continuar.', 'Select a size to continue.', 'Sélectionnez une taille pour continuer.'], ['Talla única', 'One size', 'Taille unique'],
  ['AÑADIR A LA BOLSA', 'ADD TO BAG', 'AJOUTER AU PANIER'],
  ['Para los días sin planes. Un esencial relajado que te acompaña de la ciudad a la costa.', 'For unplanned days. A laid-back essential from the city to the coast.', 'Pour les jours sans programme. Un essentiel décontracté, de la ville à la côte.'],
  ['Colección anterior', 'Previous collection', 'Collection précédente'], ['Colección siguiente', 'Next collection', 'Collection suivante'],
  ['Productos anteriores', 'Previous products', 'Produits précédents'], ['Más productos', 'More products', 'Plus de produits'],
  ['Colecciones', 'Collections', 'Collections'], ['Colecciones de Gone Surfing', 'Gone Surfing collections', 'Collections Gone Surfing'], ['carrusel', 'carousel', 'carrousel'],
  ['Filtrar catálogo', 'Filter catalog', 'Filtrer le catalogue'], ['Cerrar video', 'Close video', 'Fermer la vidéo'], ['Película de surf', 'Surf film', 'Film de surf'],
  ['FUERA DEL MAPA', 'OFF THE MAP', 'HORS CARTE'], ['Esta ola no existe.', "This wave doesn't exist.", 'Cette vague n’existe pas.'], ['VOLVER AL INICIO →', 'BACK HOME →', 'RETOUR À L’ACCUEIL →'],
  ['NO ES SOLO UNA MARCA. ES UNA ESCAPADA.', 'NOT JUST A BRAND. A WAY OUT.', 'PLUS QU’UNE MARQUE. UNE ÉCHAPPÉE.'],
  ['Algún lugar', 'Somewhere', 'Quelque part'], ['sin', 'with no', 'sans'], ['señal.', 'signal.', 'réseau.'],
  ['No hacemos planes. Seguimos la marea. Ropa para los que prefieren perderse, encontrar una ola y quedarse un poco más.', "We don't make plans. We follow the tide. Clothing for those who'd rather get lost, find a wave and stay a little longer.", 'Pas de plans. Nous suivons la marée. Des vêtements pour ceux qui préfèrent se perdre, trouver une vague et rester un peu plus longtemps.'],
  ['ESTO ES GONE SURFING', 'THIS IS GONE SURFING', 'VOICI GONE SURFING'], ['MENOS CONEXIÓN. MÁS VIDA.', 'LESS CONNECTED. MORE ALIVE.', 'MOINS CONNECTÉS. PLUS VIVANTS.'],
  ['Una carretera sin destino, dos tablas y todo el tiempo del mundo. Hay viajes que no se miden en kilómetros, sino en olas.', 'A road with no destination, two boards and all the time in the world. Some trips are measured not in miles, but in waves.', 'Une route sans destination, deux planches et tout le temps du monde. Certains voyages se mesurent en vagues, pas en kilomètres.'],
  ['Salimos antes del amanecer. Sin notificaciones ni itinerario. Solo la costa, los amigos y la promesa de un baño más. Eso es Gone Surfing.', 'We left before dawn. No notifications, no itinerary. Just the coast, friends and the promise of one more session. That is Gone Surfing.', 'Départ avant l’aube. Sans notifications ni itinéraire. Juste la côte, les amis et une dernière session. Voilà Gone Surfing.'],
  ['Única · Ajustable', 'One size · Adjustable', 'Taille unique · Réglable'], ['M · Relaxed fit', 'M · Relaxed fit', 'M · Coupe ample'],
  ['Chalk / Algodón orgánico', 'Chalk / Organic cotton', 'Craie / Coton biologique'], ['Asphalt / Neopreno 3/2 mm', 'Asphalt / 3/2 mm Neoprene', 'Asphalte / Néoprène 3/2 mm'], ['Black / Neopreno 4/3 mm', 'Black / 4/3 mm Neoprene', 'Noir / Néoprène 4/3 mm'],
  ['Stone / Unstructured', 'Stone / Unstructured', 'Pierre / Non structurée'], ['Washed black / Relaxed fit', 'Washed black / Relaxed fit', 'Noir délavé / Coupe ample'], ['Chalk / Unstructured', 'Chalk / Unstructured', 'Craie / Non structurée'], ['Golden / Everyday essentials', 'Golden / Everyday essentials', 'Doré / Essentiels du quotidien'],
  ['Salvia / Algodón suave', 'Sage / Soft cotton', 'Sauge / Coton doux'], ['Negro / Mochila 25 L', 'Black / 25 L backpack', 'Noir / Sac à dos 25 L'],
]
const aliases: Record<string, string> = { SHOP: 'TIENDA', COLLECTIONS: 'COLECCIONES', ABOUT: 'NOSOTROS', Shop: 'TIENDA', 'Best Sellers': 'Más vendidos', 'VER PRODUCTO': 'VER PRODUCTO', STORIES: 'HISTORIAS' }
const LanguageContext = createContext<{ language: Locale; setLanguage: (language: Locale) => void } | null>(null)

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Locale>(() => { try { const stored = localStorage.getItem('gone-surfing-language'); return stored === 'EN' || stored === 'FR' ? stored : 'ES' } catch { return 'ES' } })
  useEffect(() => { document.documentElement.lang = language.toLowerCase(); try { localStorage.setItem('gone-surfing-language', language) } catch {} }, [language])
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is required')
  const position = { ES: 0, EN: 1, FR: 2 }[context.language]
  const t = (text: string): string => {
    const normalized = text.replace(/\s+/g, ' ').trim()
    const source = aliases[normalized] || normalized
    const row = rows.find(entry => entry.includes(source))
    if (row) return row[position]
    const count = normalized.match(/^(?:Tu bolsa \((\d+)\)|Carrito, (\d+) artículos|(\d+) PRODUCTOS)$/)
    if (count) { const amount = count[1] || count[2] || count[3]; return count[3] ? `${amount} ${['PRODUCTOS', 'PRODUCTS', 'PRODUITS'][position]}` : count[2] ? `${['Carrito', 'Cart', 'Panier'][position]}, ${amount}` : `${['Tu bolsa', 'Your bag', 'Votre panier'][position]} (${amount})` }
    if (normalized.startsWith('Te faltan S/.')) return normalized.replace('Te faltan', ['Te faltan', 'You need', 'Il vous manque'][position]).replace('para envío gratis.', ['para envío gratis.', 'for free shipping.', 'pour la livraison offerte.'][position])
    if (normalized.startsWith('Ver ')) return `${['Ver', 'View', 'Voir'][position]} ${normalized.slice(4)}`
    if (normalized.includes(': inspiración lifestyle en la costa')) return normalized.replace(': inspiración lifestyle en la costa', [': inspiración lifestyle en la costa', ': coastal lifestyle inspiration', ' : inspiration lifestyle sur la côte'][position])
    if (normalized.endsWith(' en la costa')) return normalized.replace(' en la costa', [' en la costa', ' on the coast', ' sur la côte'][position])
    if (normalized.includes('ALWAYS WANDERING')) return normalized.replace('ALWAYS WANDERING', ['SIEMPRE EXPLORANDO', 'ALWAYS WANDERING', 'TOUJOURS EN EXPLORATION'][position])
    if (normalized === 'Talla:') return ['Talla:', 'Size:', 'Taille :'][position]
    if (normalized === '· Cantidad: 1') return ['· Cantidad: 1', '· Quantity: 1', '· Quantité : 1'][position]
    if (normalized === 'Precio unitario:') return ['Precio unitario:', 'Unit price:', 'Prix unitaire :'][position]
    return text
  }
  const translate = (node: ReactNode): ReactNode => Children.map(node, child => {
    if (typeof child === 'string') {
      const translated = t(child)
      if (translated === child) return child
      return `${child.match(/^\s*/)?.[0] || ''}${translated}${child.match(/\s*$/)?.[0] || ''}`
    }
    if (!isValidElement(child)) return child
    const element = child as ReactElement<Record<string, unknown>>
    const props: Record<string, unknown> = {}
    for (const attribute of ['aria-label', 'aria-roledescription', 'placeholder', 'alt', 'title']) if (typeof element.props[attribute] === 'string') props[attribute] = t(element.props[attribute] as string)
    if (element.props.children !== undefined) props.children = translate(element.props.children as ReactNode)
    return cloneElement(element, props)
  })
  return { ...context, t, translate }
}
