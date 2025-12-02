import { useState, useEffect } from 'react';
import { useInventory } from '../hooks/useInventory';
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

// Mock assigned inventory data
interface AssignedInventoryItem {
  usage_id: string;
  registration_number: string;
  vehicle_model: string;
  item_name: string;
  part_number: string;
  category: string;
  quantity: number;
  unit: string;
}

const mockAssignedInventory: AssignedInventoryItem[] = [
  {
    usage_id: '1',
    registration_number: 'VH-001',
    vehicle_model: 'Truck Model A',
    item_name: 'Engine Oil Filter',
    part_number: 'PN-001',
    category: 'Vehicle Parts',
    quantity: 5,
    unit: 'pcs',
  },
  {
    usage_id: '2',
    registration_number: 'VH-002',
    vehicle_model: 'Van Model B',
    item_name: 'Brake Pads',
    part_number: 'PN-002',
    category: 'Vehicle Parts',
    quantity: 2,
    unit: 'pairs',
  },
];

// Mock vendors and categories
const mockVendorsData: VendorFormData[] = [
  {
    id: 1,
    category_name: 'ABC Electronics Ltd',
    phone_number: '9876543210',
    email_id: 'contact@abcelectronics.com',
    contact_person_name: 'John Doe',
    address: '123 Industrial Area, City',
    materials_products: 'Electronic components, Circuit boards',
  },
  {
    id: 2,
    category_name: 'XYZ Auto Parts',
    phone_number: '9876543211',
    email_id: 'info@xyzautoparts.com',
    contact_person_name: 'Jane Smith',
    address: '456 Auto Street, City',
    materials_products: 'Vehicle parts, Brake pads, Filters',
  },
];

const mockCategoriesData: CategoryFormData[] = [
  { category_id: 1, category_name: 'Electronics', vendor_id: 1 },
  { category_id: 2, category_name: 'Tools', vendor_id: 1 },
  { category_id: 3, category_name: 'Safety Equipment', vendor_id: 2 },
];

export function InventoryList() {
  const { items, loading, create, update, remove, refresh, metrics } = useInventory();
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
  const [assignedInventory, setAssignedInventory] = useState<AssignedInventoryItem[]>(mockAssignedInventory);
  const [assignedSearchTerm, setAssignedSearchTerm] = useState('');
  const [assignedCategoryFilter, setAssignedCategoryFilter] = useState('all');
  const [assignedPage, setAssignedPage] = useState(1);
  const [assignedItemsPerPage, setAssignedItemsPerPage] = useState(10);
  const [editingAssignedQuantity, setEditingAssignedQuantity] = useState<{ id: string; quantity: number } | null>(null);

  // Vendors state
  const [vendors, setVendors] = useState<VendorFormData[]>(mockVendorsData);
  const [editingVendor, setEditingVendor] = useState<VendorFormData | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorPage, setVendorPage] = useState(1);
  const [vendorItemsPerPage, setVendorItemsPerPage] = useState(10);

  // Categories state
  const [categories, setCategories] = useState<CategoryFormData[]>(mockCategoriesData);
  const [editingCategory, setEditingCategory] = useState<CategoryFormData | null>(null);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryItemsPerPage, setCategoryItemsPerPage] = useState(10);

  // Fetch assigned inventory (optional API call)
  useEffect(() => {
    const fetchAssignedInventory = async () => {
      try {
        const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
        if (API_KEY) {
          const response = await fetch(
            "https://n8n.srv799538.hstgr.cloud/webhook/assignedinventory",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                "Content-Profile": "srtms",
                jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                session_id: "1",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0]?.data) {
              setAssignedInventory(data[0].data);
            }
          }
        }
      } catch (error) {
        console.log('Using mock assigned inventory:', error);
      }
    };

    if (activeTab === 'assigned') {
      fetchAssignedInventory();
    }
  }, [activeTab]);

  // Fetch vendors (optional API call)
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
        if (API_KEY) {
          const response = await fetch(
            "https://n8n.srv799538.hstgr.cloud/webhook/vendor",
            {
              method: 'GET',
              headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'content-Profile': 'srtms',
                'session_id': '1',
                'jwt_token': '9082c5f9b14d12773ec0ead79742d239cec142c3',
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0]?.status === 'success' && data[0]?.data) {
              const activeVendors = data[0].data.filter((v: any) => !v.deleted_flag);
              setVendors(activeVendors.map((v: any) => ({
                id: v.vendor_id,
                category_name: v.company_name,
                phone_number: v.phone_number || '',
                email_id: v.email_id || '',
                contact_person_name: v.contact_person_name || '',
                address: '',
                materials_products: '',
              })));
            }
          }
        }
      } catch (error) {
        console.log('Using mock vendors:', error);
      }
    };

    if (activeTab === 'vendors') {
      fetchVendors();
    }
  }, [activeTab]);

  // Fetch categories (optional API call)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const API_KEY = import.meta.env.VITE_SUPABASE_API_KEY || '';
        if (API_KEY) {
          const response = await fetch(
            "https://n8n.srv799538.hstgr.cloud/webhook/578481f3-a817-434a-b301-c3c48f9addfc",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                apikey: API_KEY,
                Authorization: `Bearer ${API_KEY}`,
                "Content-Profile": "srtms",
                jwt_token: "9082c5f9b14d12773ec0ead79742d239cec142c3",
                session_id: "1",
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data[0]?.data) {
              setCategories(data[0].data.map((cat: any) => ({
                category_id: cat.category_id,
                category_name: cat.category_name,
                vendor_id: cat.vendor_id || 1,
              })));
            }
          }
        }
      } catch (error) {
        console.log('Using mock categories:', error);
      }
    };

    if (activeTab === 'categories') {
      fetchCategories();
    }
  }, [activeTab]);

  // Filter inventory items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
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
      item.registration_number.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      item.item_name.toLowerCase().includes(assignedSearchTerm.toLowerCase()) ||
      item.part_number.toLowerCase().includes(assignedSearchTerm.toLowerCase());
    const matchesCategory = assignedCategoryFilter === 'all' || item.category === assignedCategoryFilter;
    return matchesSearch && matchesCategory;
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
    vendor.category_name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.contact_person_name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.email_id.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
    vendor.phone_number.includes(vendorSearchTerm)
  );

  // Filter categories
  const filteredCategories = categories.filter((category) =>
    category.category_name.toLowerCase().includes(categorySearchTerm.toLowerCase())
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
            onClick={() => remove(row.id)}
            className="text-[11px] text-red-500 hover:text-red-600"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const assignedColumns: TableColumn<AssignedInventoryItem>[] = [
    { key: 'registration_number', header: 'Vehicle' },
    { key: 'vehicle_model', header: 'Model' },
    { key: 'item_name', header: 'Item' },
    { key: 'part_number', header: 'Part #' },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'unit', header: 'Unit' },
    {
      key: 'usage_id',
      header: 'Actions',
      render: (row) => (
        <button
          type="button"
          onClick={() => {
            setEditingAssignedQuantity({ id: row.usage_id, quantity: row.quantity });
          }}
          className="text-[11px] text-primary hover:text-primary-dark"
        >
          Edit Qty
        </button>
      ),
    },
  ];

  const handleFormSubmit = async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingItem) {
      await update(editingItem.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleVendorSubmit = async (data: VendorFormData) => {
    if (editingVendor) {
      // Update vendor
      setVendors((prev) =>
        prev.map((v) => (v.id === editingVendor.id ? { ...data, id: editingVendor.id } : v))
      );
      setEditingVendor(null);
    } else {
      // Create vendor
      const newVendor: VendorFormData = {
        ...data,
        id: vendors.length > 0 ? Math.max(...vendors.map((v) => v.id || 0)) + 1 : 1,
      };
      setVendors((prev) => [newVendor, ...prev]);
    }
    setVendorModalOpen(false);
  };

  const handleCategorySubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      // Update category
      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === editingCategory.category_id
            ? { ...data, category_id: editingCategory.category_id }
            : c
        )
      );
      setEditingCategory(null);
    } else {
      // Create category
      const newCategory: CategoryFormData = {
        ...data,
        category_id:
          categories.length > 0
            ? Math.max(...categories.map((c) => c.category_id || 0)) + 1
            : 1,
      };
      setCategories((prev) => [newCategory, ...prev]);
    }
    setCategoryModalOpen(false);
  };

  const handleDeleteVendor = (id: number | undefined) => {
    if (id) {
      setVendors((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleDeleteCategory = (categoryId: number | undefined) => {
    if (categoryId) {
      setCategories((prev) => prev.filter((c) => c.category_id !== categoryId));
    }
  };

  const handleAssignSubmit = async (data: any) => {
    console.log('Inventory assigned:', data);
    setAssignModalOpen(false);
    // Refresh assigned inventory
    if (activeTab === 'assigned') {
      // Refresh logic here
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
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Select
                      value={itemsPerPage.toString()}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-32"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </Select>
                    <Pagination
                      page={currentPage}
                      totalPages={totalPages}
                      onChange={setCurrentPage}
                    />
                  </div>
                )}
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
                  placeholder="Search by vehicle, item, or part number..."
                  value={assignedSearchTerm}
                  onChange={(e) => {
                    setAssignedSearchTerm(e.target.value);
                    setAssignedPage(1);
                  }}
                />
              </div>
              <Select
                value={assignedCategoryFilter}
                onChange={(e) => {
                  setAssignedCategoryFilter(e.target.value);
                  setAssignedPage(1);
                }}
                className="w-full sm:w-48"
              >
                <option value="all">All Categories</option>
                {Array.from(new Set(filteredAssigned.map((item) => item.category))).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>

            {/* Table */}
            {filteredAssigned.length === 0 ? (
              <EmptyState
                title="No assigned inventory found"
                description="Assign inventory items to vehicles to see them here."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={assignedColumns}
                    data={assignedPaginatedItems}
                    getRowKey={(row, index) => `${row.usage_id}-${index}`}
                  />
                </div>
                {assignedTotalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Select
                      value={assignedItemsPerPage.toString()}
                      onChange={(e) => {
                        setAssignedItemsPerPage(Number(e.target.value));
                        setAssignedPage(1);
                      }}
                      className="w-full sm:w-32"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </Select>
                    <Pagination
                      page={assignedPage}
                      totalPages={assignedTotalPages}
                      onChange={setAssignedPage}
                    />
                  </div>
                )}
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
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingVendor(null);
                  setVendorModalOpen(true);
                }}
              >
                Add Vendor
              </Button>
            </div>

            {/* Table */}
            {filteredVendors.length === 0 ? (
              <EmptyState
                title="No vendors found"
                description="Add your first vendor to get started."
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'category_name', header: 'Vendor Name' },
                      { key: 'contact_person_name', header: 'Contact Person' },
                      { key: 'phone_number', header: 'Phone' },
                      { key: 'email_id', header: 'Email' },
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
                              onClick={() => handleDeleteVendor(row.id)}
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
                {vendorTotalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Select
                      value={vendorItemsPerPage.toString()}
                      onChange={(e) => {
                        setVendorItemsPerPage(Number(e.target.value));
                        setVendorPage(1);
                      }}
                      className="w-full sm:w-32"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </Select>
                    <Pagination
                      page={vendorPage}
                      totalPages={vendorTotalPages}
                      onChange={setVendorPage}
                    />
                  </div>
                )}
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
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryModalOpen(true);
                }}
              >
                Add Category
              </Button>
            </div>

            {/* Table */}
            {filteredCategories.length === 0 ? (
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
                          return vendor?.category_name || `Vendor #${row.vendor_id}`;
                        },
                      },
                      {
                        key: 'category_id',
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
                              onClick={() => handleDeleteCategory(row.category_id)}
                              className="text-[11px] text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        ),
                      },
                    ]}
                    data={categoryPaginatedItems}
                    getRowKey={(row, index) => `category-${row.category_id}-${index}`}
                  />
                </div>
                {categoryTotalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <Select
                      value={categoryItemsPerPage.toString()}
                      onChange={(e) => {
                        setCategoryItemsPerPage(Number(e.target.value));
                        setCategoryPage(1);
                      }}
                      className="w-full sm:w-32"
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </Select>
                    <Pagination
                      page={categoryPage}
                      totalPages={categoryTotalPages}
                      onChange={setCategoryPage}
                    />
                  </div>
                )}
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
      >
        <InventoryForm
          initial={editingItem || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      <Modal
        title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
        open={vendorModalOpen}
        onClose={() => {
          setVendorModalOpen(false);
          setEditingVendor(null);
        }}
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
              value={editingAssignedQuantity.quantity}
              onChange={(e) =>
                setEditingAssignedQuantity({
                  ...editingAssignedQuantity,
                  quantity: Number(e.target.value),
                })
              }
            />
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="ghost" size="md" onClick={() => setEditingAssignedQuantity(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={async () => {
                  // Update logic here
                  console.log('Update quantity:', editingAssignedQuantity);
                  setEditingAssignedQuantity(null);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
