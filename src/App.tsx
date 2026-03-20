import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RoleProvider } from "@/contexts/RoleContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import EmployeeList from "./pages/EmployeeList";
import EmployeeProfile from "./pages/EmployeeProfile";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import EmployeeSelfService from "./pages/EmployeeSelfService";
import Offboarding from "./pages/Offboarding";
import Reports from "./pages/Reports";
import RolesAccess from "./pages/RolesAccess";
import AssetManagement from "./pages/AssetManagement";
import Payroll from "./pages/Payroll";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <RoleProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/employees" element={<EmployeeList />} />
                <Route path="/employees/:id" element={<EmployeeProfile />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/leave" element={<LeaveManagement />} />
                <Route path="/payroll" element={<Payroll />} />
                <Route path="/ess" element={<EmployeeSelfService />} />
                <Route path="/offboarding" element={<Offboarding />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/roles" element={<RolesAccess />} />
                <Route path="/assets" element={<AssetManagement />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </TooltipProvider>
      </RoleProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
