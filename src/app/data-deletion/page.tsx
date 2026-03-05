"use client";

import React from "react";

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold mb-4">Request Data Deletion</h1>
        <p className="mb-6 text-gray-700">
          If you would like to request deletion of your personal data from our platform, please email us at
          <a href="mailto:admin@gigworldtoday.com" className="text-blue-600 underline ml-1">admin@gigworldtoday.com</a>.
          Please include your account email and any relevant details. We will process your request promptly in accordance with our privacy policy.
        </p>
        <p className="text-sm text-gray-500">
          For more information, see our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
