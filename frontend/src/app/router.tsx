import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { MemberLayout } from './layouts/MemberLayout'
import { AdminLayout } from './layouts/AdminLayout'
import { RequireAuth } from './guards/RequireAuth'
import { RequireMember } from './guards/RequireMember'
import { RequireRole } from './guards/RequireRole'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { HomePage } from '../features/member/pages/HomePage'
import { StoryDetailPage } from '../features/member/pages/StoryDetailPage'
import { DashboardPage } from '../features/admin/pages/DashboardPage'
import { SettingsPage } from '../features/admin/pages/SettingsPage'
import { StoriesPage } from '../features/admin/pages/StoriesPage'
import { StoryFormPage } from '../features/admin/pages/StoryFormPage'
import { ChaptersPage } from '../features/admin/pages/ChaptersPage'
import { CategoriesPage } from '../features/admin/pages/CategoriesPage'
import { UsersPage } from '../features/admin/pages/UsersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/home" replace />,
  },
  {
    path: '/login',
    element: <AuthLayout />,
    children: [{ index: true, element: <LoginPage /> }],
  },
  {
    path: '/home',
    element: (
      <RequireAuth>
        <RequireMember>
          <MemberLayout />
        </RequireMember>
      </RequireAuth>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: 'read/:slug', element: <StoryDetailPage /> },
    ],
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
      { path: 'stories', element: <StoriesPage /> },
      { path: 'stories/new', element: <StoryFormPage /> },
      { path: 'stories/:id/edit', element: <StoryFormPage /> },
      { path: 'stories/:storyId/chapters', element: <ChaptersPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/home" replace />,
  },
])
