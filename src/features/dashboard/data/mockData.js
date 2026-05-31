import { BarChart3, Boxes, ShoppingBag, Users, MessageSquare, BadgePercent } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "Products", href: "/products", icon: Boxes },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Reviews", href: "/reviews", icon: MessageSquare },
  { label: "Coupons", href: "/coupons", icon: BadgePercent }
];

export const orders = [
  { id: "#SRT-1001", customer: "Amina", status: "Packed", total: "$280" },
  { id: "#SRT-1002", customer: "James", status: "In transit", total: "$190" },
  { id: "#SRT-1003", customer: "Mia", status: "Awaiting pickup", total: "$140" }
];

export const products = [
  { name: "Lumina Coat", stock: "24 in stock", status: "Live" },
  { name: "Nova Set", stock: "18 in stock", status: "Live" },
  { name: "Orbit Tee", stock: "6 low stock", status: "Alert" }
];
