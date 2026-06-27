# Spec — Legales y Privacidad

> Estado del spec: **revisado** (borradores + backlog de cumplimiento L-1..L-11) · 2026-06-20
> ⚠️ Contenido orientativo, **no es asesoría legal**. Requiere revisión por abogado/a
> especializado/a en protección de datos antes de la entrada en vigencia de la Ley 21.719.

## Observaciones registradas (2026-06-20)

- **OBS-1 — Términos y Condiciones NO están redactados.** Hay que escribirlos. El registro
  los referencia/exige (ver B-6 en `01-auth.md`) pero el texto no existe.
- **OBS-2 — Política de Privacidad NO está redactada.** Requerida por la Ley 21.719
  (deber de información). Tampoco existe el texto.

## Aplicabilidad de la Ley N° 21.719 (por verificar con fuente oficial / abogado)

RecomiendoPymes trata datos personales de personas en Chile (nombres, emails, IPs, datos
de dueños de negocios, reseñas) → es **responsable de datos** y **la ley le aplica**.
No hay exención general para pymes ni MVP.

- **Norma:** Ley 21.719, "regula la protección y el tratamiento de los datos personales y
  crea la Agencia de Protección de Datos Personales". Moderniza la Ley 19.628; estilo GDPR.
- **Publicación:** ~13-dic-2024. **Vigencia:** ~24 meses después → **~diciembre 2026**
  (fecha exacta **por confirmar** en la BCN).
- **Obligaciones que tocan al proyecto:**
  - Consentimiento informado (libre, específico, inequívoco) → captura en registro (B-6).
  - Deber de información → **Política de Privacidad** (qué datos, finalidad, base legal,
    retención, derechos, contacto).
  - Derechos ARCO+ del titular (Acceso, Rectificación, Cancelación/Supresión, Oposición,
    Portabilidad) → borrado de cuenta (B-7 en `01-auth.md`).
  - Seguridad del tratamiento y **notificación de brechas**.
  - Sanciones por tramos (multas que pueden ser altas) — montos **por verificar**.

## Backlog legal

| ID | Item | Esfuerzo | Notas |
|---|---|---|---|
| **L-1** | Redactar **Términos y Condiciones** | Medio | 🟡 Borrador en `docs/legal/terminos-y-condiciones.md` — faltan datos `[…]` + revisión legal |
| **L-2** | Redactar **Política de Privacidad** conforme a Ley 21.719 | Medio | 🟡 Borrador en `docs/legal/politica-de-privacidad.md` — faltan datos `[…]` + revisión legal |
| **L-3** | Revisión por abogado/a de datos | — | Antes de la vigencia (~dic 2026) |
| **L-4** | Versionar los textos legales (fecha + versión) y enlazarlos al consentimiento (B-6) | Bajo | Para trazabilidad de qué versión aceptó cada usuario |
| **L-5** | Confirmar fecha exacta de vigencia y montos de sanciones en BCN | Bajo | Fuentes en vivo no disponibles al redactar esto |
| **L-6** | Banner de cookies + página de **política de cookies** | Medio | Necesario si hay tracking no esencial (analytics, click-tracking Resend) |
| **L-7** | **Acceso/portabilidad** del usuario (ver/descargar sus datos) | Medio | Derecho ARCO de cara al titular; complementa borrado (Auth B-7) |
| **L-8** | **Re-consentimiento** al cambiar materialmente T&C/Privacidad | Bajo-Medio | Compara `terms_version` (B-6) y vuelve a pedir aceptación |
| **L-9** | **Takedown** de contenido: reportar negocio/imagen/contenido ilícito + procedimiento de bajada | Medio | Protección ante UGC de terceros; cruce RV-8 / admin |
| **L-10** | Artefactos internos: **registro de actividades de tratamiento** + **procedimiento de notificación de brechas** | Medio | Obligaciones directas de la Ley 21.719 (no de cara al usuario) |
| **L-11** | **Política de transparencia de reseñas** (cómo se moderan/ocultan) | Bajo | Confianza + posible requisito |

## Decisiones tomadas (2026-06-20)

- **D-1** — Modelo de contenido legal y consentimiento: T&C + Privacidad redactados (borrador), consentimiento capturado (B-6); pendiente revisión legal y responsable/RUT.
- **D-2** — Se amplía el alcance de cumplimiento con L-6..L-11: cookies, acceso/portabilidad, re-consentimiento, takedown, artefactos internos y transparencia de reseñas.

> Nota: el panel admin ya contempla editar T&C y Privacidad (Markdown). Lo que falta es el
> **contenido** redactado y su revisión legal.
