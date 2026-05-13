'use client';
import React from 'react';
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaClock,
} from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';

const contacts = [
  {
    icon: FaMapMarkerAlt,
    label: 'Хаяг',
    value: 'Union Building C блок, 7 давхар 708 тоот, Улаанбаатар',
    color: 'bg-blue-600',
  },
  {
    icon: FaPhoneAlt,
    label: 'Утас',
    value: '77135051',
    color: 'bg-green-600',
  },
  {
    icon: FaEnvelope,
    label: 'Цахим шуудан',
    value: 'emduz2025@gmail.com',
    color: 'bg-orange-500',
  },
  {
    icon: FaClock,
    label: 'Ажлын цаг',
    value: 'Даваа — Баасан, 09:00 – 18:00',
    color: 'bg-purple-600',
  },
];

const ContactSection = () => {
  return (
    <section className="py-16 bg-[#F8FAFC] border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 h-[3px] bg-blue-600 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">
              Холбоо барих
            </h2>
            <span className="w-8 h-[3px] bg-blue-600 rounded-full" />
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
            Бидэнтэй холбогдох мэдээлэл
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl ${item.color} shadow-sm`}
                  >
                    <Icon size={14} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    <p className="text-[13px] font-bold text-gray-800 leading-snug">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
            })}

            <a
              href="https://maps.google.com/?q=Union+Building+Ulaanbaatar"
              target="_blank"
              rel="noopener noreferrer"
              className="sm:col-span-2 flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <FaMapMarkerAlt size={14} />
              Google Maps-аар харах
              <FiExternalLink size={13} />
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100 h-[360px] bg-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.5!2d106.9057!3d47.9077!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d96ed37a4e9ad3b%3A0x333d61aa98a78e49!2sUnion+Building!5e0!3m2!1sen!2smn!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ЭМДҮЗ байршил"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
