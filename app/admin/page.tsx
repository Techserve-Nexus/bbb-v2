"use client"

import { useState } from "react"
import AdminLayout from "@/components/admin/admin-layout"
import DashboardOverview from "@/components/admin/dashboard-overview"
import RegistrationsList from "@/components/admin/registrations-list"
import PaymentsManagement from "@/components/admin/payments-management"
import SponsorsManagement from "@/components/admin/sponsors-management"
import SponsorRequestsList from "@/components/admin/sponsor-requests-list"
import VisitorsAnalytics from "@/components/admin/visitors-analytics"
import BannerManagement from "@/components/admin/banner-management"
import AdminSettings from "@/components/admin/admin-settings"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === "dashboard" && <DashboardOverview />}
      {activeTab === "registrations" && <RegistrationsList />}
      {activeTab === "payments" && <PaymentsManagement />}
      {activeTab === "sponsors" && <SponsorsManagement />}
      {activeTab === "sponsor-requests" && <SponsorRequestsList />}
      {activeTab === "visitors" && <VisitorsAnalytics />}
      {activeTab === "banners" && <BannerManagement />}
      {activeTab === "settings" && <AdminSettings />}
    </AdminLayout>
  )
}
