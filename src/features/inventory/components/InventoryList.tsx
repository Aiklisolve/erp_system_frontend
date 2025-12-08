import { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../../../hooks/useToast';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Table, type TableColumn } from '../../../components/ui/Table';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { StatCard } from '../../../components/ui/StatCard';
import { Tabs } from '../../../components/ui/Tabs';
import { Badge } from '../../../components/ui/Badge';
import { Pagination } from '../../../components/ui/Pagination';
import type { InventoryItem } from '../types';
import { InventoryForm } from './InventoryForm';
import { VendorForm, type VendorFormData } from './VendorForm';
import { CategoryForm, type CategoryFormData } from './CategoryForm';
import { AssignInventoryForm } from './AssignInventoryForm';

// Assigned inventory interface matching backend
interface AssignedInventoryItem {
  id: number;
  product_id: number;
  product_name?: string;
  product_code?: string;
  purchase_order_id: number;
  po_number?: string;
  quantity: number;
  date_of_use: string;
  reason_notes: string;
  created_at?: string;
}

// Mock vendors and categories
const mockVendorsData: VendorFormData[] = [
  {
    id: 1,
    vendor_name: 'ABC Electronics Ltd',
    phone_number: '9876543210',
    email: 'contact@abcelectronics.com',
    contact_person_name: 'John Doe',
    address: '123 Industrial Area, City',
    materials_products: 'Electronic components, Circuit boards',
  },
  {
    id: 2,
    vendor_name: 'XYZ Auto Parts',
    phone_number: '9876543211',
    email: 'info@xyzautoparts.com',
    contact_person_name: 'Jane Smith',
    address: '456 Auto Street, City',
    materials_products: 'Vehicle parts, Brake pads, Filters',
  },
];


export function InventoryList() {
  const { items, loading, create, update, remove, refresh, metrics } = useInventory();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'assigned' | 'vendors' | 'categories'>('inventory');
  const [modalOpen, setModalOpen] = useState(false);
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Assigned inventory state
  const [assignedInventory, setAssignedInventory] = useState<AssignedInventoryItem[]>([]);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedItemsPerPage, setAssignedItemsPerPage] = useState(10);
  const [editingAssignedQuantity, setEditingAssignedQuantity] = useState<{ id: number; quantity: number } | null>(null);
  const [updatingQuantity, setUpdatingQuantity] = useState(false);

  // Vendors state
  const [vendors, setVendors] = useState<VendorFormData[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorFormData | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorItemsPerPage, setVendorItemsPerPage] = useState(10);

  // Categories state
  const [categories, setCategories] = useState<CategoryFormData[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryItemsPerPage, setCategoryItemsPerPage] = useState(10);

  // Fetch assigned inventory from backend
  const fetchAssignedInventory = async () => {
    setAssignedLoading(true);
    try {
      const { listAssignments } = await import('../api/inventoryApi');
      const assignments = await listAssignments();
      setAssignedInventory(assignments);
    } catch (error) {
      console.error('Error fetching assigned inventory:', error);
      showToast('error', 'Failed to Load', 'Failed to load assigned inventory. Please try again.');
    } finally {
      setAssignedLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assigned') {
      fetchAssignedInventory();
    }
  }, [activeTab]);

  // Fetch vendors from backend API
  const fetchVendors = async () => {
    setVendorsLoading(true);
    try {
      const { listVendors } = await import('../api/inventoryApi');
      const vendorList = await listVendors();
      setVendors(vendorList.map((v: any) => ({
        id: v.id,
        vendor_name: v.vendor_name || '',
        phone_number: v.phone_number || '',
        email: v.email || '',
        contact_person_name: v.contact_person_name || '',
        address: v.address || '',
        materials_products: v.materials_products || '',
      })));
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showToast('error', 'Failed to Load', 'Failed to load vendors. Please try again.');
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'vendors') {
      fetchVendors();
    }
  }, [activeTab]);

  // Fetch categories from backend API
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const { listCategories } = await import('../api/inventoryApi');
      const categoryList = await listCategories();
      setCategories(categoryList.map((cat: any) => ({
        id: cat.id,
        category_name: cat.category_name || '',
        vendor_id: cat.vendor_id || 0,
        description: cat.description || '',
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast('error', 'Failed to Load', 'Failed to load categories. Please try again.');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  // Filter inventory items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && item.qty_on_hand <= item.reorder_level) ||
      (stockFilter === 'in-stock' && item.qty_on_hand > item.reorder_level);
    return matchesSearch && matchesCategory && matchesStock;
  });

  // Filter assigned inventory
  const filteredAssigned = assignedInventory.filter((item) => {
    const matchesSearch =
      (item.product_name || '').toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      (item.product_code || '').toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      (item.po_number || '').toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      (item.reason_notes || '').toLowerCase().includes(assignedSearchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const assignedTotalPages = Math.ceil(filteredAssigned.length / assignedItemsPerPage);
  const assignedStartIndex = (assignedPage - 1) * assignedItemsPerPage;
  const assignedPaginatedItems = filteredAssigned.slice(assignedStartIndex, assignedStartIndex + assignedItemsPerPage);

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) =>
    (vendor.vendor_name || '').toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    (vendor.contact_person_name || '').toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    (vendor.email || '').toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    (vendor.phone_number || '').includes(vendorSearchTerm)
  );

  // Filter categories
  const filteredCategories = categories.filter((category) =>
    (category.category_name || '').toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Pagination for vendors
  const vendorTotalPages = Math.ceil(filteredVendors.length / vendorItemsPerPage);
  const vendorStartIndex = (vendorPage - 1) * vendorItemsPerPage;
  const vendorPaginatedItems = filteredVendors.slice(vendorStartIndex, vendorStartIndex + vendorItemsPerPage);

  // Pagination for categories
  const categoryTotalPages = Math.ceil(filteredCategories.length / categoryItemsPerPage);
  const categoryStartIndex = (categoryPage - 1) * categoryItemsPerPage;
  const categoryPaginatedItems = filteredCategories.slice(categoryStartIndex, categoryStartIndex + categoryItemsPerPage);

  // Get unique categories for inventory filter
  const inventoryCategories = Array.from(new Set(items.map((item) => item.category)));

  const inventoryColumns: TableColumn<InventoryItem>[] = [
    { key: 'sku', header: 'SKU' },
    { key: 'name', header: 'Name' },
    { key: 'category', header: 'Category' },
    {
      key: 'qty_on_hand',
      header: 'On Hand',
      render: (row) => (
        <span
          className={
            row.qty_on_hand <= row.reorder_level
              ? 'text-red-600 font-semibold'
              : 'text-slate-800'
          }
        >
          {row.qty_on_hand}
        </span>
      ),
    },
    { key: 'reorder_level', header: 'Reorder Level' },
    { key: 'location', header: 'Location' },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingItem(row);
              setModalOpen(true);
            }}
            className="text-[11px] text-primary hover:text-primary-dark"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDeleteItem(row)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const assignedColumns: TableColumn<AssignedInventoryItem>[] = [
    { key: 'po_number', header: 'Purchase Order' },
    { key: 'product_name', header: 'Product' },
    { key: 'product_code', header: 'SKU' },
    { 
      key: 'quantity', 
      header: 'Quantity',
      render: (row) => (
        <span className="font-medium">{row.quantity}</span>
      )
    },
    { 
      key: 'date_of_use', 
      header: 'Date of Use',
      render: (row) => (
        <span>{new Date(row.date_of_use).toLocaleDateString()}</span>
      )
    },
    { key: 'reason_notes', header: 'Notes' },
    {
      key: 'id',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setEditingAssignedQuantity({ id: row.id, quantity: row.quantity });
          }}
          className="text-[11px] text-primary hover:text-primary-dark"
        >
          Edit Qty
        </button>
      ),
    },
  ];

  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    setFormLoading(true);
    try {
      if (editingItem) {
        await update(editingItem.id, data);
        showToast('success', 'Inventory Item Updated', `Item "${data.name}" has been updated successfully.`);
      } else {
        await create(data);
        showToast('success', 'Inventory Item Created', `Item "${data.name}" has been created successfully.`);
      }
      setModalOpen(false);
      setEditingItem(null);
      // Refresh the list to get updated data from backend
      await refresh();
    } catch (error) {
      showToast('error', 'Operation Failed', 'Failed to save inventory item. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteItem = async (item: InventoryItem) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await remove(item.id);
        showToast('success', 'Inventory Item Deleted', `Item "${item.name}" has been deleted successfully.`);
        // Refresh the list to get updated data from backend
        await refresh();
      } catch (error) {
        showToast('error', 'Deletion Failed', 'Failed to delete inventory item. Please try again.');
      }
    }
  };

  const handleVendorSubmit = async (data: VendorFormData) => {
    // VendorForm already handles the API call, we just need to refresh the list
    setVendorModalOpen(false);
    setEditingVendor(null);
    // Refresh vendors list to show updated data
    await fetchVendors();
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    // CategoryForm already handles the API call, we just need to refresh the list
    setCategoryModalOpen(false);
    setEditingCategory(null);
    // Refresh categories list to show updated data
    await fetchCategories();
  };

  const handleDeleteVendor = async (vendor: VendorFormData) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      if (vendor.id) {
        try {
          const { deleteVendor } = await import('../api/inventoryApi');
          await deleteVendor(vendor.id);
          showToast('success', 'Vendor Deleted', `Vendor "${vendor.vendor_name || 'Unknown'}" has been deleted successfully.`);
          // Refresh vendors list
          await fetchVendors();
        } catch (error) {
          showToast('error', 'Deletion Failed', 'Failed to delete vendor. Please try again.');
        }
      }
    }
  };

  const handleDeleteCategory = async (category: CategoryFormData) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      if (category.id) {
        try {
          const { deleteCategory } = await import('../api/inventoryApi');
          await deleteCategory(category.id);
          showToast('success', 'Category Deleted', `Category "${category.category_name}" has been deleted successfully.`);
          // Refresh categories list
          await fetchCategories();
        } catch (error) {
          showToast('error', 'Deletion Failed', 'Failed to delete category. Please try again.');
        }
      }
    }
  };

  const handleAssignSubmit = async (data: any) => {
    try {
      setAssignModalOpen(false);
      showToast('success', 'Inventory Assigned', 'Inventory has been assigned successfully.');
      // Refresh assigned inventory if on assigned tab
      if (activeTab === 'assigned') {
        await fetchAssignedInventory();
      }
    } catch (error) {
      showToast('error', 'Assignment Failed', 'Failed to assign inventory. Please try again.');
    }
  };

  const handleUpdateQuantity = async () => {
    if (!editingAssignedQuantity) return;

    setUpdatingQuantity(true);
    try {
      const { updateAssignment } = await import('../api/inventoryApi');
      await updateAssignment(editingAssignedQuantity.id, {
        quantity: editingAssignedQuantity.quantity
      });
      showToast('success', 'Quantity Updated', 'Assignment quantity has been updated successfully.');
      setEditingAssignedQuantity(null);
      await fetchAssignedInventory();
    } catch (error) {
      showToast('error', 'Update Failed', 'Failed to update quantity. Please try again.');
    } finally {
      setUpdatingQuantity(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
            Inventory Management
          </h1>
          <p className="text-xs text-slate-600 max-w-xl">
            Monitor stock levels, locations, and reorder points for all inventory items.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setVendorModalOpen(true)}>
            Add Vendor
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setCategoryModalOpen(true)}>
            New Category
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setAssignModalOpen(true)}>
            Assign Inventory
          </Button>
          <Button variant="primary" size="sm" onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}>
            New Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Items"
          value={metrics.totalItems.toString()}
          helper="Unique SKUs tracked."
          trend="up"
          variant="teal"
        />
        <StatCard
          label="Low Stock Items"
          value={metrics.lowStock.toString()}
          helper="At or below reorder level."
          trend={metrics.lowStock > 0 ? 'down' : 'flat'}
          variant="yellow"
        />
        <StatCard
          label="Total Quantity"
          value={metrics.totalQty.toString()}
          helper="Across all locations."
          trend="flat"
          variant="blue"
        />
      </div>

      {/* Tabs */}
      <Card className="space-y-4">
        <Tabs
          items={[
            { id: 'inventory', label: 'Inventory Items' },
            { id: 'assigned', label: 'Assigned Inventory' },
            { id: 'vendors', label: 'Vendors' },
            { id: 'categories', label: 'Categories' },
          ]}
          activeId={activeTab}
          onChange={(id) => setActiveTab(id as 'inventory' | 'assigned' | 'vendors' | 'categories')}
        />

        {/* Inventory Items Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by SKU, name, or location..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Categories</option>
                {inventoryCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              <Select
                value={stockFilter}
                onChange={(e) => {
                  setStockFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Stock</option>
                <option value="low">Low Stock</option>
                <option value="in-stock">In Stock</option>
              </Select>
            </div>

            {/* Table */}
            {loading ? (
              <LoadingState label="Loading inventory..." />
            ) : filteredItems.length === 0 ? (
              <EmptyState
                title="No inventory items found"
                description="Create your first inventory item to get started."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={inventoryColumns}
                    data={paginatedItems}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={currentPage}
                        totalPages={totalPages}
                        onChange={setCurrentPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(startIndex + itemsPerPage, filteredItems.length)}</span> of <span className="font-medium text-slate-900">{filteredItems.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Assigned Inventory Tab */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by product name, SKU, PO number, or notes..."
                  value={assignedSearchTerm}
                  onChange={(e) => {
                    setAssignedSearchTerm(e.target.value);
                    setAssignedPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table */}
            {assignedLoading ? (
              <LoadingState label="Loading assigned inventory..." />
            ) : filteredAssigned.length === 0 ? (
              <EmptyState
                title="No assigned inventory found"
                description="Assign inventory items to purchase orders to see them here."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={assignedColumns}
                    data={assignedPaginatedItems}
                    getRowKey={(row, index) => `${row.id}-${index}`}
                  />
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={assignedItemsPerPage}
                        onChange={(e) => {
                          setAssignedItemsPerPage(Number(e.target.value));
                          setAssignedPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={assignedPage}
                        totalPages={assignedTotalPages}
                        onChange={setAssignedPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{assignedStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(assignedStartIndex + assignedItemsPerPage, filteredAssigned.length)}</span> of <span className="font-medium text-slate-900">{filteredAssigned.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by vendor name, contact person, email, or phone..."
                  value={vendorSearchTerm}
                  onChange={(e) => {
                    setVendorSearchTerm(e.target.value);
                    setVendorPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table */}
            {vendorsLoading ? (
              <LoadingState label="Loading vendors..." />
            ) : filteredVendors.length === 0 ? (
              <EmptyState
                title="No vendors found"
                description="Add your first vendor to get started."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'vendor_name', header: 'Vendor Name' },
                      { key: 'contact_person_name', header: 'Contact Person' },
                      { key: 'phone_number', header: 'Phone' },
                      { key: 'email', header: 'Email' },
                      {
                        key: 'id',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingVendor(row);
                                setVendorModalOpen(true);
                              }}
                              className="text-[11px] text-primary hover:text-primary-dark"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVendor(row)}
                              className="text-[11px] text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={vendorPaginatedItems}
                    getRowKey={(row, index) => `vendor-${row.id}-${index}`}
                  />
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={vendorItemsPerPage}
                        onChange={(e) => {
                          setVendorItemsPerPage(Number(e.target.value));
                          setVendorPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={vendorPage}
                        totalPages={vendorTotalPages}
                        onChange={setVendorPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{vendorStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(vendorStartIndex + vendorItemsPerPage, filteredVendors.length)}</span> of <span className="font-medium text-slate-900">{filteredVendors.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search by category name..."
                  value={categorySearchTerm}
                  onChange={(e) => {
                    setCategorySearchTerm(e.target.value);
                    setCategoryPage(1);
                  }}
                />
              </div>
            </div>

            {/* Table */}
            {categoriesLoading ? (
              <LoadingState label="Loading categories..." />
            ) : filteredCategories.length === 0 ? (
              <EmptyState
                title="No categories found"
                description="Add your first category to get started."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'category_name', header: 'Category Name' },
                      {
                        key: 'vendor_id',
                        header: 'Vendor',
                        render: (row) => {
                          const vendor = vendors.find((v) => v.id === row.vendor_id);
                          return vendor?.vendor_name || `Vendor #${row.vendor_id}`;
                        },
                      },
                      {
                        key: 'id',
                        header: 'Actions',
                        render: (row) => (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(row);
                                setCategoryModalOpen(true);
                              }}
                              className="text-[11px] text-primary hover:text-primary-dark"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(row)}
                              className="text-[11px] text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={categoryPaginatedItems}
                    getRowKey={(row, index) => `category-${row.id}-${index}`}
                  />
                </div>
                {/* Pagination */}
                <div className="px-4 py-3 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: Page size selector */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>Show</span>
                      <select
                        value={categoryItemsPerPage}
                        onChange={(e) => {
                          setCategoryItemsPerPage(Number(e.target.value));
                          setCategoryPage(1);
                        }}
                        className="border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span>per page</span>
                    </div>

                    {/* Center: Page numbers */}
                    <div className="flex-1 flex justify-center">
                      <Pagination
                        page={categoryPage}
                        totalPages={categoryTotalPages}
                        onChange={setCategoryPage}
                      />
                    </div>

                    {/* Right: Showing info */}
                    <div className="text-xs text-slate-600 whitespace-nowrap">
                      Showing <span className="font-medium text-slate-900">{categoryStartIndex + 1}</span> to <span className="font-medium text-slate-900">{Math.min(categoryStartIndex + categoryItemsPerPage, filteredCategories.length)}</span> of <span className="font-medium text-slate-900">{filteredCategories.length}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Modals */}
      <Modal
        title={editingItem ? 'Edit Inventory Item' : 'New Inventory Item'}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        hideCloseButton
      >
        <InventoryForm
          initial={editingItem || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          isLoading={formLoading}
        />
      </Modal>

      <Modal
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        open={vendorModalOpen}
        onClose={() => {
          setVendorModalOpen(false);
          setEditingVendor(null);
        }}
        hideCloseButton
      >
        <VendorForm
          initial={editingVendor || undefined}
          onSubmit={handleVendorSubmit}
          onCancel={() => {
            setVendorModalOpen(false);
            setEditingVendor(null);
          }}
        />
      </Modal>

      <Modal
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        hideCloseButton
      >
        <CategoryForm
          initial={editingCategory || undefined}
          onSubmit={handleCategorySubmit}
          onCancel={() => {
            setCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      </Modal>

      <Modal
        title="Assign Inventory"
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        hideCloseButton
      >
        <AssignInventoryForm
          onSubmit={handleAssignSubmit}
          onCancel={() => setAssignModalOpen(false)}
        />
      </Modal>

      {/* Edit Assigned Quantity Modal */}
      {editingAssignedQuantity && (
        <Modal
          title="Edit Quantity"
          open={!!editingAssignedQuantity}
          onClose={() => setEditingAssignedQuantity(null)}
        >
          <div className="space-y-4">
            <Input
              label="Quantity"
              type="number"
              value={editingAssignedQuantity.quantity || ''}
              onChange={(e) => {
                const inputValue = e.target.value;
                // Remove leading zeros and parse as integer
                const numValue = inputValue === '' ? 0 : parseInt(inputValue.replace(/^0+/, '') || '0', 10);
                if (!isNaN(numValue) && numValue >= 0) {
                  setEditingAssignedQuantity({
                    ...editingAssignedQuantity,
                    quantity: numValue,
                  });
                }
              }}
              min={1}
              required
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button 
                variant="ghost" 
                size="md" 
                onClick={() => setEditingAssignedQuantity(null)}
                disabled={updatingQuantity}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleUpdateQuantity}
                disabled={updatingQuantity || editingAssignedQuantity.quantity < 1}
              >
                {updatingQuantity ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
