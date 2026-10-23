const {
    onDocumentUpdated,
    onDocumentCreated
} = require("firebase-functions/v2/firestore")

//acceder a la bd
const admin = require("firebase-admin")
//imprimir cosas en consola 
const logger = require("firebase-functions/logger")
const { event } = require("firebase-functions/v1/analytics")

//actualizar la foto de perfil apenas la cambie en la BD (en todos los tweets de ese usuario)

admin.initializeApp()
const db = admin.firestore()


exports.updateUserInfoInReviews = onDocumentUpdated (
    "users/{userId}",
    async(event) => {
        const userId = event.params.userId

        const beforeData = event.data.before.data()

        const afterData = event.data.after.data()

        //si la imagen no cambio
        if(beforeData.photoUrl === afterData.photoUrl){
            logger.log("no change in profile image, skipping update.")
            return
        }

        logger.log("actualizando reviews del usuario: ", userId)

        //obtener todos los reviews
        const reviewsSnapshot = await db
            .collection("reviews")
            .where("userId", "==" , userId)
            .get()

        //batch funciona para actualizar todos las reviews y si todo sale bien hace el commit
        const batch = db.batch()

        reviewsSnapshot.forEach((reviewDoc) =>{
            batch.update(reviewDoc.ref,{
                "user.photoUrl": afterData.photoUrl
            })
        })

        await batch.commit()

        logger.log("reviews actualizadas exitosamente por el usuario: ", userId)

    }
)

//notificacion follow

exports.sendFollowNotificaction = onDocumentCreated(
    "users/{userId}/followers/{followerId}",
    async (event) => {
        const { userId, followerId } = event.params;

        const userDoc = await db.collection("users").doc(userId).get();
        const userToken = userDoc.data()?.fcmtoken;

        const followerDoc = await db.collection("users").doc(followerId).get();
        const followerName = followerDoc.data()?.username || "Alguien";

        if (!userToken) {
            logger.log(`El usuario ${userId} no tiene un token FCM`);
            return;
        }

        const message = {
            token: userToken,
            notification: {
                title: "Nuevo seguidor",
                body: `${followerName} ha comenzado a seguirte`
            }
        };

        try {
            await admin.messaging().send(message);
            logger.log(
                `Notificación enviada a ${userId} por nuevo seguidor: ${followerName}`
            );
        } catch (error) {
            logger.error(
                `Error al enviar la notificación a ${userId}:`,
                error
            );
        }
    }
);