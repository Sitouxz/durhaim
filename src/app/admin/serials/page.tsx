'use client';

import { Plus, Search, Filter, Download, RotateCcw, CalendarDays, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';

type Product = {
  id: string;
  name: string;
  slug: string;
};

type Serial = {
  id: string;
  serial: string;
  status: string;
  verification_count: number;
  created_at: string;
  products: {
    id: string;
    name: string;
  } | { id: string; name: string }[] | null;
};

type SerialFilters = {
  search: string;
  statusFilter: string;
  productId: string;
  dateFrom: string;
  dateTo: string;
  minScans: string;
  maxScans: string;
};

type SerialPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type SerialListResponse = {
  data: Serial[];
  pagination: SerialPagination;
};

type SortField = 'serial' | 'product' | 'status' | 'scans' | 'generated';
type SortDirection = 'asc' | 'desc';
type QrExportScope = 'SELECTED_SERIALS' | 'CURRENT_PAGE_SERIALS' | 'ALL_FILTERED_SERIALS';
type ExportAction = '' | 'CSV' | 'QR_PDF' | 'QR_PNG';

const defaultFilters: SerialFilters = {
  search: '',
  statusFilter: 'ALL',
  productId: 'ALL',
  dateFrom: '',
  dateTo: '',
  minScans: '',
  maxScans: '',
};

const ALL_DURHAIM_PRODUCTS = 'ALL_DURHAIM_PRODUCTS';
const ALL_FILTERED_SERIALS: QrExportScope = 'ALL_FILTERED_SERIALS';

type DateFilterInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
};

type SortableHeaderProps = {
  label: string;
  field: SortField;
  activeSortBy: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  align?: 'left' | 'right';
};

function SortableHeader({ label, field, activeSortBy, sortDirection, onSort, align = 'left' }: SortableHeaderProps) {
  const isActive = field === activeSortBy;
  const Icon = !isActive ? ArrowUpDown : sortDirection === 'asc' ? ArrowUp : ArrowDown;

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`flex w-full items-center gap-2 font-label-caps uppercase transition-colors hover:text-signal-orange ${
        isActive ? 'text-signal-orange' : 'text-on-surface-variant'
      } ${align === 'right' ? 'justify-end' : 'justify-start'}`}
      aria-label={`Sort by ${label.toLowerCase()} ${isActive && sortDirection === 'asc' ? 'descending' : 'ascending'}`}
    >
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5 shrink-0" />
    </button>
  );
}

function DateFilterInput({ id, label, value, onChange }: DateFilterInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;
    const pickerInput = input as HTMLInputElement & { showPicker?: () => void };

    if (pickerInput.showPicker) {
      pickerInput.showPicker();
      return;
    }

    input.focus();
  };

  return (
    <label htmlFor={id} className="space-y-1">
      <span className="block font-label-caps text-on-surface-variant">{label}</span>
      <div className="flex border border-surface-container-highest bg-tactical-black focus-within:border-signal-orange">
        <input
          ref={inputRef}
          id={id}
          type="date"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-3 py-2 text-stark-white font-data-mono focus:outline-none"
        />
        <button
          type="button"
          onClick={openPicker}
          className="flex w-11 items-center justify-center border-l border-surface-container-highest text-on-surface-variant hover:text-signal-orange transition-colors"
          aria-label={`Open ${label.toLowerCase()} date picker`}
        >
          <CalendarDays className="h-4 w-4" />
        </button>
      </div>
    </label>
  );
}

export default function SerialsPage() {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [pagination, setPagination] = useState<SerialPagination>({
    page: 1,
    pageSize: 25,
    total: 0,
    totalPages: 1,
  });
  const [sortBy, setSortBy] = useState<SortField>('generated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [productId, setProductId] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minScans, setMinScans] = useState('');
  const [maxScans, setMaxScans] = useState('');
  const [selectedSerialIds, setSelectedSerialIds] = useState<string[]>([]);
  const [qrExportScope, setQrExportScope] = useState<QrExportScope>('SELECTED_SERIALS');
  const [qrLayoutColumns, setQrLayoutColumns] = useState(3);
  const [qrLayoutRows, setQrLayoutRows] = useState(3);
  const [exportAction, setExportAction] = useState<ExportAction>('');
  const [isExportingQr, setIsExportingQr] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(ALL_DURHAIM_PRODUCTS);
  const [generateCount, setGenerateCount] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSerials = useCallback(async (
    filters: SerialFilters = defaultFilters,
    nextPage = 1,
    nextPageSize = 25,
    nextSortBy: SortField = 'generated',
    nextSortDirection: SortDirection = 'desc',
  ) => {
    setLoading(true);
    setError('');
    try {
      const url = new URL('/api/admin/serials', window.location.origin);
      url.searchParams.set('page', String(nextPage));
      url.searchParams.set('pageSize', String(nextPageSize));
      url.searchParams.set('sortBy', nextSortBy);
      url.searchParams.set('sortDirection', nextSortDirection);
      if (filters.search.trim()) url.searchParams.set('search', filters.search.trim());
      if (filters.statusFilter !== 'ALL') url.searchParams.set('status', filters.statusFilter);
      if (filters.productId !== 'ALL') url.searchParams.set('productId', filters.productId);
      if (filters.dateFrom) url.searchParams.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) url.searchParams.set('dateTo', filters.dateTo);
      if (filters.minScans) url.searchParams.set('minScans', filters.minScans);
      if (filters.maxScans) url.searchParams.set('maxScans', filters.maxScans);
      const res = await fetch(url.toString());
      if (res.ok) {
        const data: SerialListResponse | Serial[] = await res.json();
        const nextSerials = Array.isArray(data) ? data : data.data;
        const nextPagination = Array.isArray(data)
          ? {
              page: nextPage,
              pageSize: nextPageSize,
              total: nextSerials.length,
              totalPages: 1,
            }
          : data.pagination;

        setSerials(nextSerials);
        setPagination(nextPagination);
        setCurrentPage(nextPagination.page);
        setPageSize(nextPagination.pageSize);
        setSortBy(nextSortBy);
        setSortDirection(nextSortDirection);
        setSelectedSerialIds((current) => current.filter((id) => nextSerials.some((serial: Serial) => serial.id === id)));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load serial numbers.');
        setSerials([]);
        setPagination({
          page: nextPage,
          pageSize: nextPageSize,
          total: 0,
          totalPages: 1,
        });
        setSelectedSerialIds([]);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to connect to serial number API.');
    }
    setLoading(false);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to load products for serial generation.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSerials(defaultFilters, 1, 25, 'generated', 'desc');
    fetchProducts();
  }, [fetchSerials]);

  const selectedSerialIdSet = useMemo(() => new Set(selectedSerialIds), [selectedSerialIds]);

  const selectedSerials = useMemo(
    () => serials.filter((serial) => selectedSerialIdSet.has(serial.id)),
    [serials, selectedSerialIdSet],
  );

  const qrExportCount = qrExportScope === 'SELECTED_SERIALS'
    ? selectedSerials.length
    : qrExportScope === 'CURRENT_PAGE_SERIALS'
      ? serials.length
      : pagination.total;

  const allVisibleSelected = serials.length > 0 && serials.every((serial) => selectedSerialIdSet.has(serial.id));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSerials({ search, statusFilter, productId, dateFrom, dateTo, minScans, maxScans }, 1, pageSize, sortBy, sortDirection);
  };

  const handleStatusFilter = (nextStatus: string) => {
    setStatusFilter(nextStatus);
    fetchSerials({ search, statusFilter: nextStatus, productId, dateFrom, dateTo, minScans, maxScans }, 1, pageSize, sortBy, sortDirection);
  };

  const toggleSerialSelection = (id: string) => {
    setSelectedSerialIds((current) => (
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    ));
  };

  const toggleAllVisibleSerials = () => {
    setSelectedSerialIds((current) => {
      if (allVisibleSelected) {
        const visibleIds = new Set(serials.map((serial) => serial.id));
        return current.filter((id) => !visibleIds.has(id));
      }

      return Array.from(new Set([...current, ...serials.map((serial) => serial.id)]));
    });
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setProductId('ALL');
    setDateFrom('');
    setDateTo('');
    setMinScans('');
    setMaxScans('');
    setSelectedSerialIds([]);
    fetchSerials(defaultFilters, 1, pageSize, sortBy, sortDirection);
  };

  const buildSerialsUrl = (
    filters: SerialFilters,
    nextPage: number,
    nextPageSize: number,
    nextSortBy: SortField,
    nextSortDirection: SortDirection,
  ) => {
    const url = new URL('/api/admin/serials', window.location.origin);
    url.searchParams.set('page', String(nextPage));
    url.searchParams.set('pageSize', String(nextPageSize));
    url.searchParams.set('sortBy', nextSortBy);
    url.searchParams.set('sortDirection', nextSortDirection);
    if (filters.search.trim()) url.searchParams.set('search', filters.search.trim());
    if (filters.statusFilter !== 'ALL') url.searchParams.set('status', filters.statusFilter);
    if (filters.productId !== 'ALL') url.searchParams.set('productId', filters.productId);
    if (filters.dateFrom) url.searchParams.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) url.searchParams.set('dateTo', filters.dateTo);
    if (filters.minScans) url.searchParams.set('minScans', filters.minScans);
    if (filters.maxScans) url.searchParams.set('maxScans', filters.maxScans);
    return url;
  };

  const exportCsv = () => {
    const rows = serials.map((s) => [
      s.serial,
      getProductName(s.products),
      s.status,
      s.verification_count || 0,
      new Date(s.created_at).toISOString(),
    ]);
    const csv = [['Serial', 'Product', 'Status', 'Scans', 'Generated'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'durhaim-serials.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchAllMatchingSerials = async () => {
    const allSerials: Serial[] = [];
    const fetchPageSize = 100;
    let nextPage = 1;
    let totalPages = 1;

    while (nextPage <= totalPages) {
      const url = buildSerialsUrl(getCurrentFilters(), nextPage, fetchPageSize, sortBy, sortDirection);
      const res = await fetch(url.toString());
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load all serials for QR export.');
      }

      const data: SerialListResponse = await res.json();
      allSerials.push(...data.data);
      totalPages = data.pagination.totalPages;
      nextPage += 1;
    }

    return allSerials;
  };

  const getQrSerials = async (targetSerials?: Serial[] | React.MouseEvent<HTMLButtonElement>) => {
    if (Array.isArray(targetSerials)) return targetSerials;
    if (qrExportScope === 'CURRENT_PAGE_SERIALS') return serials;
    if (qrExportScope === ALL_FILTERED_SERIALS) return fetchAllMatchingSerials();
    return selectedSerials;
  };

  const getQrLayout = () => ({
    columns: Math.max(1, Math.min(40, Math.floor(qrLayoutColumns) || 1)),
    rows: Math.max(1, Math.min(60, Math.floor(qrLayoutRows) || 1)),
  });

  const downloadBulkQR = async (targetSerials: Serial[] | React.MouseEvent<HTMLButtonElement> = selectedSerials) => {
    setIsExportingQr(true);
    const qrSerials = await getQrSerials(targetSerials);

    if (qrSerials.length === 0) {
      alert('Select one or more serials to download as QR labels.');
      setIsExportingQr(false);
      return;
    }

    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 2;
      const qrGap = 1;
      const { columns, rows } = getQrLayout();
      const cellWidth = (pageWidth - margin * 2 - qrGap * (columns - 1)) / columns;
      const cellHeight = (pageHeight - margin * 2 - qrGap * (rows - 1)) / rows;
      const qrSize = Math.min(cellWidth, cellHeight);
      const qrPerPage = columns * rows;

      for (let index = 0; index < qrSerials.length; index++) {
        if (index > 0 && index % qrPerPage === 0) {
          pdf.addPage();
        }

        const pageIndex = index % qrPerPage;
        const col = pageIndex % columns;
        const row = Math.floor(pageIndex / columns);
        const cellX = margin + col * (cellWidth + qrGap);
        const cellY = margin + row * (cellHeight + qrGap);
        const x = cellX + (cellWidth - qrSize) / 2;
        const y = cellY + (cellHeight - qrSize) / 2;
        const serial = qrSerials[index];
        const verifyUrl = `${window.location.origin}/verify/${serial.serial}`;
        const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 512, margin: 0 });

        pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`durhaim-qr-labels-${date}.pdf`);
    } catch (e) {
      console.error(e);
      alert('Error generating bulk QR PDF.');
    } finally {
      setIsExportingQr(false);
    }
  };

  const downloadQrPng = async (targetSerials?: Serial[] | React.MouseEvent<HTMLButtonElement>) => {
    setIsExportingQr(true);

    try {
      const qrSerials = await getQrSerials(targetSerials);
      if (qrSerials.length === 0) {
        alert('Select one or more serials to download as QR PNG sheets.');
        return;
      }

      const { columns, rows } = getQrLayout();
      const qrPerPage = columns * rows;
      const sheetWidth = 2480;
      const sheetHeight = 3508;
      const margin = 24;
      const qrGap = 8;
      const cellWidth = (sheetWidth - margin * 2 - qrGap * (columns - 1)) / columns;
      const cellHeight = (sheetHeight - margin * 2 - qrGap * (rows - 1)) / rows;
      const qrSize = Math.floor(Math.min(cellWidth, cellHeight));
      const date = new Date().toISOString().slice(0, 10);

      for (let pageIndex = 0; pageIndex < Math.ceil(qrSerials.length / qrPerPage); pageIndex++) {
        const pageSerials = qrSerials.slice(pageIndex * qrPerPage, (pageIndex + 1) * qrPerPage);
        const canvas = document.createElement('canvas');
        canvas.width = sheetWidth;
        canvas.height = sheetHeight;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Could not create QR PNG canvas.');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, sheetWidth, sheetHeight);

        for (let index = 0; index < pageSerials.length; index++) {
          const serial = pageSerials[index];
          const verifyUrl = `${window.location.origin}/verify/${serial.serial}`;
          const dataUrl = await QRCode.toDataURL(verifyUrl, { width: qrSize, margin: 0 });
          const image = new Image();
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Could not load generated QR image.'));
            image.src = dataUrl;
          });

          const col = index % columns;
          const row = Math.floor(index / columns);
          const cellX = margin + col * (cellWidth + qrGap);
          const cellY = margin + row * (cellHeight + qrGap);
          const x = cellX + (cellWidth - qrSize) / 2;
          const y = cellY + (cellHeight - qrSize) / 2;
          context.drawImage(image, x, y, qrSize, qrSize);
        }

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `durhaim-qr-sheet-${date}-${pageIndex + 1}.png`;
        a.click();
      }
    } catch (e) {
      console.error(e);
      alert('Error generating QR PNG sheet.');
    } finally {
      setIsExportingQr(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || generateCount < 1) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/admin/serials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct, count: generateCount })
      });
      if (res.ok) {
        setShowGenerateModal(false);
        fetchSerials({ search, statusFilter, productId, dateFrom, dateTo, minScans, maxScans }, currentPage, pageSize, sortBy, sortDirection);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to generate serials.");
      }
    } catch (e) {
      console.error(e);
      alert("Error generating serials.");
    }
    setIsGenerating(false);
  };

  const updateSerialStatus = async (id: string, status: 'INACTIVE' | 'ACTIVE' | 'REVOKED') => {
    if (!confirm(`Are you sure you want to change this serial to ${status}?`)) return;

    try {
      const res = await fetch('/api/admin/serials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialId: id, status })
      });
      if (res.ok) {
        fetchSerials({ search, statusFilter, productId, dateFrom, dateTo, minScans, maxScans }, currentPage, pageSize, sortBy, sortDirection);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to update serial status.');
      }
    } catch (e) {
      console.error(e);
      alert('Error updating serial status.');
    }
  };

  const printQR = async (serial: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site to print QR labels.');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR - ${serial}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: monospace; background: white; color: black; }
          </style>
        </head>
        <body>Generating QR label...</body>
      </html>
    `);
    printWindow.document.close();

    try {
      const verifyUrl = `${window.location.origin}/verify/${serial}`;
      const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 1024, margin: 0 });

      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR - ${serial}</title>
            <style>
              html, body { width: 100%; height: 100%; margin: 0; background: white; }
              body { display: flex; justify-content: center; align-items: center; }
              .label { width: 100%; height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; }
              img { display: block; width: 100%; height: 100%; object-fit: contain; }
              @media print {
                @page { margin: 2mm; }
                html, body, .label { width: 100%; height: 100%; }
              }
            </style>
          </head>
          <body></body>
        </html>
      `);
      printWindow.document.close();

      const label = printWindow.document.createElement('div');
      label.className = 'label';

      const qrImage = printWindow.document.createElement('img');
      qrImage.alt = `QR code for ${serial}`;
      qrImage.onload = () => {
        printWindow.focus();
        setTimeout(() => printWindow.print(), 100);
      };

      label.append(qrImage);
      printWindow.document.body.replaceChildren(label);
      qrImage.src = dataUrl;
    } catch (e) {
      console.error(e);
      printWindow.document.body.textContent = 'Error generating QR code. Please close this tab and try again.';
      alert('Error generating QR code');
    }
  };

  const getProductName = (prod: Serial['products']) => {
    if (Array.isArray(prod) && prod.length > 0) return prod[0].name;
    if (prod && !Array.isArray(prod) && 'name' in prod) return prod.name;
    return 'Unknown';
  };

  const getCurrentFilters = (): SerialFilters => ({
    search,
    statusFilter,
    productId,
    dateFrom,
    dateTo,
    minScans,
    maxScans,
  });

  const goToPage = (page: number) => {
    const targetPage = Math.min(Math.max(page, 1), pagination.totalPages);
    if (targetPage === currentPage || loading) return;

    fetchSerials(getCurrentFilters(), targetPage, pageSize, sortBy, sortDirection);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setSelectedSerialIds([]);
    fetchSerials(getCurrentFilters(), 1, nextPageSize, sortBy, sortDirection);
  };

  const handleSort = (field: SortField) => {
    const nextDirection: SortDirection = field === sortBy && sortDirection === 'asc' ? 'desc' : 'asc';
    setSelectedSerialIds([]);
    fetchSerials(getCurrentFilters(), 1, pageSize, field, nextDirection);
  };

  const handleExportAction = async (action: ExportAction) => {
    setExportAction(action);

    if (action === 'CSV') {
      exportCsv();
    }

    if (action === 'QR_PDF') {
      await downloadBulkQR();
    }

    if (action === 'QR_PNG') {
      await downloadQrPng();
    }

    setExportAction('');
  };

  const pageStart = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const pageEnd = Math.min(pagination.page * pagination.pageSize, pagination.total);

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display-xl text-headline-lg text-stark-white uppercase">Serial Numbers</h1>
          <p className="font-body-md text-on-surface-variant">Manage and generate product authenticity codes.</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 bg-signal-orange text-tactical-black font-label-caps px-4 py-2 hover:bg-stark-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          GENERATE BATCH
        </button>
      </div>

      {error && (
        <div className="border border-error bg-error-container/20 p-4 font-body-md text-error">
          {error}
        </div>
      )}

      <div className="bg-charcoal-field border border-surface-container-highest">
        {/* Toolbar */}
        <form onSubmit={handleSearch} className="p-4 border-b border-surface-container-highest space-y-3">
          <div className="flex flex-col xl:flex-row gap-3 justify-between">
            <div className="flex flex-1 min-w-0 bg-tactical-black border border-surface-container-highest px-3 py-2">
              <Search className="w-5 h-5 text-on-surface-variant mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search serials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-stark-white font-data-mono w-full focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(event) => handleStatusFilter(event.target.value)}
                className="border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors font-label-caps"
              >
                <option value="ALL">ALL STATUS</option>
                <option value="INACTIVE">UNACTIVATED</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="REVOKED">REVOKED</option>
              </select>
              <select
                value={productId}
                onChange={(event) => setProductId(event.target.value)}
                className="border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors font-label-caps"
              >
                <option value="ALL">ALL PRODUCTS</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
              <div className="flex items-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors focus-within:border-signal-orange hover:text-signal-orange">
                <Download className="ml-3 h-4 w-4 shrink-0" />
                <select
                  value={exportAction}
                  onChange={(event) => handleExportAction(event.target.value as ExportAction)}
                  disabled={isExportingQr}
                  className="min-w-[9.5rem] bg-transparent px-3 py-2 font-label-caps text-current focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Export serial data or QR sheets"
                >
                  <option value="">EXPORT</option>
                  <option value="CSV">CSV</option>
                  <option value="QR_PDF" disabled={qrExportCount === 0}>QR PDF ({qrExportCount})</option>
                  <option value="QR_PNG" disabled={qrExportCount === 0}>QR PNG ({qrExportCount})</option>
                </select>
              </div>
              <select
                value={qrExportScope}
                onChange={(event) => setQrExportScope(event.target.value as QrExportScope)}
                className="border border-surface-container-highest bg-tactical-black px-3 py-2 text-on-surface-variant hover:text-signal-orange transition-colors font-label-caps"
                aria-label="QR export scope"
              >
                <option value="SELECTED_SERIALS">SELECTED</option>
                <option value="CURRENT_PAGE_SERIALS">CURRENT PAGE</option>
                <option value={ALL_FILTERED_SERIALS}>ALL MATCHING</option>
              </select>
              <label className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-3 py-2 text-on-surface-variant font-label-caps">
                <span>COLS</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={qrLayoutColumns}
                  onChange={(event) => setQrLayoutColumns(Number(event.target.value))}
                  className="w-14 bg-transparent text-stark-white font-data-mono focus:outline-none"
                  aria-label="QR layout columns"
                />
              </label>
              <label className="flex items-center gap-2 border border-surface-container-highest bg-tactical-black px-3 py-2 text-on-surface-variant font-label-caps">
                <span>ROWS</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={qrLayoutRows}
                  onChange={(event) => setQrLayoutRows(Number(event.target.value))}
                  className="w-14 bg-transparent text-stark-white font-data-mono focus:outline-none"
                  aria-label="QR layout rows"
                />
              </label>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(4,minmax(0,1fr))_auto_auto] xl:items-end">
            <DateFilterInput id="generated-from" label="Generated From" value={dateFrom} onChange={setDateFrom} />
            <DateFilterInput id="generated-to" label="Generated To" value={dateTo} onChange={setDateTo} />
            <label className="space-y-1">
              <span className="block font-label-caps text-on-surface-variant">Minimum Scans</span>
              <input type="number" min="0" value={minScans} onChange={(event) => setMinScans(event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black px-3 py-2 text-stark-white font-data-mono" />
            </label>
            <label className="space-y-1">
              <span className="block font-label-caps text-on-surface-variant">Maximum Scans</span>
              <input type="number" min="0" value={maxScans} onChange={(event) => setMaxScans(event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black px-3 py-2 text-stark-white font-data-mono" />
            </label>
            <button type="submit" className="flex h-[44px] items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <Filter className="w-4 h-4" />
              <span className="font-label-caps">FILTER</span>
            </button>
            <button type="button" onClick={resetFilters} className="flex h-[44px] items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black px-4 py-2 text-on-surface-variant hover:text-signal-orange transition-colors">
              <RotateCcw className="w-4 h-4" />
              <span className="font-label-caps whitespace-nowrap">RESET ALL FILTERS</span>
            </button>
          </div>
        </form>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-container-highest bg-surface-container-lowest">
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleAllVisibleSerials}
                    aria-label="Select all visible serials"
                    className="h-4 w-4 accent-signal-orange"
                  />
                </th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase">No.</th>
                <th className="py-3 px-4">
                  <SortableHeader label="Serial Code" field="serial" activeSortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="py-3 px-4">
                  <SortableHeader label="Product" field="product" activeSortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="py-3 px-4">
                  <SortableHeader label="Status" field="status" activeSortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="py-3 px-4">
                  <SortableHeader label="Scans" field="scans" activeSortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="py-3 px-4">
                  <SortableHeader label="Generated" field="generated" activeSortBy={sortBy} sortDirection={sortDirection} onSort={handleSort} />
                </th>
                <th className="font-label-caps text-on-surface-variant py-3 px-4 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="font-data-mono text-sm text-stark-white">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-on-surface-variant">Loading serials...</td></tr>
              ) : serials.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-on-surface-variant">No serials found.</td></tr>
              ) : (
                serials.map((s, index) => {
                  const rowNumber = pageStart + index;

                  return (
                  <tr key={s.id} className="border-b border-surface-container-highest/50 hover:bg-surface-container-highest/30">
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedSerialIdSet.has(s.id)}
                        onChange={() => toggleSerialSelection(s.id)}
                        aria-label={`Select serial ${s.serial}`}
                        className="h-4 w-4 accent-signal-orange"
                      />
                    </td>
                    <td className="py-3 px-4 text-on-surface-variant">{rowNumber}</td>
                    <td className="py-3 px-4 text-signal-orange">{s.serial}</td>
                    <td className="py-3 px-4">{getProductName(s.products)}</td>
                    <td className="py-3 px-4">
                      {s.status === 'INACTIVE' && <span className="bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded-full text-xs">UNACTIVATED</span>}
                      {s.status === 'ACTIVE' && <span className="bg-operator-green/20 text-operator-green px-2 py-1 rounded-full text-xs">ACTIVE</span>}
                      {s.status === 'REVOKED' && <span className="bg-error/20 text-error px-2 py-1 rounded-full text-xs">REVOKED</span>}
                    </td>
                    <td className="py-3 px-4">{s.verification_count || 0}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => printQR(s.serial)} className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
                      {s.status !== 'ACTIVE' && (
                        <button onClick={() => updateSerialStatus(s.id, 'ACTIVE')} className="text-stark-white hover:text-signal-orange underline mr-3">
                          Activate
                        </button>
                      )}
                      {s.status !== 'INACTIVE' && s.status !== 'REVOKED' && (
                        <button onClick={() => updateSerialStatus(s.id, 'INACTIVE')} className="text-on-surface-variant hover:text-signal-orange underline mr-3">
                          Reset
                        </button>
                      )}
                      {s.status !== 'REVOKED' && (
                        <button onClick={() => updateSerialStatus(s.id, 'REVOKED')} className="text-error hover:text-error/80 underline">
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-surface-container-highest bg-surface-container-lowest px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-data-mono text-sm text-on-surface-variant">
            Showing <span className="text-stark-white">{pageStart}</span>-<span className="text-stark-white">{pageEnd}</span> of <span className="text-stark-white">{pagination.total}</span> serials
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 font-label-caps text-on-surface-variant">
              Rows
              <select
                value={pageSize}
                onChange={(event) => handlePageSizeChange(Number(event.target.value))}
                disabled={loading}
                className="border border-surface-container-highest bg-tactical-black px-3 py-2 text-stark-white font-data-mono disabled:opacity-50"
                aria-label="Rows per page"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={loading || currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[8rem] text-center font-data-mono text-sm text-on-surface-variant">
                Page <span className="text-stark-white">{pagination.page}</span> / <span className="text-stark-white">{pagination.totalPages}</span>
              </span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={loading || currentPage >= pagination.totalPages}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-black/80 backdrop-blur-sm p-4">
          <div className="bg-charcoal-field border border-surface-container-highest w-full max-w-md p-stack-lg shadow-2xl">
            <div className="flex justify-between items-center mb-stack-md">
              <h2 className="font-headline-md text-stark-white uppercase">Generate Serials</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-on-surface-variant hover:text-signal-orange">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-stack-md">
              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Target Product</label>
                <select
                  className="w-full bg-tactical-black border border-surface-container-highest text-stark-white p-3 focus:border-signal-orange"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  required
                >
                  <option value={ALL_DURHAIM_PRODUCTS}>All Durhaim Products</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-caps text-on-surface-variant mb-2">Quantity to Generate</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="w-full bg-tactical-black border border-surface-container-highest text-stark-white p-3 focus:border-signal-orange font-data-mono"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="pt-stack-sm flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-surface-container-highest text-stark-white hover:bg-surface-container-highest"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-4 py-2 bg-signal-orange text-tactical-black font-label-caps hover:bg-stark-white disabled:opacity-50"
                >
                  {isGenerating ? 'GENERATING...' : 'GENERATE BATCH'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
