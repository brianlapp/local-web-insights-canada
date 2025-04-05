export const createMockSupabaseClient = () => {
  const mockUpload = jest.fn();
  const mockUpdate = jest.fn();
  const mockInsert = jest.fn();
  const mockRpc = jest.fn();
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'businesses') {
      return { update: mockUpdate, eq: jest.fn().mockReturnThis() };
    }
    if (table === 'raw_business_data') {
      return { insert: mockInsert };
    }
    if (table === 'geo_grids') {
      return { update: mockUpdate, eq: jest.fn().mockReturnThis() };
    }
    return {};
  });

  const mockClient = {
    storage: { from: jest.fn().mockReturnValue({ upload: mockUpload }) },
    from: mockFrom,
    rpc: mockRpc
  };

  // Set default successful responses
  mockUpload.mockResolvedValue({ data: { path: 'test-path' }, error: null });
  mockUpdate.mockResolvedValue({ data: null, error: null });
  mockInsert.mockResolvedValue({ data: null, error: null });
  mockRpc.mockResolvedValue({ data: null, error: null });

  return {
    mockClient,
    mockUpload,
    mockUpdate,
    mockInsert,
    mockRpc,
    mockFrom
  };
};

describe('Database Mocks', () => {
  it('should create mock Supabase client', () => {
    const { mockClient, mockUpload, mockUpdate } = createMockSupabaseClient();
    expect(mockClient).toBeDefined();
    expect(mockUpload).toBeDefined();
    expect(mockUpdate).toBeDefined();
  });
}); 