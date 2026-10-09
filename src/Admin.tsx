import React, { useState, useEffect, useMemo } from 'react';

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: 'Accesorios' | 'Merch' | 'Wetsuits' | 'New Arrivals';
  coleccion?: string;
  imagenUrl: string;
  createdAt: string;
  sizesStock?: Record<string, number>;
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
  distrito?: string;
  direccion?: string;
  cliente?: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'catalogo' | 'colecciones' | 'caja'>('catalogo');

  // Filtros de Caja por Fechas
  const [filtroTiempo, setFiltroTiempo] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'rango'>('todos');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Estados de Colecciones Dinámicas
  const [colecciones, setColecciones] = useState<Collection[]>(() => {
    const saved = localStorage.getItem('gs_colecciones') || localStorage.getItem('gs-drops-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
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

  // Estados de Productos
  const [productos, setProductos] = useState<Product[]>(() => {
    const saved = localStorage.getItem('gs_productos') || localStorage.getItem('gs-products-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) { console.error(e); }
    }
    return [
      { id: 'prod-1', nombre: 'Stay Real Cap', precio: 100, stock: 24, categoria: 'Accesorios', coleccion: 'The slow days', imagenUrl: '/images/stay-real-cap.png', createdAt: '2026-10-01', sizesStock: { 'Única': 24 } },
      { id: 'prod-2', nombre: 'Off Duty Tee', precio: 120, stock: 15, categoria: 'Merch', coleccion: 'Golden hour', imagenUrl: '/images/off-duty-tee.png', createdAt: '2026-10-02', sizesStock: { S: 3, M: 5, L: 5, XL: 2 } },
      { id: 'prod-3', nombre: 'Leash Pro 6ft', precio: 85, stock: 30, categoria: 'Accesorios', coleccion: 'The blue', imagenUrl: '/images/everyday-cap.png', createdAt: '2026-10-03', sizesStock: { 'Única': 30 } }
    ];
  });

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    precio: '',
    categoria: 'Accesorios' as Product['categoria'],
    coleccion: '',
    imagenUrl: '',
    stockS: 10,
    stockM: 15,
    stockL: 15,
    stockXL: 5,
    stockUnica: 25,
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  // Estados de Transacciones con Destino y Dirección
  const [transacciones, setTransacciones] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gs_transacciones') || localStorage.getItem('gs-sales-v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((t: any, i: number) => ({
            id: t.id || t.number || `#GS-${100 + i}`,
            fecha: t.fecha || t.date || new Date().toISOString(),
            detalle: t.detalle || t.detail || 'Prendas surtidas',
            subtotal: Number(t.subtotal || 0),
            igv: Number(t.igv || t.tax || 0),
            total: Number(t.total || 0),
            estado: t.estado || 'Pagado vía Stripe',
            distrito: t.distrito || t.district || (i % 2 === 0 ? 'San Bartolo' : 'Miraflores'),
            direccion: t.direccion || t.address || (i % 2 === 0 ? 'Malecón San Martín 340' : 'Av. Larco 750 Dpto 402'),
            cliente: t.cliente || t.customerName || 'Jaime Monroy'
          }));
        }
      } catch (e) { console.error(e); }
    }
    return [
      { id: 'GS-1041', fecha: '2026-10-08T10:14:00', detalle: '1x Stay Real Cap, 1x Off Duty Tee', subtotal: 186.44, igv: 33.56, total: 220.00, estado: 'Pagado vía Stripe', distrito: 'Miraflores', direccion: 'Av. Larco 820 Dpto 301', cliente: 'Carlos Mendoza' },
      { id: 'GS-1042', fecha: '2026-10-08T11:32:00', detalle: '2x Leash Pro 6ft', subtotal: 144.07, igv: 25.93, total: 170.00, estado: 'Pagado vía Stripe', distrito: 'San Bartolo', direccion: 'Calle Las Olas 142', cliente: 'Alonso Rivera' },
      { id: 'GS-1043', fecha: '2026-10-08T12:05:00', detalle: '1x Off Duty Tee', subtotal: 101.69, igv: 18.31, total: 120.00, estado: 'Pagado vía Stripe', distrito: 'Punta Hermosa', direccion: 'Calle El Silencio 405', cliente: 'Mateo Quispe' }
    ];
  });

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

  // Conversor de Fechas
  const parseFecha = (str: string): Date => {
    if (!str) return new Date();
    const dmyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch;
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    const parsed = new Date(str);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const formatearFechaDisplay = (str: string) => {
    const d = parseFecha(str);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  // Filtrado de Transacciones según el Periodo
  const transaccionesFiltradas = useMemo(() => {
    const ahora = new Date();
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate()).getTime();

    return transacciones.filter(tx => {
      const fechaTx = parseFecha(tx.fecha).getTime();

      if (filtroTiempo === 'hoy') {
        return fechaTx >= inicioHoy;
      }
      if (filtroTiempo === 'semana') {
        const sieteDiasAtras = inicioHoy - 7 * 24 * 60 * 60 * 1000;
        return fechaTx >= sieteDiasAtras;
      }
      if (filtroTiempo === 'mes') {
        const treintaDiasAtras = inicioHoy - 30 * 24 * 60 * 60 * 1000;
        return fechaTx >= treintaDiasAtras;
      }
      if (filtroTiempo === 'rango') {
        const desde = fechaDesde ? new Date(fechaDesde).getTime() : 0;
        const hasta = fechaHasta ? new Date(fechaHasta).getTime() + (24 * 60 * 60 * 1000 - 1) : Infinity;
        return fechaTx >= desde && fechaTx <= hasta;
      }
      return true; // 'todos'
    });
  }, [transacciones, filtroTiempo, fechaDesde, fechaHasta]);

  // Métricas Dinámicas según el Filtro
  const totalRecaudado = transaccionesFiltradas.reduce((acc, t) => acc + t.total, 0);
  const totalIGV = transaccionesFiltradas.reduce((acc, t) => acc + t.igv, 0);

  // Exportar Hoja de Cálculo (CSV Profesional con UTF-8 BOM y Separador Punto y Coma)
  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    const separador = ';';

    const headers = [
      'ID Ticket',
      'Fecha y Hora',
      'Cliente',
      'Distrito',
      'Dirección de Entrega',
      'Detalle de Prendas',
      'Subtotal (S/.)',
      'IGV 18% (S/.)',
      'Total Cobrado (S/.)',
      'Estado'
    ].join(separador);

    const rows = transaccionesFiltradas.map(t => {
      const id = `"${t.id}"`;
      const fecha = `"${formatearFechaDisplay(t.fecha)}"`;
      const cliente = `"${t.cliente || 'No especificado'}"`;
      const distrito = `"${t.distrito || 'Lima'}"`;
      const direccion = `"${t.direccion || 'Dirección registrada'}"`;
      const detalle = `"${t.detalle.replace(/"/g, '""')}"`;
      const subtotal = t.subtotal.toFixed(2);
      const igv = t.igv.toFixed(2);
      const total = t.total.toFixed(2);
      const estado = `"${t.estado}"`;

      return [id, fecha, cliente, distrito, direccion, detalle, subtotal, igv, total, estado].join(separador);
    });

    const csvContent = BOM + headers + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_caja_gone_surfing_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin666') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o contraseña incorrectos.');
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>) => {
    let file: File | undefined;
    if ('dataTransfer' in e) {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) file = e.dataTransfer.files[0];
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

  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      alert('Por favor completa los campos requeridos (nombre y precio).');
      return;
    }

    const isAccesorios = nuevoProducto.categoria === 'Accesorios';
    const sizesStock: Record<string, number> = isAccesorios
      ? { 'Única': Math.max(0, Number(nuevoProducto.stockUnica) || 0) }
      : {
          S: Math.max(0, Number(nuevoProducto.stockS) || 0),
          M: Math.max(0, Number(nuevoProducto.stockM) || 0),
          L: Math.max(0, Number(nuevoProducto.stockL) || 0),
          XL: Math.max(0, Number(nuevoProducto.stockXL) || 0),
        };

    const totalStock = Object.values(sizesStock).reduce((sum, val) => sum + val, 0);

    const prod: Product = {
      id: `prod-${Date.now()}`,
      nombre: nuevoProducto.nombre,
      precio: parseFloat(nuevoProducto.precio),
      stock: totalStock,
      categoria: nuevoProducto.categoria,
      coleccion: nuevoProducto.coleccion.trim() || undefined,
      imagenUrl: imagePreview || 'https://via.placeholder.com/600x600/f4f4f4/111111?text=GONE+SURFING',
      createdAt: new Date().toISOString().split('T')[0],
      sizesStock,
    };

    setProductos([prod, ...productos]);
    setNuevoProducto({
      nombre: '',
      precio: '',
      categoria: 'Accesorios',
      coleccion: '',
      imagenUrl: '',
      stockS: 10,
      stockM: 15,
      stockL: 15,
      stockXL: 5,
      stockUnica: 25,
    });
    setImagePreview('');
    alert('¡Prenda agregada al catálogo exitosamente!');
  };

  const handleUpdateStock = (id: string, delta: number) => {
    setProductos(productos.map(p => {
      if (p.id === id) {
        const nuevoStock = Math.max(0, p.stock + delta);
        let nuevoSizesStock = p.sizesStock ? { ...p.sizesStock } : undefined;
        if (nuevoSizesStock) {
          if (p.categoria === 'Accesorios') {
            nuevoSizesStock['Única'] = nuevoStock;
          } else {
            const tallas = ['S', 'M', 'L', 'XL'];
            const targetKey = delta > 0 ? 'M' : tallas.find(t => (nuevoSizesStock![t] || 0) > 0) || 'M';
            nuevoSizesStock[targetKey] = Math.max(0, (nuevoSizesStock[targetKey] || 0) + delta);
          }
        }
        return { ...p, stock: nuevoStock, sizesStock: nuevoSizesStock };
      }
      return p;
    }));
  };

  const handleDeleteProducto = (id: string) => {
    if (confirm('¿Seguro que deseas retirar este producto de la tienda?')) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const handleToggleColeccion = (id: string) => {
    setColecciones(prev => prev.map(c => c.id === id ? { ...c, activa: !c.activa } : c));
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

  const handleLimpiarCaja = () => {
    if (confirm('¿Deseas reiniciar las transacciones registradas? Asegúrate de haber exportado el reporte primero.')) {
      setTransacciones([]);
    }
  };

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

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-neutral-100 font-sans">
      <header className="border-b border-neutral-800 bg-[#141414] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <span className="font-black text-lg tracking-widest uppercase">GONE SURFING</span>
          <span className="text-[10px] bg-[#7A8B7B]/20 text-[#A3B8A4] border border-[#7A8B7B]/40 px-2 py-0.5 rounded font-mono">
            ADMIN LIVE
          </span>
        </div>

        {/* Pestañas de Navegación con separación física y estilo Segmented Control */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#1b1b1b',
            padding: '5px 8px',
            borderRadius: '10px',
            border: '1px solid #2e2e2e',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: activeTab === 'catalogo' ? 800 : 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'catalogo' ? '#ffffff' : 'transparent',
              color: activeTab === 'catalogo' ? '#000000' : '#999999',
              boxShadow: activeTab === 'catalogo' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            Gestión de Catálogo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('colecciones')}
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: activeTab === 'colecciones' ? 800 : 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'colecciones' ? '#ffffff' : 'transparent',
              color: activeTab === 'colecciones' ? '#000000' : '#999999',
              boxShadow: activeTab === 'colecciones' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
            }}
          >
            Colecciones & Drops
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('caja')}
            style={{
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: activeTab === 'caja' ? 800 : 600,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: activeTab === 'caja' ? '#ffffff' : 'transparent',
              color: activeTab === 'caja' ? '#000000' : '#999999',
              boxShadow: activeTab === 'caja' ? '0 2px 8px rgba(0,0,0,0.4)' : 'none',
            }}
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
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 md:p-8">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-6 text-white border-b border-neutral-800 pb-3">
                Subir Nueva Prenda al Catálogo
              </h2>

              <form onSubmit={handleCrearProducto} className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                      <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Categoría</label>
                      <select
                        value={nuevoProducto.categoria}
                        onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value as any })}
                        className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                      >
                        <option value="Accesorios">Accesorios (Talla Única)</option>
                        <option value="Merch">Merch (S, M, L, XL)</option>
                        <option value="Wetsuits">Wetsuits (S, M, L, XL)</option>
                        <option value="New Arrivals">New Arrivals (S, M, L, XL)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Colección / Drop (Opcional)</label>
                    <select
                      value={nuevoProducto.coleccion}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, coleccion: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                    >
                      <option value="">Ninguna (Catálogo General / Regular)</option>
                      {colecciones.filter(col => col.activa).map((col) => (
                        <option key={col.id} value={col.nombre}>{col.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-[#181818] border border-neutral-800 rounded-lg p-3">
                    <label className="block text-[11px] font-bold uppercase text-[#A3B8A4] tracking-wider mb-2">
                      Control de Stock por Variantes ({nuevoProducto.categoria === 'Accesorios' ? 'Talla Única' : 'S, M, L, XL'})
                    </label>

                    {nuevoProducto.categoria === 'Accesorios' ? (
                      <div>
                        <span className="text-[10px] text-neutral-400 block mb-1">Unidades Talla Única</span>
                        <input
                          type="number"
                          min="0"
                          value={nuevoProducto.stockUnica}
                          onChange={(e) => setNuevoProducto({ ...nuevoProducto, stockUnica: Number(e.target.value) })}
                          className="w-full bg-[#111] border border-neutral-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7A8B7B]"
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">Talla S</span>
                          <input
                            type="number"
                            min="0"
                            value={nuevoProducto.stockS}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stockS: Number(e.target.value) })}
                            className="w-full bg-[#111] border border-neutral-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#7A8B7B]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">Talla M</span>
                          <input
                            type="number"
                            min="0"
                            value={nuevoProducto.stockM}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stockM: Number(e.target.value) })}
                            className="w-full bg-[#111] border border-neutral-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#7A8B7B]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">Talla L</span>
                          <input
                            type="number"
                            min="0"
                            value={nuevoProducto.stockL}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stockL: Number(e.target.value) })}
                            className="w-full bg-[#111] border border-neutral-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#7A8B7B]"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-neutral-400 block mb-1">Talla XL</span>
                          <input
                            type="number"
                            min="0"
                            value={nuevoProducto.stockXL}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, stockXL: Number(e.target.value) })}
                            className="w-full bg-[#111] border border-neutral-700 rounded px-2 py-1.5 text-xs text-center text-white focus:outline-none focus:border-[#7A8B7B]"
                          />
                        </div>
                      </div>
                    )}
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
                            <span className="bg-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-200">{prod.coleccion}</span>
                          ) : (
                            <span className="text-neutral-500 italic text-[11px]">General</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-white">S/. {prod.precio.toFixed(2)}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2 mb-1.5">
                            <button onClick={() => handleUpdateStock(prod.id, -1)} className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer">-</button>
                            <span className={`font-mono font-bold ${prod.stock === 0 ? 'text-red-500' : 'text-white'}`}>{prod.stock}</span>
                            <button onClick={() => handleUpdateStock(prod.id, 1)} className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 cursor-pointer">+</button>
                          </div>
                          {prod.sizesStock && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(prod.sizesStock).map(([talla, cantidad]) => (
                                <span
                                  key={talla}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                                    cantidad === 0 ? 'bg-red-950/50 border-red-800/40 text-red-400' : 'bg-neutral-900 border-neutral-800 text-neutral-300'
                                  }`}
                                >
                                  {talla}: {cantidad}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button onClick={() => handleDeleteProducto(prod.id)} className="text-red-400 hover:text-red-300 font-semibold cursor-pointer">Eliminar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLECCIONES */}
        {activeTab === 'colecciones' && (
          <div className="space-y-10">
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6 md:p-8">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-6">
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  {editingCollectionId ? 'Editar Colección' : 'Crear Nuevo Catálogo / Colección'}
                </h2>
                {editingCollectionId && (
                  <button onClick={handleCancelEditColeccion} className="text-xs text-neutral-400 hover:text-white underline cursor-pointer">
                    Cancelar Edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveColeccion} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">Nombre de la Colección</label>
                  <input
                    type="text"
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
                    value={nuevaColeccion.subtitulo}
                    onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, subtitulo: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-neutral-400 mb-1">URL Portada 3D</label>
                  <input
                    type="url"
                    value={nuevaColeccion.portadaUrl}
                    onChange={(e) => setNuevaColeccion({ ...nuevaColeccion, portadaUrl: e.target.value })}
                    className="w-full bg-[#1a1a1a] border border-neutral-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7A8B7B]"
                  />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="bg-white hover:bg-neutral-200 text-black font-bold uppercase text-xs px-6 py-3.5 rounded-lg tracking-wider cursor-pointer">
                    {editingCollectionId ? 'Guardar Cambios' : 'Crear Colección'}
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {colecciones.map((col) => (
                <div key={col.id} className={`bg-[#141414] border rounded-xl overflow-hidden flex flex-col ${col.activa ? 'border-neutral-800' : 'border-red-900/40 opacity-60'}`}>
                  <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${col.portadaUrl})` }}>
                    <div className="absolute inset-0 bg-black/50 p-4 flex flex-col justify-between">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold w-fit ${col.activa ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-red-950 text-red-400 border border-red-700'}`}>
                        {col.activa ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                      <h4 className="font-bold text-lg text-white drop-shadow">{col.nombre}</h4>
                    </div>
                  </div>
                  <div className="p-4 bg-[#181818] flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-neutral-400 italic">"{col.subtitulo}"</p>
                      <p className="text-[10px] text-neutral-500 font-mono mt-1">Slug: /{col.slug}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-800 text-[11px] font-semibold">
                      <button onClick={() => handleToggleColeccion(col.id)} className={`py-1.5 px-2 rounded text-center cursor-pointer ${col.activa ? 'bg-neutral-800 text-neutral-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                        {col.activa ? 'Desactivar' : 'Activar'}
                      </button>
                      <button onClick={() => handleStartEditColeccion(col)} className="py-1.5 px-2 bg-neutral-800 text-white rounded text-center cursor-pointer">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteColeccion(col.id)} className="py-1.5 px-2 bg-neutral-800 hover:bg-red-900/60 text-red-400 rounded text-center cursor-pointer">
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CONTROL DE CAJA CON DESTINO Y FILTROS */}
        {activeTab === 'caja' && (
          <div className="space-y-8">
            {/* Tarjetas de Métricas Recalculadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Recaudación {filtroTiempo === 'hoy' ? '(Hoy)' : filtroTiempo === 'semana' ? '(Última Semana)' : filtroTiempo === 'mes' ? '(Último Mes)' : '(Filtrada)'}
                </p>
                <p className="text-3xl font-black text-white mt-2">S/. {totalRecaudado.toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Total de cobros procesados en el periodo</p>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">IGV Acumulado (18%)</p>
                <p className="text-3xl font-black text-[#A3B8A4] mt-2">S/. {totalIGV.toFixed(2)}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Impuesto fiscal de las órdenes filtradas</p>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tickets Emitidos</p>
                <p className="text-3xl font-black text-white mt-2">{transaccionesFiltradas.length}</p>
                <p className="text-[10px] text-neutral-500 mt-1">Órdenes encontradas con el filtro activo</p>
              </div>
            </div>

            {/* Barra de Filtros de Fecha con espaciado y botones definidos */}
            <div
              style={{
                backgroundColor: '#141414',
                border: '1px solid #262626',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#888888',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    marginRight: '6px',
                  }}
                >
                  Filtrar por fecha:
                </span>

                {[
                  { id: 'todos', label: 'Historial Completo' },
                  { id: 'hoy', label: 'Hoy' },
                  { id: 'semana', label: 'Últimos 7 días' },
                  { id: 'mes', label: 'Este mes' },
                  { id: 'rango', label: 'Rango personalizado' }
                ].map(tab => {
                  const activo = filtroTiempo === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFiltroTiempo(tab.id as any)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '11px',
                        fontWeight: activo ? 800 : 600,
                        borderRadius: '20px',
                        border: activo ? '1px solid #7A8B7B' : '1px solid #333333',
                        backgroundColor: activo ? '#7A8B7B' : '#1c1c1c',
                        color: activo ? '#0b1211' : '#cccccc',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activo ? '0 2px 8px rgba(122,139,123,0.25)' : 'none',
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {filtroTiempo === 'rango' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                  <span style={{ color: '#888888' }}>Desde:</span>
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    style={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333333',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <span style={{ color: '#888888', marginLeft: '6px' }}>Hasta:</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    style={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333333',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tabla Detallada con Destino y Dirección de Casa */}
            <div className="bg-[#141414] border border-neutral-800 rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Historial de Transacciones para Cierre de Caja
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Mostrando {transaccionesFiltradas.length} órdenes registradas
                  </p>
                </div>
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
                    <span>Exportar a Excel (CSV)</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1c1c1c] text-neutral-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID Ticket</th>
                      <th className="p-3">Fecha y Hora</th>
                      <th className="p-3">Destino de Entrega</th>
                      <th className="p-3">Detalle de Prendas</th>
                      <th className="p-3">Subtotal</th>
                      <th className="p-3">IGV (18%)</th>
                      <th className="p-3 font-bold text-white">Total</th>
                      <th className="p-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {transaccionesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-neutral-500">
                          No se encontraron transacciones en el periodo seleccionado.
                        </td>
                      </tr>
                    ) : (
                      transaccionesFiltradas.map((tx) => (
                        <tr key={tx.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{tx.id}</td>
                          <td className="p-3 text-neutral-400 whitespace-nowrap">{formatearFechaDisplay(tx.fecha)}</td>
                          
                          {/* Columna Detallada de Destino y Dirección */}
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-semibold text-white flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B7B]" />
                                {tx.distrito || 'Lima'}
                              </span>
                              <span className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                {tx.direccion || 'Entrega estándar'}
                              </span>
                              {tx.cliente && (
                                <span className="text-[9px] text-neutral-500 mt-0.5">
                                  {tx.cliente}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 text-neutral-300 max-w-xs">{tx.detalle}</td>
                          <td className="p-3 font-mono text-neutral-400">S/. {tx.subtotal.toFixed(2)}</td>
                          <td className="p-3 font-mono text-[#A3B8A4]">S/. {tx.igv.toFixed(2)}</td>
                          <td className="p-3 font-mono font-bold text-white">S/. {tx.total.toFixed(2)}</td>
                          <td className="p-3 text-right">
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap">
                              {tx.estado}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
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