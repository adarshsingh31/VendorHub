/**
 * mockData.js — Temporary mock data for all dashboards.
 * Replace these with real API calls when the backend is ready.
 * Components consume these via props, not hardcoded values.
 */

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
export const adminStats = {
  totalUsers: 1250,
  totalSellers: 120,
  totalProducts: 3450,
  totalOrders: 2890,
  totalRevenue: '₹12.5L',
};

export const adminSellerApplications = [
  { id: 1, name: 'Rahul Electronics', email: 'rahul@example.com', city: 'Lucknow, UP', date: '12 May 2024', status: 'Pending', initials: 'R', color: '#EDE7F6', textColor: '#5E35B1' },
  { id: 2, name: 'Aman Store', email: 'amanstore@example.com', city: 'Kanpur, UP', date: '11 May 2024', status: 'Pending', initials: 'A', color: '#E8F5E9', textColor: '#2E7D32' },
  { id: 3, name: 'Sharma Collection', email: 'sharma@example.com', city: 'Delhi, DL', date: '10 May 2024', status: 'Pending', initials: 'S', color: '#FFEBEE', textColor: '#C62828' },
  { id: 4, name: 'Priya Fashion', email: 'priya@example.com', city: 'Mumbai, MH', date: '10 May 2024', status: 'Pending', initials: 'P', color: '#E3F2FD', textColor: '#1565C0' },
];

export const adminRecentOrders = [
  { id: '#1001', product: 'iPhone 13', icon: 'smartphone', buyer: 'Rahul Kumar', seller: 'Rahul Electronics', amount: '₹35,000', status: 'Delivered', statusColor: '#E8F5E9', statusText: '#2E7D32' },
  { id: '#1002', product: 'Study Table', icon: 'desk', buyer: 'Aman Verma', seller: 'Aman Store', amount: '₹2,499', status: 'Shipped', statusColor: '#E3F2FD', statusText: '#1565C0' },
  { id: '#1003', product: 'HP Laptop', icon: 'laptop_mac', buyer: 'Priya Singh', seller: 'Priya Computers', amount: '₹50,000', status: 'Processing', statusColor: '#FFF8E1', statusText: '#F57F17' },
];

export const adminTopCategories = [
  { name: 'Electronics', icon: 'devices', percent: 36, products: 1250, color: '#5E35B1', bg: '#EDE7F6' },
  { name: 'Fashion', icon: 'checkroom', percent: 28, products: 980, color: '#2E7D32', bg: '#E8F5E9' },
  { name: 'Home & Kitchen', icon: 'kitchen', percent: 21, products: 750, color: '#E65100', bg: '#FFF3E0' },
];

export const adminActivity = [
  { id: 1, text: 'Rahul Electronics application approved', meta: 'by Adarsh Singh', time: '2m ago', icon: 'check_circle', iconBg: '#E8F5E9', iconColor: '#2E7D32' },
  { id: 2, text: 'New seller application from Aman Store', meta: null, time: '10m ago', icon: 'schedule', iconBg: '#FFF8E1', iconColor: '#F57F17' },
  { id: 3, text: 'New product "Samsung S23" added', meta: 'by Priya Computers', time: '25m ago', icon: 'inventory_2', iconBg: '#E3F2FD', iconColor: '#1565C0' },
];

// ─── Seller Dashboard ──────────────────────────────────────────────────────────
export const sellerStats = {
  totalSales: '₹2,45,780',
  totalOrders: 156,
  totalProducts: 42,
  storeViews: '3,560',
  storeRating: 4.7,
  reviewCount: 128,
};

export const sellerEarnings = {
  availableBalance: '₹45,680',
  pendingBalance: '₹12,340',
};

export const sellerRecentOrders = [
  { id: '#ORD1001', buyer: 'Priya Sharma', items: 2, date: '30 May, 2024', status: 'Delivered', statusColor: 'bg-green-100 text-green-800', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAH93UIrYgev9Jcbj9-7lY7Kxiq8ZZLIluXULMWLw8uzW08CGVTJEsdiVjIXAIAyIbvtSjpqXL-DqLAPQf1xaW9z62VeSWIfdoYmrlPAUX1SvdT586-tIJZz3748_kyhMExsUBk9qwUeiGFvtHOwJNKsjZRS-NUOp1HUHiPHql4yNtTfhDQb5am7eEHZ1Lkt_wQq3rlVyzVA2WQrEdMmzqio5V54M5NiTq1FURnA_y_tM0JGzAoxNhFFQ' },
  { id: '#ORD1002', buyer: 'Aman Verma', items: 1, date: '30 May, 2024', status: 'Shipped', statusColor: 'bg-blue-100 text-blue-800', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHbL0-sVUv7uIn9ZbSD8gbwM6Zg7aLC3Rl7XAzT4lSQqN8gMrOK5zMho4CprdttAxTK-cVUXxUAmSuFYMSW8-f3WDLi35ZVddFONdlxuf-x9JUSil1UF1Jy3jBKtpTs2hVHaxamNWkOFGy45ELCXDJer1rVrJyjZit79fMXuclj8vtqipGLExF95t8V8oUtRkEPfY3xwS1Xm-Dc8uHhbpFDsm8L4-Gq2xMzwmc3ytp4Me6xzoejZnFQg' },
  { id: '#ORD1003', buyer: 'Neha Singh', items: 3, date: '29 May, 2024', status: 'Processing', statusColor: 'bg-orange-100 text-orange-800', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdfIoJCYPI85hJoTkpazpintofDke2U0GpWEI6k0ekVMg-JJLKcCbRRinTyPGE-44YLNgzejww1hhQ5kWbxCD5xR1zakzl0iWlreL63qI0e3CezcQHBufCBFiUVuuWeNSL5PxtZSDyxhB_nvqofUnQQmKT9oOlWQLf7KtBPemHBRIxxIPyqlONEuYFQ6AOe16rSUNZQItstAW5q6RAYh7s1n6XBmBOLoSfp-T7CiycxknaOrpM6TLgdg' },
];

export const sellerTopProducts = [
  { name: 'Wireless Earbuds', sold: 120, soldPercent: 80, price: '₹2,499', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe0W9h7PK9y858JEUK1yySImX-CAiQrojW5-ioDlEDWSNu6pfK8NTkXP0fN815oD1Rjb2limidw5pQcCRkZuGVykQKvLC3iwgwLvxvwehnfO7RpCuCjlMyciPaoftBnMntLy1AxXPJSUwrYS9uKV60JXnZB6bVzRvGuo7qcbP-rDVnY1WG7A3HcFSY9HtUwNUd9VRVXL2y-r0T-h6bCN7cEzZ-75-e_k6dsa38jpQI1HhBSeJe-q0oyw' },
  { name: 'Smart Watch', sold: 98, soldPercent: 65, price: '₹2,499', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKHJ7Qa4xAToI1FPSUagpsyxe4MoWXdqKkQSAPcVuFuU1Yhd8iGm5ECMFKLx_yxIk74jVp25Ycx3lm44wVshACRE-HGe_lYuNRl7FGlQN88Iyr3H6OkYJNoIHFeixFpTqg7JzGxdzAro5e55EGXasMumopb1FIwJ7kkh5cNb9PXRh8ix6s3sKiqzjCliy2CaboOIdPZ8Tq9_1fPONT6-WBXZCkihibR_OUhUorH5-QeXDLHw287PiDEg' },
  { name: 'Bluetooth Speaker', sold: 75, soldPercent: 50, price: '₹1,799', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpzcD1MBwJGvioslumez5LrHrLN6p_tmoJC37mLMG2e_dz8iMVHlCInwa1bbt8SWpPCf5SQeEEWtNG4ILn03Yz23AIY_onFmZROddKKnfhI5tRFx5rCL4DwunL96vsaJVQn6V3A6YU1CwDujMKtZZF65Txtmw4l86NUP2Fd-Wk2-dYbsLVDeLLSC-46pR1w_0_5-FvIRb9o__s_CcbC_vsp5J6usSFu70c4qtFNhEsr8RbxvWmO1f3ng' },
];

// ─── Buyer Dashboard ───────────────────────────────────────────────────────────
export const buyerStats = {
  totalOrders: 12,
  wishlistItems: 5,
  cartItems: 3,
  totalSpent: '₹45,230',
  savedAddresses: 2,
};

export const buyerRecentOrders = [
  { id: '#ORD2021', product: 'Wireless Earbuds', seller: 'Rahul Electronics', amount: '₹2,499', date: '30 May, 2024', status: 'Delivered', statusColor: 'bg-green-100 text-green-800' },
  { id: '#ORD2020', product: 'Smart Watch', seller: 'TechBazaar', amount: '₹8,999', date: '25 May, 2024', status: 'Shipped', statusColor: 'bg-blue-100 text-blue-800' },
  { id: '#ORD2019', product: 'Bluetooth Speaker', seller: 'GadgetHub', amount: '₹1,799', date: '20 May, 2024', status: 'Processing', statusColor: 'bg-orange-100 text-orange-800' },
];

export const buyerCategories = [
  { name: 'Electronics', icon: 'devices', count: '1,250+ products', color: '#5E35B1', bg: '#EDE7F6' },
  { name: 'Fashion', icon: 'checkroom', count: '980+ products', color: '#2E7D32', bg: '#E8F5E9' },
  { name: 'Home & Kitchen', icon: 'kitchen', count: '750+ products', color: '#E65100', bg: '#FFF3E0' },
  { name: 'Sports', icon: 'sports_soccer', count: '430+ products', color: '#1565C0', bg: '#E3F2FD' },
];

export const buyerRecommendedProducts = [
  { id: 1, name: 'Wireless Earbuds Pro', price: '₹2,499', originalPrice: '₹3,499', rating: 4.5, reviews: 240, seller: 'Rahul Electronics', badge: 'Top Pick' },
  { id: 2, name: 'Fitness Smart Band', price: '₹1,299', originalPrice: '₹1,999', rating: 4.2, reviews: 185, seller: 'FitZone', badge: 'Sale' },
  { id: 3, name: 'Ceramic Coffee Mug Set', price: '₹649', originalPrice: '₹999', rating: 4.8, reviews: 312, seller: 'HomeStyle', badge: 'Popular' },
  { id: 4, name: 'Running Shoes', price: '₹2,999', originalPrice: '₹4,499', rating: 4.3, reviews: 97, seller: 'SportVille', badge: null },
];
