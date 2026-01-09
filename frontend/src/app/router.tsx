import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { MemberLayout } from './layouts/MemberLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { HomePage } from '../features/member/pages/HomePage'
import { DashboardPage } from '../features/admin/pages/DashboardPage'
import { SettingsPage } from '../features/admin/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <MemberLayout />
      </RequireAuth>
    ),
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/admin',
    element: (
      <RequireAuth>
        <RequireRole>
          <AdminLayout />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app" replace />,
  },
])
