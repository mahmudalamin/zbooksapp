// src/app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Your Company',
  description: 'Learn more about our company and team',
};

// Custom SVG Icons (no external dependencies needed)
const HeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const AcademicIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
  </svg>
);

const BriefcaseIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 0H8m8 0v5a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're passionate about creating exceptional digital experiences that make a difference.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            We believe in the power of technology to transform businesses and lives. Our mission is to 
            deliver innovative solutions that combine cutting-edge technology with exceptional user experience. 
            We're committed to building lasting relationships with our clients and creating digital products 
            that exceed expectations.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <CodeIcon className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
            <p className="text-gray-600">
              We stay ahead of the curve with the latest technologies and best practices.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <UserIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Client Focus</h3>
            <p className="text-gray-600">
              Your success is our priority. We listen, understand, and deliver.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <GlobeIcon className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-gray-600">
              We serve clients worldwide with 24/7 support and dedication.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center mb-6">
            <AcademicIcon className="h-8 w-8 text-indigo-500 mr-3" />
            <h2 className="text-3xl font-bold text-gray-900">Our Expertise</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <BriefcaseIcon className="h-6 w-6 text-blue-500 mr-3 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Web Development</h4>
                <p className="text-gray-600">
                  Full-stack development with modern frameworks like React, Next.js, and Node.js.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BriefcaseIcon className="h-6 w-6 text-green-500 mr-3 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Mobile Apps</h4>
                <p className="text-gray-600">
                  Native and cross-platform mobile applications for iOS and Android.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BriefcaseIcon className="h-6 w-6 text-purple-500 mr-3 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">UI/UX Design</h4>
                <p className="text-gray-600">
                  Beautiful, intuitive designs that prioritize user experience and accessibility.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <BriefcaseIcon className="h-6 w-6 text-red-500 mr-3 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Cloud Solutions</h4>
                <p className="text-gray-600">
                  Scalable cloud infrastructure and deployment solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
