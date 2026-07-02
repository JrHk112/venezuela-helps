#!/usr/bin/env node
/**
 * validate.js — Valida data/links.json antes de commitear.
 *
 * Uso:
 *   node scripts/validate.js
 *
 * También puede agregarse como hook pre-commit en .git/hooks/pre-commit:
 *   #!/bin/sh
 *   node scripts/validate.js || exit 1
 */

const fs   = require('fs');
const path = require('path');

const FILE = path.resolve(__dirname, '../data/links.json');

const CAMPOS_REQUERIDOS = ['nombre', 'categoria', 'descripcion', 'url', 'etiquetas'];
const URL_REGEX         = /^https?:\/\/.+/;

/* ─── Utilidades ─────────────────────────────────────────────────────────── */
const ok  = (msg) => console.log(`  ✅  ${msg}`);
const err = (msg) => console.error(`  ❌  ${msg}`);
const warn = (msg) => console.warn(`  ⚠️   ${msg}`);

let errores = 0;

function fallo(msg) {
  err(msg);
  errores++;
}

/* ─── 1. El archivo existe ────────────────────────────────────────────────── */
console.log(`\nValidando: ${FILE}\n`);

if (!fs.existsSync(FILE)) {
  err(`No se encontró el archivo: ${FILE}`);
  process.exit(1);
}

/* ─── 2. JSON bien formado ───────────────────────────────────────────────── */
let links;
try {
  const raw = fs.readFileSync(FILE, 'utf8');
  links = JSON.parse(raw);
  ok('JSON bien formado.');
} catch (e) {
  err(`JSON inválido: ${e.message}`);
  process.exit(1);
}

/* ─── 3. Debe ser un array ───────────────────────────────────────────────── */
if (!Array.isArray(links)) {
  err('La raíz del JSON debe ser un array.');
  process.exit(1);
}
ok(`Array con ${links.length} entradas.`);

/* ─── 4. Validar cada entrada ────────────────────────────────────────────── */
const urlsVistas = new Set();

links.forEach((link, i) => {
  const id = `Entrada #${i + 1} ("${link.nombre ?? 'sin nombre'}")`;

  // Campos requeridos
  CAMPOS_REQUERIDOS.forEach((campo) => {
    if (link[campo] === undefined || link[campo] === null || link[campo] === '') {
      fallo(`${id}: falta el campo requerido "${campo}".`);
    }
  });

  // URL válida
  if (link.url && !URL_REGEX.test(link.url)) {
    fallo(`${id}: URL inválida → "${link.url}".`);
  }

  // URL duplicada
  if (link.url) {
    const urlNorm = link.url.replace(/\/$/, '').toLowerCase();
    if (urlsVistas.has(urlNorm)) {
      warn(`${id}: URL duplicada → "${link.url}".`);
    } else {
      urlsVistas.add(urlNorm);
    }
  }

  // etiquetas debe ser array no vacío de strings
  if (Array.isArray(link.etiquetas)) {
    if (link.etiquetas.length === 0) {
      warn(`${id}: el array "etiquetas" está vacío.`);
    }
    link.etiquetas.forEach((tag, t) => {
      if (typeof tag !== 'string' || tag.trim() === '') {
        fallo(`${id}: etiqueta[${t}] no es un string válido.`);
      }
    });
  } else if (link.etiquetas !== undefined) {
    fallo(`${id}: "etiquetas" debe ser un array.`);
  }

  // nombre y descripcion como strings
  ['nombre', 'descripcion', 'categoria'].forEach((campo) => {
    if (link[campo] !== undefined && typeof link[campo] !== 'string') {
      fallo(`${id}: "${campo}" debe ser un string.`);
    }
  });
});

/* ─── 5. Resultado ───────────────────────────────────────────────────────── */
console.log('');
if (errores === 0) {
  console.log(`✅  Validación superada. Ningún error encontrado en ${links.length} entradas.\n`);
  process.exit(0);
} else {
  console.error(`❌  Validación fallida: ${errores} error(es) encontrado(s). Corrige antes de commitear.\n`);
  process.exit(1);
}
