import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

let app;

/** Starts Firebase on first use, so the server can start (and list its tools) even before credentials are set. */
export function init() {
  if (app) return app;
  const emulator = process.env.FIRESTORE_EMULATOR_HOST;
  if (emulator) {
    app = initializeApp({ projectId: process.env.GCLOUD_PROJECT || "demo-aspire" });
    return app;
  }
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    app = initializeApp({ credential: applicationDefault() });
    return app;
  }
  throw new Error(
    "Firebase key not found. Set GOOGLE_APPLICATION_CREDENTIALS to the path of your service-account JSON file (see README)."
  );
}

export const db = () => (init(), getFirestore());
export const auth = () => (init(), getAuth());
export const col = (name) => db().collection(name);

export async function all(name) {
  const s = await col(name).get();
  return s.docs.map((d) => ({ ...d.data(), id: d.id }));
}
export async function where(name, field, op, value) {
  const s = await col(name).where(field, op, value).get();
  return s.docs.map((d) => ({ ...d.data(), id: d.id }));
}
export async function getDoc(name, id) {
  const d = await col(name).doc(id).get();
  return d.exists ? { ...d.data(), id: d.id } : null;
}
/** Writes many documents (max 400 per batch, like the app). */
export async function setMany(name, docs) {
  for (let i = 0; i < docs.length; i += 400) {
    const b = db().batch();
    for (const d of docs.slice(i, i + 400)) b.set(col(name).doc(d.id), d);
    await b.commit();
  }
}
export async function deleteMany(name, ids) {
  for (let i = 0; i < ids.length; i += 400) {
    const b = db().batch();
    for (const id of ids.slice(i, i + 400)) b.delete(col(name).doc(id));
    await b.commit();
  }
}
export function newId(name) {
  return col(name).doc().id;
}
