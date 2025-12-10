import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RootLayout } from './layout/RootLayout';
import { AuthLayout } from './layout/AuthLayout';
import { LandingPage } from '../pages/marketing/LandingPage';
import { PrivacyPage } from '../pages/marketing/PrivacyPage';
import { TermsPage } from '../pages/marketing/TermsPage';
import { SupportPage } from '../pages/marketing/SupportPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { OverviewPage } from '../pages/dashboard/OverviewPage';
import { ModulesListPage } from '../pages/modules/ModulesListPage';
import { ModuleDetailPage } from '../pages/modules/ModuleDetailPage';
import { FinanceList } from '../features/finance/components/FinanceList';
import { ProcurementList } from '../features/procurement/components/ProcurementList';
import { ManufacturingList } from '../features/manufacturing/components/ManufacturingList';
import { InventoryList } from '../features/inventory/components/InventoryList';
import { OrdersList } from '../features/orders/components/OrdersList';
import { WarehouseList } from '../features/warehouse/components/WarehouseList';
import { SupplyChainDeliveryList } from '../features/supplyChain/components/SupplyChainDeliveryList';
import { CustomerList } from '../features/crm/components/CustomerList';
import { ProjectList } from '../features/projects/components/ProjectList';
import { WorkforceList } from '../features/workforce/components/WorkforceList';
import { EmployeeList } from '../features/hr/components/EmployeeList';
import { EcommerceProductsList } from '../features/ecommerce/components/EcommerceProductsList';
import { CampaignList } from '../features/marketing/components/CampaignList';
import { InternalTasksPage } from '../pages/InternalTasksPage';
import { ProtectedRoute } from './protectedRoute';
import { ModuleProtectedRoute } from './moduleProtectedRoute';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <LandingPage />
    },
    {
      path: '/privacy',
      element: <PrivacyPage />
    },
    {
      path: '/terms',
      element: <TermsPage />
    },
    {
      path: '/support',
      element: <SupportPage />
    },
    {
      path: '/login',
      element: <AuthLayout />,
      children: [{ index: true, element: <LoginPage /> }]
    },
    {
      path: '/register',
      element: <AuthLayout />,
      children: [{ index: true, element: <RegisterPage /> }]
    },
    {
      element: (
        <ProtectedRoute>
          <RootLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: '/dashboard',
          element: <OverviewPage />
        },
        {
          path: '/modules',
          element: <ModulesListPage />
        },
        {
          path: '/modules/:slug',
          element: <ModuleDetailPage />
        },
        {
          path: '/finance',
          element: (
            <ModuleProtectedRoute>
              <FinanceList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/procurement',
          element: (
            <ModuleProtectedRoute>
              <ProcurementList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/manufacturing',
          element: (
            <ModuleProtectedRoute>
              <ManufacturingList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/inventory',
          element: (
            <ModuleProtectedRoute>
              <InventoryList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/orders',
          element: (
            <ModuleProtectedRoute>
              <OrdersList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/warehouse',
          element: (
            <ModuleProtectedRoute>
              <WarehouseList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/supply-chain',
          element: (
            <ModuleProtectedRoute>
              <SupplyChainDeliveryList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/crm',
          element: (
            <ModuleProtectedRoute>
              <CustomerList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/projects',
          element: (
            <ModuleProtectedRoute>
              <ProjectList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/workforce',
          element: (
            <ModuleProtectedRoute>
              <WorkforceList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/hr',
          element: (
            <ModuleProtectedRoute>
              <EmployeeList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/ecommerce',
          element: (
            <ModuleProtectedRoute>
              <EcommerceProductsList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/marketing',
          element: (
            <ModuleProtectedRoute>
              <CampaignList />
            </ModuleProtectedRoute>
          )
        },
        {
          path: '/internal-tasks',
          element: (
            <ModuleProtectedRoute>
              <InternalTasksPage />
            </ModuleProtectedRoute>
          )
        }
      ]
    }
  ]
);

