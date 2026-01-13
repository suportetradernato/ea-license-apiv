import admin from "firebase-admin";

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_KEY)
      )
    });
  }
} catch (e) {
  console.error("Firebase init error", e);
}

export default async function handler(req, res) {
  try {
    const account = req.query.account;
    if (!account) return res.json({ status: "error" });

    const doc = await admin.firestore()
      .collection("licenses")
      .doc(account)
      .get();

    if (!doc.exists) return res.json({ status: "blocked" });

    const data = doc.data();
    const expires = data.expires.toDate();

    if (data.status !== "active" || expires < new Date())
      return res.json({ status: "expired" });

    return res.json({ status: "active" });
  } catch (e) {
    console.error("Runtime error", e);
    return res.status(500).json({ status: "error" });
  }
}
