# Voxel Review — Cloud Functions

Backend de funciones serverless utilizado por **Voxel Review** para mantener datos sincronizados y enviar notificaciones push.

## Tecnologías

- Node.js
- Cloud Functions for Firebase de segunda generación
- Cloud Firestore
- Firebase Cloud Messaging (FCM)
- Firebase Admin SDK

## Funciones

### `updateUserInfoInReviews`

Sincroniza la información del usuario en sus reseñas cuando actualiza su perfil.

### `sendFollowNotificaction`

Envía una notificación cuando un usuario recibe un nuevo seguidor.

Documento que activa la función:

```text
users/{userId}/followers/{followerId}
```

### `sendLikeNotificaction`

Notifica al autor de una reseña cuando otro usuario le da like. No envía notificaciones por likes propios.

Documento que activa la función:

```text
reviews/{reviewId}/likes/{likerId}
```

## Requisitos

- Node.js compatible con la versión configurada en `functions/package.json`.
- Firebase CLI.
- Acceso al proyecto Firebase de Voxel Review.

## Instalación

Desde la raíz del repositorio:

```bash
cd functions
npm install
cd ..
```

Inicia sesión y selecciona el proyecto:

```bash
firebase login
firebase use voxelreview-78caf
```

## Despliegue

Desplegar todas las funciones:

```bash
firebase deploy --only functions
```

Desplegar una función específica:

```bash
firebase deploy --only functions:sendLikeNotificaction
```

## Notificaciones push

Para recibir notificaciones, el usuario debe tener un token FCM válido guardado en el campo `fcmtoken` de su documento:

```text
users/{userId}
```

El campo `username` se utiliza para mostrar el nombre de quien realiza la acción.

En Android 13 o superior, la aplicación también debe tener concedido el permiso de notificaciones.

## Logs

Consultar los registros de las funciones:

```bash
firebase functions:log
```

Consultar una función específica:

```bash
firebase functions:log --only sendLikeNotificaction
```

## Comportamiento de los likes

Si un usuario elimina su like y vuelve a darlo, se crea un nuevo documento y se vuelve a activar la notificación.
