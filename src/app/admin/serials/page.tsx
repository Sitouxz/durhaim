'use client';

import { Plus, Search, Filter, Download, RotateCcw, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, ArrowUpDown, ArrowUp, ArrowDown, Trash2, X } from "lucide-react";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  calculateQrExportLayout,
  QR_LABEL_BORDER_COLOR,
  QR_LABEL_BORDER_WIDTH_MM,
  QR_LABEL_MARGIN_MM,
  QR_LABEL_PADDING_MM,
} from '@/lib/qr-export-layout';

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
type QrExportScope = 'ALL_MATCHING_SERIALS' | 'SELECTED_SERIALS' | 'CURRENT_PAGE_SERIALS';
type ExportAction = 'CSV' | 'QR_PDF' | 'QR_PNG';

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
const CUSTOM_PRODUCT = 'CUSTOM_PRODUCT';
const CUSTOM_PRODUCT_LABEL = 'Custom Product / All Durhaim Product';
const ALL_MATCHING_SERIALS: QrExportScope = 'ALL_MATCHING_SERIALS';

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
          className="date-input-hide-indicator min-w-0 flex-1 bg-transparent px-3 py-2 text-stark-white font-data-mono focus:outline-none"
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
  const [pageInput, setPageInput] = useState('1');
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
  const [qrExportScope, setQrExportScope] = useState<QrExportScope>('ALL_MATCHING_SERIALS');
  const [qrLayoutColumns, setQrLayoutColumns] = useState(3);
  const [qrLayoutRows, setQrLayoutRows] = useState(3);
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');
  const [exportProductIds, setExportProductIds] = useState<string[] | null>(null);
  const [exportProductSearch, setExportProductSearch] = useState('');
  const [exportAction, setExportAction] = useState<ExportAction>('QR_PDF');
  const [showExportProducts, setShowExportProducts] = useState(false);
  const [showExportAdvanced, setShowExportAdvanced] = useState(false);
  const [allMatchingExportCount, setAllMatchingExportCount] = useState(0);
  const [isLoadingExportCount, setIsLoadingExportCount] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkWorking, setIsBulkWorking] = useState(false);
  const [error, setError] = useState('');

  // Modal state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState(CUSTOM_PRODUCT);
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
        setPageInput(String(nextPagination.page));
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

  const exportProductOptions = useMemo(
    () => [{ id: CUSTOM_PRODUCT, name: CUSTOM_PRODUCT_LABEL }, ...products],
    [products],
  );
  const allExportProductIds = useMemo(() => exportProductOptions.map((product) => product.id), [exportProductOptions]);
  const isExportDateRangeInvalid = Boolean(exportDateFrom && exportDateTo && exportDateFrom > exportDateTo);
  const getSerialProductId = useCallback((serial: Serial) => {
    if (Array.isArray(serial.products) && serial.products.length > 0) return serial.products[0].id;
    if (serial.products && !Array.isArray(serial.products)) return serial.products.id;
    return CUSTOM_PRODUCT;
  }, []);
  const filterSerialsForExport = useCallback((targetSerials: Serial[]) => {
    if (exportProductIds?.length === 0 || isExportDateRangeInvalid) return [];
    const fromTime = exportDateFrom ? new Date(`${exportDateFrom}T00:00:00.000Z`).getTime() : Number.NEGATIVE_INFINITY;
    const toTime = exportDateTo ? new Date(`${exportDateTo}T23:59:59.999Z`).getTime() : Number.POSITIVE_INFINITY;

    return targetSerials.filter((serial) => {
      const generatedTime = new Date(serial.created_at).getTime();
      const matchesProduct = exportProductIds === null || exportProductIds.includes(getSerialProductId(serial));
      return matchesProduct && Number.isFinite(generatedTime) && generatedTime >= fromTime && generatedTime <= toTime;
    });
  }, [exportDateFrom, exportDateTo, exportProductIds, getSerialProductId, isExportDateRangeInvalid]);

  const selectedExportSerials = useMemo(() => filterSerialsForExport(selectedSerials), [filterSerialsForExport, selectedSerials]);
  const currentPageExportSerials = useMemo(() => filterSerialsForExport(serials), [filterSerialsForExport, serials]);
  const exportScopeCount = qrExportScope === 'SELECTED_SERIALS'
    ? selectedExportSerials.length
    : qrExportScope === 'CURRENT_PAGE_SERIALS'
      ? currentPageExportSerials.length
      : allMatchingExportCount;

  const exportDateRangeLabel = exportDateFrom || exportDateTo
    ? `${exportDateFrom || 'Any start'} to ${exportDateTo || 'Any end'}`
    : 'All generated dates';
  const exportProductSelectionLabel = exportProductIds === null
    ? 'All products'
    : exportProductIds.length === 0
      ? 'No products'
      : `${exportProductIds.length} product${exportProductIds.length === 1 ? '' : 's'}`;
  const filteredExportProductOptions = exportProductOptions.filter((product) => (
    product.name.toLowerCase().includes(exportProductSearch.trim().toLowerCase())
  ));
  const selectedExportProductNames = exportProductIds?.map((id) => (
    exportProductOptions.find((product) => product.id === id)?.name
  )).filter((name): name is string => Boolean(name)) ?? [];
  const exportProductSummary = exportProductIds === null
    ? 'All products'
    : selectedExportProductNames.length === 0
      ? 'Choose products'
      : selectedExportProductNames.length <= 2
        ? selectedExportProductNames.join(', ')
        : `${selectedExportProductNames.slice(0, 2).join(', ')} +${selectedExportProductNames.length - 2}`;
  const exportScopeLabel = qrExportScope === 'SELECTED_SERIALS'
    ? 'Selected rows'
    : qrExportScope === 'CURRENT_PAGE_SERIALS'
      ? 'Current page'
      : 'All matching serials';
  const isExportSubmitDisabled = isExporting
    || isExportDateRangeInvalid
    || exportScopeCount === 0
    || (qrExportScope === ALL_MATCHING_SERIALS && isLoadingExportCount);

  const allVisibleSelected = serials.length > 0 && serials.every((serial) => selectedSerialIdSet.has(serial.id));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSerials({ search, statusFilter, productId, dateFrom, dateTo, minScans, maxScans }, 1, pageSize, sortBy, sortDirection);
    setShowFilterModal(false);
  };

  const handleToolbarSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSerials({ search, statusFilter, productId, dateFrom, dateTo, minScans, maxScans }, 1, pageSize, sortBy, sortDirection);
  };

  const handleStatusFilter = (nextStatus: string) => {
    setStatusFilter(nextStatus);
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
    setShowFilterModal(false);
  };

  const buildExportSerialsUrl = useCallback((nextPage: number, nextPageSize: number) => {
    const url = new URL('/api/admin/serials', window.location.origin);
    url.searchParams.set('page', String(nextPage));
    url.searchParams.set('pageSize', String(nextPageSize));
    url.searchParams.set('sortBy', 'generated');
    url.searchParams.set('sortDirection', 'desc');
    if (exportDateFrom) url.searchParams.set('dateFrom', exportDateFrom);
    if (exportDateTo) url.searchParams.set('dateTo', exportDateTo);
    exportProductIds?.forEach((id) => url.searchParams.append('productId', id));
    return url;
  }, [exportDateFrom, exportDateTo, exportProductIds]);

  useEffect(() => {
    if (!showExportModal || isExportDateRangeInvalid || exportProductIds?.length === 0) {
      setAllMatchingExportCount(0);
      setIsLoadingExportCount(false);
      return;
    }

    const controller = new AbortController();
    setIsLoadingExportCount(true);

    fetch(buildExportSerialsUrl(1, 1).toString(), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to count serials for export.');
        }
        return response.json() as Promise<SerialListResponse>;
      })
      .then((data) => setAllMatchingExportCount(data.pagination.total))
      .catch((countError) => {
        if ((countError as Error).name !== 'AbortError') {
          console.error(countError);
          setAllMatchingExportCount(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingExportCount(false);
      });

    return () => controller.abort();
  }, [buildExportSerialsUrl, exportProductIds, isExportDateRangeInvalid, showExportModal]);

  const toggleExportProduct = (id: string) => {
    setExportProductIds((current) => {
      const selectedIds = current ?? allExportProductIds;
      const nextIds = selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];
      return nextIds.length === allExportProductIds.length ? null : nextIds;
    });
  };

  const openExportModal = () => {
    setQrExportScope(ALL_MATCHING_SERIALS);
    setShowExportAdvanced(false);
    setShowExportProducts(false);
    setExportProductSearch('');
    setShowExportModal(true);
  };

  const fetchAllMatchingSerials = async () => {
    const allSerials: Serial[] = [];
    const fetchPageSize = 100;
    let nextPage = 1;
    let totalPages = 1;

    while (nextPage <= totalPages) {
      const url = buildExportSerialsUrl(nextPage, fetchPageSize);
      const res = await fetch(url.toString());
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load all serials for export.');
      }

      const data: SerialListResponse = await res.json();
      allSerials.push(...data.data);
      totalPages = data.pagination.totalPages;
      nextPage += 1;
    }

    return allSerials;
  };

  const getExportSerials = async () => {
    if (qrExportScope === 'CURRENT_PAGE_SERIALS') return currentPageExportSerials;
    if (qrExportScope === 'SELECTED_SERIALS') return selectedExportSerials;
    return fetchAllMatchingSerials();
  };

  const exportCsv = async () => {
    try {
      const exportSerials = await getExportSerials();
      if (exportSerials.length === 0) {
        alert('No serials match the export options.');
        return false;
      }

      const rows = exportSerials.map((s) => [
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
      return true;
    } catch (exportError) {
      console.error(exportError);
      alert('Error exporting serial data.');
      return false;
    }
  };

  const getQrLayout = () => ({
    columns: Math.max(1, Math.min(40, Math.floor(qrLayoutColumns) || 1)),
    rows: Math.max(1, Math.min(60, Math.floor(qrLayoutRows) || 1)),
  });

  const downloadBulkQR = async (targetSerials?: Serial[]) => {
    try {
      const qrSerials = targetSerials ?? await getExportSerials();
      if (qrSerials.length === 0) {
        alert('No serials match the export options.');
        return false;
      }

      const { columns, rows } = getQrLayout();
      const layout = calculateQrExportLayout({ rows, columns });
      const pdf = new jsPDF({ orientation: layout.orientation, unit: 'mm', format: [layout.pageWidth, layout.pageHeight] });
      const qrPerPage = columns * rows;
      pdf.setDrawColor(QR_LABEL_BORDER_COLOR);
      pdf.setLineWidth(QR_LABEL_BORDER_WIDTH_MM);

      for (let index = 0; index < qrSerials.length; index++) {
        if (index > 0 && index % qrPerPage === 0) {
          pdf.addPage();
        }

        const pageIndex = index % qrPerPage;
        const { cellX, cellY, qrX, qrY } = layout.getCellPosition(pageIndex);
        const serial = qrSerials[index];
        const verifyUrl = `${window.location.origin}/verify/${serial.serial}`;
        const dataUrl = await QRCode.toDataURL(verifyUrl, { width: 512, margin: 0 });

        pdf.rect(cellX, cellY, layout.cellWidth, layout.cellHeight);
        pdf.addImage(dataUrl, 'PNG', qrX, qrY, layout.qrSize, layout.qrSize);
      }

      const date = new Date().toISOString().slice(0, 10);
      pdf.save(`durhaim-qr-labels-${date}.pdf`);
      return true;
    } catch (e) {
      console.error(e);
      alert('Error generating bulk QR PDF.');
      return false;
    }
  };

  const downloadQrPng = async (targetSerials?: Serial[]) => {
    try {
      const qrSerials = targetSerials ?? await getExportSerials();
      if (qrSerials.length === 0) {
        alert('No serials match the export options.');
        return false;
      }

      const { columns, rows } = getQrLayout();
      const qrPerPage = columns * rows;
      const pxPerMm = 2480 / 210;
      const layout = calculateQrExportLayout({ rows, columns, unitScale: pxPerMm });
      const sheetWidth = Math.round(layout.pageWidth);
      const sheetHeight = Math.round(layout.pageHeight);
      const borderWidth = Math.max(1, Math.round(QR_LABEL_BORDER_WIDTH_MM * pxPerMm));
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
        context.strokeStyle = QR_LABEL_BORDER_COLOR;
        context.lineWidth = borderWidth;

        for (let index = 0; index < pageSerials.length; index++) {
          const serial = pageSerials[index];
          const verifyUrl = `${window.location.origin}/verify/${serial.serial}`;
          const dataUrl = await QRCode.toDataURL(verifyUrl, { width: Math.max(1, Math.floor(layout.qrSize)), margin: 0 });
          const image = new Image();
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error('Could not load generated QR image.'));
            image.src = dataUrl;
          });

          const { cellX, cellY, qrX, qrY } = layout.getCellPosition(index);
          context.strokeRect(cellX, cellY, layout.cellWidth, layout.cellHeight);
          context.drawImage(image, qrX, qrY, layout.qrSize, layout.qrSize);
        }

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `durhaim-qr-sheet-${date}-${pageIndex + 1}.png`;
        a.click();
      }
      return true;
    } catch (e) {
      console.error(e);
      alert('Error generating QR PNG sheet.');
      return false;
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
              .label { width: 100%; height: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; padding: ${QR_LABEL_PADDING_MM}mm; }
              img { display: block; width: 100%; height: 100%; object-fit: contain; }
              @media print {
                @page { margin: ${QR_LABEL_MARGIN_MM}mm; }
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
    return CUSTOM_PRODUCT_LABEL;
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
    const normalizedPage = Number.isFinite(page) ? Math.floor(page) : 1;
    const targetPage = Math.min(Math.max(normalizedPage, 1), pagination.totalPages);
    setPageInput(String(targetPage));
    if (targetPage === currentPage || loading) return;

    fetchSerials(getCurrentFilters(), targetPage, pageSize, sortBy, sortDirection);
  };

  const runSelectedQrExport = async (format: 'PDF' | 'PNG') => {
    if (selectedSerials.length === 0 || isBulkWorking) return;
    setIsBulkWorking(true);
    if (format === 'PDF') await downloadBulkQR(selectedSerials);
    if (format === 'PNG') await downloadQrPng(selectedSerials);
    setIsBulkWorking(false);
  };

  const bulkRevokeSelected = async () => {
    const revokableSerials = selectedSerials.filter((serial) => serial.status !== 'REVOKED');
    if (revokableSerials.length === 0 || isBulkWorking) return;
    if (!confirm(`Revoke ${revokableSerials.length} selected serial${revokableSerials.length === 1 ? '' : 's'}?`)) return;

    setIsBulkWorking(true);
    try {
      const res = await fetch('/api/admin/serials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialIds: revokableSerials.map((serial) => serial.id), status: 'REVOKED' }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to revoke selected serials.');
        return;
      }

      setSelectedSerialIds([]);
      await fetchSerials(getCurrentFilters(), currentPage, pageSize, sortBy, sortDirection);
    } catch (bulkError) {
      console.error(bulkError);
      alert('Error revoking selected serials.');
    } finally {
      setIsBulkWorking(false);
    }
  };

  const handlePageJump = (event: React.FormEvent) => {
    event.preventDefault();
    goToPage(Number(pageInput) || 1);
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

  const handleExportSubmit = async () => {
    if (isExportSubmitDisabled) return;
    setIsExporting(true);

    let exported = false;
    if (exportAction === 'CSV') exported = await exportCsv();
    if (exportAction === 'QR_PDF') exported = await downloadBulkQR();
    if (exportAction === 'QR_PNG') exported = await downloadQrPng();

    setIsExporting(false);
    if (exported) setShowExportModal(false);
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
        <div className="flex flex-col gap-3 border-b border-surface-container-highest p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="font-data-mono text-sm text-on-surface-variant">
            Selected <span className="text-stark-white">{selectedSerials.length}</span> / Showing <span className="text-stark-white">{serials.length}</span>
          </div>
          <form onSubmit={handleToolbarSearch} className="flex min-w-0 flex-1 border border-surface-container-highest bg-tactical-black px-3 py-2 lg:max-w-md">
            <Search className="mr-2 h-5 w-5 shrink-0 text-on-surface-variant" />
            <input
              type="search"
              placeholder="Search serials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-none bg-transparent font-data-mono text-stark-white placeholder:text-on-surface-variant focus:outline-none"
              aria-label="Search serials"
            />
          </form>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className="flex h-11 items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black px-4 text-on-surface-variant transition-colors hover:text-signal-orange"
              aria-label="Open filter controls"
            >
              <Filter className="h-4 w-4" />
              <span className="font-label-caps">FILTER</span>
            </button>
            <button
              type="button"
              onClick={openExportModal}
              className="flex h-11 items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black px-4 text-on-surface-variant transition-colors hover:text-signal-orange"
              aria-label="Open export controls"
            >
              <Download className="h-4 w-4" />
              <span className="font-label-caps">EXPORT</span>
            </button>
          </div>
        </div>
        {selectedSerials.length > 0 && (
          <div className="flex flex-col gap-3 border-b border-signal-orange bg-signal-orange px-4 py-3 text-tactical-black sm:flex-row sm:items-center sm:justify-between">
            <div className="font-data-mono text-sm font-bold">
              {selectedSerials.length} serial{selectedSerials.length === 1 ? '' : 's'} selected
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedSerialIds([])}
                disabled={isBulkWorking}
                className="flex h-10 items-center justify-center border border-tactical-black/40 bg-signal-orange px-3 font-label-caps text-tactical-black transition-colors hover:bg-stark-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                CLEAR SELECTION
              </button>
              <button
                type="button"
                onClick={() => runSelectedQrExport('PDF')}
                disabled={isBulkWorking}
                className="flex h-10 items-center justify-center gap-2 bg-tactical-black px-3 font-label-caps text-stark-white transition-colors hover:bg-stark-white hover:text-tactical-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                BULK QR PDF
              </button>
              <button
                type="button"
                onClick={() => runSelectedQrExport('PNG')}
                disabled={isBulkWorking}
                className="flex h-10 items-center justify-center gap-2 bg-tactical-black px-3 font-label-caps text-stark-white transition-colors hover:bg-stark-white hover:text-tactical-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                BULK QR PNG
              </button>
              <button
                type="button"
                onClick={bulkRevokeSelected}
                disabled={isBulkWorking || selectedSerials.every((serial) => serial.status === 'REVOKED')}
                className="flex h-10 items-center justify-center gap-2 border border-tactical-black bg-transparent px-3 font-label-caps text-tactical-black transition-colors hover:bg-error hover:text-stark-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                REVOKE SELECTED
              </button>
            </div>
          </div>
        )}

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
                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant">Loading serials...</td></tr>
              ) : serials.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-on-surface-variant">No serials found.</td></tr>
              ) : (
                serials.map((s, index) => {
                  const rowNumber = pageStart + index;

                  return (
                  <tr
                    key={s.id}
                    className={`border-b border-surface-container-highest/50 transition-colors ${
                      selectedSerialIdSet.has(s.id)
                        ? 'border-l-2 border-l-signal-orange bg-signal-orange/10 hover:bg-signal-orange/20'
                        : 'hover:bg-surface-container-highest/30'
                    }`}
                  >
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
                    <td className="py-3 px-4">{s.verification_count || 0}</td>
                    <td className="py-3 px-4 text-on-surface-variant">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => printQR(s.serial)} className="text-on-surface-variant hover:text-signal-orange underline mr-3">Print QR</button>
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
                {[10, 25, 50, 100, 512].map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </label>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => goToPage(1)}
                disabled={loading || currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={loading || currentPage <= 1}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <form onSubmit={handlePageJump} className="flex items-center gap-2 font-data-mono text-sm text-on-surface-variant">
                <span>Page</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pageInput}
                  onChange={(event) => setPageInput(event.target.value)}
                  onBlur={() => goToPage(Number(pageInput) || 1)}
                  disabled={loading}
                  className="h-10 w-16 border border-surface-container-highest bg-tactical-black px-2 text-center text-stark-white focus:border-signal-orange focus:outline-none disabled:opacity-50"
                  aria-label="Page number"
                />
                <span>of <span className="text-stark-white">{pagination.totalPages}</span></span>
              </form>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={loading || currentPage >= pagination.totalPages}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => goToPage(pagination.totalPages)}
                disabled={loading || currentPage >= pagination.totalPages}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest bg-tactical-black text-on-surface-variant transition-colors hover:text-signal-orange disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-surface-container-highest bg-charcoal-field p-stack-lg shadow-2xl">
            <div className="mb-stack-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Filter className="h-4 w-4" />
                <h2 className="font-headline-md uppercase text-stark-white">Filter Controls</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowFilterModal(false)}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest text-on-surface-variant transition-colors hover:text-signal-orange"
                aria-label="Close filter controls"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1fr)_auto_auto]">
                <div className="flex min-w-0 border border-surface-container-highest bg-tactical-black px-3 py-2">
                  <Search className="mr-2 h-5 w-5 shrink-0 text-on-surface-variant" />
                  <input
                    type="text"
                    placeholder="Search serials..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-none bg-transparent font-data-mono text-stark-white focus:outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusFilter(event.target.value)}
                  className="border border-surface-container-highest bg-tactical-black px-4 py-2 font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange"
                >
                  <option value="ALL">ALL STATUS</option>
                  <option value="INACTIVE">UNACTIVATED</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="REVOKED">REVOKED</option>
                </select>
                <select
                  value={productId}
                  onChange={(event) => setProductId(event.target.value)}
                  className="border border-surface-container-highest bg-tactical-black px-4 py-2 font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange"
                >
                  <option value="ALL">ALL PRODUCTS</option>
                  <option value={CUSTOM_PRODUCT}>{CUSTOM_PRODUCT_LABEL}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <DateFilterInput id="generated-from" label="Generated From" value={dateFrom} onChange={setDateFrom} />
                <DateFilterInput id="generated-to" label="Generated To" value={dateTo} onChange={setDateTo} />
                <label className="space-y-1">
                  <span className="block font-label-caps text-on-surface-variant">Minimum Scans</span>
                  <input type="number" min="0" value={minScans} onChange={(event) => setMinScans(event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black px-3 py-2 font-data-mono text-stark-white" />
                </label>
                <label className="space-y-1">
                  <span className="block font-label-caps text-on-surface-variant">Maximum Scans</span>
                  <input type="number" min="0" value={maxScans} onChange={(event) => setMaxScans(event.target.value)} className="w-full border border-surface-container-highest bg-tactical-black px-3 py-2 font-data-mono text-stark-white" />
                </label>
              </div>
              <div className="flex flex-col gap-2 pt-stack-sm sm:flex-row sm:justify-end">
                <button type="button" onClick={resetFilters} className="flex h-11 items-center justify-center gap-2 border border-surface-container-highest bg-tactical-black px-4 text-on-surface-variant transition-colors hover:text-signal-orange">
                  <RotateCcw className="h-4 w-4" />
                  <span className="font-label-caps">RESET ALL FILTERS</span>
                </button>
                <button type="submit" className="flex h-11 items-center justify-center gap-2 bg-signal-orange px-4 text-tactical-black transition-colors hover:bg-stark-white">
                  <Filter className="h-4 w-4" />
                  <span className="font-label-caps">APPLY FILTER</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tactical-black/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-surface-container-highest bg-charcoal-field p-stack-lg shadow-2xl">
            <div className="mb-stack-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Download className="h-4 w-4" />
                <div>
                  <h2 className="font-headline-md uppercase text-stark-white">Export Serials</h2>
                  <p className="font-body-md text-sm text-on-surface-variant">Choose which serials to export.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="flex h-10 w-10 items-center justify-center border border-surface-container-highest text-on-surface-variant transition-colors hover:text-signal-orange"
                aria-label="Close export controls"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <DateFilterInput id="export-generated-from" label="Export From" value={exportDateFrom} onChange={setExportDateFrom} />
                <DateFilterInput id="export-generated-to" label="Export To" value={exportDateTo} onChange={setExportDateTo} />
              </div>
              <div className="flex flex-col gap-2 font-data-mono text-xs uppercase text-on-surface-variant sm:flex-row sm:items-center sm:justify-between">
                <span>Date range: <span className={isExportDateRangeInvalid ? 'text-error' : 'text-stark-white'}>{isExportDateRangeInvalid ? 'End date must be after start date' : exportDateRangeLabel}</span></span>
                <button
                  type="button"
                  onClick={() => {
                    setExportDateFrom('');
                    setExportDateTo('');
                  }}
                  className="text-left font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange sm:text-right"
                >
                  CLEAR EXPORT DATES
                </button>
              </div>

              <div className="space-y-1">
                <span className="block font-label-caps text-on-surface-variant">Products</span>
                <button
                  type="button"
                  onClick={() => setShowExportProducts((current) => !current)}
                  aria-expanded={showExportProducts}
                  aria-controls="export-product-options"
                  className="flex w-full items-center justify-between gap-3 border border-surface-container-highest bg-tactical-black px-3 py-3 text-left font-data-mono text-stark-white transition-colors hover:border-signal-orange"
                >
                  <span className="truncate">{exportProductSummary}</span>
                  {showExportProducts ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                </button>
                {showExportProducts && (
                  <div id="export-product-options" className="space-y-3 border border-surface-container-highest bg-tactical-black p-3">
                    <div className="flex border border-surface-container-highest bg-charcoal-field px-3 py-2">
                      <Search className="mr-2 h-4 w-4 shrink-0 text-on-surface-variant" />
                      <input
                        type="search"
                        value={exportProductSearch}
                        onChange={(event) => setExportProductSearch(event.target.value)}
                        placeholder="Search products..."
                        className="w-full border-none bg-transparent font-data-mono text-sm text-stark-white focus:outline-none"
                        aria-label="Search export products"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <button type="button" onClick={() => setExportProductIds(null)} className="font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange">
                        SELECT ALL
                      </button>
                      <button type="button" onClick={() => setExportProductIds([])} className="font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange">
                        CLEAR ALL
                      </button>
                    </div>
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {filteredExportProductOptions.map((product) => (
                        <label key={product.id} className="flex cursor-pointer items-center gap-3 px-2 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-highest/40 hover:text-stark-white">
                          <input
                            type="checkbox"
                            checked={exportProductIds === null || exportProductIds.includes(product.id)}
                            onChange={() => toggleExportProduct(product.id)}
                            className="h-4 w-4 accent-signal-orange"
                          />
                          <span>{product.name}</span>
                        </label>
                      ))}
                      {filteredExportProductOptions.length === 0 && (
                        <p className="px-2 py-3 font-data-mono text-sm text-on-surface-variant">No products found.</p>
                      )}
                    </div>
                  </div>
                )}
                <span className="block font-data-mono text-xs text-on-surface-variant">{exportProductSelectionLabel}</span>
              </div>

              <fieldset className="space-y-2">
                <legend className="font-label-caps text-on-surface-variant">Export type</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {([
                    ['CSV', 'CSV'],
                    ['QR_PDF', 'QR PDF'],
                    ['QR_PNG', 'QR PNG'],
                  ] as [ExportAction, string][]).map(([value, label]) => (
                    <label
                      key={value}
                      className={`cursor-pointer border px-3 py-3 text-center font-label-caps transition-colors ${
                        exportAction === value
                          ? 'border-signal-orange bg-signal-orange/10 text-signal-orange'
                          : 'border-surface-container-highest bg-tactical-black text-on-surface-variant hover:border-signal-orange hover:text-stark-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="export-type"
                        value={value}
                        checked={exportAction === value}
                        onChange={() => setExportAction(value)}
                        className="mr-2 accent-signal-orange"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <button
                type="button"
                onClick={() => setShowExportAdvanced((current) => !current)}
                aria-expanded={showExportAdvanced}
                aria-controls="export-advanced-options"
                className="flex w-full items-center justify-between border-y border-surface-container-highest py-3 font-label-caps text-on-surface-variant transition-colors hover:text-signal-orange"
              >
                <span>Advanced options</span>
                {showExportAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showExportAdvanced && (
                <div id="export-advanced-options" className="space-y-4 border border-surface-container-highest bg-tactical-black p-3">
                  <p className="font-body-md text-sm text-on-surface-variant">Date and product choices still apply to these row scopes.</p>
                  <fieldset className="space-y-2">
                    <legend className="font-label-caps text-on-surface-variant">Row scope</legend>
                    {([
                      [ALL_MATCHING_SERIALS, 'All matching serials', allMatchingExportCount, false],
                      ['SELECTED_SERIALS', 'Selected rows', selectedExportSerials.length, selectedExportSerials.length === 0],
                      ['CURRENT_PAGE_SERIALS', 'Current page', currentPageExportSerials.length, currentPageExportSerials.length === 0],
                    ] as [QrExportScope, string, number, boolean][]).map(([value, label, count, disabled]) => (
                      <label
                        key={value}
                        className={`flex items-center justify-between gap-3 border px-3 py-3 font-label-caps transition-colors ${
                          disabled
                            ? 'cursor-not-allowed border-surface-container-highest text-on-surface-variant/40'
                            : qrExportScope === value
                              ? 'cursor-pointer border-signal-orange bg-signal-orange/10 text-signal-orange'
                              : 'cursor-pointer border-surface-container-highest text-on-surface-variant hover:border-signal-orange hover:text-stark-white'
                        }`}
                      >
                        <span>
                          <input
                            type="radio"
                            name="export-scope"
                            value={value}
                            checked={qrExportScope === value}
                            onChange={() => setQrExportScope(value)}
                            disabled={disabled}
                            className="mr-2 accent-signal-orange"
                          />
                          {label}
                        </span>
                        <span className="font-data-mono">{value === ALL_MATCHING_SERIALS && isLoadingExportCount ? '...' : count}</span>
                      </label>
                    ))}
                  </fieldset>

                  {exportAction !== 'CSV' && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="space-y-1">
                        <span className="block font-label-caps text-on-surface-variant">Columns</span>
                        <input
                          type="number"
                          min="1"
                          max="40"
                          value={qrLayoutColumns}
                          onChange={(event) => setQrLayoutColumns(Number(event.target.value))}
                          className="w-full border border-surface-container-highest bg-charcoal-field px-3 py-2 font-data-mono text-stark-white"
                          aria-label="QR layout columns"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="block font-label-caps text-on-surface-variant">Rows Per Sheet</span>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={qrLayoutRows}
                          onChange={(event) => setQrLayoutRows(Number(event.target.value))}
                          className="w-full border border-surface-container-highest bg-charcoal-field px-3 py-2 font-data-mono text-stark-white"
                          aria-label="QR layout rows"
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div aria-live="polite" className={`border-l-2 p-3 font-data-mono text-sm ${isExportDateRangeInvalid ? 'border-error bg-error-container/20 text-error' : 'border-signal-orange bg-tactical-black text-on-surface-variant'}`}>
                <span className={isExportDateRangeInvalid ? 'text-error' : 'text-stark-white'}>
                  {isExportDateRangeInvalid
                    ? 'Choose a valid date range'
                    : qrExportScope === ALL_MATCHING_SERIALS && isLoadingExportCount
                      ? 'Counting matching serials...'
                      : `${exportScopeCount} serial${exportScopeCount === 1 ? '' : 's'} ready`}
                </span>
                {!isExportDateRangeInvalid && (
                  <span className="mt-1 block text-xs uppercase">
                    {exportDateRangeLabel} · {exportProductSelectionLabel} · {exportAction.replace('_', ' ')}{qrExportScope === ALL_MATCHING_SERIALS ? '' : ` · ${exportScopeLabel}`}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleExportSubmit}
                disabled={isExportSubmitDisabled}
                className="flex h-12 w-full items-center justify-center gap-2 bg-signal-orange px-4 font-label-caps text-tactical-black transition-colors hover:bg-stark-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'EXPORTING...' : <>EXPORT {exportScopeCount} SERIAL{exportScopeCount === 1 ? '' : 'S'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <option value={CUSTOM_PRODUCT}>{CUSTOM_PRODUCT_LABEL}</option>
                  <option value={ALL_DURHAIM_PRODUCTS}>All Durhaim Product</option>
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
