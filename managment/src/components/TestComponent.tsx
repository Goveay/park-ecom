import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../utils/storage';

const TestComponent: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const testStorage = () => {
    // Test localStorage functionality
    const testData = { test: 'data', timestamp: Date.now() };
    storage.set('test_key', testData);
    const retrieved = storage.get('test_key');
    console.log('Storage test:', retrieved);
    storage.remove('test_key');
    alert('Depolama testi tamamlandı! Detaylar için konsolu kontrol edin.');
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">🎉 Uygulama Durumu: ÇALIŞIYOR!</h2>
      
      <div className="space-y-6">
        <div className="test-section bg-blue-50">
          <h3 className="font-semibold text-blue-900 text-lg mb-3">✅ Kimlik Doğrulama Durumu</h3>
          <p className="text-blue-700 mb-2">
            Kimlik Doğrulandı: {isAuthenticated ? '✅ Evet' : '❌ Hayır'}
          </p>
          {user && (
            <p className="text-blue-700">
              Kullanıcı: <span className="font-semibold">{user.name}</span> ({user.email})
            </p>
          )}
        </div>

        <div className="test-section bg-green-50">
          <h3 className="font-semibold text-green-900 text-lg mb-3">✅ CSS Stil Testi</h3>
          <div className="flex gap-3 mb-3">
            <button className="btn-primary">Ana Buton</button>
            <button className="btn-secondary">İkincil Buton</button>
            <button className="btn-danger">Tehlikeli Buton</button>
          </div>
          <p className="text-sm text-green-700">
            Tüm butonlar uygun stil, gradyan ve hover efektlerine sahip olmalı!
          </p>
        </div>

        <div className="test-section bg-purple-50">
          <h3 className="font-semibold text-purple-900 text-lg mb-3">✅ Storage Test</h3>
          <button 
            onClick={testStorage}
            className="btn-primary"
          >
            Test localStorage
          </button>
          <p className="text-sm text-purple-700 mt-2">
            Click to test localStorage functionality
          </p>
        </div>

        <div className="test-section bg-orange-50">
          <h3 className="font-semibold text-orange-900 text-lg mb-3">✅ Responsive Design</h3>
          <div className="grid grid-cols-1 gap-4 mb-3">
            <div className="p-4 bg-white rounded-lg border shadow-sm">Mobile First Design</div>
            <div className="p-4 bg-white rounded-lg border shadow-sm">Tablet Responsive</div>
            <div className="p-4 bg-white rounded-lg border shadow-sm">Desktop Layout</div>
          </div>
          <p className="text-sm text-orange-700">
            Try resizing your browser window to see responsive behavior!
          </p>
        </div>

        <div className="test-section bg-red-50">
          <h3 className="font-semibold text-red-900 text-lg mb-3">🎯 Next Steps</h3>
          <p className="text-red-700 mb-3">
            Great! The application is now working with beautiful styling. We can proceed to implement:
          </p>
          <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
            <li>Dashboard with financial calculations</li>
            <li>Project CRUD operations</li>
            <li>Customer management</li>
            <li>Product inventory</li>
            <li>Transaction system</li>
            <li>PDF quotation generation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;
