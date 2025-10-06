# 🚀 Guía de Instalación y Configuración

## 📋 Requisitos del Sistema

### 💻 **Navegadores Compatibles**
- ✅ **Chrome 88+** (Recomendado)
- ✅ **Firefox 85+**
- ✅ **Safari 14+**
- ✅ **Edge 88+**
- ✅ **Opera 74+**

### 📱 **Dispositivos Soportados**
- ✅ **Desktop** - Windows, macOS, Linux
- ✅ **Móvil** - iOS 14+, Android 8+
- ✅ **Tablet** - iPad, Android tablets

### 🌐 **Conectividad**
- ✅ **Internet** - Para servicios de traducción
- ✅ **Micrófono** - Para grabación de audio
- ✅ **Altavoces** - Para reproducción de traducciones

---

## 📚 **Métodos de Instalación**

### 🔗 **Opción 1: Acceso Directo**
1. Abre `index.html` directamente en tu navegador
2. ⚠️ **Limitación:** Algunas funciones PWA no estarán disponibles

### 🌐 **Opción 2: Servidor Web Local (Recomendado)**

#### Con Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Con Node.js:
```bash
# Instalar serve globalmente
npm install -g serve

# Ejecutar servidor
serve .
```

#### Con PHP:
```bash
php -S localhost:8000
```

### 📱 **Opción 3: Como PWA (Aplicación)**
1. Abre la aplicación en un servidor web
2. Busca el botón "Instalar App" en el header
3. Confirma la instalación
4. ¡La app estará disponible como aplicación nativa!

---

## 🔑 **Configuración de APIs**

### 💼 **Servicios Gratuitos**
- **MyMemory** - No requiere configuración
- **Límite:** 500 caracteres por traducción
- **Uso:** Selecciona "MyMemory" en el dropdown

### 🔑 **APIs Premium**

#### **Google Translate API**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto nuevo
3. Habilita "Cloud Translation API"
4. Crea credenciales (API Key)
5. En la app: Configuración > API Keys > Google Translate API Key

#### **Azure Translator**
1. Ve a [Azure Portal](https://portal.azure.com/)
2. Crea un recurso "Translator"
3. Obtén la API Key desde "Keys and Endpoint"
4. En la app: Configuración > API Keys > Azure Translator API Key

#### **DeepL API**
1. Ve a [DeepL Pro](https://www.deepl.com/pro-api)
2. Regístrate para una cuenta Pro
3. Obtén tu API Key
4. En la app: Configuración > API Keys > DeepL API Key

---

## ⚙️ **Configuración Inicial**

### 🎤 **Audio**
1. **Velocidad de Síntesis:** 0.5x - 2.0x (predeterminado: 1.0x)
2. **Tono de Voz:** 0.5 - 2.0 (predeterminado: 1.0)
3. **Reproducción Automática:** Activa para reproducción instantánea

### 🎨 **Apariencia**
1. **Tema:** Automático/Claro/Oscuro
2. **Esquema de Colores:** Azul/Verde/Morado/Naranja

### 🌍 **Idiomas**
1. Selecciona la dirección de traducción
2. 12 pares de idiomas disponibles
3. El reconocimiento de voz se adapta automáticamente

---

## 🗋 **Estructura de Archivos**

```
glory-translation-tool/
├── index.html                 # Página principal
├── style.css                  # Estilos
├── script.js                  # JavaScript principal
├── manifest.json              # Configuración PWA
├── sw.js                      # Service Worker
├── demo.html                  # Página demo
├── demo-comparison.html       # Comparación
├── assets/
│   ├── glory_logo.svg         # Logo principal
│   └── icon-*.png             # Iconos PWA
└── docs/
    ├── README.md
    ├── CHANGELOG.md
    ├── TIEMPO_GRABACION_GUIA.md
    ├── FUNCIONALIDADES_EMPRESARIALES.md
    └── INSTALACION.md         # Este archivo
```

---

## 🔧 **Solución de Problemas**

### 🎤 **Problemas de Audio**

**❓ No se detecta el micrófono**
- ✅ Verifica permisos de micrófono en el navegador
- ✅ Asegúrate de que esté conectado y funcionando
- ✅ Prueba en una pestaña de incognito

**❓ Reconocimiento de voz no funciona**
- ✅ Verifica conexión a internet
- ✅ Prueba con un idioma diferente
- ✅ Habla más cerca del micrófono

### 🌐 **Problemas de Traducción**

**❓ Error "API Key no configurada"**
- ✅ Ve a Configuración > API Keys
- ✅ Ingresa la clave correcta para el servicio
- ✅ Verifica que la clave sea válida

**❓ Error de conexión**
- ✅ Verifica conexión a internet
- ✅ Prueba con el servicio MyMemory (gratuito)
- ✅ Reinicia la aplicación

### 📱 **Problemas de PWA**

**❓ No aparece el botón "Instalar App"**
- ✅ Asegúrate de usar HTTPS o localhost
- ✅ Verifica que el navegador soporte PWA
- ✅ Refresca la página

**❓ La app instalada no funciona offline**
- ✅ Abre la app online al menos una vez
- ✅ Permite que se complete la descarga del cache
- ✅ Verifica la configuración del Service Worker

---

## 📊 **Monitoreo y Mantenimiento**

### 📈 **Analytics**
- Ve a la pestaña "Analytics" para ver estadísticas
- Monitorea el uso de servicios y idiomas
- Exporta datos regularmente como backup

### 💾 **Backup de Datos**
1. Ve a Configuración > Datos
2. Haz clic en "Exportar Todos los Datos"
3. Guarda el archivo JSON en un lugar seguro
4. Para restaurar: "Importar Datos" y selecciona el archivo

### 🔄 **Actualizaciones**
- El Service Worker actualiza automáticamente la app
- Refresca la página si ves notificación de actualización
- Los datos locales se mantienen entre actualizaciones

---

## 📞 **Soporte**

### 📋 **Recursos**
- **Documentación:** Lee todos los archivos .md incluidos
- **Demo:** Prueba `demo.html` para ver todas las funcionalidades
- **Comparación:** Revisa `demo-comparison.html` para ver mejoras

### ⚙️ **Configuración Avanzada**
- Todos los ajustes están en la pestaña "Configuración"
- Los cambios se guardan automáticamente
- Usa "Limpiar Todos los Datos" para reseteo completo

### 🚀 **Optimización**
- Usa APIs premium para mejor calidad
- Ajusta duración de grabación según necesidades
- Configura reproducción automática para mayor eficiencia

---

## 🎆 **¡Listo para Usar!**

Sigue esta guía y tendrás la herramienta funcionando perfectamente. Para más detalles, revisa la documentación completa incluida.

**Glory Global Solutions** - Traducción Profesional de Audio 🎤✨

---

*Última actualización: Octubre 2025*