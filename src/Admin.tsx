import React, { useState, useEffect } from 'react';

// Tipos de datos para el ecosistema GONE SURFING
export interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: 'Accesorios' | 'Merch' | 'Wetsuits' | 'New Arrivals';
  coleccion?: string;
  imagenUrl: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  nombre: string;
  slug: string;
  subtitulo: string;
  portadaUrl: string;
  activa: boolean;
}

export interface Transaction {
  id: string;
  fecha: string;
  detalle: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
}

export default function Admin() {
  // 1. Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // 2. Navegación
  const [activeTab, setActiveTab] = useState<'catalogo' | 'colecciones' | 'caja'>('catalogo');

  // 3. Estados de Colecciones Dinámicas
  const [colecciones, setColecciones] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('gs_colecciones') || localStorage.getItem('gs-drops-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: any, i: number) => ({
            id: c.id || `col-${i + 1}`,
            nombre: c.nombre || c.name || `Colección ${i + 1}`,
            slug: c.slug || (c.nombre || c.name || '').toLowerCase().replace(/\s+/g, '-'),
            subtitulo: c.subtitulo || c.subtitle || '',
            portadaUrl: c.portadaUrl || c.image || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
            activa: c.activa ?? c.active ?? true,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: '1', nombre: 'The slow days', slug: 'the-slow-days', subtitulo: 'No plans. Just tides.', portadaUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80', activa: true },
      { id: '2', nombre: 'Golden hour', slug: 'golden-hour', subtitulo: 'Stay until the sun goes down', portadaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80', activa: true },
      { id: '3', nombre: 'The blue', slug: 'the-blue', subtitulo: 'Less connected. More alive.', portadaUrl: 'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1200&q=80', activa: true }
    ];
  });

  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [nuevaColeccion, setNuevaColeccion] = useState({
    nombre: '',
    slug: '',
    subtitulo: '',
    portadaUrl: '',
    activa: true
  });

  // 4. Estados de Productos
  const [productos, setProductos] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gs_productos') || localStorage.getItem('gs-products-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any, i: number) => ({
            id: p.id || `prod-${i + 1}`,
            nombre: p.nombre || p.name || 'Prenda GONE SURFING',
            precio: Number(p.precio ?? p.price ?? 0),
            stock: Number(p.stock ?? 10),
            categoria: (p.categoria || p.category || 'Accesorios') as Product['categoria'],
            coleccion: p.coleccion || p.collection || '',
            imagenUrl: p.imagenUrl || p.image || '/images/stay-real-cap.png',
            createdAt: p.createdAt || '2026-10-01'
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'prod-1', nombre: 'Stay Real Cap', precio: 100, stock: 24, categoria: 'Accesorios', coleccion: 'The slow days', imagenUrl: '/images/stay-real-cap.png', createdAt: '2026-10-01' },
      { id: 'prod-2', nombre: 'Off Duty Tee', precio: 120, stock: 15, categoria: 'Merch', coleccion: 'Golden hour', imagenUrl: '/images/off-duty-tee.png', createdAt: '2026-10-02' },
      { id: 'prod-3', nombre: 'Leash Pro 6ft', precio: 85, stock: 30, categoria: 'Accesorios', coleccion: 'The blue', imagenUrl: '/images/everyday-cap.png', createdAt: '2026-10-03' }
    ];
  });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    stock: '',
    categoria: 'Accesorios' as Product['categoria'],
    coleccion: '',
    imagenUrl: ''
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  // 5. Estados de Caja
  const [transacciones, setTransacciones] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gs_transacciones') || localStorage.getItem('gs-sales-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any) => ({
            id: t.id || t.number || '#GS-100',
            fecha: t.fecha || t.date || new Date().toLocaleString(),
            detalle: t.detalle || t.detail || 'Prendas surtidas',
            subtotal: Number(t.subtotal || 0),
            igv: Number(t.igv || t.tax || 0),
            total: Number(t.total || 0),
            estado: t.estado || 'Pagado vía Stripe'
          }));
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [
      { id: 'GS-1041', fecha: '08/10/2026 10:14 AM', detalle: '1x Stay Real Cap, 1x Off Duty Tee', subtotal: 186.44, igv: 33.56, total: 220.00, estado: 'Pagado vía Stripe' },
      { id: 'GS-1042', fecha: '08/10/2026 11:32 AM', detalle: '2x Leash Pro 6ft', subtotal: 144.07, igv: 25.93, total: 170.00, estado: 'Pagado vía Stripe' },
      { id: 'GS-1043', fecha: '08/10/2026 12:05 PM', detalle: '1x Off Duty Tee', subtotal: 101.69, igv: 18.31, total: 120.00, estado: 'Pagado vía Stripe' }
    ];
  });

  // Persistencia sincronizada en doble clave y notificación de eventos
  useEffect(() => {
    const serialized = JSON.stringify(colecciones);
    localStorage.setItem('gs_colecciones', serialized);
    localStorage.setItem('gs-drops-v1', serialized);
    window.dispatchEvent(new Event('storage'));
  }, [colecciones]);

  useEffect(() => {
    const serialized = JSON.stringify(productos);
    localStorage.setItem('gs_productos', serialized);
    localStorage.setItem('gs-products-v1', serialized);
    window.dispatchEvent(new Event('storage'));
  }, [productos]);

  useEffect(() => {
    const serialized = JSON.stringify(transacciones);
    localStorage.setItem('gs_transacciones', serialized);
    localStorage.setItem('gs-sales-v1', serialized);
    window.dispatchEvent(new Event('storage'));
  }, [transacciones]);

  // Manejo de Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin666') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  // Subida de imagen PNG
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        file = e.dataTransfer.files[0];
      }
    } else if (e.target.files && e.target.files[0]) {
      file = e.target.files[0];
    }

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setNuevoProducto(prev => ({ ...prev, imagenUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar Producto
  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.stock) {
      alert('Por favor completa los campos requeridos (nombre, precio y stock).');
      return;
    }

    const prod: Product = {
      id: `prod-${Date.now()}`,
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
      stock: parseInt(nuevoProducto.stock),
      categoria: nuevoProducto.categoria,
      coleccion: nuevoProducto.coleccion.trim() || undefined,
      imagenUrl: imagePreview || 'https://via.placeholder.com/600x600/f4f4f4/111111?text=GONE+SURFING',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProductos([prod, ...productos]);
    setNuevoProducto({
      nombre: '',
      precio: '',
      stock: '',
      categoria: 'Accesorios',
      coleccion: '',
      imagenUrl: ''
    });
    setImagePreview('');
    alert('¡Prenda agregada al catálogo exitosamente!');
  };

  // Actualizar stock rápido
  const handleUpdateStock = (id: string, delta: number) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        return { ...p, stock: Math.max(0, p.stock + delta) };
      }
      return p;
    }));
  };

  // Eliminar producto
  const handleDeleteProducto = (id: string) => {
    if (confirm('¿Seguro que deseas retirar este producto de la tienda?')) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  // Control de Colecciones (CRUD)
  const handleToggleColeccion = (id: string) => {
    setColecciones(prev => prev.map(c => 
      c.id === id ? { ...c, activa: !c.activa } : c
    ));
  };

  const handleStartEditColeccion = (col: Collection) => {
    setEditingCollectionId(col.id);
    setNuevaColeccion({
      nombre: col.nombre,
      slug: col.slug,
      subtitulo: col.subtitulo,
      portadaUrl: col.portadaUrl,
      activa: col.activa
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEditColeccion = () => {
    setEditingCollectionId(null);
    setNuevaColeccion({ nombre: '', slug: '', subtitulo: '', portadaUrl: '', activa: true });
  };

  const handleSaveColeccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaColeccion.nombre) return;

    if (editingCollectionId) {
      setColecciones(prev => prev.map(c => 
        c.id === editingCollectionId 
          ? { 
              ...c, 
              nombre: nuevaColeccion.nombre,
              slug: nuevaColeccion.slug.trim() || nuevaColeccion.nombre.toLowerCase().replace(/\s+/g, '-'),
              subtitulo: nuevaColeccion.subtitulo,
              portadaUrl: nuevaColeccion.portadaUrl,
              activa: nuevaColeccion.activa
            }
          : c
      ));
      alert('Colección actualizada con éxito.');
    } else {
      const col: Collection = {
        id: `col-${Date.now()}`,
        nombre: nuevaColeccion.nombre,
        slug: nuevaColeccion.slug.trim() || nuevaColeccion.nombre.toLowerCase().replace(/\s+/g, '-'),
        subtitulo: nuevaColeccion.subtitulo || 'Nueva temporada',
        portadaUrl: nuevaColeccion.portadaUrl || 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
        activa: nuevaColeccion.activa
      };
      setColecciones(prev => [...prev, col]);
      alert(`Colección "${col.nombre}" creada y sincronizada.`);
    }

    handleCancelEditColeccion();
  };

  const handleDeleteColeccion = (id: string) => {
    if (confirm('¿Eliminar esta colección permanentemente?')) {
      setColecciones(prev => prev.filter(c => c.id !== id));
    }
  };

  // Exportar caja en formato CSV
  const handleExportCSV = () => {
    const header = 'ID Ticket,Fecha,Detalle,Subtotal (S/.),IGV 18% (S/.),Total (S/.),Estado\n';
    const rows = transacciones.map(t => 
      `"${t.id}","${t.fecha}","${t.detalle}",${t.subtotal.toFixed(2)},${t.igv.toFixed(2)},${t.total.toFixed(2)},"${t.estado}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cierre_caja_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Limpiar registro de caja diario (evita advertencia de setter no usado)
  const handleLimpiarCaja = () => {
    if (confirm('¿Deseas reiniciar las transacciones registradas del día? Asegúrate de haber exportado el reporte CSV primero.')) {
      setTransacciones([]);
    }
  };

  // Métricas
  const totalRecaudado = transacciones.reduce((acc, t) => acc + t.total, 0);
  const totalIGV = transacciones.reduce((acc, t) => acc + t.igv, 0);

  // VISTA DE LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-[#181818] border border-neutral-800 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black tracking-widest uppercase">GONE SURFING</h1>
            <p className="text-xs text-neutral-400 mt-1 uppercase tracking-wider">Acceso Administrativo Privado</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full bg-[#111111] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7A8B7B] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#111111] border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7A8B7B] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-white text-xs font-bold"
                >
                  {showPassword ? 'OCULTAR' : 'VER'}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-red-400 text-xs font-medium bg-red-950/40 border border-red-800/50 rounded p-2 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-white hover:bg-neutral-200 text-black font-bold uppercase text-xs py-3.5 rounded-lg tracking-wider transition-all duration-200 mt-4 cursor-pointer"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // VISTA DASHBOARD
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-neutral-100 font-sans">
      {/* Navegación Superior */}
      <header className="border-b border-neutral-800 bg-[#141414] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <span className="font-black text-lg tracking-widest uppercase">GONE SURFING</span>
          <span className="text-[10px] bg-[#7A8B7B]/20 text-[#A3B8A4] border border-[#7A8B7B]/40 px-2 py-0.5 rounded font-mono">
            ADMIN LIVE
          </span>
        </div>

        <div className="flex space-x-1 bg-[#1c1c1c] p-1 rounded-lg border border-neutral-800">
          <button
            onClick={() => setActiveTab('catalogo')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${
              activeTab === 'catalogo' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Gestión de Catálogo
          </button>
          <button
            onClick={() => setActiveTab('colecciones')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${
              activeTab === 'colecciones' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Colecciones & Drops
          </button>
          <button
            onClick={() => setActiveTab('caja')}
            className={`px-4 py-2 text-xs font-bold uppercase rounded-md transition-all ${
              activeTab === 'caja' ? 'bg-white text-black shadow' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Control de Caja
          </button>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs text-neutral-400 hover:text-red-400 font-semibold tracking-wider uppercase transition-colors"
        >
          Cerrar Sesión
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        {/* TAB 1: CATÁLOGO */}
        {activeTab === 'catalogo' && (
          <div className="space-y-10">
            {/* Formulario */}
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 text-white border-b border-neutral-800 pb-3">
                Subir Nueva Prenda al Catálogo
              </h2>

              <form onSubmit={handleCrearProducto} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Drag and Drop */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-2">
                    Fotografía PNG (Fondo transparente)
                  </label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-neutral-700 hover:border-[#7A8B7B] bg-[#1a1a1a] rounded-xl h-64 flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors relative overflow-hidden"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(''); setNuevoProducto(prev => ({ ...prev, imagenUrl: '' })); }}
                          className="absolute top-2 right-2 bg-black/70 hover:bg-red-600 text-white rounded-full p-1.5 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-neutral-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-xs text-neutral-300 font-medium">Arrastra aquí el PNG del producto</p>
                        <p className="text-[10px] text-neutral-500 mt-1">o haz clic para explorar archivos</p>
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          onChange={handleFileDrop}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Campos */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Nombre de la Prenda</label>
                    <input
                      type="text"
                      placeholder="Ej. Stay Real Wetsuit 3/2mm"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Precio (S/.)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="120.00"
                        value={nuevoProducto.precio}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Stock Inicial</label>
                      <input
                        type="number"
                        placeholder="25"
                        value={nuevoProducto.stock}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, stock: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Categoría</label>
                      <select
                        value={nuevoProducto.categoria}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value as any })}
                        className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                      >
                        <option value="Accesorios">Accesorios</option>
                        <option value="Merch">Merch</option>
                        <option value="Wetsuits">Wetsuits</option>
                        <option value="New Arrivals">New Arrivals</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">
                        Colección / Drop (Opcional)
                      </label>
                      <select
                        value={nuevoProducto.coleccion}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, coleccion: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                      >
                        <option value="">Ninguna (Catálogo General / Regular)</option>
                        {colecciones
                          .filter(col => col.activa)
                          .map((col) => (
                            <option key={col.id} value={col.nombre}>
                              {col.nombre}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#7A8B7B] hover:bg-[#8da08e] text-black font-bold uppercase text-xs py-3.5 rounded-lg tracking-wider transition-colors cursor-pointer mt-2"
                  >
                    Publicar en la Tienda
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Productos */}
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4">
                Catálogo Actual ({productos.length} Ítems)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Prenda</th>
                      <th className="p-3">Categoría</th>
                      <th className="p-3">Colección</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">Stock Actual</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {productos.map((prod) => (
                      <tr key={prod.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3 flex items-center space-x-3">
                          <img src={prod.imagenUrl} alt={prod.nombre} className="w-10 h-10 object-contain bg-[#222] rounded p-1" />
                          <span className="font-semibold text-white">{prod.nombre}</span>
                        </td>
                        <td className="p-3 text-neutral-300">{prod.categoria}</td>
                        <td className="p-3 text-neutral-400 font-mono">
                          {prod.coleccion ? (
                            <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-200">
                              {prod.coleccion}
                            </span>
                          ) : (
                            <span className="text-neutral-500 italic text-[11px]">General</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-white">S/. {prod.precio.toFixed(2)}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateStock(prod.id, -1)}
                              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer"
                            >
                              -
                            </button>
                            <span className={`font-mono font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-white'}`}>
                              {prod.stock}
                            </span>
                            <button
                              onClick={() => handleUpdateStock(prod.id, 1)}
                              className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteProducto(prod.id)}
                            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLECCIONES Y DROPS */}
        {activeTab === 'colecciones' && (
          <div className="space-y-10">
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  {editingCollectionId ? 'Editar Colección' : 'Crear Nuevo Catálogo / Colección'}
                </h2>
                {editingCollectionId && (
                  <button
                    onClick={handleCancelEditColeccion}
                    className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Cancelar Edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveColeccion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Nombre de la Colección</label>
                  <input
                    type="text"
                    placeholder="Ej. Winter Swell 2026"
                    value={nuevaColeccion.nombre}
                    onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, nombre: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Subtítulo / Micro-copy</label>
                  <input
                    type="text"
                    placeholder="Ej. Heavy barrels and cold dawns"
                    value={nuevaColeccion.subtitulo}
                    onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, subtitulo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">URL Fotografía Cinemática (Portada Coverflow 3D)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={nuevaColeccion.portadaUrl}
                    onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, portadaUrl: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-3 pt-2">
                  <button
                    type="submit"
                    className="bg-white hover:bg-neutral-200 text-black font-bold uppercase text-xs px-6 py-3.5 rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {editingCollectionId ? 'Guardar Cambios de Colección' : 'Crear y Sincronizar Colección'}
                  </button>
                </div>
              </form>
            </div>

            {/* Listado de Colecciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {colecciones.map((col) => (
                <div 
                  key={col.id} 
                  className={`bg-[#141414] border rounded-xl overflow-hidden flex flex-col transition-all ${
                    col.activa ? 'border-neutral-800' : 'border-red-900/40 opacity-60'
                  }`}
                >
                  <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${col.portadaUrl})` }}>
                    <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          col.activa ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-red-950 text-red-400 border border-red-700'
                        }`}>
                          {col.activa ? 'ACTIVA' : 'INACTIVA / OCULTA'}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-white drop-shadow">{col.nombre}</h4>
                    </div>
                  </div>

                  <div className="p-4 bg-[#181818] flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-neutral-400 italic">"{col.subtitulo}"</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">Slug: /{col.slug}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-[11px] font-semibold">
                      <button
                        type="button"
                        onClick={() => handleToggleColeccion(col.id)}
                        className={`py-1.5 px-2 rounded text-center transition-colors cursor-pointer ${
                          col.activa 
                            ? 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300' 
                            : 'bg-emerald-900/50 hover:bg-emerald-800 text-emerald-300'
                        }`}
                      >
                        {col.activa ? 'Desactivar' : 'Activar'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEditColeccion(col)}
                        className="py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-center transition-colors cursor-pointer"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteColeccion(col.id)}
                        className="py-1.5 px-2 bg-neutral-800 hover:bg-red-900/60 text-red-400 rounded text-center transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONTROL DE CAJA */}
        {activeTab === 'caja' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Recaudación Bruta (Día)</p>
                <p className="text-3xl font-black text-white mt-2">S/. {totalRecaudado.toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Total de cobros procesados</p>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">IGV Acumulado (18%)</p>
                <p className="text-3xl font-black text-[#A3B8A4] mt-2">S/. {totalIGV.toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Impuesto fiscal peruano calculado</p>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tickets Emitidos</p>
                <p className="text-3xl font-black text-white mt-2">{transacciones.length}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Órdenes completadas sin incidencias</p>
              </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Historial de Transacciones para Cierre de Caja
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleLimpiarCaja}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold uppercase text-xs px-3.5 py-2.5 rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    Reiniciar Caja
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="bg-[#7A8B7B] hover:bg-[#8da08e] text-black font-bold uppercase text-xs px-4 py-2.5 rounded-lg tracking-wider flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Exportar Reporte (CSV)</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID Ticket</th>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Detalle de Prendas</th>
                      <th className="p-3">Subtotal</th>
                      <th className="p-3">IGV (18%)</th>
                      <th className="p-3 font-bold text-white">Total Cobrado</th>
                      <th className="p-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {transacciones.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="p-3 font-mono font-bold text-white">{tx.id}</td>
                        <td className="p-3 text-neutral-400">{tx.fecha}</td>
                        <td className="p-3 text-neutral-300">{tx.detalle}</td>
                        <td className="p-3 font-mono text-neutral-400">S/. {tx.subtotal.toFixed(2)}</td>
                        <td className="p-3 font-mono text-[#A3B8A4]">S/. {tx.igv.toFixed(2)}</td>
                        <td className="p-3 font-mono font-bold text-white">S/. {tx.total.toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {tx.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}