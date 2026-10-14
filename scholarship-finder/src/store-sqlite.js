// SQLite storage (local development and tests). Same async interface as the Supabase store.
import * as db from './db.js';

export function createSqliteStore(path) {
  const conn = db.openDb(path);
  return {
    kind: 'sqlite',
    async ping() {
      conn.prepare('SELECT 1').get();
    },
    async listPublished() {
      return db.listPublished(conn);
    },
    async getPublished(id) {
      return db.getPublished(conn, id);
    },
    async listAll() {
      return db.listAllScholarships(conn);
    },
    async get(id) {
      return db.getScholarship(conn, id);
    },
    async save(s) {
      db.saveScholarship(conn, s);
    },
    async deleteScholarship(id) {
      return db.deleteScholarship(conn, id);
    },
    async setStatus(id, status) {
      return db.setStatus(conn, id, status);
    },
    async seed(rows, opts) {
      return db.seedRows(conn, rows, opts);
    },
    async insertProfile(p) {
      db.insertProfile(conn, p);
    },
    async listProfiles(limit) {
      return db.listProfiles(conn, limit);
    },
    async countProfiles() {
      return db.countProfiles(conn);
    },
    async deleteProfile(id) {
      return db.deleteProfile(conn, id);
    },
    async deleteProfilesBefore(iso) {
      return db.deleteProfilesBefore(conn, iso);
    },
    async addSuggestion(s) {
      db.addSuggestion(conn, s);
    },
    async listSuggestions(status) {
      return db.listSuggestions(conn, status);
    },
    async getSuggestion(id) {
      return db.getSuggestion(conn, id);
    },
    async resolveSuggestion(id, status) {
      return db.resolveSuggestion(conn, id, status);
    },
    close() {
      conn.close();
    },
  };
}
