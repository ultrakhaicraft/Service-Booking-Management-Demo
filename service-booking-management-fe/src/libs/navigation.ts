// src/lib/navigation.ts
export interface NavItem {
  label: string;
  href: string;
}
 
export const ADMIN_HOME_PATH = "/admin/home";
export const CUSTOMER_HOME_PATH = "/customer-home";
 
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: ADMIN_HOME_PATH },
  { label: "Services", href: "/admin/services" },
  { label: "Schedules", href: "/admin/schedules" },
  { label: "Bookings", href: "/admin/bookings" },
];
 
export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: CUSTOMER_HOME_PATH },
  { label: "Services", href: "/services" },
  { label: "Book a service", href: "/booking" },
  { label: "My bookings", href: "/my-bookings" },
];
 