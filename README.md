# 🔨 Matilla Ferretería — Sistema POS & Gestión de Inventario Offline-First

<div align="center">

[![React](https://img.shields.io/badge/React-19.2-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Dexie.js](https://img.shields.io/badge/Dexie-IndexedDB_Offline-blue?style=for-the-badge&logo=indexeddb&logoColor=white)](https://dexie.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud_Sync-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**Sistema de punto de venta (POS) y control de stock de mostrador para ferreterías industriales y corralones: arquitectura offline-first con IndexedDB y sincronización cloud en segundo plano.**

[Explorar CreAPP Lab](https://creapp.com.ar) • [Reportar un Issue](https://github.com/Creapp-apps/Matilla-Ferreteria/issues)

</div>

---

## 🌟 Visión del Sistema

**Matilla Ferretería** es una aplicación de mostrador diseñada para resolver el problema más crítico en el comercio de materiales y ferretería: la velocidad de atención al cliente y la continuidad operativa ante caídas de internet. 

Gracias a su arquitectura *Offline-First* con **Dexie (IndexedDB)**, el operador puede buscar entre miles de códigos de artículos, registrar ventas y emitir comprobantes en milisegundos sin depender de la latencia de la red, sincronizando transacciones con **Supabase** de manera transparente una vez restablecida la conexión.

---

## 🚀 Capacidades Principales

### ⚡ 1. Punto de Venta (POS) Ultrarrápido
* Búsqueda instantánea predictiva por código de barras, SKU interno o descripción parcial de artículos.
* Atajos de teclado ergonómicos diseñados para operar sin tocar el mouse en el mostrador.

### 💾 2. Arquitectura Offline-First (Dexie.js)
* Caché y réplica local completa del catálogo y listas de precios en el navegador del cliente.
* Operación ininterrumpida frente a microcortes de conectividad.

### ☁️ 3. Sincronización Cloud Bidireccional (Supabase)
* Respaldo automático de tickets de venta, movimientos de inventario y ajustes de stock en PostgreSQL.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías | Propósito |
| :--- | :--- | :--- |
| **Frontend** | `React 19` + `TypeScript` + `Vite 8` | Rendimiento de renderizado sin sobrecarga. |
| **Almacenamiento Local** | `Dexie.js (IndexedDB)` | Base de datos embebida en el cliente para latencia cero. |
| **Base de Datos Cloud** | `Supabase` (PostgreSQL) | Centralización de datos, reportes y seguridad RLS. |
| **Linter & Calidad** | `oxlint` | Análisis estático ultrarrápido en Rust. |

---

## 💻 Puesta en Marcha

```bash
git clone https://github.com/Creapp-apps/Matilla-Ferreteria.git
cd Matilla-Ferreteria
npm install
npm run dev
```

---

<div align="center">
<sub>Herramienta de punto de venta industrial desarrollada por <b>CreAPP Software Lab</b> © 2026</sub>
</div>
