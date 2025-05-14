'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function BloodDonationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h1 className="text-white text-center text-3xl font-bold">Blood Donation Center</h1>
              <p className="text-white text-center text-sm mt-1">Donate blood and give the gift of life</p>
            </div>
            
            <div className="p-6">
              {/* Overview Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Donate Blood?</h2>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="md:w-2/3">
                    <p className="text-gray-700 mb-4">
                      Blood donation is a simple procedure that can help save multiple lives. Your donated blood is used for various
                      life-saving procedures, from emergency surgeries to treating patients with cancer, blood disorders, and chronic illnesses.
                    </p>
                    <p className="text-gray-700 mb-4">
                      Despite medical advances, there is still no substitute for human blood. It remains an essential resource that only
                      generous donors can provide.
                    </p>
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                      <p className="font-bold text-gray-800">Did you know?</p>
                      <p className="text-gray-700">A single car accident victim can require up to 100 units of blood.</p>
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <img 
                      src="https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-5488.jpg" 
                      alt="Blood Donation Importance" 
                      className="rounded-lg shadow-sm w-full h-auto"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x300?text=Blood+Donation';
                      }}
                    />
                  </div>
                </div>
              </section>
              
              {/* Eligibility Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Eligibility Requirements</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Basic Requirements</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>Be at least 17 years old (16 with parental consent in some states)</li>
                      <li>Weigh at least 110 pounds (50 kg)</li>
                      <li>Be in good general health</li>
                      <li>Have not donated blood in the last 56 days</li>
                    </ul>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Temporary Deferrals</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>Recent tattoos or piercings (within 3-12 months)</li>
                      <li>Pregnancy (until 6 weeks after delivery)</li>
                      <li>Travel to certain countries with endemic diseases</li>
                      <li>Recent surgery or major illness (varies by type)</li>
                      <li>Current cold, flu, or fever</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 text-sm">
                  Note: These are general guidelines. Our medical staff will perform a detailed screening to determine
                  eligibility on the day of donation.
                </p>
              </section>
              
              {/* Donation Process Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">The Donation Process</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold mb-3">1</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Registration</h3>
                    <p className="text-gray-700 text-sm">Sign in and complete a confidential medical history questionnaire.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold mb-3">2</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Medical Screening</h3>
                    <p className="text-gray-700 text-sm">Quick health check including blood pressure, pulse, and hemoglobin levels.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold mb-3">3</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Donation</h3>
                    <p className="text-gray-700 text-sm">The actual blood donation takes only about 8-10 minutes.</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex justify-center items-center h-12 w-12 rounded-full bg-blue-500 text-white font-bold mb-3">4</div>
                    <h3 className="font-semibold text-gray-800 mb-2">Refreshments</h3>
                    <p className="text-gray-700 text-sm">Rest and enjoy snacks and drinks before leaving.</p>
                  </div>
                </div>
                <p className="text-gray-700 mt-4">
                  The entire process takes about one hour. Your body will replace the fluid within 24 hours, and the red blood cells within 4-6 weeks.
                </p>
              </section>
              
              {/* Location and Hours */}
              <section className="mb-12 bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Visit Our Donation Center</h2>
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 mb-4 md:mb-0">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">Location Details</h3>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Room:</span> B-103
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Floor:</span> Ground Floor, East Wing
                    </p>
                    <p className="text-gray-700 mb-2">
                      <span className="font-medium">Hours:</span> Monday to Friday, 9:00 AM - 3:00 PM
                    </p>
                    <p className="text-gray-700 mb-4">
                      <span className="font-medium">Weekend Hours:</span> Saturday, 10:00 AM - 2:00 PM (Closed on Sundays)
                    </p>
                    <p className="text-gray-700">
                      Walk-ins are welcome, but appointments are recommended to minimize wait times.
                    </p>
                  </div>
                  <div className="md:w-1/2 md:pl-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">What to Bring</h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-2">
                      <li>Valid ID (driver's license, passport, or donor card)</li>
                      <li>List of medications you're currently taking</li>
                      <li>List of countries visited in the past 3 years</li>
                    </ul>
                    <div className="mt-6">
                      <Link href="/" className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                        Return to Home
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 