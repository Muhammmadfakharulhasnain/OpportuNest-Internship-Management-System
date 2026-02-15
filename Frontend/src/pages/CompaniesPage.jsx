import React from 'react'

function CompaniesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Partner Companies</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company listings will be added here */}
        <p className="text-gray-600">Loading companies...</p>
      </div>
    </div>
  )
}

export default CompaniesPage




