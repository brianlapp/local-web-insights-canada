
import { BusinessImport } from '@/components/admin/BusinessImport';

const BusinessImportPage = () => {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Import Businesses</h1>
      <p className="mb-6 text-gray-600">
        Upload prepared business data from CSV files. The data will be processed in chunks to avoid overloading the system.
      </p>
      <BusinessImport />
    </div>
  );
};

export default BusinessImportPage;
