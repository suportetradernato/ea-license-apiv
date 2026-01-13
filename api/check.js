import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_KEY)
    )
  });
}

export default async function handler(req, res) {
  const account = req.query.account;

  if (!account) {
    return res.json({ status: "error" });
  }

  const doc = await admin.firestore()
    .collection("licenses")
    .doc(account)
    .get();

  if (!doc.exists) {
    return res.json({ status: "blocked" });
  }

  const data = doc.data();
  const expires = data.expires.toDate();

  if (data.status !== "active") {
    return res.json({ status: "blocked" });
  }

  if (expires < new Date()) {
    return res.json({ status: "expired" });
  }

  return res.json({ status: "active" });
}
