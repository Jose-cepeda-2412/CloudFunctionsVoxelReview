const {
    onDocumentUpdated,
    onDocumentCreated
} = require("firebase-functions/v2/firestore")

//acceder a la bd
const admin = require("firebase-admin")
//imprimir cosas en consola 
const logger = require("firebase-functions/logger")

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

