import { BarChart3, Boxes, ShoppingBag, Users, MessageSquare, BadgePercent, Layout, Mail, TrendingUp, Settings, Tag, Zap } from "lucide-react";

export const navItems = [
  { label: "Dashboard", href: "/", icon: BarChart3 },
  { label: "Products", href: "/products", icon: Boxes },
  { label: "Categories", href: "/categories", icon: Tag },
  { label: "Orders", href: "/orders", icon: ShoppingBag },
  { label: "Sales", href: "/sales", icon: TrendingUp },
  { label: "Hero Slider", href: "/hero", icon: Layout },
  { label: "Reviews", href: "/reviews", icon: MessageSquare },
  { label: "Flash Sale", href: "/flash-sale", icon: Zap },
  { label: "Coupons", href: "/coupons", icon: BadgePercent },
  { label: "Messages", href: "/messages", icon: Mail },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings }
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
