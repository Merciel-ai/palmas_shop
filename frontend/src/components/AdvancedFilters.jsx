import React, { useState } from 'react';

const AdvancedFilters = ({ onFilterChange, products }) => {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 200000 });
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique sizes from all products
  const allSizes = [...new Set(products.flatMap(p => p.sizes || []))];

  // Price in CFA (1 USD = 600 CFA)
  const priceRanges = [
    { label: 'Under 30,000 CFA', min: 0, max: 30000 },
    { label: '30,000 - 60,000 CFA', min: 30000, max: 60000 },
    { label: '60,000 - 100,000 CFA', min: 60000, max: 100000 },
    { label: 'Over 100,000 CFA', min: 100000, max: 200000 }
  ];

  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const handleApplyFilters = () => {
    onFilterChange({
      priceRange,
      sizes: selectedSizes,
      sortBy
    });
  };

  const handleClearFilters = () => {
    setPriceRange({ min: 0, max: 200000 });
    setSelectedSizes([]);
    setSortBy('newest');
    onFilterChange({
      priceRange: { min: 0, max: 200000 },
      sizes: [],
      sortBy: 'newest'
    });
  };

  return (
    <div className="relative">
      {/* Filter Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 bg-gray-900 border border-afro-orange/30 rounded-full px-6 py-2 hover:border-afro-orange transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <span className="text-sm">Filters & Sort</span>
        {(selectedSizes.length > 0 || priceRange.min > 0 || priceRange.max < 200000) && (
          <span className="bg-afro-orange text-black text-xs px-2 py-1 rounded-full">Active</span>
        )}
      </button>

      {/* Filter Modal */}
      {showFilters && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)}></div>
          <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 z-50 shadow-2xl transform transition-transform duration-300">
            <div className="p-6 h-full overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-afro-orange/20">
                <h3 className="text-xl font-bold text-white">Advanced Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-afro-gold text-sm mb-3">SORT BY</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'newest', label: 'Newest First' },
                    { value: 'price-asc', label: 'Price: Low to High' },
                    { value: 'price-desc', label: 'Price: High to Low' },
                    { value: 'popular', label: 'Most Popular' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`px-4 py-2 rounded-lg text-sm transition ${
                        sortBy === option.value 
                          ? 'bg-afro-orange text-black font-bold' 
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-afro-gold text-sm mb-3">PRICE RANGE (CFA)</label>
                <div className="space-y-3">
                  {priceRanges.map(range => (
                    <button
                      key={range.label}
                      onClick={() => setPriceRange({ min: range.min, max: range.max })}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${
                        priceRange.min === range.min && priceRange.max === range.max
                          ? 'bg-afro-orange/20 border border-afro-orange text-afro-orange'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-afro-gold text-sm mb-3">SIZES</label>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`w-12 h-12 rounded-lg font-bold transition ${
                          selectedSizes.includes(size)
                            ? 'bg-afro-orange text-black'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8 pt-4 border-t border-gray-800">
                <button
                  onClick={handleApplyFilters}
                  className="flex-1 bg-afro-orange text-black py-3 rounded-lg font-bold hover:bg-afro-gold transition"
                >
                  Apply Filters
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 border border-gray-600 rounded-lg text-gray-400 hover:border-afro-orange hover:text-afro-orange transition"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdvancedFilters;