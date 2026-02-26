import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/order.service';
import Table from '../../components/common/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MobileCard from '../../components/common/MobileCard';
import DetailModal, { DetailRow } from '../../components/common/DetailModal';
import { format } from 'date-fns';
import { Package, DollarSign, User, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Pagination ───────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    }
  }

  const withEllipsis = [];
  let prev = null;
  for (const p of pages) {
    if (prev && p - prev > 1) withEllipsis.push('...');
    withEllipsis.push(p);
    prev = p;
  }

  return (
    <div className="p-6 border-t border-gray-200">
      <div className="flex items-center justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {withEllipsis.map((p, i) =>
          p === '...' ? (
            <span key={`e-${i}`} className="px-2 text-gray-400 text-sm select-none">...</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === p
                  ? 'bg-primary-600 text-white'
                  : 'border hover:bg-gray-100 text-gray-700'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Filter Tag ───────────────────────────────────────────────────────────────
function FilterTag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
      {label}
      <button onClick={onRemove} className="hover:text-blue-900"><X size={12} /></button>
    </span>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="p-12 text-center">
      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">
        {hasFilters ? 'No orders match your filters' : 'No orders found'}
      </p>
      {hasFilters && (
        <button onClick={onClear} className="mt-3 text-sm text-blue-600 hover:underline font-medium">
          Clear filters
        </button>
      )}
    </div>
  );
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
const statusClass = (s) =>
  ({ completed: 'bg-green-100 text-green-800', processing: 'bg-blue-100 text-blue-800',
     pending: 'bg-yellow-100 text-yellow-800', cancelled: 'bg-red-100 text-red-800' }[s] ||
    'bg-gray-100 text-gray-800');

const paymentClass = (s) =>
  ({ completed: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800',
     failed: 'bg-red-100 text-red-800' }[s] || 'bg-gray-100 text-gray-800');

// ─── AdminOrders ──────────────────────────────────────────────────────────────
function AdminOrders() {
  const [page, setPage]                   = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal]         = useState(false);

  const [search, setSearch]               = useState('');
  const [searchQuery, setSearchQuery]     = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [dateFrom, setDateFrom]           = useState('');
  const [dateTo, setDateTo]               = useState('');
  const [showFilters, setShowFilters]     = useState(false);

  const hasActiveFilters = !!(searchQuery || statusFilter || paymentFilter || dateFrom || dateTo);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(window.__orderSearchTimer);
    window.__orderSearchTimer = setTimeout(() => {
      setSearchQuery(val.trim());
      setPage(1);
    }, 400);
  };

  const applyFilter = useCallback((setter, value) => {
    setter(value);
    setPage(1);
  }, []);

  const clearAll = () => {
    setSearch(''); setSearchQuery('');
    setStatusFilter(''); setPaymentFilter('');
    setDateFrom(''); setDateTo('');
    setPage(1);
  };

  // ── Query — params match exactly what backend expects ──────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-orders', page, searchQuery, statusFilter, paymentFilter, dateFrom, dateTo],
    queryFn: () =>
      orderService.getAdminOrders({
        page,
        limit: 10,
        ...(searchQuery   && { search: searchQuery }),
        ...(statusFilter  && { status: statusFilter }),
        ...(paymentFilter && { paymentStatus: paymentFilter }),
        ...(dateFrom      && { dateFrom }),
        ...(dateTo        && { dateTo }),
      }),
    keepPreviousData: true,
  });

  // Backend returns: { orders, total, page, pages }
  // ✅ Use data.pages (not data.totalPages)
  const totalPages = data?.pages || 1;

  const columns = [
    { key: 'createdAt', label: 'Date',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy') },
    { key: 'user', label: 'Customer',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.user?.name || 'N/A'}</p>
          <p className="text-xs text-gray-500">{row.user?.email || ''}</p>
        </div>
      )},
    { key: 'items', label: 'Items', render: (row) => row.items?.length || 0 },
    { key: 'total', label: 'Total',
      render: (row) => <span className="font-semibold text-green-700">${row.total?.toFixed(2)}</span> },
    { key: 'paymentStatus', label: 'Payment',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${paymentClass(row.paymentStatus)}`}>
          {row.paymentStatus}
        </span>
      )},
    { key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusClass(row.status)}`}>
          {row.status}
        </span>
      )},
  ];

  const mobileFields = [
    { label: 'Date', key: 'createdAt',
      render: (o) => <span className="text-sm font-medium">{format(new Date(o.createdAt), 'MMM dd, yyyy')}</span> },
    { label: 'Customer', key: 'user',
      render: (o) => (
        <div className="flex items-center gap-2">
          <User size={14} className="text-gray-400" />
          <span className="text-sm font-medium">{o.user?.name || 'N/A'}</span>
        </div>
      )},
    { label: 'Total', key: 'total',
      render: (o) => (
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-green-600" />
          <span className="text-sm font-bold text-green-600">${o.total?.toFixed(2)}</span>
        </div>
      )},
    { label: 'Items', key: 'items',
      render: (o) => (
        <div className="flex items-center gap-1">
          <Package size={14} className="text-gray-400" />
          <span className="text-sm">{o.items?.length || 0} items</span>
        </div>
      )},
    { label: 'Status', key: 'status',
      render: (o) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass(o.status)}`}>
          {o.status}
        </span>
      )},
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-4 sm:py-6 md:py-8 px-2 sm:px-4 space-y-4 sm:space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isFetching ? 'Loading…' : `${data?.total || 0} total orders`}
          </p>
        </div>

        {/* Search + Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search by customer name or order ID…"
                className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setSearchQuery(''); setPage(1); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Filter size={15} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-white rounded-full opacity-80" />}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => applyFilter(setStatusFilter, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Payment Status</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => applyFilter(setPaymentFilter, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Payments</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => applyFilter(setDateFrom, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 block">Date To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => applyFilter(setDateTo, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {hasActiveFilters && (
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button onClick={clearAll} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium">
                    <X size={13} /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active filter tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {searchQuery   && <FilterTag label={`Search: "${searchQuery}"`} onRemove={() => { setSearch(''); setSearchQuery(''); setPage(1); }} />}
            {statusFilter  && <FilterTag label={`Status: ${statusFilter}`}  onRemove={() => applyFilter(setStatusFilter, '')} />}
            {paymentFilter && <FilterTag label={`Payment: ${paymentFilter}`} onRemove={() => applyFilter(setPaymentFilter, '')} />}
            {dateFrom      && <FilterTag label={`From: ${dateFrom}`}         onRemove={() => applyFilter(setDateFrom, '')} />}
            {dateTo        && <FilterTag label={`To: ${dateTo}`}             onRemove={() => applyFilter(setDateTo, '')} />}
          </div>
        )}

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : data?.orders?.length > 0 ? (
            <>
              {data.orders.map((order) => (
                <MobileCard
                  key={order._id}
                  item={order}
                  fields={mobileFields}
                  onCardClick={(o) => { setSelectedOrder(o); setShowModal(true); }}
                />
              ))}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            </>
          ) : (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearAll} />
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
          ) : data?.orders?.length > 0 ? (
            <>
              <Table columns={columns} data={data.orders} isLoading={false} />
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          ) : (
            <EmptyState hasFilters={hasActiveFilters} onClear={clearAll} />
          )}
        </div>

        {/* Detail Modal */}
        <DetailModal isOpen={showModal} onClose={() => setShowModal(false)} title="Order Details">
          {selectedOrder && (
            <>
              <DetailRow label="Order ID"   value={selectedOrder._id} />
              <DetailRow label="Order Date" value={format(new Date(selectedOrder.createdAt), 'PPpp')} />
              <DetailRow label="Customer"   value={
                <div>
                  <p className="font-medium">{selectedOrder.user?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedOrder.user?.email || ''}</p>
                </div>
              } />
              <DetailRow label="Total Amount" value={
                <span className="text-lg font-bold text-green-600">${selectedOrder.total?.toFixed(2)}</span>
              } />
              <DetailRow label="Payment Status" value={
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentClass(selectedOrder.paymentStatus)}`}>
                  {selectedOrder.paymentStatus}
                </span>
              } />
              <DetailRow label="Order Status" value={
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              } />
              <DetailRow label="Items" value={
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="text-sm font-medium">{item.product?.title || 'Product'}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">${item.price?.toFixed(2)}</p>
                    </div>
                  )) || <p className="text-sm text-gray-500">No items</p>}
                </div>
              } />
              {selectedOrder.shippingAddress && (
                <DetailRow label="Shipping Address" value={
                  <div className="text-sm">
                    <p>{selectedOrder.shippingAddress.addressLine1}</p>
                    {selectedOrder.shippingAddress.addressLine2 && (
                      <p>{selectedOrder.shippingAddress.addressLine2}</p>
                    )}
                    <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                    <p>{selectedOrder.shippingAddress.country}</p>
                  </div>
                } />
              )}
            </>
          )}
        </DetailModal>

      </div>
    </div>
  );
}

export default AdminOrders;