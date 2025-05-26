'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import emailjs from '@emailjs/browser';

export default function Home() {
  const router = useRouter();
  const { isLoggedIn, role, user } = useUserStore();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    otherDepartment: '',
    doctor: '',
    date: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({
    isSubmitting: false,
    isSubmitted: false,
    error: null
  });
  const form = useRef();
  const [minDate, setMinDate] = useState('');

  useEffect(() => {
    console.log('Home page - Auth state:', { isLoggedIn, role });
    
    // If admin or doctor is logged in, redirect to dashboard
    if (isLoggedIn && (role === 1 || role === 2)) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, role, router]);

  // Fetch doctors when component mounts
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch('/api/doctors?limit=3');
        const data = await response.json();
        setDoctors(data.doctors || []);
      } catch (error) {
        console.error('Error fetching doctors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    // Get tomorrow's date as the minimum allowed date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format as YYYY-MM-DD for the date input
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for date field
    if (name === 'date') {
      // Check if the selected date is not before the minimum date
      const selectedDate = new Date(value);
      const minimumDate = new Date(minDate);
      
      // Only update if date is valid and not in the past
      if (!isNaN(selectedDate) && selectedDate >= minimumDate) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      } else {
        // Reset to empty if invalid date selected
        setFormData(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ isSubmitting: true, isSubmitted: false, error: null });

    try {
      // Create the message
      const message = 
`New Appointment Request:

Patient Details:
- Name: ${formData.name}
- Email: ${formData.email}
- Phone: ${formData.phone}

Appointment Details:
- Department: ${formData.department === 'other' ? formData.otherDepartment : formData.department}
- Doctor: ${formData.doctor === 'none' ? 'No specific doctor requested' : formData.doctor}
- Date: ${formData.date}
- Message: ${formData.message}`;

      // Format phone number (remove all non-digits)
      const phoneNumber = '96103890087'.replace(/\D/g, '');
      
      // Check if device is mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      // Create WhatsApp URL based on device type
      const encodedText = encodeURIComponent(message);
      const whatsappUrl = isMobile
        ? `whatsapp://send?phone=${phoneNumber}&text=${encodedText}`
        : `https://web.whatsapp.com/send/?phone=${phoneNumber}&text=${encodedText}&type=phone_number&app_absent=0`;
      
      // Open WhatsApp in a new tab
      const newTab = window.open(whatsappUrl, '_blank');
      // Ensure new tab gets focus (for better user experience)
      if (newTab) newTab.focus();

      // Clear form after a short delay
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          department: '',
          otherDepartment: '',
          doctor: '',
          date: '',
          message: ''
        });
        
        setSubmitStatus({
          isSubmitting: false,
          isSubmitted: true,
          error: null
        });

        // Reset success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(prev => ({ ...prev, isSubmitted: false }));
        }, 5000);
      }, 1000);

    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        isSubmitting: false,
        isSubmitted: false,
        error: 'Failed to send appointment request. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
          <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Modern Healthcare Solution</h1>
              <p className="text-xl mb-8">Get professional medical care from the comfort of your home. Book appointments, connect with doctors, and manage your health journey.</p>
              {isLoggedIn && role === 3 ? (
                <button 
                  onClick={() => router.push('/dashboard')} 
                  className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard
                </button>
              ) : !isLoggedIn ? (
                <div className="flex flex-wrap gap-4">
                  <button 
                    onClick={() => router.push('/signup')} 
                    className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Sign Up
                  </button>
                  <button 
                    onClick={() => router.push('/login')} 
                    className="bg-transparent border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    Login
                  </button>
                </div>
              ) : null}
            </div>
            <div className="md:w-1/2 md:pl-10">
              <img 
                src="https://online.visual-paradigm.com/repository/images/6748adf2-f238-4d5a-8fe4-6939312c4408/healthcare-illustration-design/hospital-illustration.png" 
                alt="Healthcare Illustration" 
                className="max-w-full rounded-lg shadow-xl"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/500x400?text=Healthcare';
                }}
              />
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 mb-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Online Appointments</h3>
                <p className="text-gray-600">Schedule appointments with our qualified doctors without leaving your home.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 mb-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Doctors</h3>
                <p className="text-gray-600">Connect with experienced specialists across various medical fields.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-blue-500 mb-4">
                  <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Health Records</h3>
                <p className="text-gray-600">Access and manage your medical records securely in one place.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Doctors Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Doctors</h2>
            
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {doctors.map((doctor) => (
                    <div key={doctor.doctor_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                      <div className="h-48 bg-blue-50 flex items-center justify-center">
                        {doctor.profile_picture ? (
                          <img 
                            src={doctor.profile_picture}
                            alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/300x200?text=Doctor';
                            }}
                          />
                        ) : (
                          <div className="text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-blue-500 mb-2">Dr. {doctor.first_name} {doctor.last_name}</h3>
                        <p className="text-blue-400 mb-3">{doctor.specialty_name}</p>
                        
                        <div className="space-y-2 text-gray-600 mb-4">
                          {doctor.gender && (
                            <p><span className="font-medium">Gender:</span> {doctor.gender}</p>
                          )}
                          {doctor.qualifications && (
                            <p><span className="font-medium">Qualifications:</span> {doctor.qualifications}</p>
                          )}
                          {doctor.experience_years && (
                            <p><span className="font-medium">Experience:</span> {doctor.experience_years} years</p>
                          )}
                          {doctor.languages_spoken && (
                            <p><span className="font-medium">Languages:</span> {doctor.languages_spoken}</p>
                          )}
                        </div>
                        
                        {doctor.bio && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{doctor.bio}</p>
                        )}
                        
                        
                      </div>
                    </div>
                  ))}
                  
                  {doctors.length === 0 && !loading && (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-gray-500">No doctors found.</p>
                    </div>
                  )}
                </div>
                
                {/* View All Doctors Button */}
                <div className="mt-12 text-center">
                  <button
                    onClick={() => router.push('/doctors')}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center"
                  >
                    <span>View All Doctors</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </>
            )}
            
          </div>
        </section>


        {/* Testimonials Section */}
        <section className="py-16 relative z-40">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Patients Say</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 rounded-full p-2 mr-3">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Sarah Johnson</h3>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
                <p className="text-gray-600">"The online appointment system saved me so much time. I was able to see a doctor within hours of booking!"</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 rounded-full p-2 mr-3">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Michael Thompson</h3>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
                <p className="text-gray-600">"Having all my health records in one place has made managing my chronic condition so much easier. Highly recommended!"</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow border border-gray-100 lg:col-span-1 md:col-span-2 lg:col-auto">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-50 rounded-full p-2 mr-3">
                    <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Emily Rodriguez</h3>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
                <p className="text-gray-600">"The doctors are very professional and take the time to explain everything. I feel much more in control of my health now."</p>
              </div>
            </div>
          </div>
        </section>

        {/* Blood Donation Section */}
        <section className="py-16 bg-gradient-to-r from-red-50 to-red-100 relative z-30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <img 
                  src="https://img.freepik.com/free-vector/blood-donation-concept-illustration_114360-2870.jpg" 
                  alt="Blood Donation" 
                  className="rounded-lg shadow-md max-w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/500x400?text=Blood+Donation';
                  }}
                />
              </div>
              <div className="md:w-1/2 md:pl-10">
                <h2 className="text-3xl font-bold text-red-600 mb-4">Donate Blood, Save Lives</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Your blood donation can make a significant difference in someone's life. 
                  Just one donation can save up to three lives!
                </p>
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Donation Center Location</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Room:</span> B-103
                  </p>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Floor:</span> Ground Floor, East Wing
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Hours:</span> Monday to Friday, 9:00 AM - 3:00 PM
                  </p>
                </div>
                <button 
                  onClick={() => window.open('/blood-donation', '_self')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300 shadow-md"
                >
                  Learn More About Donating
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Appointment Booking Section */}
        <section className="py-16 bg-gray-50 rounded-lg">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-800">We Are Always Ready To Help You.</h2>
              <h3 className="text-2xl font-semibold text-gray-700 mt-2">Contact With Us</h3>
              <div className="flex justify-center mt-4">
                <svg className="w-20 h-8 text-blue-500" viewBox="0 0 100 20">
                  <path d="M0 10 H40 M60 10 H100" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="10" r="5" fill="currentColor"/>
                </svg>
              </div>
              
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2">
                <form ref={form} className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Department</option>
                      <option value="blood-donation">Blood Donation</option>
                      <option value="blood-test">Blood Test</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {formData.department === 'other' && (
                    <div className="mt-4">
                      <input
                        type="text"
                        name="otherDepartment"
                        placeholder="Please specify your department/concern"
                        value={formData.otherDepartment}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      name="doctor"
                      value={formData.doctor}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Doctor</option>
                      <option value="none">None (No preference)</option>
                      <option value="dr-smith">Dr. Smith</option>
                      <option value="dr-jones">Dr. Jones</option>
                    </select>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={minDate}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <textarea
                    name="message"
                    placeholder="Write Your Message Here...."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  <div>
                    <button
                      type="submit"
                      disabled={submitStatus.isSubmitting}
                      className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 ${
                        submitStatus.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitStatus.isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                    {!submitStatus.error && !submitStatus.isSubmitted && (
                      <p className="text-sm text-gray-500 mt-2">( We will confirm by Text Message )</p>
                    )}
                    {submitStatus.isSubmitted && (
                      <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
                        Request sent successfully! We'll be in touch soon. Please check your email for confirmation.
                      </div>
                    )}
                    {submitStatus.error && (
                      <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                        {submitStatus.error}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="w-full md:w-1/2">
                <img
                  src="https://img.freepik.com/free-photo/medical-banner-with-doctor-working-laptop_23-2149611211.jpg"
                  alt="Medical Team"
                  className="rounded-lg shadow-lg w-full h-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/600x400?text=Medical+Team';
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
