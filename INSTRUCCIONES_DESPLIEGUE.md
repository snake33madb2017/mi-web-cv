# Guía de Despliegue para tu Web

Tu proyecto es una aplicación **Node.js dinámica** (usa `server.js`, Express y base de datos local), por lo que **no puede alojarse en GitHub Pages**, ya que este servicio solo funciona para sitios estáticos (HTML/CSS puro).

Para hacerlo visible en internet, te recomiendo usar **Render** (tienen un plan gratuito compatible con tu proyecto).

## Pasos para Desplegar en Render (Gratis)

1.  Ve a [https://render.com/](https://render.com/) y crea una cuenta (puedes hacer login con tu GitHub).
2.  Haz clic en **New +** y selecciona **Web Service**.
3.  Conecta tu repositorio de GitHub: `snake33madb2017/mi-web-cv`.
4.  Configura los siguientes datos:
    *   **Name:** (El nombre que quieras para tu url, ej: `mi-web-cv`)
    *   **Region:** Frankfurt o la más cercana.
    *   **Branch:** `main`
    *   **Root Directory:** (Déjalo vacío)
    *   **Runtime:** Node
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
5.  Selecciona el plan **Free**.
6.  Haz clic en **Create Web Service**.

Render descargará tu código, instalará las dependencias y arrancará el servidor. En unos minutos te darán una URL (ej: `https://mi-web-cv.onrender.com`) donde tu web será visible para todo el mundo.

> **⚠️ IMPORTANTE SOBRE LOS DATOS:**
> Al usar el plan gratuito de Render (y la mayoría de servicios similares), el sistema de archivos es "efímero".
> Esto significa que si haces cambios desde el **Panel de Admin** de tu web (editar textos, etc.), esos cambios se guardan en el archivo `data.json` del servidor, **pero se perderán si el servidor se reinicia** (lo cual pasa automáticamente cada cierto tiempo en los planes gratuitos).
>
> **Solución recomendada:**
> Haz los cambios de contenido en tu ordenador (local), guarda, y haz `git push` para subirlos. Usa el Panel de Admin online solo para pruebas o si actualizas a un plan con "Persistent Disk" (Disco Persistente).
