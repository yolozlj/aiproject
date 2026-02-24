import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import MainLayout from '@/components/Layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import ProjectList from '@/pages/Projects/ProjectList';
import ProjectDetail from '@/pages/Projects/ProjectDetail';
import ProjectForm from '@/pages/Projects/ProjectForm';
import MemberList from '@/pages/Members/MemberList';
import MemberForm from '@/pages/Members/MemberForm';
import Settings from '@/pages/Settings';
import SimpleApiTest from '@/pages/SimpleApiTest';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/api-test',
    element: <SimpleApiTest />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'projects',
        children: [
          {
            index: true,
            element: <ProjectList />,
          },
          {
            path: 'new',
            element: <ProjectForm />,
          },
          {
            path: ':id',
            element: <ProjectDetail />,
          },
          {
            path: ':id/edit',
            element: <ProjectForm />,
          },
        ],
      },
      {
        path: 'members',
        children: [
          {
            index: true,
            element: <MemberList />,
          },
          {
            path: 'new',
            element: <MemberForm />,
          },
          {
            path: ':id/edit',
            element: <MemberForm />,
          },
        ],
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
