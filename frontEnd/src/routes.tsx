import { Route } from "react-router";
import type React from "react";
import UnauthorizedPage from "./components/UnAuthorized"
import NotFoundPage from "./components/Maintenance/NotFoundPage"
import Dashboard from "./components/Dashboard"
import TemplateList from "./components/templates/TemplateList";
import CreateTemplate from "./components/templates/createTemplate/CreateTemplate";
import TenderList from "./components/tenders/TenderList";
import CreateTender from "./components/tenders/createTender/createTender";
import PreviewTenderTemplate from "./components/tenders/PreviewTenderTemplate";
import EditTenderTemplate from "./components/tenders/EditTenderTemplate";
import TenderSubmit from "./components/tenders/TenderSubmit";
import VendorForm from "./components/tenders/VendorForm";

type Route = {
  name: string
  path: string
  index?: boolean
  component: React.ComponentType | (() => React.ReactNode)
  exact?: boolean
  children?: Route[]
  isPrivate?: boolean
  roles?: string[]
}

export const Routes = [
  {
    name: 'Dashboard',
    path: '/',
    component: Dashboard
  },
  {
    name: 'Templates',
    path: '/templates',
    component: TemplateList
  },
  {
    name: 'Tenders',
    path: '/tenders',
    component: TenderList
  },
  {
    name: 'Create Template',
    path: '/templates/create-template',
    component: CreateTemplate
  },
  {
    name: 'Edit Template',
    path: '/edit-template/:id',
    component: CreateTemplate
  },
  {
    name: 'Create Tender',
    path: '/tenders/create-tender',
    component: CreateTender
  },
  {
    name: "Preview Tender Template",
    path: '/preview-template/:tempId',
    component: PreviewTenderTemplate
  },
  {
    name: "Edit Tender Template",
    path: '/edit-tender-template/:tempId',
    component: EditTenderTemplate
  },
  {
    name: "Tender Submit",
    path: '/tender-submit',
    component: TenderSubmit
  },
  {
    name: "Vendor Form",
    path: '/vendor-form/:tempId',
    component: VendorForm
  },
  {
    name: "UnAuthorized",
    path: "/unauthorized",
    component: () => <UnauthorizedPage />
  },
  {
    name: 'Not Found',
    path: '/*',
    component: () => <NotFoundPage />

  },
]


export const renderRoutes = (routes: Route[]) => {
  return (
    <>
      {routes.map(({ name, path, component: Component, children }: Route) => {
        return (
          <Route key={name} path={path} element={<Component />}>
            {children && children.length > 0 ? renderRoutes(children) : null}
          </Route>
        )
      })}
    </>
  )
}