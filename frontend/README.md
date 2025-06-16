# STICKER Token Claim Mini-App

Mini-app para reclamar tokens STICKER en la red Avalanche Fuji. Permite a los usuarios reclamar 100 tokens STICKER y donar 50 tokens a un giver. Desarrollada con Next.js y compatible con Sherry SDK para integración en redes sociales.

## Características

- Reclamación de tokens STICKER
- Donación automática a givers
- Integración con Sherry SDK
- Soporte para Avalanche Fuji Testnet
- Interfaz de usuario intuitiva

## Tecnologías

- Next.js
- TypeScript
- ethers.js
- Sherry SDK
- Avalanche Fuji Testnet

## Requisitos Previos

- Node.js 18 o superior
- MetaMask o wallet compatible
- Cuenta en Avalanche Fuji Testnet

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/fersoria/sticker-token-mini-app.git
   cd sticker-token-mini-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env.local
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Uso

1. Conecta tu wallet (MetaMask)
2. Asegúrate de estar en la red Avalanche Fuji
3. Ingresa la dirección del giver
4. Haz clic en "Claim Tokens"
5. Confirma la transacción en tu wallet

## Despliegue

La aplicación está configurada para ser desplegada en Vercel:

1. Fork este repositorio
2. Crea una cuenta en Vercel
3. Importa el repositorio
4. Configura las variables de entorno
5. ¡Despliega!

## Integración con Sherry

Para probar la mini-app en Sherry:

1. Despliega la aplicación
2. Ve a [app.sherry.so](https://app.sherry.so)
3. Ingresa la URL de tu API (ej: `https://tu-app.vercel.app/api/claim`)
4. Prueba la funcionalidad

## Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tutwitter](https://twitter.com/tutwitter)

Link del Proyecto: [https://github.com/fersoria/sticker-token-mini-app](https://github.com/fersoria/sticker-token-mini-app)
