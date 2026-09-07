import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { Login } from '@/pages/Login';

/* ── Lazy-loaded pages — General ────────────────────────────────── */
const Dashboard       = lazy(() => import('@/pages/general/Dashboard').then(m => ({ default: m.Dashboard })));
const SelectForm      = lazy(() => import('@/pages/general/SelectForm').then(m => ({ default: m.SelectForm })));
const NewSubmission   = lazy(() => import('@/pages/general/NewSubmission').then(m => ({ default: m.NewSubmission })));
const EditSubmission  = lazy(() => import('@/pages/general/EditSubmission').then(m => ({ default: m.EditSubmission })));
const SubmissionDetail = lazy(() => import('@/pages/general/SubmissionDetail').then(m => ({ default: m.SubmissionDetail })));

/* ── Lazy-loaded pages — Admin ──────────────────────────────────── */
const ManageQuestions  = lazy(() => import('@/pages/admin/ManageQuestions').then(m => ({ default: m.ManageQuestions })));
const ManageSections   = lazy(() => import('@/pages/admin/ManageSections').then(m => ({ default: m.ManageSections })));
const ManageForms      = lazy(() => import('@/pages/admin/ManageForms').then(m => ({ default: m.ManageForms })));
const FormVersions     = lazy(() => import('@/pages/admin/FormVersions').then(m => ({ default: m.FormVersions })));
const FormBuilder      = lazy(() => import('@/pages/admin/FormBuilder').then(m => ({ default: m.FormBuilder })));
const ManageCategories = lazy(() => import('@/pages/admin/ManageCategories').then(m => ({ default: m.ManageCategories })));

function PageFallback() {
  return <LoadingSpinner size="lg" label="Loading page…" />;
}

function ProtectedRoutes() {
  return (
    <AppShell>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          {/* General */}
          <Route path="/"                                                    element={<Dashboard />} />
          <Route path="/submissions/new"                                     element={<SelectForm />} />
          <Route path="/submissions/new/:formVersionId"                      element={<NewSubmission />} />
          <Route path="/submissions/:submissionId/edit"                      element={<EditSubmission />} />
          <Route path="/submissions/:submissionId"                           element={<SubmissionDetail />} />

          {/* Admin */}
          <Route path="/admin/questions"                                     element={<ManageQuestions />} />
          <Route path="/admin/sections"                                      element={<ManageSections />} />
          <Route path="/admin/forms"                                         element={<ManageForms />} />
          <Route path="/admin/forms/:formId/versions"                        element={<FormVersions />} />
          <Route path="/admin/forms/:formId/versions/:versionId/builder"    element={<FormBuilder />} />
          <Route path="/admin/categories"                                    element={<ManageCategories />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={isAuthenticated ? <ProtectedRoutes /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
