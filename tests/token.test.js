/**
 * Tests unitaires pour les fonctionnalités de token JWT
 */

const jwt = require('jsonwebtoken');
const tokenController = require('../controllers/tokenController');
const config = require('../config/config');

// Mock pour Express req/res
const mockRequest = (body = {}) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Token Controller', () => {
  // Test de génération de token
  describe('generateToken', () => {
    test('devrait générer un token valide avec un payload', () => {
      const req = mockRequest({ userId: '123', username: 'test' });
      const res = mockResponse();
      
      tokenController.generateToken(req, res);
      
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].token).toBeDefined();
      
      // Vérifier que le token est bien un JWT valide
      const token = res.json.mock.calls[0][0].token;
      const decoded = jwt.verify(token, config.jwtSecret);
      
      expect(decoded.userId).toBe('123');
      expect(decoded.username).toBe('test');
    });
    
    test('devrait renvoyer une erreur si le payload est vide', () => {
      const req = mockRequest({});
      const res = mockResponse();
      
      tokenController.generateToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });
  
  // Test de vérification de token
  describe('verifyToken', () => {
    test('devrait valider correctement un token JWT valide', () => {
      // Générer un token valide pour le test
      const payload = { userId: '123', username: 'test' };
      const token = jwt.sign(payload, config.jwtSecret);
      
      const req = mockRequest({ token });
      const res = mockResponse();
      
      tokenController.verifyToken(req, res);
      
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      expect(res.json.mock.calls[0][0].payload).toBeDefined();
      expect(res.json.mock.calls[0][0].payload.userId).toBe('123');
    });
    
    test('devrait rejeter un token JWT expiré', () => {
      // Générer un token déjà expiré
      const payload = { userId: '123', username: 'test' };
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '0s' });
      
      // Attendre un peu pour s'assurer que le token est expiré
      setTimeout(() => {
        const req = mockRequest({ token });
        const res = mockResponse();
        
        tokenController.verifyToken(req, res);
        
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalled();
        expect(res.json.mock.calls[0][0].success).toBe(false);
        expect(res.json.mock.calls[0][0].message).toContain('expiré');
      }, 100);
    });
    
    test('devrait rejeter un token mal formé', () => {
      const req = mockRequest({ token: 'ceci-nest-pas-un-token-jwt' });
      const res = mockResponse();
      
      tokenController.verifyToken(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(false);
    });
  });
  
  // Test de révocation de token
  describe('revokeToken', () => {
    test('devrait révoquer un token valide', () => {
      // Générer un token valide
      const payload = { userId: '123', username: 'test' };
      const token = jwt.sign(payload, config.jwtSecret);
      
      // Révoquer le token
      const req = mockRequest({ token });
      const res = mockResponse();
      
      tokenController.revokeToken(req, res);
      
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].success).toBe(true);
      
      // Vérifier que le token ne fonctionne plus après révocation
      const verifyReq = mockRequest({ token });
      const verifyRes = mockResponse();
      
      tokenController.verifyToken(verifyReq, verifyRes);
      
      expect(verifyRes.status).toHaveBeenCalledWith(401);
      expect(verifyRes.json.mock.calls[0][0].message).toContain('révoqué');
    });
  });
});