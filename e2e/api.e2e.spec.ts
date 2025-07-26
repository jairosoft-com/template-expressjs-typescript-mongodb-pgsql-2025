import request from 'supertest';
import app from '../../src/server'; // Import your express app
import UserModel from '../../src/database/models/user.model';

jest.mock('../../src/database/models/user.model');
const mockUserModel = UserModel as jest.Mocked<typeof UserModel>;

describe('POST /api/v1/users/register', () => {
  it('should register a user and return 201', async () => {
    const userData = {
      name: 'E2E Test User',
      email: 'e2e@test.com',
      password: 'password123',
    };

    // Mock the database interaction
    mockUserModel.findOne.mockResolvedValue(null);
    (UserModel.create as jest.Mock).mockResolvedValue({
      id: 'mock-id',
      ...userData,
    });
    
    const response = await request(app)
      .post('/api/v1/users/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.token).toBeDefined();
  });
});