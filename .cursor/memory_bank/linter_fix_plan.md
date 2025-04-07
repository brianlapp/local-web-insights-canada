# Linter Error Fix Plan

## 1. Type Declaration Issues

### A. Express Type Declarations
- Issue: `File '/types/express/index.d.ts' is not a module`
- Solution: Create proper Express type declarations
- Files to fix:
  - `src/controllers/businessController.ts`
  - `src/routes/businessRoutes.ts`
  - `src/middleware/validationMiddleware.ts`

### B. Express-Validator Type Declarations
- Issue: `Cannot find module 'express-validator' or its corresponding type declarations`
- Solution: Install express-validator type declarations
- Files to fix:
  - `src/routes/businessRoutes.ts`
  - `src/middleware/validationMiddleware.ts`

## 2. Logger Import Issues

### A. Logger Export/Import
- Issue: `Module '"../utils/logger"' has no exported member 'logger'`
- Solution: Fix logger export/import
- Files to fix:
  - `src/services/businessService.ts`
  - `src/controllers/businessController.ts`

## 3. Type Safety Issues

### A. Error Handling Types
- Issue: `'error' is of type 'unknown'`
- Solution: Add proper type checking and casting
- Files to fix:
  - `src/controllers/businessController.ts`

### B. Validation Error Types
- Issue: `Parameter 'err' implicitly has an 'any' type`
- Solution: Add proper type definitions for validation errors
- Files to fix:
  - `src/middleware/validationMiddleware.ts`

### C. ApiError Constructor
- Issue: `Argument of type 'string' is not assignable to parameter of type 'number'`
- Solution: Fix ApiError constructor parameter types
- Files to fix:
  - `src/services/businessService.ts`
  - `src/middleware/validationMiddleware.ts`

## Implementation Steps

1. Fix Type Declarations
   ```bash
   # Install required type declarations
   npm install --save-dev @types/express-validator
   ```

2. Fix Logger Export/Import
   - Update logger.ts to use proper export
   - Update imports in affected files

3. Fix Error Handling
   - Add proper type checking for errors
   - Update ApiError constructor usage

4. Fix Validation Types
   - Add proper type definitions for validation errors
   - Update validation middleware

## Files to Modify

1. `src/types/express/index.d.ts`
   - Create proper Express type declarations

2. `src/utils/logger.ts`
   - Fix logger export

3. `src/services/businessService.ts`
   - Fix logger import
   - Fix ApiError constructor usage

4. `src/controllers/businessController.ts`
   - Fix error type handling
   - Fix logger import

5. `src/routes/businessRoutes.ts`
   - Fix express-validator imports

6. `src/middleware/validationMiddleware.ts`
   - Fix validation error types
   - Fix ApiError constructor usage

## Verification Steps

1. Run TypeScript compiler
   ```bash
   npm run build
   ```

2. Run ESLint
   ```bash
   npm run lint
   ```

3. Verify no new errors introduced

## Next Steps After Fixing Linter Errors

1. Test Business Endpoints
   - Set up test environment
   - Create test cases
   - Run endpoint tests

2. Implement Business Analytics
   - Add analytics endpoints
   - Implement data aggregation
   - Add caching

3. Implement Business Search and Filtering
   - Add search functionality
   - Implement filtering
   - Add sorting options

Would you like to proceed with fixing the type declarations first? 