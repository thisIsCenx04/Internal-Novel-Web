import { createBrowserRouter, Navigate } from 'react-router-dom'

import { RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { AdminLayout } from './layouts/AdminLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { MemberLayout } from './layouts/MemberLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { DashboardPage } from '../features/admin/pages/DashboardPage'
import { HomePage } from '../features/member/pages/HomePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: (
      <RequireAuth>
        <MemberLayout />
      </RequireAuth>
    ),
    children: [
      {
        path: '/app',
        element: <HomePage />,
      },
    ],
  },
  {
    element: (
      <RequireRole role="ADMIN">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      {
        path: '/admin',
        element: <DashboardPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/app" replace />,
  },
])