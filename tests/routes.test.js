/**
 * Tests d'intégration pour les routes API
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../index');
const config = require('../config/config');

describe('API Routes', () => {
  // Test de la route racine
  describe('GET /', () => {
    test('devrait renvoyer le statut du service', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('online');
      expect(response.body.service).toBe('jwt-microservice');
    });
  });

  // Tests des routes de token
  describe('Token Routes', () => {
    test('POST /api/token/generate devrait générer un token', async () => {
      const payload = { userId: '123', username: 'test', role: 'user' };
      
      const response = await request(app)
        .post('/api/token/generate')
        .send(payload);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      
      // Vérifier que le token est décodable
      const decoded = jwt.verify(response.body.token, config.jwtSecret);
      expect(decoded.userId).toBe('123');
      expect(decoded.role).toBe('user');
    });
    
    test('POST /api/token/verify devrait vérifier un token valide', async () => {
      // Générer un token
      const payload = { userId: '123', username: 'test', role: 'user' };
      const token = jwt.sign(payload, config.jwtSecret);
      
      const response = await request(app)
        .post('/api/token/verify')
        .send({ token });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.payload.userId).toBe('123');
      expect(response.body.payload.role).toBe('user');
    });
  });

  // Tests des routes protégées
  describe('Protected Routes', () => {
    let validToken;
    let adminToken;
    
    beforeAll(() => {
      // Créer des tokens pour les tests
      validToken = jwt.sign({ userId: '123', username: 'test', role: 'user' }, config.jwtSecret);
      adminToken = jwt.sign({ userId: '456', username: 'admin', role: 'admin' }, config.jwtSecret);
    });
    
    test('GET /api/protected devrait autoriser un utilisateur authentifié', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.userId).toBe('123');
    });
    
    test('GET /api/protected devrait refuser un utilisateur sans token', async () => {
      const response = await request(app)
        .get('/api/protected');
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
    
    test('GET /api/admin devrait autoriser un admin', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
    
    test('GET /api/admin devrait refuser un utilisateur non-admin', async () => {
      const response = await request(app)
        .get('/api/admin')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
    
    test('GET /api/profile devrait renvoyer le profil de l\'utilisateur', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.userId).toBe('123');
      expect(response.body.profile.username).toBe('test');
      // Les champs iat et exp ne devraient pas être présents
      expect(response.body.profile.iat).toBeUndefined();
      expect(response.body.profile.exp).toBeUndefined();
    });
  });
});