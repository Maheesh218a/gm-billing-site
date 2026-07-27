import React, { useState, useEffect } from 'react';
import { invoiceService, Invoice } from '../../services/invoice.service';
import { Card } from '../../components/ui/Card';
import { Calendar as CalendarIcon, Clock, MapPin } from 'lucide-react';
import dayjs from 'dayjs';

export const BookingCalendar: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = invoiceService.subscribeToInvoices((data) => {
      // Filter only invoices that have a pickup date (i.e. are bookings)
      const bookings = data.filter(i => i.pickupDate);
      // Sort by pickup date
      bookings.sort((a, b) => new Date(a.pickupDate!).getTime() - new Date(b.pickupDate!).getTime());
      setInvoices(bookings);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Schedule</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upcoming trips and vehicle assignments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading schedule...</div>
        ) : invoices.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            No upcoming bookings found.
          </div>
        ) : (
          invoices.map(booking => (
            <Card premium key={booking.id} className="flex flex-col">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
                <div>
                  <div className="text-sm font-bold text-primary dark:text-blue-400 mb-1">{dayjs(booking.pickupDate).format('DD MMM YYYY')}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{booking.customerName}</h3>
                  <div className="text-xs text-gray-500 mt-1">{booking.invoiceNumber} • {booking.status}</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <CalendarIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="p-5 flex-1 space-y-4">
                {booking.pickupTime && (
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{booking.pickupTime}</span>
                  </div>
                )}
                {booking.pickupLocation && (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="flex-1">Pickup: {booking.pickupLocation}</span>
                  </div>
                )}
                {booking.dropLocation && (
                  <div className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                    <span className="flex-1">Drop: {booking.dropLocation}</span>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
