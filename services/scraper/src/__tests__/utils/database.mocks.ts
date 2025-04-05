export const createMockSupabaseClient = () => {
  const mockUpload = jest.fn();
  const mockUpdate = jest.fn();
  const mockFrom = jest.fn().mockImplementation((table) => {
    if (table === 'businesses') {
      return { update: mockUpdate, eq: jest.fn().mockReturnThis() };
    }
    return {};
  });

  const mockClient = {
    storage: { from: jest.fn().mockReturnValue({ upload: mockUpload }) },
    from: mockFrom
  };

  // Set default successful responses
  mockUpload.mockResolvedValue({ data: { path: 'test-path' }, error: null });
  mockUpdate.mockResolvedValue({ data: null, error: null });

  return {
    mockClient,
    mockUpload,
    mockUpdate,
    mockFrom
  };
}; 