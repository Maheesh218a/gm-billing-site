import React, { useState, useEffect } from 'react';
import { Card, CardBody } from '../components/ui/Card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Car } from 'lucide-react';
import { invoiceService } from '../services/invoice.service';
import { vehicleService } from '../services/vehicle.service';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

interface BookingEvent {
  id: string;
  invoiceId: string;
  customerId: string;
  customerName: string;
  vehicleId?: string;
  vehicleName?: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  status: string;
}

export const Calendar = () => {
  const [currentMonthStr, setCurrentMonthStr] = useState(dayjs().format('YYYY-MM-01'));
  const currentDate = dayjs(currentMonthStr);
  
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let invoices: any[] = [];
    let vehicles: any[] = [];
    let isSubscribed = true;

    const processEvents = () => {
      if (!isSubscribed) return;
      
      const parsedEvents: BookingEvent[] = [];
      
      invoices.forEach(inv => {
        if (inv.pickupDate && inv.dropDate) {
          const startDate = dayjs(inv.pickupDate);
          const endDate = dayjs(inv.dropDate);
          
          if (startDate.isValid() && endDate.isValid()) {
            const vehicle = vehicles.find(v => v.id === inv.vehicleId);
            
            parsedEvents.push({
              id: inv.id,
              invoiceId: inv.id,
              customerId: inv.customerId,
              customerName: inv.customerName,
              vehicleId: inv.vehicleId,
              vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registrationNumber})` : 'Unassigned Vehicle',
              startDate: startDate,
              endDate: endDate,
              status: inv.status
            });
          }
        }
      });
      
      setEvents(parsedEvents);
      setLoading(false);
    };

    const unsubI = invoiceService.subscribeToInvoices(data => {
      // Filter out Cancelled/Refunded invoices
      invoices = data.filter(i => i.status !== 'Cancelled' && i.status !== 'Refunded');
      processEvents();
    });
    
    const unsubV = vehicleService.subscribeToVehicles(data => {
      vehicles = data;
      processEvents();
    });

    return () => {
      isSubscribed = false;
      unsubI();
      unsubV();
    };
  }, []);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const dateFormat = "D";
  const rows = [];
  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = day.format(dateFormat);
      const cloneDay = day;
      
      // Find events that span this day
      const dayEvents = events.filter(e => {
        const isStart = e.startDate.isSame(cloneDay, 'day');
        const isEnd = e.endDate.isSame(cloneDay, 'day');
        const isBetween = cloneDay.isAfter(e.startDate, 'day') && cloneDay.isBefore(e.endDate, 'day');
        return isStart || isEnd || isBetween;
      });

      days.push(
        <div 
          key={day.format('YYYY-MM-DD')}
          className={`min-h-[120px] p-2 border border-gray-100 dark:border-gray-700/50 transition-colors ${
            !day.isSame(startOfMonth, 'month') 
              ? 'bg-gray-50/50 dark:bg-gray-800/20 text-gray-400' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full ${
              day.isSame(dayjs(), 'day') ? 'bg-primary text-white' : ''
            }`}>
              {formattedDate}
            </span>
            <span className="text-xs text-gray-400 font-medium sm:hidden">{day.format('ddd')}</span>
          </div>
          
          <div className="space-y-1 mt-2">
            {dayEvents.map((evt, idx) => {
              const isStart = evt.startDate.isSame(cloneDay, 'day');
              const isEnd = evt.endDate.isSame(cloneDay, 'day');
              
              // Define color based on status
              let bgClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800/50';
              if (evt.status === 'Paid') bgClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800/50';
              if (evt.status === 'Pending') bgClass = 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800/50';
              
              return (
                <div 
                  key={`${evt.id}-${idx}`}
                  onClick={() => navigate(`/invoices/${evt.invoiceId}`)}
                  className={`text-[10px] sm:text-xs p-1 sm:p-1.5 rounded border cursor-pointer hover:shadow-md transition-shadow truncate flex items-center gap-1 ${bgClass}`}
                  title={`${evt.customerName} - ${evt.vehicleName}`}
                >
                  {isStart && <Car className="w-3 h-3 flex-shrink-0" />}
                  <span className="font-semibold truncate">{evt.vehicleName?.split(' ')[0] || 'Car'}</span>
                  <span className="hidden sm:inline truncate opacity-75"> - {evt.customerName}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
      day = day.add(1, 'day');
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.format('YYYY-MM-DD')}>
        {days}
      </div>
    );
    days = [];
  }

  const nextMonth = () => setCurrentMonthStr(currentDate.add(1, 'month').format('YYYY-MM-01'));
  const prevMonth = () => setCurrentMonthStr(currentDate.subtract(1, 'month').format('YYYY-MM-01'));
  const today = () => setCurrentMonthStr(dayjs().format('YYYY-MM-01'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-primary" />
            Booking Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track vehicle availability and upcoming trips.</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={today} className="px-4 py-2 font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <Card premium>
        <CardBody className="p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <div className="flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Pending
              </div>
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Advance Paid
              </div>
              <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> Full Paid
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Clock className="w-8 h-8 mb-3 animate-spin text-gray-300" />
              <p>Loading bookings...</p>
            </div>
          ) : (
            <div className="w-full">
              {/* Days Header */}
              <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/80">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                  <div key={i} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:block">
                    {d}
                  </div>
                ))}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
                  <div key={i} className="py-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider sm:hidden">
                    {d}
                  </div>
                ))}
              </div>
              
              {/* Grid */}
              <div className="bg-gray-100 dark:bg-gray-700/50 gap-[1px]">
                {rows}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default Calendar;
