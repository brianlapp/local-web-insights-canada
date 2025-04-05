// Mock Supabase client
const mockUpload = jest.fn().mockResolvedValue({ data: { path: 'test-path' }, error: null });
const mockUpdate = jest.fn().mockResolvedValue({ data: null, error: null });
const mockInsert = jest.fn().mockResolvedValue({ data: null, error: null });
const mockRpc = jest.fn().mockResolvedValue({ data: null, error: null });
const mockEq = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({ data: null, error: null });

const mockFrom = jest.fn().mockImplementation((table) => ({
  update: mockUpdate,
  insert: mockInsert,
  eq: mockEq,
  select: mockSelect,
  single: mockSingle
}));

const mockClient = {
  storage: { from: jest.fn().mockReturnValue({ upload: mockUpload }) },
  from: mockFrom,
  rpc: mockRpc
};

const createClient = jest.fn().mockReturnValue(mockClient);

// Reset function for tests
const resetSupabaseMocks = () => {
  mockUpload.mockClear();
  mockUpdate.mockClear();
  mockInsert.mockClear();
  mockRpc.mockClear();
  mockEq.mockClear();
  mockSelect.mockClear();
  mockSingle.mockClear();
  mockFrom.mockClear();
  createClient.mockClear();
};

// Export using CommonJS for Jest mock compatibility
module.exports = {
  createClient,
  mockUpload,
  mockUpdate,
  mockInsert,
  mockRpc,
  mockEq,
  resetSupabaseMocks
}; 