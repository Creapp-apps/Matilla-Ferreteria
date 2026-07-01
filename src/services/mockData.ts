import { type Product } from '@/types/product';

export const MOCK_PRODUCTS: Omit<Product, 'price'>[] = [
  // Herramientas Manuales
  { sku: '7791234560012', name: 'Destornillador Philips 1/4 x 4 Bremen', brand: 'Bremen', category: 'Herramientas', cost: 3500, markup_percent: 45, stock: 15, min_stock: 5, location: 'Pasillo 1, Estante A-12' },
  { sku: '7791234560029', name: 'Destornillador Plano 3/16 x 3 Bremen', brand: 'Bremen', category: 'Herramientas', cost: 3200, markup_percent: 45, stock: 12, min_stock: 5, location: 'Pasillo 1, Estante A-13' },
  { sku: '7791234560036', name: 'Pinza Universal 7 pulgadas Stanley', brand: 'Stanley', category: 'Herramientas', cost: 12500, markup_percent: 50, stock: 8, min_stock: 3, location: 'Pasillo 1, Estante B-04' },
  { sku: '7791234560043', name: 'Alicate de Corte Diagonal 6 Stanley', brand: 'Stanley', category: 'Herramientas', cost: 11000, markup_percent: 50, stock: 6, min_stock: 3, location: 'Pasillo 1, Estante B-05' },
  { sku: '7791234560050', name: 'Llave Ajustable 10 pulgadas Bahco', brand: 'Bahco', category: 'Herramientas', cost: 22000, markup_percent: 40, stock: 5, min_stock: 2, location: 'Pasillo 1, Estante C-01' },
  { sku: '7791234560067', name: 'Martillo Galponero 20oz Stanley', brand: 'Stanley', category: 'Herramientas', cost: 14500, markup_percent: 45, stock: 10, min_stock: 4, location: 'Pasillo 2, Estante A-01' },
  { sku: '7791234560074', name: 'Cinta Métrica 5 metros Stanley Tyylon', brand: 'Stanley', category: 'Herramientas', cost: 6800, markup_percent: 50, stock: 25, min_stock: 10, location: 'Pasillo 2, Estante C-08' },
  { sku: '7791234560081', name: 'Arco de Sierra Fijo Bremen profesional', brand: 'Bremen', category: 'Herramientas', cost: 9500, markup_percent: 45, stock: 7, min_stock: 3, location: 'Pasillo 2, Estante B-12' },
  { sku: '7791234560098', name: 'Trincheta Cutter metálica Stanley', brand: 'Stanley', category: 'Herramientas', cost: 4200, markup_percent: 50, stock: 30, min_stock: 8, location: 'Pasillo 2, Estante C-09' },

  // Bulonería y Fijaciones (high volume)
  { sku: '2000000000010', name: 'Clavo Espiralado 2 pulgadas (x kg)', brand: 'Genérico', category: 'Bulonería', cost: 2500, markup_percent: 60, stock: 45, min_stock: 15, location: 'Cajón Bulones B-01' },
  { sku: '2000000000027', name: 'Clavo Punta Paris 2 y media (x kg)', brand: 'Genérico', category: 'Bulonería', cost: 2300, markup_percent: 60, stock: 50, min_stock: 20, location: 'Cajón Bulones B-02' },
  { sku: '2000000000034', name: 'Tornillo Autoperforante T2 8x1 (x100u)', brand: 'Fischer', category: 'Bulonería', cost: 1800, markup_percent: 55, stock: 30, min_stock: 10, location: 'Cajón Bulones C-10' },
  { sku: '2000000000041', name: 'Tarugo Fisher SX 8mm con tope (x100u)', brand: 'Fischer', category: 'Bulonería', cost: 2200, markup_percent: 50, stock: 40, min_stock: 12, location: 'Cajón Bulones D-04' },
  { sku: '2000000000058', name: 'Tornillo Fix para Madera 4.0 x 40 (x100u)', brand: 'Fischer', category: 'Bulonería', cost: 1500, markup_percent: 55, stock: 35, min_stock: 10, location: 'Cajón Bulones C-22' },
  { sku: '2000000000065', name: 'Arandela Plana 5/16 hierro (x100u)', brand: 'Genérico', category: 'Bulonería', cost: 950, markup_percent: 70, stock: 60, min_stock: 15, location: 'Cajón Bulones A-05' },
  { sku: '2000000000072', name: 'Tuerca Hexagonal 5/16 zincada (x100u)', brand: 'Genérico', category: 'Bulonería', cost: 1200, markup_percent: 70, stock: 55, min_stock: 15, location: 'Cajón Bulones A-06' },
  { sku: '2000000000089', name: 'Bulón Cabeza Hexagonal 5/16 x 2 (x10u)', brand: 'Genérico', category: 'Bulonería', cost: 1900, markup_percent: 50, stock: 22, min_stock: 8, location: 'Cajón Bulones E-01' },

  // Pinturas y Accesorios
  { sku: '7790123000552', name: 'Látex Exterior Frentes Sinteplast 4L', brand: 'Sinteplast', category: 'Pinturas', cost: 18500, markup_percent: 42, stock: 12, min_stock: 4, location: 'Estantería Pinturas P-01' },
  { sku: '7790123000569', name: 'Látex Interior Antihongo Sinteplast 4L', brand: 'Sinteplast', category: 'Pinturas', cost: 16200, markup_percent: 42, stock: 15, min_stock: 4, location: 'Estantería Pinturas P-02' },
  { sku: '7790123000576', name: 'Esmalte Sintético Brillante Blanco 1L', brand: 'Sinteplast', category: 'Pinturas', cost: 7400, markup_percent: 45, stock: 18, min_stock: 6, location: 'Estantería Pinturas P-12' },
  { sku: '7790123000583', name: 'Pincel Galgo Serie Azul Nro 15', brand: 'Galgo', category: 'Pinturas', cost: 1800, markup_percent: 50, stock: 24, min_stock: 8, location: 'Estantería Pinturas Accesorios' },
  { sku: '7790123000590', name: 'Rodillo Lanar Profesional Galgo 22cm', brand: 'Galgo', category: 'Pinturas', cost: 3500, markup_percent: 48, stock: 14, min_stock: 5, location: 'Estantería Pinturas Accesorios' },
  { sku: '7790123000606', name: 'Fijador Sellador Concentrado 1L', brand: 'Sinteplast', category: 'Pinturas', cost: 3100, markup_percent: 45, stock: 10, min_stock: 3, location: 'Estantería Pinturas P-14' },
  { sku: '7790123000613', name: 'Lija al Agua Grano 120 Doble A', brand: 'Doble A', category: 'Pinturas', cost: 250, markup_percent: 80, stock: 150, min_stock: 30, location: 'Estantería Pinturas L-01' },
  { sku: '7790123000620', name: 'Lija para Madera Grano 80 Doble A', brand: 'Doble A', category: 'Pinturas', cost: 230, markup_percent: 80, stock: 120, min_stock: 30, location: 'Estantería Pinturas L-03' },

  // Electricidad e Iluminación
  { sku: '7798765430018', name: 'Cinta Aisladora Tacsa Negra 20m', brand: 'Tacsa', category: 'Electricidad', cost: 1200, markup_percent: 50, stock: 80, min_stock: 20, location: 'Mostrador Cajón E-01' },
  { sku: '7798765430025', name: 'Cable Unipolar 2.5mm Prysmian Azul 100m', brand: 'Prysmian', category: 'Electricidad', cost: 38000, markup_percent: 35, stock: 4, min_stock: 2, location: 'Estantería Cables C-01' },
  { sku: '7798765430032', name: 'Cable Unipolar 2.5mm Prysmian Rojo 100m', brand: 'Prysmian', category: 'Electricidad', cost: 38000, markup_percent: 35, stock: 5, min_stock: 2, location: 'Estantería Cables C-02' },
  { sku: '7798765430049', name: 'Lámpara LED 9W Luz Fría Philips', brand: 'Philips', category: 'Electricidad', cost: 1100, markup_percent: 45, stock: 45, min_stock: 15, location: 'Góndola Eléctrica A-02' },
  { sku: '7798765430056', name: 'Lámpara LED 12W Luz Cálida Philips', brand: 'Philips', category: 'Electricidad', cost: 1350, markup_percent: 45, stock: 35, min_stock: 12, location: 'Góndola Eléctrica A-03' },
  { sku: '7798765430063', name: 'Llave de Luz Armada 1 Toma + 1 Punto Sica', brand: 'Sica', category: 'Electricidad', cost: 2400, markup_percent: 48, stock: 20, min_stock: 8, location: 'Góndola Eléctrica B-01' },
  { sku: '7798765430070', name: 'Caja Octogonal Chapa de Hierro', brand: 'Genérico', category: 'Electricidad', cost: 650, markup_percent: 60, stock: 75, min_stock: 25, location: 'Depósito Eléctrico D-12' },
  { sku: '7798765430087', name: 'Disyuntor Diferencial 2x25A Sica', brand: 'Sica', category: 'Electricidad', cost: 28500, markup_percent: 38, stock: 6, min_stock: 2, location: 'Góndola Eléctrica C-01' },
  { sku: '7798765430094', name: 'Llave Térmica Bipolar 20A Sica', brand: 'Sica', category: 'Electricidad', cost: 14500, markup_percent: 38, stock: 9, min_stock: 3, location: 'Góndola Eléctrica C-02' },

  // Plomería y Sanitarios
  { sku: '7797777000115', name: 'Teflón Alta Densidad 3/4 x 20m IPS', brand: 'IPS', category: 'Plomería', cost: 1500, markup_percent: 50, stock: 90, min_stock: 20, location: 'Mostrador Cajón P-01' },
  { sku: '7797777000122', name: 'Adhesivo para PVC Tigre 250g', brand: 'Tigre', category: 'Plomería', cost: 4800, markup_percent: 45, stock: 16, min_stock: 5, location: 'Góndola Plomería G-02' },
  { sku: '7797777000139', name: 'Codo 90 Termofusión Agua 20mm IPS', brand: 'IPS', category: 'Plomería', cost: 350, markup_percent: 70, stock: 120, min_stock: 40, location: 'Cajones Plomería C-01' },
  { sku: '7797777000146', name: 'Tee Termofusión Agua 20mm IPS', brand: 'IPS', category: 'Plomería', cost: 450, markup_percent: 70, stock: 100, min_stock: 30, location: 'Cajones Plomería C-02' },
  { sku: '7797777000153', name: 'Tubo Termofusión Agua 20mm x 4m IPS', brand: 'IPS', category: 'Plomería', cost: 3100, markup_percent: 45, stock: 24, min_stock: 10, location: 'Pasillo Caños Depósito' },
  { sku: '7797777000160', name: 'Flexible Extensible Inox 1/2 x 40cm', brand: 'Fv', category: 'Plomería', cost: 6500, markup_percent: 45, stock: 14, min_stock: 5, location: 'Góndola Plomería G-08' },
  { sku: '7797777000177', name: 'Cuerito de Goma Grifería 1/2 (x10u)', brand: 'Genérico', category: 'Plomería', cost: 400, markup_percent: 100, stock: 200, min_stock: 50, location: 'Mostrador Cajón P-03' },
  { sku: '7797777000184', name: 'Grifería de Cocina de Pared Fv Allegro', brand: 'Fv', category: 'Plomería', cost: 58000, markup_percent: 35, stock: 3, min_stock: 1, location: 'Góndola Plomería Fv-01' },

  // Jardín, Herrajes y Seguridad
  { sku: '7799999000224', name: 'Manguera de Riego Reforzada 1/2 x 15m', brand: 'Tramontina', category: 'Jardín', cost: 9500, markup_percent: 42, stock: 18, min_stock: 5, location: 'Pasillo 4, Fila Estantería F-1' },
  { sku: '7799999000231', name: 'Pistola de Riego Regulable Tramontina', brand: 'Tramontina', category: 'Jardín', cost: 2800, markup_percent: 45, stock: 15, min_stock: 4, location: 'Estantería Jardín J-02' },
  { sku: '7799999000248', name: 'Candado de Latón Traba Doble 40mm Sekur', brand: 'Sekur', category: 'Herrajes', cost: 6200, markup_percent: 45, stock: 22, min_stock: 6, location: 'Estantería Herrajes H-01' },
  { sku: '7799999000255', name: 'Cerradura de Seguridad Doble Paleta Kallay', brand: 'Kallay', category: 'Herrajes', cost: 16500, markup_percent: 40, stock: 8, min_stock: 3, location: 'Estantería Herrajes H-02' },
  { sku: '7799999000262', name: 'Bisagra Libro Pulida 3 x 3 (par)', brand: 'Genérico', category: 'Herrajes', cost: 1800, markup_percent: 50, stock: 40, min_stock: 10, location: 'Estantería Herrajes H-12' },
  { sku: '7799999000279', name: 'Pala Ancha de Acero Tramontina', brand: 'Tramontina', category: 'Jardín', cost: 18500, markup_percent: 40, stock: 5, min_stock: 2, location: 'Pasillo 4, Fila Estantería F-4' },
  { sku: '7799999000286', name: 'Guantes de Trabajo Vaqueta t/Único', brand: 'Libus', category: 'Seguridad', cost: 3200, markup_percent: 50, stock: 35, min_stock: 10, location: 'Góndola Seguridad S-01' },
  { sku: '7799999000293', name: 'Lentes de Seguridad Libus Transparente', brand: 'Libus', category: 'Seguridad', cost: 1900, markup_percent: 50, stock: 40, min_stock: 10, location: 'Góndola Seguridad S-02' }
];

export const getPrice = (cost: number, markupPercent: number): number => {
  return Math.round(cost * (1 + markupPercent / 100));
};

export const getProductsWithPrices = (): Product[] => {
  return MOCK_PRODUCTS.map(p => ({
    ...p,
    price: getPrice(p.cost, p.markup_percent)
  })) as Product[];
};
