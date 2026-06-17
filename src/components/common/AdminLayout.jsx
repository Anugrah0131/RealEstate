import React from "react";
import { adminLayoutStyles as s } from "../../assets/dummyStyles";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
    return (
        <div className={s.layout}>
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />
            <div className={s.mainWrapper}>
                <DashboardNavbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className={s.mainContent}>
                    <Outlet />
                </main>

            </div>


        </div>
    )
}

export default AdminLayout;