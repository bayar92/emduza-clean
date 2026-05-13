import React from 'react';
import {
  FaBell,
  FaEnvelope,
  FaTasks,
  FaUserCircle,
  FaSearch,
} from 'react-icons/fa';

const TopNavBar = () => {
  return (
    <div className="flex-1 min-h-screen p-8 bg-gray-100 ml-72">
      <header className="flex justify-between items-center bg-white p-6 shadow-md">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </header>
      <main className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Total Likes</h2>
            <p className="text-3xl font-semibold">50,120</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Comments</h2>
            <p className="text-3xl font-semibold">25,120</p>
          </div>
          <div className="bg-purple-100 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold">Total Share</h2>
            <p className="text-3xl font-semibold">10,320</p>
          </div>
        </div>
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Joined</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4 border-b">Prem Shahi</td>
                <td className="py-2 px-4 border-b">premshahi@gmail.com</td>
                <td className="py-2 px-4 border-b">2022-02-12</td>
                <td className="py-2 px-4 border-b">New</td>
                <td className="py-2 px-4 border-b">Liked</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Deepa Chand</td>
                <td className="py-2 px-4 border-b">deepachand@gmail.com</td>
                <td className="py-2 px-4 border-b">2022-02-12</td>
                <td className="py-2 px-4 border-b">Member</td>
                <td className="py-2 px-4 border-b">Shared</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Prakash Shahi</td>
                <td className="py-2 px-4 border-b">prakashshahi@gmail.com</td>
                <td className="py-2 px-4 border-b">2022-02-13</td>
                <td className="py-2 px-4 border-b">New</td>
                <td className="py-2 px-4 border-b">Liked</td>
              </tr>
              <tr>
                <td className="py-2 px-4 border-b">Manisha Chand</td>
                <td className="py-2 px-4 border-b">manishachand@gmail.com</td>
                <td className="py-2 px-4 border-b">2022-02-13</td>
                <td className="py-2 px-4 border-b">Member</td>
                <td className="py-2 px-4 border-b">Shared</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default TopNavBar;
