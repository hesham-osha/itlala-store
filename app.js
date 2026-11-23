/* إطلالة | ITLALA — واجهة المتجر (SPA)
 * كل القراءات والكتابات عبر دالة Cloudflare Pages واحدة:
 *   POST /api?action=<name>
 *   مع Authorization: Bearer <access_token> عند تسجيل الدخول.
 * الجلسة محفوظة في localStorage (itlala-session)، وسلة الضيف في (itlala-cart).
 * أسماء الأكشنات وحقولها مطابقة لعقد البناء CONTRACT.md §3 حرفيًا.
 * ملاحظة: لو الباك إند لسه مش منشور، صفحات التصفح بتستخدم كتالوجًا احتياطيًا
 * مضمّنًا (نفس بيانات products-seed.json) عشان المتجر يفضل شغال للتصفح،
 * وعمليات الحساب والطلبات بتتطلب الباك إند الحي وتظهر رسالة واضحة لو غايب.
 */
(function () {
"use strict";

/* ---------- الإعدادات ---------- */
var CFG = window.STORE_CONFIG || {};
var API_BASE = "https://pitfrmotksosoimoxcpy.supabase.co/functions/v1/api";
var SESSION_KEY = "itlala-session";
var CART_KEY = "itlala-cart";
var WISH_KEY = "itlala-wishlist";
var LANG_KEY = "itlala-lang";
var VIEWED_KEY = "itlala-viewed";

/* ---------- قاموس الترجمة ---------- */
var STRINGS = {
  ar: {
    nav_home: "الرئيسية", nav_shop: "تسوق الكل", nav_men: "رجالي", nav_women: "حريمي",
    nav_kids: "أطفال", nav_sale: "العروض 🔥", nav_login: "دخول / حساب جديد", nav_logout: "خروج",
    search_btn: "بحث", search_ph: "ابحث عن منتج… مثال: هودي، فستان، جينز",
    shop_title: "تسوّق الكل", cart_title: "سلة التسوق 🛒", checkout_title: "إتمام الشراء",
    login_title: "تسجيل الدخول", register_title: "حساب جديد", forgot_title: "استعادة كلمة السر",
    profile_title: "حسابي", addresses_title: "عناويني", orders_title: "طلباتي",
    track_title: "تتبع الطلب 📦", wishlist_title: "المفضلة ♥",
    about_title: "من نحن", contact_title: "تواصل معنا", faq_title: "الأسئلة الشائعة",
    shipping_title: "سياسة الشحن", returns_title: "سياسة الاسترجاع والاستبدال",
    privacy_title: "سياسة الخصوصية", terms_title: "الشروط والأحكام", admin_title: "لوحة تحكم الأدمن 🛠️",
    f_email: "الإيميل", f_password: "كلمة السر", f_name: "الاسم الكامل", f_phone: "رقم الموبايل (اختياري)",
    login_btn: "دخول", register_btn: "اعمل حساب", forgot_btn: "ابعت رابط الاستعادة",
    loading: "جاري التحميل…", no_results: "مفيش منتجات مطابقة للفلاتر دي — جرّب تغيّر الفلاتر.",
    add_to_cart: "أضف للسلة", buy_now: "اشترِ الآن ♥", added_cart: "اتضاف للسلة ✅",
    added_wish: "اتضاف للمفضلة ♥", removed_wish: "اتشال من المفضلة.",
    choose_size: "اختار المقاس الأول", choose_color: "اختار اللون الأول",
    out_of_stock: "غير متوفر", in_stock: "متوفر", low_stock: "باقي قطع قليلة",
    new_badge: "جديد", sale_badge: "خصم", best_badge: "الأكثر مبيعًا",
    reviews: "تقييم", no_reviews: "لسه مفيش تقييمات للمنتج ده — كن أول من يقيّمه.",
    related: "منتجات مشابهة", viewed: "شاهدت مؤخرًا", size_guide: "دليل المقاسات",
    qty: "الكمية", sku: "كود المنتج", desc: "الوصف", colors: "الألوان", sizes: "المقاسات",
    cart_empty: "سلتك فاضية — روح اتسوق وارجع.", cart_empty_cta: "تسوّق الآن",
    subtotal: "المجموع الفرعي", discount: "الخصم", shipping: "الشحن", total: "الإجمالي",
    free: "مجاني", coupon_ph: "كود الخصم", apply: "تطبيق", coupon_ok: "الكوبون اتطبق ✅",
    coupon_bad: "الكوبون مش صالح أو مش مناسب للطلب ده.", go_checkout: "إتمام الشراء",
    have_coupon: "عندك كود خصم؟", remove_coupon: "إزالة الكوبون", coupon_login: "سجّل دخولك الأول عشان تستخدم كود الخصم",
    continue_shopping: "كمّل تسوق", remove: "حذف", clear_cart: "إفراغ السلة",
    cod: "الدفع عند الاستلام", cod_note: "هتدفع كاش لما طلبك يوصلك. مفيش أي دفع مقدم.",
    customer_info: "بيانات العميل", address_pick: "اختار عنوان أو اكتب عنوان جديد",
    order_summary: "ملخص الطلب", place_order: "أكّد الطلب", placing: "جاري تأكيد طلبك…",
    order_ok: "طلبك اتأكد بنجاح 🎉 — رقم الطلب: ", order_fail: "مقدرناش نأكد الطلب: ",
    need_login: "سجّل دخولك الأول عشان توصل للصفحة دي.",
    admin_only: "الصفحة دي للأدمن بس.", login_needed_order: "سجّل دخولك الأول أو كمّل كضيف.",
    login_ok: "أهلاً بيك تاني! 👋", register_ok: "حسابك اتعمل بنجاح 🎉",
    logout_ok: "خرجت بالسلامة 👋", forgot_ok: "بعتنا رابط الاستعادة على إيميلك ✅ — افتح إيميلك وكمل الخطوات.",
    profile_saved: "بياناتك اتحفظت ✅", address_saved: "العنوان اتحفظ ✅", address_deleted: "العنوان اتحذف.",
    address_default: "اتعيّن كعنوان افتراضي ✅", order_cancelled: "الطلب اتلغى واترجّع المخزون.",
    review_sent: "تقييمك اتبعت وهيظهر بعد موافقة الأدمن ✅",
    newsletter_ok: "اشتركت في النشرة بنجاح 🎉", newsletter_fail: "مقدرناش نسجّل اشتراكك — اتأكد من الإيميل وحاول تاني.",
    contact_ok: "رسالتك وصلتنا ✅ — هنرد عليك في أقرب وقت.",
    config_missing: "لسه الإعدادات ما اتظبطتش — حط رابط Supabase والـ anon key في public/config.js وأعد النشر.",
    err_load: "مقدرناش نحمّل البيانات دلوقتي — اتأكد من الاتصال وحاول تاني.",
    err_backend: "الباك إند لسه مش منشور — العملية دي محتاجة السيرفر الحي. جرّب تاني بعد النشر.",
    err_generic: "حصلت مشكلة، جرّب تاني.", retry: "حاول تاني",
    sort_newest: "الأحدث", sort_price_asc: "السعر: من الأقل للأعلى", sort_price_desc: "السعر: من الأعلى للأقل",
    sort_popular: "الأكثر شعبية", sort_rating: "الأعلى تقييمًا",
    filter_sub: "القسم الفرعي", filter_price: "السعر", filter_color: "اللون", filter_size: "المقاس",
    filter_sale: "العروض بس", filter_all: "الكل", clear_filters: "مسح الفلاتر",
    results_count: "منتج", track_btn: "تتبع الطلب", track_num: "رقم الطلب (مثال: ITL-1001)",
    status_pending: "قيد المراجعة", status_confirmed: "مؤكد", status_shipped: "تم الشحن",
    status_delivered: "تم التوصيل", status_cancelled: "ملغي",
    pay_pending: "الدفع معلّق", pay_paid: "مدفوع",
    view_order: "عرض الطلب", cancel_order: "إلغاء الطلب", confirm_cancel: "متأكد إنك عايز تلغي الطلب ده؟",
    tap_again_cancel: "اضغط مرة تانية للتأكيد",
    write_review: "اكتب تقييمك", review_title_ph: "عنوان التقييم (اختياري)", review_body_ph: "رأيك في المنتج…",
    send_review: "ابعت التقييم", rate: "التقييم (1–5)",
    my_orders_empty: "لسه مفيش طلبات — أول طلب ليك مستنيك.",
    wish_empty: "مفضلتك فاضية — دوس على القلب في أي منتج عشان تحفظه هنا.",
    save: "حفظ", edit: "تعديل", del: "حذف", cancel: "إلغاء", add_new: "إضافة جديد",
    set_default: "تعيين كافتراضي", default_badge: "افتراضي",
    label: "اسم العنوان (مثال: البيت، الشغل)", full_name: "الاسم الكامل", phone: "التليفون",
    city: "المدينة", address_line: "العنوان بالتفصيل", country: "الدولة",
    email: "الإيميل", name: "الاسم",
    admin_seed: "زرع المنتجات الـ48", admin_seed_ok: "المنتجات اتزرعت ✅",
    overview: "نظرة عامة", products: "المنتجات", orders: "الطلبات", customers: "العملاء",
    coupons: "الكوبونات", reviews_m: "المراجعات", settings: "بانرات / إعدادات",
    revenue: "إجمالي الإيرادات", orders_total: "إجمالي الطلبات", orders_pending: "طلبات قيد المراجعة",
    customers_total: "إجمالي العملاء", products_total: "إجمالي المنتجات",
    sales_14: "مبيعات آخر 14 يومًا", best_sellers: "الأكثر مبيعًا", recent_orders: "أحدث الطلبات",
    search_admin: "ابحث برقم الطلب أو اسم العميل…", all_status: "كل الحالات",
    approve: "قبول ✅", reject: "رفض ❌", update_status: "تحديث الحالة",
    coupon_code: "كود الكوبون", coupon_type: "النوع", coupon_value: "القيمة",
    coupon_min: "حد أدنى للطلب (ج.م)", coupon_uses: "أقصى عدد استخدامات", coupon_exp: "تاريخ الانتهاء",
    coupon_active: "فعّال", percent: "نسبة %", fixed: "مبلغ ثابت (ج.م)",
    product_name_ar: "اسم المنتج (عربي)", product_name_en: "اسم المنتج (إنجليزي)",
    product_desc_ar: "الوصف (عربي)", product_desc_en: "الوصف (إنجليزي)",
    product_price: "السعر (ج.م)", product_old_price: "السعر قبل الخصم (ج.م) — اختياري",
    product_images: "روابط الصور (رابط في كل سطر)", product_variants: "المتغيرات (لون عربي، لون إنجليزي، hex، مقاس، مخزون — سطر لكل متغير، مفصولة بفاصلة)",
    product_flags: "جديد", product_best: "الأكثر مبيعًا", product_trend: "ترند", product_feat: "مميز", product_active: "نشط",
    save_product: "حفظ المنتج", new_product: "منتج جديد",
    settings_saved: "الإعدادات اتحفظت ✅", store_name: "اسم المتجر",
    ship_cairo: "رسوم شحن القاهرة/الجيزة (ج.م)", ship_other: "رسوم شحن باقي المحافظات (ج.م)",
    free_ship_at: "حد الشحن المجاني (ج.م)", support_phone: "تليفون الدعم", support_email: "إيميل الدعم",
    announcement: "شريط الإعلان (عربي)", announcement_en: "شريط الإعلان (إنجليزي)",
    guest_checkout_note: "سجّل دخولك الأول عشان تكمل طلبك — حسابك بيحفظ عناوينك وطلباتك وتقدر تتابعها بعد كده.",
    login_first_cart_sync: "تم دمج سلة الضيف مع سلة حسابك ✅",
    select_address: "اختار عنوان", new_address: "عنوان جديد",
    no_address: "لسه مفيش عناوين محفوظة — ضيف عنوان من صفحة عناويني أو اكتب عنوان جديد هنا.",
    items_count: "قطعة", per_item: "للقطعة",
    back_to_shop: "رجوع للتسوق", back_to_orders: "رجوع لطلباتي",
    order_details: "تفاصيل الطلب", order_items: "عناصر الطلب", order_address: "عنوان التوصيل",
    payment_method: "طريقة الدفع", payment_status: "حالة الدفع", order_date: "تاريخ الطلب",
    search_results_for: "نتائج البحث عن", suggestions: "اقتراحات",
    all: "الكل", men: "رجالي", women: "حريمي", kids: "أطفال",
    home_new: "وصل حديثًا", home_best: "الأكثر مبيعًا", home_trend: "ترند الآن", home_sale: "العروض"
  },
  en: {
    nav_home: "Home", nav_shop: "Shop All", nav_men: "Men", nav_women: "Women",
    nav_kids: "Kids", nav_sale: "Sale 🔥", nav_login: "Login / Sign up", nav_logout: "Logout",
    search_btn: "Search", search_ph: "Search products… e.g. hoodie, dress, jeans",
    shop_title: "Shop All", cart_title: "Shopping Cart 🛒", checkout_title: "Checkout",
    login_title: "Login", register_title: "Create Account", forgot_title: "Reset Password",
    profile_title: "My Account", addresses_title: "My Addresses", orders_title: "My Orders",
    track_title: "Track Order 📦", wishlist_title: "Wishlist ♥",
    about_title: "About Us", contact_title: "Contact Us", faq_title: "FAQ",
    shipping_title: "Shipping Policy", returns_title: "Returns & Refunds",
    privacy_title: "Privacy Policy", terms_title: "Terms & Conditions", admin_title: "Admin Dashboard 🛠️",
    f_email: "Email", f_password: "Password", f_name: "Full Name", f_phone: "Mobile (optional)",
    login_btn: "Login", register_btn: "Create Account", forgot_btn: "Send Reset Link",
    loading: "Loading…", no_results: "No products match these filters — try changing them.",
    add_to_cart: "Add to Cart", buy_now: "Buy Now ♥", added_cart: "Added to cart ✅",
    added_wish: "Added to wishlist ♥", removed_wish: "Removed from wishlist.",
    choose_size: "Please choose a size first", choose_color: "Please choose a color first",
    out_of_stock: "Out of stock", in_stock: "In stock", low_stock: "Only a few left",
    new_badge: "New", sale_badge: "Sale", best_badge: "Best Seller",
    reviews: "reviews", no_reviews: "No reviews yet — be the first to review it.",
    related: "Related Products", viewed: "Recently Viewed", size_guide: "Size Guide",
    qty: "Quantity", sku: "SKU", desc: "Description", colors: "Colors", sizes: "Sizes",
    cart_empty: "Your cart is empty — go shopping and come back.", cart_empty_cta: "Shop Now",
    subtotal: "Subtotal", discount: "Discount", shipping: "Shipping", total: "Total",
    free: "Free", coupon_ph: "Coupon code", apply: "Apply", coupon_ok: "Coupon applied ✅",
    coupon_bad: "This coupon is invalid or doesn't apply to this order.", go_checkout: "Checkout",
    have_coupon: "Have a discount code?", remove_coupon: "Remove coupon", coupon_login: "Please log in first to use a discount code",
    continue_shopping: "Continue Shopping", remove: "Remove", clear_cart: "Clear Cart",
    cod: "Cash on Delivery", cod_note: "You pay in cash when your order arrives. No advance payment.",
    customer_info: "Customer Info", address_pick: "Choose an address or add a new one",
    order_summary: "Order Summary", place_order: "Confirm Order", placing: "Confirming your order…",
    order_ok: "Your order is confirmed 🎉 — Order number: ", order_fail: "Couldn't confirm the order: ",
    need_login: "Please login first to open this page.",
    admin_only: "This page is for admins only.", login_needed_order: "Login first or continue as guest.",
    login_ok: "Welcome back! 👋", register_ok: "Your account was created 🎉",
    logout_ok: "Logged out, see you soon 👋", forgot_ok: "We sent a reset link to your email ✅ — check your inbox.",
    profile_saved: "Your info was saved ✅", address_saved: "Address saved ✅", address_deleted: "Address deleted.",
    address_default: "Set as default ✅", order_cancelled: "Order cancelled and stock restored.",
    review_sent: "Your review was sent and will appear after admin approval ✅",
    newsletter_ok: "Subscribed to the newsletter 🎉", newsletter_fail: "Couldn't subscribe — check your email and try again.",
    contact_ok: "Your message reached us ✅ — we'll reply soon.",
    config_missing: "Setup isn't finished yet — set the Supabase URL and anon key in public/config.js and redeploy.",
    err_load: "Couldn't load the data right now — check your connection and try again.",
    err_backend: "The backend isn't deployed yet — this needs the live server. Try again after deployment.",
    err_generic: "Something went wrong, please try again.", retry: "Try Again",
    sort_newest: "Newest", sort_price_asc: "Price: Low to High", sort_price_desc: "Price: High to Low",
    sort_popular: "Most Popular", sort_rating: "Top Rated",
    filter_sub: "Subcategory", filter_price: "Price", filter_color: "Color", filter_size: "Size",
    filter_sale: "Sale only", filter_all: "All", clear_filters: "Clear Filters",
    results_count: "products", track_btn: "Track Order", track_num: "Order number (e.g. ITL-1001)",
    status_pending: "Pending", status_confirmed: "Confirmed", status_shipped: "Shipped",
    status_delivered: "Delivered", status_cancelled: "Cancelled",
    pay_pending: "Payment pending", pay_paid: "Paid",
    view_order: "View Order", cancel_order: "Cancel Order", confirm_cancel: "Are you sure you want to cancel this order?",
    tap_again_cancel: "Tap again to confirm",
    write_review: "Write a Review", review_title_ph: "Review title (optional)", review_body_ph: "Your opinion about the product…",
    send_review: "Send Review", rate: "Rating (1–5)",
    my_orders_empty: "No orders yet — your first order is waiting.",
    wish_empty: "Your wishlist is empty — tap the heart on any product to save it here.",
    save: "Save", edit: "Edit", del: "Delete", cancel: "Cancel", add_new: "Add New",
    set_default: "Set as Default", default_badge: "Default",
    label: "Address Label (e.g. Home, Work)", full_name: "Full Name", phone: "Phone",
    city: "City", address_line: "Full Address", country: "Country",
    email: "Email", name: "Name",
    admin_seed: "Seed the 48 Products", admin_seed_ok: "Products seeded ✅",
    overview: "Overview", products: "Products", orders: "Orders", customers: "Customers",
    coupons: "Coupons", reviews_m: "Reviews", settings: "Banners / Settings",
    revenue: "Total Revenue", orders_total: "Total Orders", orders_pending: "Pending Orders",
    customers_total: "Total Customers", products_total: "Total Products",
    sales_14: "Sales — Last 14 Days", best_sellers: "Best Sellers", recent_orders: "Recent Orders",
    search_admin: "Search by order number or customer name…", all_status: "All Statuses",
    approve: "Approve ✅", reject: "Reject ❌", update_status: "Update Status",
    coupon_code: "Coupon Code", coupon_type: "Type", coupon_value: "Value",
    coupon_min: "Min. Order (EGP)", coupon_uses: "Max Uses", coupon_exp: "Expiry Date",
    coupon_active: "Active", percent: "Percent %", fixed: "Fixed Amount (EGP)",
    product_name_ar: "Product Name (Arabic)", product_name_en: "Product Name (English)",
    product_desc_ar: "Description (Arabic)", product_desc_en: "Description (English)",
    product_price: "Price (EGP)", product_old_price: "Price Before Discount (EGP) — optional",
    product_images: "Image URLs (one per line)", product_variants: "Variants (Arabic color, English color, hex, size, stock — one per line, comma separated)",
    product_flags: "New", product_best: "Best Seller", product_trend: "Trending", product_feat: "Featured", product_active: "Active",
    save_product: "Save Product", new_product: "New Product",
    settings_saved: "Settings saved ✅", store_name: "Store Name",
    ship_cairo: "Cairo/Giza Shipping Fee (EGP)", ship_other: "Other Governorates Shipping Fee (EGP)",
    free_ship_at: "Free Shipping Threshold (EGP)", support_phone: "Support Phone", support_email: "Support Email",
    announcement: "Announcement Bar (Arabic)", announcement_en: "Announcement Bar (English)",
    guest_checkout_note: "Please log in first to place your order — your account saves your addresses and orders so you can track them.",
    login_first_cart_sync: "Guest cart merged with your account cart ✅",
    select_address: "Choose Address", new_address: "New Address",
    no_address: "No saved addresses yet — add one from My Addresses or write a new address here.",
    items_count: "items", per_item: "per item",
    back_to_shop: "Back to Shopping", back_to_orders: "Back to My Orders",
    order_details: "Order Details", order_items: "Order Items", order_address: "Delivery Address",
    payment_method: "Payment Method", payment_status: "Payment Status", order_date: "Order Date",
    search_results_for: "Search results for", suggestions: "Suggestions",
    all: "All", men: "Men", women: "Women", kids: "Kids",
    home_new: "New Arrivals", home_best: "Best Sellers", home_trend: "Trending Now", home_sale: "Sale"
  }
};

/* ---------- الأقسام الفرعية ---------- */
var SUBCATS = {
  men: [
    ["t-shirts", "تيشيرتات", "T-Shirts"], ["shirts", "قمصان", "Shirts"], ["polo", "بولو", "Polo Shirts"],
    ["hoodies", "هوديز", "Hoodies"], ["sweatshirts", "سويت شيرت", "Sweatshirts"],
    ["jackets", "جواكيت", "Jackets"], ["jeans", "جينز", "Jeans"], ["trousers", "بناطيل", "Trousers"],
    ["shorts", "شورتات", "Shorts"], ["sportswear", "ملابس رياضية", "Sportswear"],
    ["shoes", "أحذية", "Shoes"], ["accessories", "إكسسوارات", "Accessories"]
  ],
  women: [
    ["dresses", "فساتين", "Dresses"], ["tops", "توبات", "Tops"], ["t-shirts", "تيشيرتات", "T-Shirts"],
    ["blouses", "بلوزات", "Blouses"], ["jeans", "جينز", "Jeans"], ["trousers", "بناطيل", "Trousers"],
    ["skirts", "تنانير", "Skirts"], ["jackets", "جواكيت", "Jackets"], ["hoodies", "هوديز", "Hoodies"],
    ["sportswear", "ملابس رياضية", "Sportswear"], ["shoes", "أحذية", "Shoes"],
    ["bags", "حقائب", "Bags"], ["accessories", "إكسسوارات", "Accessories"]
  ],
  kids: [
    ["boys", "ملابس أولاد", "Boys' Clothing"], ["girls", "ملابس بنات", "Girls' Clothing"],
    ["baby", "ملابس بيبي", "Baby Clothing"], ["shoes", "أحذية أطفال", "Kids' Shoes"],
    ["accessories", "إكسسوارات أطفال", "Kids' Accessories"]
  ]
};
var GENDER_LABEL = { men: ["رجالي", "Men"], women: ["حريمي", "Women"], kids: ["أطفال", "Kids"] };

function subcatLabel(gender, slug) {
  var list = SUBCATS[gender] || [];
  for (var i = 0; i < list.length; i++) if (list[i][0] === slug) return state.lang === "ar" ? list[i][1] : list[i][2];
  return slug;
}

/* ---------- حالة التطبيق ---------- */
var state = {
  lang: "ar",
  user: null,      // {id,name,email,phone,role}
  session: null,   // {access_token, refresh_token}
  settings: null,  // من get-settings-public
  categories: [],
  cart: [],        // {product_id, variant_id, color_name_ar, color_name_en, size, qty, name_ar, name_en, price_egp, image, sku}
  wishlist: [],    // [product_id]
  coupon: null,    // {code, type, value, discount_egp}
  adminTab: "overview",
  adminProducts: [],
  adminOrders: [],
  adminCustomers: [],
  adminCoupons: [],
  adminReviews: [],
  lastOrder: null
};
try { state.lang = localStorage.getItem(LANG_KEY) || "ar"; } catch (e) {}
try { state.cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { state.cart = []; }
try { state.wishlist = JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); } catch (e) { state.wishlist = []; }
try { state.session = JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { state.session = null; }
var COUPON_KEY = "itlala-coupon";
try { var _sc = JSON.parse(localStorage.getItem(COUPON_KEY) || "null"); state.coupon = (_sc && _sc.code && typeof _sc.discount_egp === "number") ? _sc : null; } catch (e) { state.coupon = null; }

/* ---------- أدوات مساعدة ---------- */
function $(id) { return document.getElementById(id); }
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function t(k) { var d = STRINGS[state.lang] || STRINGS.ar; return d[k] != null ? d[k] : (STRINGS.ar[k] || k); }
function L(ar, en) { return state.lang === "ar" ? ar : en; }
function pname(p) { return L(p.name_ar, p.name_en) || p.name_ar || p.name_en || ""; }
function pdesc(p) { return L(p.description_ar, p.description_en) || p.description_ar || p.description_en || ""; }
function cname(c) { return c ? L(c.name_ar, c.name_en) : ""; }
function fmtPrice(n) {
  var v = Number(n || 0);
  var s = (Number.isInteger(v) ? v.toLocaleString("en-US") : v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  return state.lang === "ar" ? s + " ج.م" : "EGP " + s;
}
function fmtDate(iso) {
  if (!iso) return "";
  try { return new Date(iso).toLocaleString(state.lang === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short" }); }
  catch (e) { return String(iso); }
}
function toast(msg) {
  var el = $("toast");
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(el._timer);
  el._timer = setTimeout(function () { el.hidden = true; }, 4000);
}
function setMsg(el, text, kind) {
  if (!el) return;
  el.textContent = text || "";
  el.className = "form-msg" + (kind ? " " + kind : "");
}
function storeLocal(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function discountPct(p) {
  if (p.discount_pct != null) return Number(p.discount_pct);
  if (p.original_price_egp && p.price_egp < p.original_price_egp)
    return Math.round((1 - p.price_egp / p.original_price_egp) * 100);
  return 0;
}
function prodImages(p) {
  if (Array.isArray(p.images) && p.images.length) return p.images.map(function (im) { return typeof im === "string" ? im : im.url; });
  if (p.image) return [p.image];
  return [];
}
function prodStock(p) {
  if (p.stock_total != null) return Number(p.stock_total);
  var per = Number(p.stock_per_variant || 0);
  var n = (p.colors ? p.colors.length : 1) * (p.sizes ? p.sizes.length : 1);
  return per * n;
}
function prodColors(p) { return p.colors || []; }
function prodSizes(p) { return p.sizes || []; }
function stars(r) {
  var v = Number(r || 0), out = "";
  for (var i = 1; i <= 5; i++) out += i <= Math.round(v) ? "★" : "☆";
  return out;
}

/* ---------- الكتالوج الاحتياطي (نفس products-seed.json — يُستخدم فقط لو الباك إند غايب) ---------- */
var FALLBACK_PRODUCTS = [{"id":1,"sku":"ITL-M-TSH-001","name_ar":"تيشيرت قطن كلاسيك","name_en":"Classic Cotton T-Shirt","description_ar":"تيشيرت قطن 100% بملمس ناعم وقصّة مريحة تناسب الاستخدام اليومي. خامة ثابتة اللون لا تتأثر بالغسيل المتكرر.","description_en":"A 100% cotton T-shirt with a soft feel and a comfortable regular fit for everyday wear. Colorfast fabric that holds up wash after wash.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"t-shirts","price_egp":349,"original_price_egp":499,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":12,"images":["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":37},{"id":2,"sku":"ITL-M-TSH-002","name_ar":"تيشيرت أوفرسايز بطبعة جرافيك","name_en":"Oversized Graphic Print T-Shirt","description_ar":"تيشيرت أوفرسايز بقصّة عصرية وطبعة جرافيك مميزة تمنحك إطلالة شبابية جريئة. قطن ثقيل مريح يدوم طويلًا.","description_en":"An oversized T-shirt with a trendy cut and a bold graphic print for a fresh street look. Heavyweight cotton that stays comfortable all day.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"t-shirts","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["S","M","L","XL"],"stock_per_variant":15,"images":["https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":128},{"id":3,"sku":"ITL-M-SHR-001","name_ar":"قميص أكسفورد كلاسيك","name_en":"Classic Oxford Shirt","description_ar":"قميص أكسفورد أنيق بخامة قطنية متينة وقصّة كلاسيكية تناسب العمل والمناسبات. ياقة عملية وأزرار مخفية لمظهر مرتب طوال اليوم.","description_en":"A smart Oxford shirt in durable cotton with a classic fit for work and occasions. A neat collar and quality buttons keep you looking sharp all day.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"shirts","price_egp":649,"original_price_egp":849,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"أزرق فاتح","name_en":"Light Blue","hex":"#93C5FD"}],"sizes":["M","L","XL","XXL"],"stock_per_variant":10,"images":["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.6,"rating_count":84},{"id":4,"sku":"ITL-M-SHR-002","name_ar":"قميص كتان صيفي","name_en":"Summer Linen Shirt","description_ar":"قميص كتان خفيف يسمح بمرور الهواء، مثالي لأيام الصيف الحارة. قصّة مريحة بأكمام قابلة للطي لإطلالة كاجوال أنيقة.","description_en":"A lightweight linen shirt that breathes beautifully, perfect for hot summer days. A relaxed fit with roll-up sleeves for an effortless casual look.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"shirts","price_egp":599,"original_price_egp":null,"colors":[{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["S","M","L","XL"],"stock_per_variant":8,"images":["https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.4,"rating_count":52},{"id":5,"sku":"ITL-M-POL-001","name_ar":"بولو قطن بيكيه","name_en":"Cotton Piqué Polo Shirt","description_ar":"بولو كلاسيك من قطن البيكيه الناعم بياقة محبوكة وأزرار أنيقة. خيار مثالي يجمع بين الكاجوال والرسمي في إطلالة واحدة.","description_en":"A classic polo in soft piqué cotton with a knitted collar and neat buttons. The perfect middle ground between casual and smart in one piece.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"polo","price_egp":449,"original_price_egp":599,"colors":[{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":14,"images":["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.3,"rating_count":61},{"id":6,"sku":"ITL-M-HOD-001","name_ar":"هودي قطن مبطّن","name_en":"Fleece-Lined Cotton Hoodie","description_ar":"هودي قطن مبطّن من الداخل يمنحك دفئًا وراحة استثنائية في الشتاء. جيب كانجارو وغطاء رأس بسحاب قابل للتعديل.","description_en":"A fleece-lined cotton hoodie that keeps you warm and cozy all winter. Kangaroo pocket and an adjustable drawstring hood for extra comfort.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"hoodies","price_egp":799,"original_price_egp":1099,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"},{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":18,"images":["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":true,"is_trending":true,"is_featured":false,"rating_avg":4.8,"rating_count":203},{"id":7,"sku":"ITL-M-SWT-001","name_ar":"سويت شيرت قطن","name_en":"Cotton Sweatshirt","description_ar":"سويت شيرت قطن ناعم بقصّة مريحة وأساور محبوكة تحافظ على شكلها. قطعة أساسية لكل يوم تتناسب مع الجينز والشورت.","description_en":"A soft cotton sweatshirt with a relaxed fit and ribbed cuffs that keep their shape. An everyday essential that pairs with jeans or shorts.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"sweatshirts","price_egp":649,"original_price_egp":null,"colors":[{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["M","L","XL","XXL"],"stock_per_variant":9,"images":["https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1618354691438-25bc04584c23?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.2,"rating_count":45},{"id":8,"sku":"ITL-M-JKT-001","name_ar":"جاكيت جلد طبيعي","name_en":"Genuine Leather Jacket","description_ar":"جاكيت جلد طبيعي فاخر بتصميم كلاسيكي خالد يزداد جمالًا مع الوقت. بطانة داخلية ناعمة وسحّابات معدنية متينة.","description_en":"A premium genuine leather jacket with a timeless design that only gets better with age. Soft inner lining and sturdy metal zippers.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"jackets","price_egp":1899,"original_price_egp":2499,"colors":[{"name_ar":"بني","name_en":"Brown","hex":"#7C4A2D"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["M","L","XL","XXL"],"stock_per_variant":6,"images":["https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":true,"rating_avg":4.9,"rating_count":156},{"id":9,"sku":"ITL-M-JKT-002","name_ar":"جاكيت جينز كلاسيك","name_en":"Classic Denim Jacket","description_ar":"جاكيت جينز كلاسيك بقصّة مريحة ولون ثابت، قطعة خالدة لا تخرج من الموضة أبدًا. أزرار معدنية وجيوب عملية أمامية.","description_en":"A classic denim jacket with a comfortable fit and lasting color — a timeless piece that never goes out of style. Metal buttons and handy front pockets.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"jackets","price_egp":999,"original_price_egp":null,"colors":[{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"},{"name_ar":"أزرق فاتح","name_en":"Light Blue","hex":"#93C5FD"}],"sizes":["S","M","L","XL"],"stock_per_variant":11,"images":["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1548126032-079a0fb0099d?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":73},{"id":10,"sku":"ITL-M-JNS-001","name_ar":"جينز سليم فيت","name_en":"Slim Fit Jeans","description_ar":"جينز سليم فيت بخامة دنيم مرنة تتحرك معك براحة طوال اليوم. قصّة عصرية تناسب كل الإطلالات من الكاجوال إلى شبه الرسمي.","description_en":"Slim-fit jeans in stretch denim that moves with you comfortably all day. A modern cut that works from casual Fridays to smart evenings out.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"jeans","price_egp":999,"original_price_egp":1299,"colors":[{"name_ar":"أزرق داكن","name_en":"Dark Blue","hex":"#1E40AF"},{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":16,"images":["https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.6,"rating_count":187},{"id":11,"sku":"ITL-M-JNS-002","name_ar":"جينز سكيني","name_en":"Skinny Jeans","description_ar":"جينز سكيني بخامة مرنة عالية الجودة تمنحك مظهرًا عصريًا أنيقًا. خصر متوسط الارتفاع وثبات ممتاز بعد الغسيل.","description_en":"Skinny jeans in premium stretch fabric for a sleek modern look. A mid-rise waist and excellent shape retention after every wash.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"jeans","price_egp":899,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"أزرق داكن","name_en":"Dark Blue","hex":"#1E40AF"}],"sizes":["S","M","L","XL"],"stock_per_variant":13,"images":["https://images.unsplash.com/photo-1584865288642-42078afe6942?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.4,"rating_count":96},{"id":12,"sku":"ITL-M-TRS-001","name_ar":"بنطلون قماش كلاسيك","name_en":"Classic Chino Trousers","description_ar":"بنطلون قماش كلاسيك بخامة قطنية متينة وقصّة مستقيمة أنيقة. مثالي للعمل والمناسبات مع قميص أو بولو.","description_en":"Classic chino trousers in durable cotton with a smart straight cut. Perfect for the office or occasions, paired with a shirt or polo.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"trousers","price_egp":749,"original_price_egp":null,"colors":[{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":10,"images":["https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.5,"rating_count":68},{"id":13,"sku":"ITL-M-SHT-001","name_ar":"شورت قطن صيفي","name_en":"Summer Cotton Shorts","description_ar":"شورت قطن خفيف ومريح مع حزام مطاطي وجيوب جانبية عملية. رفيقك المثالي للصيف والمصيف والأنشطة اليومية.","description_en":"Lightweight, comfy cotton shorts with an elastic waistband and handy side pockets. Your go-to companion for summer days, the beach, and everyday outings.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"shorts","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"}],"sizes":["S","M","L","XL"],"stock_per_variant":0,"images":["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1565084888279-aca607ecce0c?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.1,"rating_count":29},{"id":14,"sku":"ITL-M-SPR-001","name_ar":"طقم رياضي","name_en":"Athletic Tracksuit Set","description_ar":"طقم رياضي كامل من خامة مرنة تمتص العرق وتمنحك حرية حركة كاملة أثناء التمرين. جاكيت وسروال بقصّة عصرية مريحة.","description_en":"A full athletic tracksuit in moisture-wicking stretch fabric for total freedom of movement. A modern-fit jacket and pants built for training.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"sportswear","price_egp":899,"original_price_egp":1199,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"}],"sizes":["S","M","L","XL","XXL"],"stock_per_variant":7,"images":["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.3,"rating_count":54},{"id":15,"sku":"ITL-M-SHO-001","name_ar":"حذاء رياضي راننج","name_en":"Running Sneakers","description_ar":"حذاء رياضي خفيف بنعل مرن يمتص الصدمات ويدعم قدمك في كل خطوة. تصميم عصري بتهوية ممتازة للجري والاستخدام اليومي.","description_en":"Lightweight running sneakers with a cushioned shock-absorbing sole that supports every step. A breathable modern design for running and daily wear.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"shoes","price_egp":1599,"original_price_egp":1999,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"أحمر","name_en":"Red","hex":"#B91C1C"}],"sizes":["40","41","42","43","44","45"],"stock_per_variant":12,"images":["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":true,"rating_avg":4.8,"rating_count":221},{"id":16,"sku":"ITL-M-ACC-001","name_ar":"ساعة جلد كلاسيك","name_en":"Classic Leather Watch","description_ar":"ساعة كلاسيكية أنيقة بحزام جلد طبيعي وميناء بسيط راقٍ. مقاومة لرذاذ الماء وحركة دقيقة موثوقة تدوم معك لسنوات.","description_en":"An elegant classic watch with a genuine leather strap and a refined minimalist dial. Splash-resistant with a reliable precise movement built to last.","brand":"إطلالة","gender":"men","category_slug":"men","subcategory":"accessories","price_egp":1299,"original_price_egp":null,"colors":[{"name_ar":"بني","name_en":"Brown","hex":"#7C4A2D"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["one-size"],"stock_per_variant":5,"images":["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":112},{"id":17,"sku":"ITL-W-DRS-001","name_ar":"فستان صيفي مزهّر","name_en":"Floral Summer Dress","description_ar":"فستان صيفي مزهّر بخامة خفيفة منسدلة وقصّة أنثوية مريحة. مثالي للنزهات والمصيف مع لمسة رومانسية منعشة.","description_en":"A breezy floral summer dress in a light flowing fabric with a flattering feminine cut. Perfect for outings and beach days with a fresh romantic touch.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"dresses","price_egp":1199,"original_price_egp":1599,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"أصفر","name_en":"Yellow","hex":"#FACC15"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":14,"images":["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":true,"is_trending":false,"is_featured":true,"rating_avg":4.9,"rating_count":187},{"id":18,"sku":"ITL-W-DRS-002","name_ar":"فستان سهرة أنيق","name_en":"Elegant Evening Dress","description_ar":"فستان سهرة فاخر بقصّة انسيابية أنيقة وتفاصيل راقية تليق بالمناسبات الخاصة. خامة فاخرة تمنحك حضورًا لا يُنسى.","description_en":"A luxurious evening dress with a graceful flowing silhouette and refined details made for special occasions. Premium fabric for an unforgettable presence.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"dresses","price_egp":1899,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"عنابي","name_en":"Burgundy","hex":"#7F1D1D"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":6,"images":["https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":true,"rating_avg":4.8,"rating_count":94},{"id":19,"sku":"ITL-W-DRS-003","name_ar":"فستان قطن كاجوال","name_en":"Casual Cotton Dress","description_ar":"فستان قطن كاجوال مريح بقصّة عملية تناسب يومك بالكامل. خامة ناعمة تسمح بمرور الهواء وجيوب جانبية عملية.","description_en":"A comfy casual cotton dress with an easy everyday cut. Breathable soft fabric with practical side pockets for all-day comfort.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"dresses","price_egp":999,"original_price_egp":1299,"colors":[{"name_ar":"أخضر","name_en":"Green","hex":"#166534"},{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"}],"sizes":["S","M","L","XL"],"stock_per_variant":11,"images":["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.4,"rating_count":63},{"id":20,"sku":"ITL-W-TOP-001","name_ar":"توب قطن بيسك","name_en":"Basic Cotton Top","description_ar":"توب قطن بيسك ناعم بقصّة مريحة وألوان أساسية تتناسب مع كل شيء في دولابك. خامة قطنية ثابتة لا تتكسر ولا تبهت.","description_en":"A soft basic cotton top in a comfy fit and essential colors that go with everything in your wardrobe. Durable cotton that keeps its shape and color.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"tops","price_egp":349,"original_price_egp":null,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":20,"images":["https://images.unsplash.com/photo-1554568218-0f1715e72254?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.3,"rating_count":41},{"id":21,"sku":"ITL-W-TSH-001","name_ar":"تيشيرت أوفرسايز حريمي","name_en":"Women's Oversized T-Shirt","description_ar":"تيشيرت أوفرسايز حريمي بقصّة واسعة مريحة وستايل عصري شبابي. قطن ناعم بملمس حريري يناسب إطلالات الكاجوال اليومية.","description_en":"A women's oversized T-shirt with a relaxed wide cut and a trendy youthful vibe. Silky-soft cotton for effortless everyday casual looks.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"t-shirts","price_egp":399,"original_price_egp":549,"colors":[{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["S","M","L","XL"],"stock_per_variant":15,"images":["https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.5,"rating_count":77},{"id":22,"sku":"ITL-W-BLS-001","name_ar":"بلوزة شيفون أنيقة","name_en":"Elegant Chiffon Blouse","description_ar":"بلوزة شيفون خفيفة وأنيقة بتصميم راقٍ يناسب العمل والمناسبات. قماش منسدل يمنحك إطلالة ناعمة وراقية في كل مرة.","description_en":"A light, elegant chiffon blouse with a refined design for work and occasions. Flowing fabric for a soft, polished look every time.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"blouses","price_egp":649,"original_price_egp":849,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"وردي فاتح","name_en":"Light Pink","hex":"#FBCFE8"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":9,"images":["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.6,"rating_count":108},{"id":23,"sku":"ITL-W-BLS-002","name_ar":"بلوزة ساتان","name_en":"Satin Blouse","description_ar":"بلوزة ساتان بلمعة ناعمة فاخرة وقصّة أنيقة تليق بالسهرات والمناسبات. خامة انسيابية مريحة على الجسم طوال اليوم.","description_en":"A satin blouse with a soft luxurious sheen and an elegant cut made for evenings and occasions. Smooth, flowing fabric that feels great all day.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"blouses","price_egp":749,"original_price_egp":null,"colors":[{"name_ar":"ذهبي","name_en":"Gold","hex":"#D4AF37"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["S","M","L","XL"],"stock_per_variant":8,"images":["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":59},{"id":24,"sku":"ITL-W-JNS-001","name_ar":"جينز حريمي سكيني","name_en":"Women's Skinny Jeans","description_ar":"جينز حريمي سكيني بخامة دنيم مرنة تبرز القوام براحة تامة. خصر عالٍ مريح وثبات ممتاز في الشكل واللون.","description_en":"Women's skinny jeans in stretch denim that flatters your figure in total comfort. A comfy high waist with lasting shape and color.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"jeans","price_egp":949,"original_price_egp":1249,"colors":[{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"},{"name_ar":"أزرق داكن","name_en":"Dark Blue","hex":"#1E40AF"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":13,"images":["https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":132},{"id":25,"sku":"ITL-W-TRS-001","name_ar":"بنطلون واسع الأرجل","name_en":"Wide-Leg Trousers","description_ar":"بنطلون واسع الأرجل بقصّة عصرية مريحة وخامة انسيابية أنيقة. خيار مثالي لإطلالة راقية مع بلوزة أو توب بسيط.","description_en":"Wide-leg trousers with a trendy relaxed cut and elegant flowing fabric. The perfect choice for a polished look with a blouse or a simple top.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"trousers","price_egp":799,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"}],"sizes":["S","M","L","XL"],"stock_per_variant":10,"images":["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.4,"rating_count":48},{"id":26,"sku":"ITL-W-SKR-001","name_ar":"تنورة ميدي بليسيه","name_en":"Pleated Midi Skirt","description_ar":"تنورة ميدي بليسيه أنيقة بحركة انسيابية جميلة وخامة مريحة. تمنحك إطلالة أنثوية راقية تناسب العمل والخروجات.","description_en":"An elegant pleated midi skirt with a beautiful flowing movement and comfy fabric. A feminine, polished look for work and outings alike.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"skirts","price_egp":699,"original_price_egp":899,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":12,"images":["https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.6,"rating_count":71},{"id":27,"sku":"ITL-W-JKT-001","name_ar":"جاكيت جينز حريمي","name_en":"Women's Denim Jacket","description_ar":"جاكيت جينز حريمي كلاسيك بقصّة مريحة تناسب كل الفصول. قطعة أساسية تكمّل أي إطلالة كاجوال بلمسة عصرية.","description_en":"A classic women's denim jacket with a comfy fit for every season. A wardrobe essential that completes any casual outfit with a modern touch.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"jackets","price_egp":1099,"original_price_egp":null,"colors":[{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":7,"images":["https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":66},{"id":28,"sku":"ITL-W-HOD-001","name_ar":"هودي أوفرسايز حريمي","name_en":"Women's Oversized Hoodie","description_ar":"هودي أوفرسايز حريمي قطن مبطّن بقصّة واسعة مريحة وستايل عصري. دفء وراحة مع جيب كانجارو وغطاء رأس ناعم.","description_en":"A women's oversized fleece-lined cotton hoodie with a relaxed wide cut and a trendy look. Warmth and comfort with a kangaroo pocket and soft hood.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"hoodies","price_egp":749,"original_price_egp":null,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"},{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"}],"sizes":["S","M","L","XL"],"stock_per_variant":16,"images":["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.6,"rating_count":119},{"id":29,"sku":"ITL-W-SPR-001","name_ar":"طقم رياضي حريمي","name_en":"Women's Athletic Set","description_ar":"طقم رياضي حريمي من خامة مرنة تمتص العرق وتدعمك أثناء التمرين. توب وليقنز بقصّة مريحة وتصميم رياضي أنيق.","description_en":"A women's athletic set in sweat-wicking stretch fabric that supports you through every workout. A comfy top and leggings with a sporty, elegant design.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"sportswear","price_egp":849,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"}],"sizes":["XS","S","M","L","XL"],"stock_per_variant":9,"images":["https://images.unsplash.com/photo-1550345332-09e3ac987658?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1583744946564-b52ac1c389c8?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.3,"rating_count":57},{"id":30,"sku":"ITL-W-SHO-001","name_ar":"حذاء رياضي أبيض","name_en":"White Sneakers","description_ar":"حذاء رياضي أبيض كلاسيك بنعل مريح وخامة جلد ناعمة. قطعة أساسية تتناسب مع كل الإطلالات من الكاجوال إلى شبه الرسمي.","description_en":"Classic white sneakers with a comfy sole and soft leather. A wardrobe essential that goes with every look, from casual to smart-casual.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"shoes","price_egp":1499,"original_price_egp":1899,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"}],"sizes":["37","38","39","40","41"],"stock_per_variant":14,"images":["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":164},{"id":31,"sku":"ITL-W-SHO-002","name_ar":"حذاء كعب عالٍ أنيق","name_en":"Elegant High Heels","description_ar":"حذاء كعب عالٍ أنيق بتصميم راقٍ وثبات ممتاز يمنحك إطلالة ساحرة في المناسبات. نعل داخلي مبطّن لراحة تدوم طوال السهرة.","description_en":"Elegant high heels with a refined design and excellent stability for a stunning look at every occasion. A cushioned insole for comfort all evening.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"shoes","price_egp":1299,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"}],"sizes":["37","38","39","40","41"],"stock_per_variant":0,"images":["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1602273660127-a0000560a4c1?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.5,"rating_count":88},{"id":32,"sku":"ITL-W-BAG-001","name_ar":"حقيبة يد جلد","name_en":"Leather Handbag","description_ar":"حقيبة يد من الجلد الطبيعي الفاخر بتصميم كلاسيكي أنيق ومساحة عملية. تفاصيل معدنية ذهبية وخامة تدوم معك لسنوات.","description_en":"A premium genuine leather handbag with a classic elegant design and practical space. Gold-tone hardware and leather that lasts for years.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"bags","price_egp":1499,"original_price_egp":1999,"colors":[{"name_ar":"بني","name_en":"Brown","hex":"#7C4A2D"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["one-size"],"stock_per_variant":8,"images":["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":true,"rating_avg":4.8,"rating_count":143},{"id":33,"sku":"ITL-W-BAG-002","name_ar":"حقيبة كتف كاجوال","name_en":"Casual Shoulder Bag","description_ar":"حقيبة كتف كاجوال خفيفة وعملية بحزام قابل للتعديل وجيوب منظمة. رفيقتك المثالية للمشاوير اليومية والسفر الخفيف.","description_en":"A light, practical casual shoulder bag with an adjustable strap and organized pockets. Your perfect companion for daily errands and light travel.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"bags","price_egp":999,"original_price_egp":null,"colors":[{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"أسود","name_en":"Black","hex":"#111111"}],"sizes":["one-size"],"stock_per_variant":11,"images":["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.4,"rating_count":52},{"id":34,"sku":"ITL-W-ACC-001","name_ar":"نظارة شمسية","name_en":"Sunglasses","description_ar":"نظارة شمسية أنيقة بعدسات تحمي من الأشعة فوق البنفسجية وإطار خفيف مريح. تصميم عصري يناسب كل أشكال الوجه.","description_en":"Stylish sunglasses with UV-protective lenses and a lightweight comfy frame. A modern design that suits every face shape.","brand":"إطلالة","gender":"women","category_slug":"women","subcategory":"accessories","price_egp":899,"original_price_egp":null,"colors":[{"name_ar":"أسود","name_en":"Black","hex":"#111111"},{"name_ar":"ذهبي","name_en":"Gold","hex":"#D4AF37"}],"sizes":["one-size"],"stock_per_variant":17,"images":["https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.2,"rating_count":39},{"id":35,"sku":"ITL-K-BOY-001","name_ar":"تيشيرت ولادي قطن","name_en":"Boys' Cotton T-Shirt","description_ar":"تيشيرت ولادي من القطن الناعم المريح على بشرة طفلك الحساسة. ألوان زاهية ثابتة تتحمل اللعب والغسيل المتكرر.","description_en":"A boys' T-shirt in soft cotton that is gentle on your child's sensitive skin. Bright lasting colors that survive playtime and repeated washing.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"boys","price_egp":249,"original_price_egp":null,"colors":[{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"},{"name_ar":"أحمر","name_en":"Red","hex":"#B91C1C"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["4-5Y","6-7Y","8-9Y","10-11Y"],"stock_per_variant":18,"images":["https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.6,"rating_count":47},{"id":36,"sku":"ITL-K-BOY-002","name_ar":"طقم ولادي صيفي","name_en":"Boys' Summer Set","description_ar":"طقم ولادي صيفي كامل من تيشيرت وشورت بخامة قطنية خفيفة ومريحة. مثالي للعب والمصيف وأيام الصيف الطويلة.","description_en":"A complete boys' summer set with a T-shirt and shorts in light, comfy cotton. Perfect for playtime, the beach, and long summer days.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"boys","price_egp":449,"original_price_egp":599,"colors":[{"name_ar":"سماوي","name_en":"Sky Blue","hex":"#38BDF8"},{"name_ar":"أخضر","name_en":"Green","hex":"#166534"}],"sizes":["4-5Y","6-7Y","8-9Y"],"stock_per_variant":12,"images":["https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":83},{"id":37,"sku":"ITL-K-BOY-003","name_ar":"هودي ولادي","name_en":"Boys' Hoodie","description_ar":"هودي ولادي قطن مبطّن يدفّي طفلك في الشتاء ويمنحه حرية الحركة واللعب. غطاء رأس مريح وجيب كانجارو عملي.","description_en":"A fleece-lined boys' cotton hoodie that keeps your child warm in winter with full freedom to play. A comfy hood and a practical kangaroo pocket.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"boys","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"رمادي","name_en":"Gray","hex":"#6B7280"},{"name_ar":"كحلي","name_en":"Navy","hex":"#1E3A5F"}],"sizes":["4-5Y","6-7Y","8-9Y","10-11Y"],"stock_per_variant":10,"images":["https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":61},{"id":38,"sku":"ITL-K-BOY-004","name_ar":"جينز ولادي","name_en":"Boys' Jeans","description_ar":"جينز ولادي بخامة دنيم مرنة تتحمل اللعب والحركة طوال اليوم. خصر مطاطي مريح يسهّل على طفلك ارتداءه بنفسه.","description_en":"Boys' jeans in stretch denim built to survive a full day of play and movement. A comfy elastic waistband your child can pull on alone.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"boys","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"},{"name_ar":"أزرق داكن","name_en":"Dark Blue","hex":"#1E40AF"}],"sizes":["4-5Y","6-7Y","8-9Y","10-11Y"],"stock_per_variant":14,"images":["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.4,"rating_count":38},{"id":39,"sku":"ITL-K-GRL-001","name_ar":"فستان بناتي مزهّر","name_en":"Girls' Floral Dress","description_ar":"فستان بناتي مزهّر بخامة خفيفة منسدلة وقصّة مريحة تمنح طفلتك إطلالة أميرة. ألوان زاهية مبهجة تدوم بعد الغسيل.","description_en":"A girls' floral dress in a light flowing fabric with a comfy cut that makes your little one feel like a princess. Bright cheerful colors that last.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"girls","price_egp":449,"original_price_egp":599,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أصفر","name_en":"Yellow","hex":"#FACC15"}],"sizes":["4-5Y","6-7Y","8-9Y"],"stock_per_variant":15,"images":["https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.8,"rating_count":92},{"id":40,"sku":"ITL-K-GRL-002","name_ar":"طقم بناتي صيفي","name_en":"Girls' Summer Set","description_ar":"طقم بناتي صيفي من توب وتنورة بخامة قطنية ناعمة وباردة على البشرة. تصميم مرح بألوان مبهجة يناسب كل يوم.","description_en":"A girls' summer set with a top and skirt in soft, cool cotton. A playful design in cheerful colors for everyday fun.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"girls","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["4-5Y","6-7Y","8-9Y"],"stock_per_variant":13,"images":["https://images.unsplash.com/photo-1560785496-3c9d27877182?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1595535873420-a599195b3f4a?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.6,"rating_count":74},{"id":41,"sku":"ITL-K-GRL-003","name_ar":"جاكيت بناتي","name_en":"Girls' Jacket","description_ar":"جاكيت بناتي دافئ وأنيق بخامة ناعمة تحمي طفلتك من برد الشتاء. تصميم عملي بسحّاب أمامي وجيوب مريحة.","description_en":"A warm, stylish girls' jacket in soft fabric that protects your child from winter cold. A practical front zip and comfy pockets.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"girls","price_egp":499,"original_price_egp":null,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أحمر","name_en":"Red","hex":"#B91C1C"}],"sizes":["4-5Y","6-7Y","8-9Y","10-11Y"],"stock_per_variant":8,"images":["https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1540479859555-17af45c78602?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.5,"rating_count":45},{"id":42,"sku":"ITL-K-GRL-004","name_ar":"تنورة بناتي","name_en":"Girls' Skirt","description_ar":"تنورة بناتي خفيفة ومريحة بخامة قطنية ناعمة وخصر مطاطي سهل الارتداء. تتناسب مع أي توب لإطلالة مرحة كل يوم.","description_en":"A light, comfy girls' skirt in soft cotton with an easy elastic waist. It pairs with any top for a playful everyday look.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"girls","price_egp":299,"original_price_egp":null,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["4-5Y","6-7Y","8-9Y"],"stock_per_variant":11,"images":["https://images.unsplash.com/photo-1590739225287-bd31519780c3?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1521577352947-9bb58764b69a?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.3,"rating_count":27},{"id":43,"sku":"ITL-K-BAB-001","name_ar":"طقم مواليد قطن","name_en":"Baby Cotton Set","description_ar":"طقم مواليد من القطن العضوي الناعم الآمن على بشرة رضيعك الحساسة. تصميم عملي بأزرار كبس تسهّل تغيير الملابس.","description_en":"A baby set in soft organic cotton, gentle and safe on your infant's delicate skin. A practical snap-button design for easy changes.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"baby","price_egp":299,"original_price_egp":399,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"سماوي","name_en":"Sky Blue","hex":"#38BDF8"},{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"}],"sizes":["0-3M","3-6M","6-12M","12-18M"],"stock_per_variant":16,"images":["https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=900&q=80"],"is_new":true,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.9,"rating_count":118},{"id":44,"sku":"ITL-K-BAB-002","name_ar":"سالوبيت مواليد","name_en":"Baby Romper","description_ar":"سالوبيت مواليد قطن ناعم بقصّة مريحة تمنح رضيعك حرية الحركة والنوم براحة. أزرار كبس سفلية لتغيير سريع ومريح.","description_en":"A soft cotton baby romper with a comfy cut that lets your baby move and sleep freely. Bottom snap buttons for quick, easy changes.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"baby","price_egp":249,"original_price_egp":null,"colors":[{"name_ar":"أصفر","name_en":"Yellow","hex":"#FACC15"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["0-3M","3-6M","6-12M"],"stock_per_variant":0,"images":["https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.7,"rating_count":64},{"id":45,"sku":"ITL-K-BAB-003","name_ar":"طقم خروج مواليد","name_en":"Baby Outing Set","description_ar":"طقم خروج مواليد أنيق من قطعتين بخامة قطنية فاخرة وناعمة. مثالي للزيارات والمناسبات والصور الأولى لطفلك.","description_en":"An elegant two-piece baby outing set in premium soft cotton. Perfect for visits, occasions, and your baby's first photos.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"baby","price_egp":349,"original_price_egp":null,"colors":[{"name_ar":"بيج","name_en":"Beige","hex":"#D6C9B8"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["3-6M","6-12M","12-18M"],"stock_per_variant":9,"images":["https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":true,"rating_avg":4.8,"rating_count":81},{"id":46,"sku":"ITL-K-SHO-001","name_ar":"حذاء أطفال رياضي","name_en":"Kids' Sneakers","description_ar":"حذاء أطفال رياضي خفيف بنعل مرن وثبات ممتاز يدعم خطوات طفلك أثناء اللعب والجري. سهل الارتداء والخلع.","description_en":"Lightweight kids' sneakers with a flexible sole and great grip that support your child's steps while playing and running. Easy to put on and take off.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"shoes","price_egp":449,"original_price_egp":599,"colors":[{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"},{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"}],"sizes":["28","29","30","31","32","33","34","35"],"stock_per_variant":12,"images":["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":true,"is_trending":false,"is_featured":false,"rating_avg":4.6,"rating_count":97},{"id":47,"sku":"ITL-K-SHO-002","name_ar":"حذاء بناتي","name_en":"Girls' Shoes","description_ar":"حذاء بناتي أنيق ومريح بخامة ناعمة وتصميم لطيف يناسب المناسبات والاستخدام اليومي. نعل ثابت يمنح ثباتًا في كل خطوة.","description_en":"Elegant, comfy girls' shoes in soft material with a sweet design for occasions and everyday wear. A steady sole for sure footing with every step.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"shoes","price_egp":399,"original_price_egp":null,"colors":[{"name_ar":"وردي","name_en":"Pink","hex":"#F472B6"},{"name_ar":"أبيض","name_en":"White","hex":"#FFFFFF"}],"sizes":["28","29","30","31","32","33","34","35"],"stock_per_variant":10,"images":["https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":true,"is_featured":false,"rating_avg":4.4,"rating_count":53},{"id":48,"sku":"ITL-K-ACC-001","name_ar":"كاب أطفال","name_en":"Kids' Cap","description_ar":"كاب أطفال مريح بخامة قطنية خفيفة يحمي طفلك من الشمس بأناقة. حزام خلفي قابل للتعديل يناسب كل المقاسات.","description_en":"A comfy kids' cap in light cotton that shields your child from the sun in style. An adjustable back strap fits every size.","brand":"إطلالة","gender":"kids","category_slug":"kids","subcategory":"accessories","price_egp":199,"original_price_egp":null,"colors":[{"name_ar":"أحمر","name_en":"Red","hex":"#B91C1C"},{"name_ar":"أزرق","name_en":"Blue","hex":"#2563EB"}],"sizes":["one-size"],"stock_per_variant":20,"images":["https://images.unsplash.com/photo-1555009393-f20bdb245c4d?auto=format&fit=crop&w=900&q=80","https://images.unsplash.com/photo-1544126592-807ade215a0b?auto=format&fit=crop&w=900&q=80"],"is_new":false,"is_best_seller":false,"is_trending":false,"is_featured":false,"rating_avg":4.2,"rating_count":31}];

/* ---------- استدعاء الباك إند ---------- */
async function api(action, body) {
  var headers = { "Content-Type": "application/json" };
  if (state.session && state.session.access_token) headers.Authorization = "Bearer " + state.session.access_token;
  var res;
  try {
    res = await fetch(API_BASE + "?action=" + encodeURIComponent(action), {
      method: "POST", headers: headers, body: JSON.stringify(body || {})
    });
  } catch (e) {
    var net = new Error(t("err_load")); net.network = true; throw net;
  }
  var data = null;
  try { data = await res.json(); } catch (e) {
    var bad = new Error(t("err_backend")); bad.network = true; bad.status = res.status; throw bad;
  }
  if (!res.ok || (data && data.ok === false)) {
    var msg = (data && (data.error || data.message)) || (t("err_generic") + " (" + res.status + ")");
    var err = new Error(msg); err.status = res.status; err.data = data; throw err;
  }
  return (data && data.data != null) ? data.data : (data || {});
}

/* قراءة آمنة: لو الباك إند غايب، نرجع للكتالوج الاحتياطي المضمّن */
function fbListProducts(params) {
  var items = FALLBACK_PRODUCTS.slice();
  if (params) {
    if (params.gender) items = items.filter(function (p) { return p.gender === params.gender; });
    if (params.category_slug) {
      var cs = String(params.category_slug);
      if (["men", "women", "kids"].indexOf(cs) >= 0) {
        items = items.filter(function (p) { return p.gender === cs; });
      } else {
        // سلاج فرعي مسبوق بالقسم الرئيسي (men-t-shirts) أو بسيط (t-shirts)
        var dash = cs.indexOf("-");
        if (dash > 0) {
          var g2 = cs.slice(0, dash), sub2 = cs.slice(dash + 1);
          items = items.filter(function (p) { return p.gender === g2 && p.subcategory === sub2; });
        } else {
          items = items.filter(function (p) { return p.subcategory === cs; });
        }
      }
    }
    if (params.subcategory) items = items.filter(function (p) { return p.subcategory === params.subcategory; });
    if (params.q) {
      var q = String(params.q).toLowerCase();
      items = items.filter(function (p) {
        return (p.name_ar + " " + p.name_en + " " + (p.description_ar || "") + " " + (p.description_en || "") + " " + p.brand + " " + p.sku).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (params.min_price != null) items = items.filter(function (p) { return p.price_egp >= params.min_price; });
    if (params.max_price != null) items = items.filter(function (p) { return p.price_egp <= params.max_price; });
    if (params.color) items = items.filter(function (p) { return (p.colors || []).some(function (c) { return c.name_en === params.color || c.name_ar === params.color; }); });
    if (params.size) items = items.filter(function (p) { return (p.sizes || []).indexOf(params.size) >= 0; });
    if (params.on_sale) items = items.filter(function (p) { return p.original_price_egp && p.original_price_egp > p.price_egp; });
    if (params.is_new) items = items.filter(function (p) { return p.is_new; });
    if (params.is_best_seller) items = items.filter(function (p) { return p.is_best_seller; });
    if (params.is_trending) items = items.filter(function (p) { return p.is_trending; });
    var sort = params.sort || "newest";
    if (sort === "price_asc") items.sort(function (a, b) { return a.price_egp - b.price_egp; });
    else if (sort === "price_desc") items.sort(function (a, b) { return b.price_egp - a.price_egp; });
    else if (sort === "popular") items.sort(function (a, b) { return b.rating_count - a.rating_count; });
    else if (sort === "rating") items.sort(function (a, b) { return b.rating_avg - a.rating_avg; });
    else items.sort(function (a, b) { return b.id - a.id; });
  }
  var page = Number((params && params.page) || 1), ps = Number((params && params.page_size) || 24);
  var total = items.length;
  items = items.slice((page - 1) * ps, page * ps);
  return { items: items, total: total, page: page, page_size: ps };
}
function fbGetProduct(id) {
  var p = null;
  for (var i = 0; i < FALLBACK_PRODUCTS.length; i++) if (String(FALLBACK_PRODUCTS[i].id) === String(id)) p = FALLBACK_PRODUCTS[i];
  if (!p) throw new Error(state.lang === "ar" ? "المنتج مش موجود." : "Product not found.");
  var variants = [];
  (p.colors || []).forEach(function (c) {
    (p.sizes || []).forEach(function (s) {
      variants.push({ id: p.id + "-" + c.name_en + "-" + s, color_name_ar: c.name_ar, color_name_en: c.name_en, color_hex: c.hex, size: s, stock_qty: Number(p.stock_per_variant || 0) });
    });
  });
  var related = FALLBACK_PRODUCTS.filter(function (x) { return x.gender === p.gender && x.id !== p.id; }).slice(0, 8);
  return { product: Object.assign({}, p, {
    images: prodImages(p).map(function (u, ix) { return { url: u, sort: ix }; }),
    variants: variants, reviews: [], related: related
  }) };
}
function fbCategories() {
  var cats = [];
  ["men", "women", "kids"].forEach(function (g, ix) {
    cats.push({ id: ix + 1, slug: g, name_ar: GENDER_LABEL[g][0], name_en: GENDER_LABEL[g][1], gender: g, parent_slug: null, sort_order: ix + 1 });
    (SUBCATS[g] || []).forEach(function (s, jx) {
      // سلاج القسم الفرعي مسبوق بالقسم الرئيسي (men-t-shirts) — مطابق لقاعدة البيانات
      cats.push({ id: 100 + ix * 20 + jx, slug: g + "-" + s[0], name_ar: s[1], name_en: s[2], gender: g, parent_slug: g, sort_order: jx + 1 });
    });
  });
  return { categories: cats };
}
function fbSettings() {
  return {
    store_name: "إطلالة", store_name_en: "ITLALA", currency: "EGP",
    shipping_fee_cairo: 35, shipping_fee_other: 60, free_shipping_threshold: 1500,
    cod_enabled: true, banners: [],
    announcement_ar: "🚚 شحن لجميع المحافظات — الدفع عند الاستلام — استرجاع مجاني خلال 14 يومًا",
    announcement_en: "🚚 Shipping all over Egypt — Cash on Delivery — Free returns within 14 days",
    support_phone: "+201091296456", support_email: "support@itlala.store"
  };
}
async function apiRead(action, body) {
  try { return await api(action, body); }
  catch (err) {
    if (!err.network) throw err;
    if (action === "list-products") return fbListProducts(body || {});
    if (action === "get-product") return fbGetProduct(body.id);
    if (action === "list-categories") return fbCategories();
    if (action === "get-settings-public") return fbSettings();
    if (action === "search-suggest") {
      var q = String((body && body.q) || "").toLowerCase();
      var s = FALLBACK_PRODUCTS.filter(function (p) {
        return q && (p.name_ar + " " + p.name_en).toLowerCase().indexOf(q) >= 0;
      }).slice(0, 8).map(function (p) {
        return { id: p.id, name_ar: p.name_ar, name_en: p.name_en, price_egp: p.price_egp, image: prodImages(p)[0] || "" };
      });
      return { suggestions: s };
    }
    if (action === "health") return { ok: true, db: false };
    throw err;
  }
}

/* ---------- اللغة ---------- */
function applyLang() {
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  $("langBtn").textContent = state.lang === "ar" ? "EN" : "ع";
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });
  var si = $("searchInput"); if (si) si.placeholder = t("search_ph");
  try { localStorage.setItem(LANG_KEY, state.lang); } catch (e) {}
  updateCounts();
}
function setLang(l) { state.lang = l === "en" ? "en" : "ar"; applyLang(); renderRoute(); }

/* ---------- السلة والمفضلة (محلي + سيرفر) ---------- */
function saveCart() { storeLocal(CART_KEY, state.cart); updateCounts(); }
function saveCoupon() { storeLocal(COUPON_KEY, state.coupon); }
function saveWish() { storeLocal(WISH_KEY, state.wishlist); updateCounts(); }
function cartCount() { return state.cart.reduce(function (a, it) { return a + Number(it.qty || 0); }, 0); }
function cartSubtotal() { return state.cart.reduce(function (a, it) { return a + Number(it.price_egp || 0) * Number(it.qty || 0); }, 0); }
function updateCounts() {
  var cc = $("cartCount"); if (cc) cc.textContent = cartCount();
  var wc = $("wishCount");
  if (wc) { wc.textContent = state.wishlist.length; wc.hidden = state.wishlist.length === 0; }
}
function findVariantId(product, colorEn, size) {
  if (!product.variants) return null;
  for (var i = 0; i < product.variants.length; i++) {
    var v = product.variants[i];
    if (v.color_name_en === colorEn && String(v.size) === String(size)) return v.id;
  }
  return null;
}
function addToCart(product, color, size, qty, variantId) {
  qty = Number(qty || 1);
  var key = String(product.id) + "|" + (color ? color.name_en : "") + "|" + (size || "");
  var ex = null;
  for (var i = 0; i < state.cart.length; i++) {
    var it = state.cart[i];
    if (String(it.product_id) + "|" + (it.color_name_en || "") + "|" + (it.size || "") === key) { ex = it; break; }
  }
  if (ex) ex.qty = Math.min(99, Number(ex.qty) + qty);
  else state.cart.push({
    product_id: product.id, variant_id: variantId || findVariantId(product, color ? color.name_en : null, size) || null,
    color_name_ar: color ? color.name_ar : "", color_name_en: color ? color.name_en : "",
    color_hex: color ? color.hex : "", size: size || "", qty: qty,
    name_ar: product.name_ar, name_en: product.name_en, price_egp: product.price_egp,
    image: prodImages(product)[0] || "", sku: product.sku || ""
  });
  saveCart();
  syncCartServer();
  toast(t("added_cart"));
}
function removeFromCart(idx) { state.cart.splice(idx, 1); saveCart(); syncCartServer(); renderRoute(); }
function setCartQty(idx, qty) {
  qty = Number(qty);
  if (qty <= 0) { removeFromCart(idx); return; }
  state.cart[idx].qty = Math.min(99, qty);
  saveCart(); syncCartServer(); renderRoute();
}
async function syncCartServer() {
  if (!state.user) return;
  try {
    await api("cart-save", { items: state.cart.map(function (it) {
      return { product_id: it.product_id, variant_id: it.variant_id || null, qty: it.qty };
    }) });
  } catch (e) { /* السلة المحلية هي الأساس — فشل المزامنة لا يوقف الشراء */ }
}
async function mergeGuestCart() {
  if (!state.user || !state.cart.length) return;
  try {
    var srv = await api("cart-get");
    // cart-get بيرجع {cart:{items:[...]}} — عناصر السيرفر بشكل buildCart
    // (variant/product ككائنات متداخلة)، مش items مسطحة.
    var serverItems = (srv && srv.cart && srv.cart.items) || (srv && srv.items) || (srv && srv.cart_items) || [];
    var merged = state.cart.slice();
    serverItems.forEach(function (si) {
      var found = merged.some(function (m) { return String(m.product_id) === String(si.product_id) && String(m.variant_id || "") === String(si.variant_id || ""); });
      if (!found) {
        var p = null;
        for (var i = 0; i < FALLBACK_PRODUCTS.length; i++) if (String(FALLBACK_PRODUCTS[i].id) === String(si.product_id)) p = FALLBACK_PRODUCTS[i];
        var v = si.variant || {};
        var prod = si.product || {};
        if (p) merged.push({
          product_id: p.id, variant_id: si.variant_id || null,
          color_name_ar: v.color_name_ar || "", color_name_en: v.color_name_en || "",
          color_hex: v.color_hex || "", size: v.size || "", qty: si.qty || 1,
          name_ar: prod.name_ar || p.name_ar, name_en: prod.name_en || p.name_en,
          price_egp: prod.price_egp != null ? prod.price_egp : p.price_egp,
          image: prodImages(p)[0] || "", sku: p.sku || ""
        });
      }
    });
    state.cart = merged; saveCart();
    await api("cart-save", { items: state.cart.map(function (it) { return { product_id: it.product_id, variant_id: it.variant_id || null, qty: it.qty }; }) });
    toast(t("login_first_cart_sync"));
  } catch (e) { /* تجاهل — السلة المحلية تكفي */ }
}
function isWished(id) { return state.wishlist.indexOf(Number(id)) >= 0 || state.wishlist.indexOf(String(id)) >= 0; }
async function toggleWish(id, product) {
  id = Number(id);
  var ix = state.wishlist.indexOf(id);
  if (ix >= 0) {
    state.wishlist.splice(ix, 1); saveWish();
    if (state.user) { try { await api("wishlist-remove", { product_id: id }); } catch (e) {} }
    toast(t("removed_wish"));
  } else {
    state.wishlist.push(id); saveWish();
    if (state.user) { try { await api("wishlist-add", { product_id: id }); } catch (e) {} }
    toast(t("added_wish"));
  }
  renderRoute();
}

/* ---------- بطاقة منتج ---------- */
function productCard(p) {
  var imgs = prodImages(p);
  var pct = discountPct(p);
  var stock = prodStock(p);
  var wished = isWished(p.id);
  var flags = "";
  if (p.is_new) flags += '<span class="flag">' + esc(t("new_badge")) + "</span>";
  else if (pct > 0) flags += '<span class="flag sale">-' + pct + "%</span>";
  return '<article class="product-card">' + flags +
    (stock <= 0 ? '<span class="out-badge">' + esc(t("out_of_stock")) + "</span>" : "") +
    '<a href="#/product/' + p.id + '"><img src="' + esc(imgs[0] || "") + '" alt="' + esc(pname(p)) + '" loading="lazy" onerror="this.src=\'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80\'"></a>' +
    '<div class="product-info">' +
    '<span class="brand">' + esc(p.brand || "إطلالة") + "</span>" +
    '<h3><a href="#/product/' + p.id + '">' + esc(pname(p)) + "</a></h3>" +
    '<div class="rating">' + stars(p.rating_avg) + ' <span class="count">(' + Number(p.rating_avg || 0).toFixed(1) + " • " + Number(p.rating_count || 0) + " " + esc(t("reviews")) + ")</span></div>" +
    '<div class="price-row"><span class="price">' + esc(fmtPrice(p.price_egp)) + "</span>" +
    (p.original_price_egp && p.original_price_egp > p.price_egp
      ? '<span class="old-price">' + esc(fmtPrice(p.original_price_egp)) + '</span><span class="discount-badge">-' + pct + "%</span>" : "") +
    "</div>" +
    '<div class="card-actions">' +
    (stock > 0
      ? '<button class="btn btn-dark" data-quick-add="' + p.id + '">' + esc(t("add_to_cart")) + "</button>"
      : '<button class="btn btn-ghost" disabled>' + esc(t("out_of_stock")) + "</button>") +
    '<button class="btn btn-ghost wish-btn' + (wished ? " active" : "") + '" data-wish="' + p.id + '" aria-label="wishlist">' + (wished ? "♥" : "♡") + "</button>" +
    "</div></div></article>";
}
function bindCards(root) {
  root.querySelectorAll("[data-quick-add]").forEach(function (btn) {
    btn.addEventListener("click", async function () {
      var id = btn.dataset.quickAdd;
      try {
        var d = await apiRead("get-product", { id: Number(id) });
        var p = d.product;
        var color = (p.colors && p.colors[0]) || (prodColors(p)[0]) || null;
        var size = (p.sizes && p.sizes[0]) || (prodSizes(p)[0]) || "";
        var vid = (p.variants && p.variants.length) ? findVariantId(p, color ? color.name_en : null, size) : null;
        addToCart(p, color, size, 1, vid);
      } catch (e) {
        var fb = null;
        for (var i = 0; i < FALLBACK_PRODUCTS.length; i++) if (String(FALLBACK_PRODUCTS[i].id) === String(id)) fb = FALLBACK_PRODUCTS[i];
        if (fb) addToCart(fb, (fb.colors || [])[0] || null, (fb.sizes || [])[0] || "", 1, null);
        else toast(e.message || t("err_generic"));
      }
    });
  });
  root.querySelectorAll("[data-wish]").forEach(function (btn) {
    btn.addEventListener("click", function () { toggleWish(btn.dataset.wish); });
  });
}

/* ---------- الروتنج ---------- */
var VIEWS = ["home", "shop", "category", "product", "cart", "checkout", "login", "register",
  "forgot", "profile", "addresses", "orders", "order-tracking", "order-details", "wishlist", "search",
  "about", "contact", "faq", "shipping", "returns", "privacy", "terms", "admin"];
function parseHash() {
  var h = (location.hash || "#/").replace(/^#/, "");
  var parts = h.split("?");
  var path = parts[0] || "/";
  var query = {};
  if (parts[1]) parts[1].split("&").forEach(function (kv) {
    var p = kv.split("="); if (p[0]) query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || "");
  });
  return { path: path, query: query, segs: path.split("/").filter(Boolean) };
}
function showView(name) {
  VIEWS.forEach(function (v) { var el = $("view-" + v); if (el) el.hidden = v !== name; });
  var wa = $("waFloat"); if (wa) wa.hidden = (name === "admin");
  document.querySelectorAll(".mainnav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    a.classList.toggle("active", href === "#" + parseHash().path || (name === "category" && href === "#/shop"));
  });
  window.scrollTo({ top: 0 });
  $("mainNav").classList.remove("open");
}
function needAuth() {
  if (!state.user) { toast(t("need_login")); location.hash = "#/login"; return true; }
  return false;
}
async function renderRoute() {
  var r = parseHash();
  var segs = r.segs;
  if (segs.length === 0) { showView("home"); renderHome(); return; }
  var first = segs[0];
  if (first === "shop") { showView("shop"); renderListing("shop", {}, r.query); return; }
  if (first === "men" || first === "women" || first === "kids") {
    showView("category"); renderListing("category", { gender: first }, r.query); return;
  }
  if (first === "category" && segs[1]) {
    var slug = segs[1];
    var gender = null;
    Object.keys(SUBCATS).forEach(function (g) {
      (SUBCATS[g] || []).forEach(function (s) { if (s[0] === slug) gender = g; });
    });
    showView("category");
    renderListing("category", gender ? { gender: gender, subcategory: slug } : { subcategory: slug }, r.query);
    return;
  }
  if (first === "product" && segs[1]) { showView("product"); renderProduct(segs[1]); return; }
  if (first === "cart") { showView("cart"); renderCart(); return; }
  // إتمام الشراء يتطلب تسجيل دخول — أكشن place-order في العقد للمستخدم المسجّل فقط (JWT).
  if (first === "checkout") { if (needAuth()) return; showView("checkout"); renderCheckout(); return; }
  if (first === "login") { showView("login"); return; }
  if (first === "register") { showView("register"); return; }
  if (first === "forgot") { showView("forgot"); return; }
  if (first === "profile") { if (needAuth()) return; showView("profile"); renderProfile(); return; }
  if (first === "addresses") { if (needAuth()) return; showView("addresses"); renderAddresses(); return; }
  if (first === "orders") { if (needAuth()) return; showView("orders"); renderOrders(); return; }
  if (first === "order" && segs[1]) { if (state.user) { showView("order-details"); renderOrderDetails(segs[1]); return; } showView("order-tracking"); renderTracking(segs[1]); return; }
  if (first === "order-tracking") { showView("order-tracking"); renderTracking(null); return; }
  if (first === "wishlist") { showView("wishlist"); renderWishlist(); return; }
  if (first === "search") { showView("search"); renderSearch(r.query.q || ""); return; }
  if (["about", "contact", "faq", "shipping", "returns", "privacy", "terms"].indexOf(first) >= 0) {
    showView(first); return;
  }
  if (first === "admin") {
    if (needAuth()) return;
    if (!state.user || state.user.role !== "admin") { showView("admin"); setMsg($("adminMsg"), t("admin_only"), "error"); $("adminContent").innerHTML = ""; return; }
    showView("admin"); renderAdmin(); return;
  }
  showView("home"); renderHome();
}
window.addEventListener("hashchange", renderRoute);

/* ---------- الرئيسية ---------- */
async function renderHome() {
  var sections = [
    ["homeNew", { is_new: true, page_size: 8 }],
    ["homeBest", { is_best_seller: true, page_size: 8 }],
    ["homeTrending", { is_trending: true, page_size: 8 }],
    ["homeSale", { on_sale: true, page_size: 8 }]
  ];
  for (var i = 0; i < sections.length; i++) {
    var el = $(sections[i][0]); if (!el) continue;
    try {
      var d = await apiRead("list-products", sections[i][1]);
      var items = d.items || [];
      el.innerHTML = items.length ? items.map(productCard).join("") : '<p class="empty">' + esc(t("no_results")) + "</p>";
      bindCards(el);
    } catch (e) {
      el.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>";
    }
  }
}

/* ---------- صفحات القوائم (تسوق الكل / الأقسام) ---------- */
var listingState = { subcategory: "", min: "", max: "", color: "", size: "", on_sale: false, sort: "newest", page: 1 };
function listingParams(base, q) {
  var p = {};
  if (base.gender) p.gender = base.gender;
  // نرسل category_slug (المسبوق بالقسم الرئيسي) + subcategory (البسيط) معًا،
  // كما ينص العقد — الباك إند يقبل الصيغتين.
  if (base.subcategory) {
    p.subcategory = base.subcategory;
    if (base.gender) p.category_slug = base.gender + "-" + base.subcategory;
  }
  if (q) {
    if (q.subcategory) listingState.subcategory = q.subcategory;
    if (q.on_sale) listingState.on_sale = q.on_sale === "1";
    if (q.is_new) p.is_new = true;
    if (q.is_best_seller) p.is_best_seller = true;
    if (q.is_trending) p.is_trending = true;
    if (q.sort) listingState.sort = q.sort;
  }
  if (listingState.subcategory) {
    p.subcategory = listingState.subcategory;
    if (base.gender) p.category_slug = base.gender + "-" + listingState.subcategory;
  }
  if (listingState.min !== "") p.min_price = Number(listingState.min);
  if (listingState.max !== "") p.max_price = Number(listingState.max);
  if (listingState.color) p.color = listingState.color;
  if (listingState.size) p.size = listingState.size;
  if (listingState.on_sale) p.on_sale = true;
  p.sort = listingState.sort;
  p.page = listingState.page;
  p.page_size = 24;
  return p;
}
function filtersHTML(base) {
  var gender = base.gender;
  var subs = gender ? SUBCATS[gender] : [];
  var allColors = {};
  FALLBACK_PRODUCTS.forEach(function (p) {
    if (gender && p.gender !== gender) return;
    (p.colors || []).forEach(function (c) { allColors[c.name_en] = c; });
  });
  var colorList = Object.keys(allColors).map(function (k) { return allColors[k]; });
  var sizes = ["XS", "S", "M", "L", "XL", "XXL", "37", "38", "39", "40", "41", "42", "43", "44", "45", "one-size"];
  var h = '<div class="filters"><h3>🔎 ' + esc(state.lang === "ar" ? "الفلاتر" : "Filters") + "</h3>";
  if (subs.length) {
    h += '<div class="filter-group"><strong>' + esc(t("filter_sub")) + "</strong><div class=\"chips\">" +
      '<button class="chip' + (!listingState.subcategory ? " active" : "") + '" data-f-sub="">' + esc(t("filter_all")) + "</button>" +
      subs.map(function (s) {
        return '<button class="chip' + (listingState.subcategory === s[0] ? " active" : "") + '" data-f-sub="' + s[0] + '">' + esc(state.lang === "ar" ? s[1] : s[2]) + "</button>";
      }).join("") + "</div></div>";
  }
  h += '<div class="filter-group"><strong>' + esc(t("filter_price")) + '</strong><div class="chips">' +
    '<input type="number" id="fMin" placeholder="Min" value="' + esc(listingState.min) + '" style="width:45%">' +
    '<input type="number" id="fMax" placeholder="Max" value="' + esc(listingState.max) + '" style="width:45%">' +
    '<button class="btn btn-dark btn-sm" id="fPriceBtn">' + esc(t("apply")) + "</button></div></div>";
  h += '<div class="filter-group"><strong>' + esc(t("filter_color")) + "</strong><div class=\"chips\">" +
    '<button class="chip' + (!listingState.color ? " active" : "") + '" data-f-color="">' + esc(t("filter_all")) + "</button>" +
    colorList.map(function (c) {
      return '<button class="color-dot' + (listingState.color === c.name_en ? " active" : "") + '" data-f-color="' + esc(c.name_en) + '" title="' + esc(cname(c)) + '" style="background:' + esc(c.hex) + '"></button>';
    }).join("") + "</div></div>";
  h += '<div class="filter-group"><strong>' + esc(t("filter_size")) + "</strong><div class=\"chips\">" +
    '<button class="chip' + (!listingState.size ? " active" : "") + '" data-f-size="">' + esc(t("filter_all")) + "</button>" +
    sizes.map(function (s) {
      return '<button class="chip' + (listingState.size === s ? " active" : "") + '" data-f-size="' + s + '">' + esc(s === "one-size" ? (state.lang === "ar" ? "مقاس واحد" : "One size") : s) + "</button>";
    }).join("") + "</div></div>";
  h += '<div class="filter-group"><label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" id="fSale" style="width:auto"' + (listingState.on_sale ? " checked" : "") + "> " + esc(t("filter_sale")) + "</label></div>";
  h += '<button class="btn btn-ghost btn-block" id="fClear">' + esc(t("clear_filters")) + "</button></div>";
  return h;
}
async function renderListing(kind, base, query) {
  var isShop = kind === "shop";
  var container = isShop ? $("shopContent") : $("categoryContent");
  var titleEl = isShop ? null : $("categoryTitle");
  if (titleEl) {
    if (base.subcategory) titleEl.textContent = subcatLabel(base.gender || "", base.subcategory);
    else if (base.gender) titleEl.textContent = GENDER_LABEL[base.gender][state.lang === "ar" ? 0 : 1];
    else titleEl.textContent = t("shop_title");
  }
  if (query && (query.subcategory || query.on_sale || query.sort || query.is_new || query.is_best_seller || query.is_trending)) {
    // فلاتر جاية من الرابط — تُطبق مرة واحدة
  }
  var params = listingParams(base, query);
  container.innerHTML = '<div class="filters-layout">' + filtersHTML(base) + '<div><p class="muted">' + esc(t("loading")) + "</p></div></div>";
  bindListingFilters(container, kind, base, query);
  try {
    var d = await apiRead("list-products", params);
    var items = d.items || [];
    var total = d.total != null ? d.total : items.length;
    var sortOpts = [["newest", t("sort_newest")], ["price_asc", t("sort_price_asc")], ["price_desc", t("sort_price_desc")], ["popular", t("sort_popular")], ["rating", t("sort_rating")]];
    var h = '<div class="filters-layout">' + filtersHTML(base) + '<div>' +
      '<div class="toolbar"><span class="muted"><strong>' + total + "</strong> " + esc(t("results_count")) + "</span>" +
      '<select id="sortSel">' + sortOpts.map(function (o) {
        return '<option value="' + o[0] + '"' + (listingState.sort === o[0] ? " selected" : "") + ">" + esc(o[1]) + "</option>";
      }).join("") + "</select></div>";
    h += items.length
      ? '<div class="products-grid">' + items.map(productCard).join("") + "</div>"
      : '<p class="empty">' + esc(t("no_results")) + "</p>";
    var pages = Math.max(1, Math.ceil(total / 24));
    if (pages > 1) {
      h += '<div class="pagination">';
      for (var pg = 1; pg <= pages; pg++)
        h += '<button class="btn ' + (pg === listingState.page ? "btn-dark" : "btn-ghost") + ' btn-sm" data-page="' + pg + '">' + pg + "</button>";
      h += "</div>";
    }
    h += "</div></div>";
    container.innerHTML = h;
    bindCards(container);
    bindListingFilters(container, kind, base, query);
    var sortSel = $("sortSel");
    if (sortSel) sortSel.addEventListener("change", function () { listingState.sort = sortSel.value; listingState.page = 1; renderListing(kind, base, {}); });
    container.querySelectorAll("[data-page]").forEach(function (b) {
      b.addEventListener("click", function () { listingState.page = Number(b.dataset.page); renderListing(kind, base, {}); });
    });
  } catch (e) {
    container.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + ' <button class="linklike" onclick="location.reload()">' + esc(t("retry")) + "</button></p>";
  }
}
function bindListingFilters(container, kind, base, query) {
  container.querySelectorAll("[data-f-sub]").forEach(function (b) {
    b.addEventListener("click", function () { listingState.subcategory = b.dataset.fSub; listingState.page = 1; renderListing(kind, base, {}); });
  });
  container.querySelectorAll("[data-f-color]").forEach(function (b) {
    b.addEventListener("click", function () { listingState.color = b.dataset.fColor; listingState.page = 1; renderListing(kind, base, {}); });
  });
  container.querySelectorAll("[data-f-size]").forEach(function (b) {
    b.addEventListener("click", function () { listingState.size = b.dataset.fSize; listingState.page = 1; renderListing(kind, base, {}); });
  });
  var sale = $("fSale");
  if (sale) sale.addEventListener("change", function () { listingState.on_sale = sale.checked; listingState.page = 1; renderListing(kind, base, {}); });
  var pb = $("fPriceBtn");
  if (pb) pb.addEventListener("click", function () {
    listingState.min = $("fMin").value || ""; listingState.max = $("fMax").value || ""; listingState.page = 1;
    renderListing(kind, base, {});
  });
  var cl = $("fClear");
  if (cl) cl.addEventListener("click", function () {
    listingState = { subcategory: "", min: "", max: "", color: "", size: "", on_sale: false, sort: "newest", page: 1 };
    renderListing(kind, base, {});
  });
}

/* ---------- صفحة المنتج ---------- */
var currentProduct = null, selColor = null, selSize = "", selQty = 1, selVariantId = null;
function variantStock(p, colorEn, size) {
  if (!p.variants) return prodStock(p);
  var v = null;
  for (var i = 0; i < p.variants.length; i++) {
    var x = p.variants[i];
    if ((!colorEn || x.color_name_en === colorEn) && (!size || String(x.size) === String(size))) { v = x; break; }
  }
  return v ? Number(v.stock_qty) : prodStock(p);
}
async function renderProduct(id) {
  var box = $("productContent");
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var d;
  try { d = await apiRead("get-product", { id: Number(id) }); }
  catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; return; }
  var p = d.product;
  currentProduct = p;
  var colors = p.colors || prodColors(p);
  var sizes = p.sizes || prodSizes(p);
  var reviews = p.reviews || [];
  var related = p.related || [];
  selColor = colors[0] || null; selSize = ""; selQty = 1; selVariantId = null;
  var imgs = prodImages(p);
  var pct = discountPct(p);
  var stock = prodStock(p);
  var stockLabel = stock <= 0 ? '<span class="stock-out">' + esc(t("out_of_stock")) + "</span>"
    : stock <= 5 ? '<span class="stock-low">' + esc(t("low_stock")) + " (" + stock + ")</span>"
    : '<span class="stock-ok">' + esc(t("in_stock")) + "</span>";
  var h = '<div class="product-layout">' +
    '<div><div class="gallery-main"><img id="mainImg" src="' + esc(imgs[0] || "") + '" alt="' + esc(pname(p)) + '"></div>' +
    (imgs.length > 1 ? '<div class="gallery-thumbs">' + imgs.map(function (u, i) {
      return '<img src="' + esc(u) + '" data-thumb="' + esc(u) + '" class="' + (i === 0 ? "active" : "") + '" alt="">';
    }).join("") + "</div>" : "") + "</div>" +
    '<div class="product-detail">' +
    '<span class="brand">' + esc(p.brand || "إطلالة") + " • " + esc(p.category_slug || p.gender || "") + "</span>" +
    "<h1>" + esc(pname(p)) + "</h1>" +
    '<div class="rating">' + stars(p.rating_avg) + " " + Number(p.rating_avg || 0).toFixed(1) + " (" + Number(p.rating_count || 0) + " " + esc(t("reviews")) + ")</div>" +
    '<div class="price-row" style="margin:.6rem 0"><span class="price" style="font-size:1.6rem">' + esc(fmtPrice(p.price_egp)) + "</span>" +
    (p.original_price_egp && p.original_price_egp > p.price_egp
      ? '<span class="old-price" style="font-size:1.1rem">' + esc(fmtPrice(p.original_price_egp)) + '</span><span class="discount-badge">-' + pct + "%</span>" : "") + "</div>" +
    "<p>" + esc(pdesc(p)) + "</p>" +
    "<p>" + stockLabel + "</p>" +
    (colors.length ? '<strong>' + esc(t("colors")) + ':</strong> <span id="selColorName">' + esc(cname(selColor)) + '</span><div class="chips" style="margin:.4rem 0 1rem">' +
      colors.map(function (c, i) {
        return '<button class="color-dot' + (i === 0 ? " active" : "") + '" data-color="' + i + '" title="' + esc(cname(c)) + '" style="background:' + esc(c.hex) + '"></button>';
      }).join("") + "</div>" : "") +
    (sizes.length ? '<strong>' + esc(t("sizes")) + ':</strong> <div class="size-row">' +
      sizes.map(function (s) {
        return '<button class="size-btn" data-size="' + esc(String(s)) + '">' + esc(String(s) === "one-size" ? (state.lang === "ar" ? "مقاس واحد" : "One size") : String(s)) + "</button>";
      }).join("") + "</div>" +
      '<details style="margin-bottom:1rem"><summary class="linklike">' + esc(t("size_guide")) + "</summary>" +
      '<table class="size-guide"><tr><th>' + (state.lang === "ar" ? "المقاس" : "Size") + '</th><th>' + (state.lang === "ar" ? "الصدر (سم)" : "Chest (cm)") + '</th><th>' + (state.lang === "ar" ? "الطول (سم)" : "Length (cm)") + '</th></tr>' +
      "<tr><td>XS</td><td>48</td><td>64</td></tr><tr><td>S</td><td>51</td><td>66</td></tr><tr><td>M</td><td>54</td><td>68</td></tr><tr><td>L</td><td>57</td><td>70</td></tr><tr><td>XL</td><td>60</td><td>72</td></tr><tr><td>XXL</td><td>63</td><td>74</td></tr></table></details>" : "") +
    '<div class="qty-row"><strong>' + esc(t("qty")) + ':</strong><button id="qtyMinus" type="button">−</button><strong id="qtyVal">1</strong><button id="qtyPlus" type="button">+</button></div>' +
    '<div class="buy-row">' +
    (stock > 0
      ? '<button class="btn btn-dark btn-lg" id="addCartBtn">' + esc(t("add_to_cart")) + "</button>" +
        '<button class="btn btn-light btn-lg" id="buyNowBtn">' + esc(t("buy_now")) + "</button>"
      : '<button class="btn btn-ghost btn-lg" disabled>' + esc(t("out_of_stock")) + "</button>") +
    '<button class="btn btn-ghost btn-lg wish-btn' + (isWished(p.id) ? " active" : "") + '" id="wishBtn">' + (isWished(p.id) ? "♥" : "♡") + "</button>" +
    "</div>" +
    '<div class="meta-list">' + esc(t("sku")) + ": <span dir=\"ltr\">" + esc(p.sku || ("ITL-" + p.id)) + "</span><br>" +
    (state.lang === "ar" ? "القسم" : "Category") + ": " + esc(baseCatName(p)) + "<br>🚚 " + (state.lang === "ar" ? "شحن سريع — الدفع عند الاستلام" : "Fast shipping — Cash on Delivery") + "</div>" +
    "</div></div>";
  h += '<h2 class="section-title">' + esc(t("reviews")) + " (" + reviews.length + ")</h2>";
  h += reviews.length ? reviews.map(function (rv) {
    return '<div class="review-item"><strong>' + esc(rv.user_name || (state.lang === "ar" ? "عميل" : "Customer")) + "</strong> " + stars(rv.rating) +
      (rv.title ? " — <strong>" + esc(rv.title) + "</strong>" : "") + '<p class="muted">' + esc(rv.body || "") + '</p><span class="small muted">' + esc(fmtDate(rv.created_at)) + "</span></div>";
  }).join("") : '<p class="muted">' + esc(t("no_reviews")) + "</p>";
  if (state.user) {
    h += '<div class="card" style="max-width:640px;margin-top:1rem"><h3>' + esc(t("write_review")) + '</h3>' +
      '<form id="reviewForm"><label>' + esc(t("rate")) + ' <select id="rvRating"><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select></label>' +
      '<label>' + esc(t("review_title_ph")) + ' <input type="text" id="rvTitle"></label>' +
      '<label>' + esc(t("review_body_ph")) + ' <textarea id="rvBody" rows="3" required></textarea></label>' +
      '<button class="btn btn-dark" type="submit">' + esc(t("send_review")) + '</button></form><p class="form-msg" id="rvMsg" role="alert"></p></div>';
  } else {
    h += '<p class="muted"><a href="#/login" class="linklike">' + esc(t("login_btn")) + '</a> ' + (state.lang === "ar" ? "عشان تكتب تقييم." : "to write a review.") + "</p>";
  }
  if (related.length) {
    h += '<h2 class="section-title">' + esc(t("related")) + "</h2><div class=\"products-grid\">" + related.map(productCard).join("") + "</div>";
  }
  var viewed = [];
  try { viewed = JSON.parse(localStorage.getItem(VIEWED_KEY) || "[]"); } catch (e) {}
  var others = viewed.filter(function (x) { return Number(x) !== Number(p.id); }).slice(0, 4);
  if (others.length) {
    h += '<h2 class="section-title">' + esc(t("viewed")) + "</h2><div class=\"products-grid\">" +
      others.map(function (vid) {
        var fp = null;
        for (var i = 0; i < FALLBACK_PRODUCTS.length; i++) if (String(FALLBACK_PRODUCTS[i].id) === String(vid)) fp = FALLBACK_PRODUCTS[i];
        return fp ? productCard(fp) : "";
      }).join("") + "</div>";
  }
  box.innerHTML = h;
  bindCards(box);
  // سجل المشاهدة
  try {
    var v = viewed.filter(function (x) { return Number(x) !== Number(p.id); });
    v.unshift(Number(p.id));
    localStorage.setItem(VIEWED_KEY, JSON.stringify(v.slice(0, 12)));
  } catch (e) {}
  // معرض الصور
  box.querySelectorAll("[data-thumb]").forEach(function (th) {
    th.addEventListener("click", function () {
      $("mainImg").src = th.dataset.thumb;
      box.querySelectorAll("[data-thumb]").forEach(function (x) { x.classList.remove("active"); });
      th.classList.add("active");
    });
  });
  box.querySelectorAll("[data-color]").forEach(function (b) {
    b.addEventListener("click", function () {
      selColor = colors[Number(b.dataset.color)];
      $("selColorName").textContent = cname(selColor);
      box.querySelectorAll("[data-color]").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      selVariantId = findVariantId(p, selColor.name_en, selSize);
    });
  });
  box.querySelectorAll("[data-size]").forEach(function (b) {
    b.addEventListener("click", function () {
      selSize = b.dataset.size;
      box.querySelectorAll("[data-size]").forEach(function (x) { x.classList.remove("active"); });
      b.classList.add("active");
      selVariantId = findVariantId(p, selColor ? selColor.name_en : null, selSize);
    });
  });
  var qv = $("qtyVal");
  $("qtyMinus").addEventListener("click", function () { selQty = Math.max(1, selQty - 1); qv.textContent = selQty; });
  $("qtyPlus").addEventListener("click", function () { selQty = Math.min(99, selQty + 1); qv.textContent = selQty; });
  var acb = $("addCartBtn");
  if (acb) acb.addEventListener("click", function () {
    if (sizes.length && !selSize) { toast(t("choose_size")); return; }
    if (colors.length && !selColor) { toast(t("choose_color")); return; }
    addToCart(p, selColor, selSize, selQty, selVariantId);
  });
  var bnb = $("buyNowBtn");
  if (bnb) bnb.addEventListener("click", function () {
    if (sizes.length && !selSize) { toast(t("choose_size")); return; }
    if (colors.length && !selColor) { toast(t("choose_color")); return; }
    addToCart(p, selColor, selSize, selQty, selVariantId);
    location.hash = "#/checkout";
  });
  var wb = $("wishBtn");
  if (wb) wb.addEventListener("click", function () { toggleWish(p.id); });
  var rf = $("reviewForm");
  if (rf) rf.addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = rf.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      await api("add-review", { product_id: Number(p.id), rating: Number($("rvRating").value), title: $("rvTitle").value.trim(), body: $("rvBody").value.trim() });
      setMsg($("rvMsg"), t("review_sent"), "ok"); rf.reset();
    } catch (err) { setMsg($("rvMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
}
function baseCatName(p) {
  var g = p.gender || p.category_slug;
  var gl = GENDER_LABEL[g] ? GENDER_LABEL[g][state.lang === "ar" ? 0 : 1] : g;
  if (p.subcategory) return gl + " / " + subcatLabel(g, p.subcategory);
  return gl;
}

/* ---------- السلة ---------- */
function shippingFee(subtotal) {
  var s = state.settings || fbSettings();
  if (subtotal >= Number(s.free_shipping_threshold || 0) && Number(s.free_shipping_threshold || 0) > 0) return 0;
  return Number(s.shipping_fee_cairo || 35);
}
function totals() {
  var sub = cartSubtotal();
  var disc = state.coupon ? Number(state.coupon.discount_egp || 0) : 0;
  var ship = state.cart.length ? shippingFee(sub - disc) : 0;
  return { sub: sub, disc: disc, ship: ship, total: Math.max(0, sub - disc + ship) };
}
function renderCart() {
  var box = $("cartContent");
  if (!state.cart.length) {
    box.innerHTML = '<p class="empty">' + esc(t("cart_empty")) + '</p><p style="text-align:center"><a href="#/shop" class="btn btn-dark">' + esc(t("cart_empty_cta")) + "</a></p>";
    return;
  }
  var tt = totals();
  var h = '<div class="cart-layout"><div>';
  state.cart.forEach(function (it, i) {
    h += '<div class="cart-item"><a href="#/product/' + it.product_id + '"><img src="' + esc(it.image || "") + '" alt=""></a>' +
      '<div><h3><a href="#/product/' + it.product_id + '">' + esc(L(it.name_ar, it.name_en)) + "</a></h3>" +
      '<p class="muted small">' + esc([it.color_name_ar || it.color_name_en, it.size].filter(Boolean).join(" • ")) + "</p>" +
      '<p class="muted small">' + esc(fmtPrice(it.price_egp)) + " " + esc(t("per_item")) + "</p>" +
      '<div class="qty-row"><button data-dec="' + i + '">−</button><strong>' + it.qty + '</strong><button data-inc="' + i + '">+</button>' +
      ' <button class="linklike" data-del="' + i + '">' + esc(t("remove")) + "</button></div></div>" +
      '<strong>' + esc(fmtPrice(Number(it.price_egp) * Number(it.qty))) + "</strong></div>";
  });
  h += '<p><button class="linklike" id="clearCartBtn">' + esc(t("clear_cart")) + "</button> • <a href=\"#/shop\" class=\"linklike\">" + esc(t("continue_shopping")) + "</a></p></div>";
  h += '<div class="summary"><h3>' + esc(t("order_summary")) + "</h3>" +
    '<p class="coupon-label">' + esc(t("have_coupon")) + "</p>" +
    '<div class="coupon-row"><input type="text" id="couponInput" placeholder="' + esc(t("coupon_ph")) + '" value="' + esc(state.coupon ? state.coupon.code : "") + '" dir="ltr"><button class="btn btn-dark" id="couponBtn">' + esc(t("apply")) + "</button></div>" +
    '<p class="form-msg" id="couponMsg" role="alert">' + (state.coupon ? esc(t("coupon_ok")) + " (" + esc(state.coupon.code) + ")" : "") + "</p>" +
    (state.coupon ? '<p><button class="linklike" id="couponRemoveBtn">' + esc(t("remove_coupon")) + "</button></p>" : "") +
    '<div class="summary-row"><span>' + esc(t("subtotal")) + "</span><strong>" + esc(fmtPrice(tt.sub)) + "</strong></div>" +
    (tt.disc ? '<div class="summary-row"><span>' + esc(t("discount")) + "</span><strong>−" + esc(fmtPrice(tt.disc)) + "</strong></div>" : "") +
    '<div class="summary-row"><span>' + esc(t("shipping")) + "</span><strong>" + (tt.ship === 0 ? esc(t("free")) : esc(fmtPrice(tt.ship))) + "</strong></div>" +
    (tt.ship > 0 && state.settings ? '<div class="free-ship">🎉 ' + (state.lang === "ar" ? "الشحن مجاني للطلبات فوق " : "Free shipping for orders over ") + esc(fmtPrice(state.settings.free_shipping_threshold)) + "</div>" : "") +
    '<div class="summary-row total"><span>' + esc(t("total")) + "</span><strong>" + esc(fmtPrice(tt.total)) + "</strong></div>" +
    '<a href="#/checkout" class="btn btn-dark btn-block btn-lg" style="margin-top:1rem">' + esc(t("go_checkout")) + "</a></div></div>";
  box.innerHTML = h;
  box.querySelectorAll("[data-inc]").forEach(function (b) { b.addEventListener("click", function () { setCartQty(Number(b.dataset.inc), state.cart[Number(b.dataset.inc)].qty + 1); }); });
  box.querySelectorAll("[data-dec]").forEach(function (b) { b.addEventListener("click", function () { setCartQty(Number(b.dataset.dec), state.cart[Number(b.dataset.dec)].qty - 1); }); });
  box.querySelectorAll("[data-del]").forEach(function (b) { b.addEventListener("click", function () { removeFromCart(Number(b.dataset.del)); }); });
  $("clearCartBtn").addEventListener("click", function () { state.cart = []; state.coupon = null; saveCart(); saveCoupon(); syncCartServer(); renderCart(); });
  $("couponBtn").addEventListener("click", async function () {
    var code = $("couponInput").value.trim();
    if (!code) return;
    if (!state.user) { setMsg($("couponMsg"), t("coupon_login"), "error"); return; }
    setMsg($("couponMsg"), t("loading"));
    try {
      var d = await api("validate-coupon", { code: code, subtotal_egp: cartSubtotal() });
      if (d.valid === false) throw new Error(t("coupon_bad"));
      state.coupon = { code: code.toUpperCase(), type: d.type, value: d.value, discount_egp: Number(d.discount_egp || 0) };
      saveCoupon(); renderCart();
    } catch (e) { state.coupon = null; saveCoupon(); renderCart(); setMsg($("couponMsg"), e.message || t("coupon_bad"), "error"); }
  });
  var crb = $("couponRemoveBtn");
  if (crb) crb.addEventListener("click", function () { state.coupon = null; saveCoupon(); renderCart(); });
}

/* ---------- إتمام الشراء ---------- */
var checkoutAddressId = "", checkoutNewAddress = null;
function checkoutSummaryHTML() {
  var tt = totals();
  return '<h3>' + esc(t("order_summary")) + "</h3>" +
    '<p class="coupon-label">' + esc(t("have_coupon")) + "</p>" +
    '<div class="coupon-row"><input type="text" id="coCouponInput" placeholder="' + esc(t("coupon_ph")) + '" value="' + esc(state.coupon ? state.coupon.code : "") + '" dir="ltr"><button class="btn btn-dark" id="coCouponBtn" type="button">' + esc(t("apply")) + "</button></div>" +
    '<p class="form-msg" id="coCouponMsg" role="alert">' + (state.coupon ? esc(t("coupon_ok")) + " (" + esc(state.coupon.code) + ")" : "") + "</p>" +
    (state.coupon ? '<p><button class="linklike" id="coCouponRemoveBtn" type="button">' + esc(t("remove_coupon")) + "</button></p>" : "") +
    state.cart.map(function (it) {
      return '<div class="summary-row"><span>' + esc(L(it.name_ar, it.name_en)) + " × " + it.qty + '</span><strong>' + esc(fmtPrice(Number(it.price_egp) * Number(it.qty))) + "</strong></div>";
    }).join("") +
    '<div class="summary-row"><span>' + esc(t("subtotal")) + "</span><strong>" + esc(fmtPrice(tt.sub)) + "</strong></div>" +
    (tt.disc ? '<div class="summary-row"><span>' + esc(t("discount")) + (state.coupon ? " (" + esc(state.coupon.code) + ")" : "") + "</span><strong>−" + esc(fmtPrice(tt.disc)) + "</strong></div>" : "") +
    '<div class="summary-row"><span>' + esc(t("shipping")) + "</span><strong>" + (tt.ship === 0 ? esc(t("free")) : esc(fmtPrice(tt.ship))) + "</strong></div>" +
    '<div class="summary-row total"><span>' + esc(t("total")) + "</span><strong>" + esc(fmtPrice(tt.total)) + "</strong></div>";
}
function refreshCheckoutSummary() {
  var s = $("coSummary"); if (!s) return;
  s.innerHTML = checkoutSummaryHTML();
  bindCheckoutCoupon();
}
function bindCheckoutCoupon() {
  var b = $("coCouponBtn"); if (!b) return;
  b.addEventListener("click", async function () {
    var code = $("coCouponInput").value.trim();
    if (!code) return;
    if (!state.user) { setMsg($("coCouponMsg"), t("coupon_login"), "error"); return; }
    setMsg($("coCouponMsg"), t("loading"));
    try {
      var d = await api("validate-coupon", { code: code, subtotal_egp: cartSubtotal() });
      if (d.valid === false) throw new Error(t("coupon_bad"));
      state.coupon = { code: code.toUpperCase(), type: d.type, value: d.value, discount_egp: Number(d.discount_egp || 0) };
      saveCoupon(); refreshCheckoutSummary();
    } catch (e) { state.coupon = null; saveCoupon(); refreshCheckoutSummary(); setMsg($("coCouponMsg"), e.message || t("coupon_bad"), "error"); }
  });
  var rb = $("coCouponRemoveBtn");
  if (rb) rb.addEventListener("click", function () { state.coupon = null; saveCoupon(); refreshCheckoutSummary(); });
}
async function renderCheckout() {
  var box = $("checkoutContent");
  if (!state.cart.length) {
    box.innerHTML = '<p class="empty">' + esc(t("cart_empty")) + '</p><p style="text-align:center"><a href="#/shop" class="btn btn-dark">' + esc(t("cart_empty_cta")) + "</a></p>";
    return;
  }
  var addresses = [];
  if (state.user) {
    try { var d = await api("list-addresses"); addresses = d.addresses || d || []; } catch (e) { addresses = []; }
  }
  var h = '<p class="muted">' + esc(t("guest_checkout_note")) + "</p>" +
    '<div class="cart-layout"><div>' +
    '<form id="checkoutForm"><div class="card" style="margin-bottom:1rem"><h3>' + esc(t("customer_info")) + "</h3>" +
    '<label>' + esc(t("full_name")) + ' <input type="text" id="coName" required value="' + esc(state.user ? (state.user.name || "") : "") + '"></label>' +
    '<label>' + esc(t("phone")) + ' <input type="tel" id="coPhone" required dir="ltr" value="' + esc(state.user ? (state.user.phone || "") : "") + '"></label>' +
    '<label>' + esc(t("email")) + ' <input type="email" id="coEmail" required dir="ltr" value="' + esc(state.user ? (state.user.email || "") : "") + '"></label></div>' +
    '<div class="card" style="margin-bottom:1rem"><h3>' + esc(t("address_pick")) + "</h3>";
  if (addresses.length) {
    h += '<label>' + esc(t("select_address")) + ' <select id="coAddressSel">' +
      addresses.map(function (a) {
        return '<option value="' + esc(a.id) + '"' + (a.is_default ? " selected" : "") + ">" + esc(a.label || "") + " — " + esc(a.city || "") + "، " + esc(a.address_line || "") + "</option>";
      }).join("") + '<option value="">' + esc(t("new_address")) + "</option></select></label>";
    checkoutAddressId = addresses.find(function (a) { return a.is_default; }) ? addresses.find(function (a) { return a.is_default; }).id : addresses[0].id;
  } else {
    h += '<p class="muted small">' + esc(t("no_address")) + "</p>";
  }
  h += '<div id="coNewAddr">' +
    '<label>' + esc(t("label")) + ' <input type="text" id="coLabel" value="البيت"></label>' +
    '<label>' + esc(t("city")) + ' <input type="text" id="coCity" required></label>' +
    '<label>' + esc(t("address_line")) + ' <input type="text" id="coAddr" required></label>' +
    '<label>' + esc(t("country")) + ' <input type="text" id="coCountry" value="مصر"></label></div></div>' +
    '<div class="card"><h3>' + esc(t("payment_method")) + "</h3>" +
    '<label style="display:flex;gap:.5rem;align-items:center"><input type="radio" name="pay" value="cod" checked style="width:auto"> 💵 ' + esc(t("cod")) + "</label>" +
    '<p class="muted small">' + esc(t("cod_note")) + "</p></div>" +
    '<button class="btn btn-dark btn-block btn-lg" type="submit" style="margin-top:1rem">' + esc(t("place_order")) + "</button>" +
    '<p class="form-msg" id="coMsg" role="alert"></p></form></div>' +
    '<div class="summary" id="coSummary">' + checkoutSummaryHTML() + "</div></div>";
  box.innerHTML = h;
  bindCheckoutCoupon();
  var sel = $("coAddressSel"), newAddr = $("coNewAddr");
  if (sel) {
    newAddr.style.display = sel.value === "" ? "block" : "none";
    sel.addEventListener("change", function () {
      checkoutAddressId = sel.value;
      newAddr.style.display = sel.value === "" ? "block" : "none";
    });
  }
  $("checkoutForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true; setMsg($("coMsg"), t("placing"));
    var payload = {
      items: state.cart.map(function (it) { return { product_id: it.product_id, variant_id: it.variant_id || null, qty: it.qty }; }),
      payment_method: "cod"
    };
    if (state.coupon) payload.coupon_code = state.coupon.code;
    if (checkoutAddressId && sel && sel.value) payload.address_id = checkoutAddressId;
    else {
      payload.address = {
        label: $("coLabel").value.trim() || "البيت", full_name: $("coName").value.trim(),
        phone: $("coPhone").value.trim(), country: $("coCountry").value.trim() || "مصر",
        city: $("coCity").value.trim(), address_line: $("coAddr").value.trim()
      };
    }
    try {
      var d = await api("place-order", payload);
      var order = d.order || d;
      state.lastOrder = order;
      state.cart = []; state.coupon = null; saveCart(); saveCoupon(); syncCartServer();
      setMsg($("coMsg"), t("order_ok") + (order.order_number || ""), "ok");
      toast(t("order_ok") + (order.order_number || ""));
      if (order.order_number) location.hash = "#/order/" + encodeURIComponent(order.order_number);
      else location.hash = "#/orders";
    } catch (err) {
      setMsg($("coMsg"), t("order_fail") + (err.message || t("err_generic")), "error");
    } finally { btn.disabled = false; }
  });
}

/* ---------- البحث ---------- */
async function renderSearch(q) {
  $("searchTitle").textContent = t("search_results_for") + " “" + q + "”";
  var box = $("searchContent");
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  if (!q) { box.innerHTML = '<p class="empty">' + esc(t("search_ph")) + "</p>"; return; }
  try {
    var d = await apiRead("list-products", { q: q, page_size: 24, sort: "popular" });
    var items = d.items || [];
    box.innerHTML = items.length
      ? '<p class="muted"><strong>' + items.length + "</strong> " + esc(t("results_count")) + '</p><div class="products-grid">' + items.map(productCard).join("") + "</div>"
      : '<p class="empty">' + esc(t("no_results")) + "</p>";
    bindCards(box);
  } catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
}

/* ---------- المفضلة ---------- */
async function renderWishlist() {
  var box = $("wishlistContent");
  if (!state.wishlist.length) { box.innerHTML = '<p class="empty">' + esc(t("wish_empty")) + '</p><p style="text-align:center"><a href="#/shop" class="btn btn-dark">' + esc(t("cart_empty_cta")) + "</a></p>"; return; }
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var items = [];
  for (var i = 0; i < state.wishlist.length; i++) {
    try {
      var d = await apiRead("get-product", { id: Number(state.wishlist[i]) });
      items.push(d.product);
    } catch (e) {
      for (var j = 0; j < FALLBACK_PRODUCTS.length; j++) if (String(FALLBACK_PRODUCTS[j].id) === String(state.wishlist[i])) items.push(FALLBACK_PRODUCTS[j]);
    }
  }
  box.innerHTML = items.length
    ? '<div class="products-grid">' + items.map(productCard).join("") + "</div>"
    : '<p class="empty">' + esc(t("wish_empty")) + "</p>";
  bindCards(box);
}

/* ---------- المصادقة ---------- */
function saveSession(data) {
  if (data && data.session) {
    state.session = data.session;
    storeLocal(SESSION_KEY, data.session);
  }
  if (data && data.user) state.user = data.user;
  applyAuthUI();
}
function applyAuthUI() {
  var loggedIn = !!state.user;
  var isAdmin = loggedIn && state.user.role === "admin";
  document.querySelectorAll(".guest-only").forEach(function (el) { el.hidden = loggedIn; });
  document.querySelectorAll(".auth-only").forEach(function (el) { el.hidden = !loggedIn; });
  var chip = $("userChip");
  if (chip) chip.textContent = loggedIn ? "👋 " + (state.user.name || state.user.email || "") + (isAdmin ? " (أدمن)" : "") : "";
  var al = $("adminLink"); if (al) al.hidden = !isAdmin;
  var lb = $("loginBtn"); if (lb) lb.hidden = loggedIn;
  var lo = $("logoutBtn"); if (lo) lo.hidden = !loggedIn;
}
async function restoreSession() {
  if (!state.session || !state.session.access_token) { state.user = null; applyAuthUI(); return; }
  try {
    var d = await api("me");
    state.user = d.user || d;
    applyAuthUI();
    await syncWishlist();
  } catch (e) {
    // نمسح الجلسة فقط لو التوكن مرفوض (401)؛ خطأ الشبكة لا يلغي تسجيل الدخول
    if (e && e.status === 401) {
      state.user = null; state.session = null;
      try { localStorage.removeItem(SESSION_KEY); } catch (ex) {}
    } else {
      state.user = null;
    }
    applyAuthUI();
  }
}
async function syncWishlist() {
  if (!state.user) return;
  try {
    var d = await api("wishlist-list");
    var items = d.items || d.wishlist || d || [];
    var ids = items.map(function (w) { return Number(w.product_id != null ? w.product_id : w.id); }).filter(function (n) { return !isNaN(n); });
    var merged = state.wishlist.slice();
    ids.forEach(function (id) { if (merged.indexOf(id) < 0) merged.push(id); });
    state.wishlist = merged; saveWish();
  } catch (e) { /* المفضلة المحلية تكفي لو السيرفر غايب */ }
}
async function afterLogin(data) {
  saveSession(data);
  toast(t("login_ok"));
  await mergeGuestCart();
  await syncWishlist();
  if (state.user && state.user.role === "admin") location.hash = "#/admin";
  else location.hash = "#/";
}

/* ---------- الحساب: بروفايل / عناوين / طلبات ---------- */
async function renderProfile() {
  var box = $("profileContent");
  box.innerHTML = '<div class="card" style="max-width:640px"><h3>' + esc(t("profile_title")) + "</h3>" +
    '<form id="profileForm"><label>' + esc(t("f_name")) + ' <input type="text" id="pfName" required value="' + esc(state.user.name || "") + '"></label>' +
    '<label>' + esc(t("email")) + ' <input type="email" value="' + esc(state.user.email || "") + '" disabled dir="ltr"></label>' +
    '<label>' + esc(t("f_phone")) + ' <input type="tel" id="pfPhone" dir="ltr" value="' + esc(state.user.phone || "") + '"></label>' +
    '<button class="btn btn-dark" type="submit">' + esc(t("save")) + '</button></form>' +
    '<p class="form-msg" id="pfMsg" role="alert"></p>' +
    '<p class="muted small">' + (state.lang === "ar" ? "عضو منذ: " : "Member since: ") + esc(fmtDate(state.user.created_at)) + (state.user.role === "admin" ? ' • <span class="status approved">أدمن</span>' : "") + "</p></div>";
  $("profileForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    try {
      var d = await api("update-profile", { name: $("pfName").value.trim(), phone: $("pfPhone").value.trim() });
      if (d.user) state.user = d.user;
      setMsg($("pfMsg"), t("profile_saved"), "ok");
    } catch (err) { setMsg($("pfMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
}
function addressFormHTML(a) {
  a = a || {};
  return '<form class="card form-card" id="addrForm">' +
    '<input type="hidden" id="addrId" value="' + esc(a.id || "") + '">' +
    '<label>' + esc(t("label")) + ' <input type="text" id="addrLabel" required value="' + esc(a.label || "البيت") + '"></label>' +
    '<label>' + esc(t("full_name")) + ' <input type="text" id="addrName" required value="' + esc(a.full_name || state.user.name || "") + '"></label>' +
    '<label>' + esc(t("phone")) + ' <input type="tel" id="addrPhone" required dir="ltr" value="' + esc(a.phone || state.user.phone || "") + '"></label>' +
    '<label>' + esc(t("city")) + ' <input type="text" id="addrCity" required value="' + esc(a.city || "") + '"></label>' +
    '<label>' + esc(t("address_line")) + ' <input type="text" id="addrLine" required value="' + esc(a.address_line || "") + '"></label>' +
    '<label>' + esc(t("country")) + ' <input type="text" id="addrCountry" value="' + esc(a.country || "مصر") + '"></label>' +
    '<div style="display:flex;gap:.5rem"><button class="btn btn-dark" type="submit">' + esc(t("save")) + '</button>' +
    '<button class="btn btn-ghost" type="button" id="addrCancel">' + esc(t("cancel")) + "</button></div>" +
    '<p class="form-msg" id="addrMsg" role="alert"></p></form>';
}
async function renderAddresses() {
  var box = $("addressesContent");
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var list = [];
  try { var d = await api("list-addresses"); list = d.addresses || d || []; }
  catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; return; }
  var h = '<p><button class="btn btn-dark" id="addAddrBtn">+ ' + esc(t("add_new")) + '</button></p><div id="addrFormBox"></div>';
  h += list.length ? list.map(function (a) {
    return '<div class="address-card' + (a.is_default ? " default" : "") + '"><strong>' + esc(a.label || "") + "</strong> " +
      (a.is_default ? '<span class="status approved">' + esc(t("default_badge")) + "</span>" : "") +
      "<br>" + esc(a.full_name || "") + " • <span dir=\"ltr\">" + esc(a.phone || "") + "</span><br>" +
      esc(a.address_line || "") + "، " + esc(a.city || "") + "، " + esc(a.country || "مصر") +
      '<div style="margin-top:.6rem;display:flex;gap:.5rem;flex-wrap:wrap">' +
      '<button class="btn btn-ghost btn-sm" data-addr-edit="' + esc(a.id) + '">' + esc(t("edit")) + "</button>" +
      '<button class="btn btn-ghost btn-sm" data-addr-del="' + esc(a.id) + '">' + esc(t("del")) + "</button>" +
      (a.is_default ? "" : '<button class="btn btn-ghost btn-sm" data-addr-def="' + esc(a.id) + '">' + esc(t("set_default")) + "</button>") +
      "</div></div>";
  }).join("") : '<p class="empty">' + esc(t("no_address")) + "</p>";
  box.innerHTML = h;
  var formBox = $("addrFormBox");
  function openForm(a) {
    formBox.innerHTML = addressFormHTML(a);
    $("addrCancel").addEventListener("click", function () { formBox.innerHTML = ""; });
    $("addrForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var payload = {
        label: $("addrLabel").value.trim(), full_name: $("addrName").value.trim(),
        phone: $("addrPhone").value.trim(), city: $("addrCity").value.trim(),
        address_line: $("addrLine").value.trim(), country: $("addrCountry").value.trim() || "مصر"
      };
      var id = $("addrId").value;
      try {
        if (id) await api("update-address", Object.assign({ id: id }, payload));
        else await api("add-address", payload);
        setMsg($("addrMsg"), t("address_saved"), "ok");
        renderAddresses();
      } catch (err) { setMsg($("addrMsg"), err.message || t("err_generic"), "error"); }
    });
  }
  $("addAddrBtn").addEventListener("click", function () { openForm(null); });
  box.querySelectorAll("[data-addr-edit]").forEach(function (b) {
    b.addEventListener("click", function () {
      var a = list.find(function (x) { return String(x.id) === String(b.dataset.addrEdit); });
      openForm(a);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  box.querySelectorAll("[data-addr-del]").forEach(function (b) {
    b.addEventListener("click", async function () {
      if (!confirm(t("del") + "?")) return;
      try { await api("delete-address", { id: b.dataset.addrDel }); toast(t("address_deleted")); renderAddresses(); }
      catch (err) { toast(err.message || t("err_generic")); }
    });
  });
  box.querySelectorAll("[data-addr-def]").forEach(function (b) {
    b.addEventListener("click", async function () {
      try { await api("set-default-address", { id: b.dataset.addrDef }); toast(t("address_default")); renderAddresses(); }
      catch (err) { toast(err.message || t("err_generic")); }
    });
  });
}
function orderStatusLabel(s) {
  return { pending: t("status_pending"), confirmed: t("status_confirmed"), shipped: t("status_shipped"), delivered: t("status_delivered"), cancelled: t("status_cancelled") }[s] || s;
}
async function renderOrders() {
  var box = $("ordersContent");
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var list = [];
  try { var d = await api("my-orders"); list = d.orders || d || []; }
  catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; return; }
  if (!list.length) { box.innerHTML = '<p class="empty">' + esc(t("my_orders_empty")) + '</p><p style="text-align:center"><a href="#/shop" class="btn btn-dark">' + esc(t("cart_empty_cta")) + "</a></p>"; return; }
  box.innerHTML = list.map(function (o) {
    return '<div class="order-card"><div><strong dir="ltr">' + esc(o.order_number) + "</strong> • " + esc(fmtDate(o.created_at)) +
      '<br><span class="status ' + esc(o.status) + '">' + esc(orderStatusLabel(o.status)) + "</span> " +
      '<span class="status">' + (o.payment_status === "paid" ? esc(t("pay_paid")) : esc(t("pay_pending"))) + "</span>" +
      '<br><span class="muted small">' + Number(o.items_count || 0) + " " + esc(t("items_count")) + "</span></div>" +
      '<div style="text-align:end"><strong>' + esc(fmtPrice(o.total_egp)) + "</strong><br>" +
      '<a href="#/order/' + esc(o.order_number) + '" class="btn btn-ghost btn-sm">' + esc(t("view_order")) + "</a> " +
      ((o.status === "pending" || o.status === "confirmed") ? '<button class="btn btn-danger btn-sm" data-cancel-order="' + esc(o.id || o.order_number) + '">' + esc(t("cancel_order")) + "</button>" : "") +
      "</div></div>";
  }).join("");
  box.querySelectorAll("[data-cancel-order]").forEach(function (b) {
    b.addEventListener("click", async function () {
      if (!b.dataset.armed) {
        b.dataset.armed = "1";
        b.dataset.origText = b.textContent;
        b.textContent = t("tap_again_cancel");
        setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = b.dataset.origText || t("cancel_order"); } }, 5000);
        return;
      }
      b.disabled = true;
      try { await api("cancel-order", { order_id: b.dataset.cancelOrder }); toast(t("order_cancelled")); renderOrders(); }
      catch (err) { toast(err.message || t("err_generic")); b.disabled = false; delete b.dataset.armed; b.textContent = b.dataset.origText || t("cancel_order"); }
    });
  });
}
function trackStepsHTML(status) {
  var steps = ["pending", "confirmed", "shipped", "delivered"];
  var ix = steps.indexOf(status);
  if (status === "cancelled") ix = -1;
  return '<div class="track-steps">' + steps.map(function (s, i) {
    return '<div class="track-step' + (i <= ix ? " done" : "") + '">' + esc(orderStatusLabel(s)) + "</div>";
  }).join("") + "</div>" + (status === "cancelled" ? '<p class="form-msg error">' + esc(t("status_cancelled")) + "</p>" : "");
}
async function renderOrderDetails(number) {
  var box = $("orderDetailsContent");
  var isAdmin = !!(state.user && state.user.role === "admin");
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var o;
  try {
    var d = await api("get-order", { order_number: number });
    o = d.order || d;
  } catch (e) {
    box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>" +
      '<p style="text-align:center"><a href="#/' + (isAdmin ? "admin" : "orders") + '" class="btn btn-dark">' + esc(isAdmin ? t("orders") : t("back_to_orders")) + "</a></p>";
    return;
  }
  var a = o.address || o.address_snapshot || {};
  if (typeof a === "string") { try { a = JSON.parse(a); } catch (e2) { a = {}; } }
  var items = o.items || [];
  var phone = (a.phone || "").toString().trim();
  var telHref = phone.replace(/[^+0-9]/g, "");
  var addrLines = [a.full_name, a.address_line, a.city, a.country].filter(function (x) { return (x || "").toString().trim() !== ""; });
  var h = '<div class="card"><h3 dir="ltr">' + esc(o.order_number || number) + "</h3>" +
    trackStepsHTML(o.status) +
    '<p><strong>' + esc(t("order_date")) + ':</strong> ' + esc(fmtDate(o.created_at)) + "<br>" +
    "<strong>" + esc(t("payment_method")) + ":</strong> " + esc(o.payment_method === "cod" ? t("cod") : (o.payment_method || "")) + " — " + esc(o.payment_status === "paid" ? t("pay_paid") : t("pay_pending")) + "<br>" +
    "<strong>" + esc(t("payment_status")) + ":</strong> " + esc(o.payment_status === "paid" ? t("pay_paid") : t("pay_pending")) + "</p>" +
    '<h4>' + esc(t("customer_info")) + "</h4><p>" +
    "<strong>" + esc(t("full_name")) + ":</strong> " + esc(o.customer_name || a.full_name || "—") + "<br>" +
    "<strong>" + esc(t("email")) + ":</strong> " + ((o.customer_email || a.email) ? '<a href="mailto:' + esc(o.customer_email || a.email) + '" dir="ltr">' + esc(o.customer_email || a.email) + "</a>" : "—") + "<br>" +
    "<strong>" + esc(t("phone")) + ":</strong> " + (phone && telHref ? '<a href="tel:' + esc(telHref) + '" dir="ltr">' + esc(phone) + "</a>" : esc(phone || "—")) + "</p>" +
    '<h4>' + esc(t("order_address")) + "</h4><p>" + (addrLines.length ? esc(addrLines.join("، ")) : "—") + (phone ? "<br>" + esc(t("phone")) + ": " + esc(phone) : "") + "</p>" +
    (items.length ? "<h4>" + esc(t("order_items")) + "</h4>" + items.map(function (it) {
      return '<div class="summary-row"><span>' + esc(it.product_name_ar || it.product_name_en || "") + " × " + Number(it.qty || 0) +
        (it.size ? " (" + esc(it.size) + ")" : "") + (it.color_name_ar ? " — " + esc(it.color_name_ar) : "") + "</span><strong>" + esc(fmtPrice(Number(it.price_egp || 0) * Number(it.qty || 0))) + "</strong></div>";
    }).join("") : "") +
    '<h4>' + esc(t("order_summary")) + "</h4>" +
    '<div class="summary-row"><span>' + esc(t("subtotal")) + "</span><strong>" + esc(fmtPrice(Number(o.subtotal_egp || 0))) + "</strong></div>" +
    (Number(o.discount_egp || 0) ? '<div class="summary-row"><span>' + esc(t("discount")) + (o.coupon_code ? " (" + esc(o.coupon_code) + ")" : "") + "</span><strong>−" + esc(fmtPrice(Number(o.discount_egp || 0))) + "</strong></div>" : "") +
    '<div class="summary-row"><span>' + esc(t("shipping")) + "</span><strong>" + (Number(o.shipping_egp || 0) === 0 ? esc(t("free")) : esc(fmtPrice(Number(o.shipping_egp || 0)))) + "</strong></div>" +
    '<div class="summary-row total"><span>' + esc(t("total")) + "</span><strong>" + esc(fmtPrice(Number(o.total_egp || 0))) + "</strong></div>" +
    "</div>";
  if (isAdmin) {
    h += '<div class="card" style="margin-top:1rem"><h4>' + esc(t("update_status")) + "</h4>" +
      '<div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center"><select id="ordDetStatus">' +
      ["pending", "confirmed", "shipped", "delivered", "cancelled"].map(function (s) {
        return '<option value="' + s + '"' + (o.status === s ? " selected" : "") + ">" + esc(orderStatusLabel(s)) + "</option>";
      }).join("") + "</select>" +
      '<button class="btn btn-dark" id="ordDetUpdate">' + esc(t("update_status")) + "</button></div>" +
      '<p class="form-msg" id="ordDetMsg" role="alert"></p></div>';
  }
  if (!isAdmin && (o.status === "pending" || o.status === "confirmed") && o.id) {
    h += '<p style="margin-top:1rem"><button class="btn btn-danger" id="ordDetCancel">' + esc(t("cancel_order")) + "</button></p>";
  }
  h += '<p style="margin-top:1rem"><a href="#/' + (isAdmin ? "admin" : "orders") + '" class="btn btn-ghost">' + esc(isAdmin ? t("orders") : t("back_to_orders")) + "</a></p>";
  box.innerHTML = h;
  var ub = $("ordDetUpdate");
  if (ub) ub.addEventListener("click", async function () {
    ub.disabled = true; setMsg($("ordDetMsg"), t("loading"));
    try { await api("admin-order-update", { id: o.id, status: $("ordDetStatus").value }); setMsg($("ordDetMsg"), t("profile_saved"), "ok"); renderOrderDetails(number); }
    catch (err) { setMsg($("ordDetMsg"), err.message || t("err_generic"), "error"); }
    finally { ub.disabled = false; }
  });
  var cb = $("ordDetCancel");
  if (cb) cb.addEventListener("click", async function () {
    if (!cb.dataset.armed) {
      cb.dataset.armed = "1";
      cb.dataset.origText = cb.textContent;
      cb.textContent = t("tap_again_cancel");
      setTimeout(function () { if (cb.isConnected) { delete cb.dataset.armed; cb.textContent = cb.dataset.origText || t("cancel_order"); } }, 5000);
      return;
    }
    cb.disabled = true;
    try { await api("cancel-order", { order_id: o.id }); toast(t("order_cancelled")); renderOrderDetails(number); }
    catch (err) { toast(err.message || t("err_generic")); cb.disabled = false; delete cb.dataset.armed; cb.textContent = cb.dataset.origText || t("cancel_order"); }
  });
}
async function renderTracking(number) {
  var box = $("orderTrackingContent");
  var preNum = number || (state.lastOrder ? state.lastOrder.order_number : "");
  var h = '<div class="card form-card"><form id="trackForm">' +
    '<label>' + esc(t("track_num")) + ' <input type="text" id="trackNum" required dir="ltr" value="' + esc(preNum || "") + '" placeholder="ITL-1001"></label>' +
    '<label>' + esc(t("f_email")) + ' <input type="email" id="trackEmail" required dir="ltr" value="' + esc(state.user ? state.user.email : "") + '"></label>' +
    '<button class="btn btn-dark btn-block" type="submit">' + esc(t("track_btn")) + '</button></form>' +
    '<p class="form-msg" id="trackMsg" role="alert"></p></div><div id="trackResult"></div>';
  box.innerHTML = h;
  async function doTrack(num, email) {
    var res = $("trackResult");
    res.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
    try {
      var d;
      if (state.user) {
        try { d = await api("get-order", { order_number: num }); d = { order: d.order || d }; }
        catch (e) { d = await api("track-order", { order_number: num, email: email }); }
      } else {
        d = await api("track-order", { order_number: num, email: email });
      }
      var o = d.order || d;
      var items = o.items || [];
      res.innerHTML = '<div class="card" style="margin-top:1rem"><h3 dir="ltr">' + esc(o.order_number) + '</h3>' +
        trackStepsHTML(o.status) +
        '<p><strong>' + esc(t("order_date")) + ':</strong> ' + esc(fmtDate(o.created_at)) + "<br>" +
        "<strong>" + esc(t("total")) + ":</strong> " + esc(fmtPrice(o.total_egp)) + "<br>" +
        "<strong>" + esc(t("payment_method")) + ":</strong> " + esc(t("cod")) + " — " + esc(o.payment_status === "paid" ? t("pay_paid") : t("pay_pending")) + "</p>" +
        (items.length ? "<h4>" + esc(t("order_items")) + "</h4>" + items.map(function (it) {
          return '<div class="summary-row"><span>' + esc(it.product_name_ar || it.product_name_en || "") + " × " + Number(it.qty || 0) +
            (it.size ? " (" + esc(it.size) + ")" : "") + (it.color_name_ar ? " — " + esc(it.color_name_ar) : "") + "</span><strong>" + esc(fmtPrice(it.price_egp)) + "</strong></div>";
        }).join("") : "") +
        (o.address_snapshot ? "<h4>" + esc(t("order_address")) + "</h4><p class=\"muted\">" + esc(typeof o.address_snapshot === "string" ? o.address_snapshot : [o.address_snapshot.address_line, o.address_snapshot.city, o.address_snapshot.country].filter(Boolean).join("، ")) + "</p>" : "") +
        ((o.status === "pending" || o.status === "confirmed") && state.user
          ? '<button class="btn btn-danger" id="trackCancel">' + esc(t("cancel_order")) + "</button>" : "") +
        "</div>";
      var cb = $("trackCancel");
      if (cb) cb.addEventListener("click", async function () {
        if (!confirm(t("confirm_cancel"))) return;
        try { await api("cancel-order", { order_id: o.id }); toast(t("order_cancelled")); doTrack(num, email); }
        catch (err) { toast(err.message || t("err_generic")); }
      });
    } catch (err) { res.innerHTML = '<p class="form-msg error">' + esc(err.message || t("err_load")) + "</p>"; }
  }
  $("trackForm").addEventListener("submit", function (e) {
    e.preventDefault();
    doTrack($("trackNum").value.trim(), $("trackEmail").value.trim());
  });
  if (preNum && (state.user || $("trackEmail").value)) doTrack(preNum, $("trackEmail").value || (state.user ? state.user.email : ""));
}

/* ---------- الأدمن ---------- */
function adminTabBtns() {
  document.querySelectorAll("[data-admin-tab]").forEach(function (b) {
    b.classList.toggle("active", b.dataset.adminTab === state.adminTab);
    b.onclick = function () { state.adminTab = b.dataset.adminTab; renderAdmin(); };
  });
}
async function renderAdmin() {
  var box = $("adminContent");
  adminTabBtns();
  setMsg($("adminMsg"), "");
  if (state.adminTab === "overview") {
    box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
    try {
      var d = await api("admin-stats");
      var sales = d.sales_by_day || [];
      var max = 0; sales.forEach(function (s) { max = Math.max(max, Number(s.revenue_egp || 0)); });
      box.innerHTML = '<div class="admin-stats">' +
        statBox(fmtPrice(d.revenue_egp), t("revenue")) + statBox(d.orders_total, t("orders_total")) +
        statBox(d.orders_pending, t("orders_pending")) + statBox(d.customers_total, t("customers_total")) +
        statBox(d.products_total, t("products_total")) + statBox(d.orders_completed, state.lang === "ar" ? "طلبات مكتملة" : "Completed Orders") +
        statBox(d.newsletter_count, state.lang === "ar" ? "مشتركو النشرة" : "Newsletter Subscribers") +
        '<div class="stat"><strong>' + esc(String(d.best_sellers && d.best_sellers.length ? d.best_sellers.length : 0)) + "</strong><span>" + esc(t("best_sellers")) + "</span></div></div>" +
        '<div class="card" style="margin-bottom:1rem"><h3>' + esc(t("sales_14")) + "</h3>" +
        (sales.length ? '<div class="bar-chart">' + sales.map(function (s) {
          var hgt = max ? Math.max(4, Math.round(Number(s.revenue_egp || 0) / max * 100)) : 4;
          return '<div class="bar" style="height:' + hgt + '%" title="' + esc(s.day) + ": " + esc(fmtPrice(s.revenue_egp)) + '"><span>' + esc(String(s.day).slice(5)) + "</span></div>";
        }).join("") + "</div>" : '<p class="muted">' + (state.lang === "ar" ? "لسه مفيش مبيعات." : "No sales yet.") + "</p>") + "</div>" +
        '<div class="admin-grid"><div class="card"><h3>' + esc(t("best_sellers")) + "</h3>" +
        ((d.best_sellers || []).map(function (b) {
          return '<div class="summary-row"><span>' + esc(b.name_ar || b.name_en || "") + " (" + Number(b.units || 0) + ")</span><strong>" + esc(fmtPrice(b.revenue_egp)) + "</strong></div>";
        }).join("") || '<p class="muted">—</p>') + "</div>" +
        '<div class="card"><h3>' + esc(t("recent_orders")) + "</h3>" +
        ((d.recent_orders || []).map(function (o) {
          return '<div class="summary-row"><span dir="ltr">' + esc(o.order_number) + '</span><strong>' + esc(fmtPrice(o.total_egp)) + "</strong></div>";
        }).join("") || '<p class="muted">—</p>') + "</div></div>" +
        '<div class="card" style="margin-top:1rem"><h3>🌱 ' + esc(t("admin_seed")) + '</h3><p class="muted small">' + (state.lang === "ar" ? "لو جدول المنتجات فاضي، دوس هنا لزرع الكتالوج الـ48 منتجًا." : "If the products table is empty, seed the 48-product catalog.") + '</p><button class="btn btn-dark" id="seedBtn">' + esc(t("admin_seed")) + '</button><p class="form-msg" id="seedMsg" role="alert"></p></div>';
      $("seedBtn").addEventListener("click", async function () {
        var b = $("seedBtn"); b.disabled = true; setMsg($("seedMsg"), t("loading"));
        try { await api("seed-products", {}); setMsg($("seedMsg"), t("admin_seed_ok"), "ok"); }
        catch (err) { setMsg($("seedMsg"), err.message || t("err_generic"), "error"); }
        finally { b.disabled = false; }
      });
    } catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
    return;
  }
  if (state.adminTab === "products") { renderAdminProducts(box); return; }
  if (state.adminTab === "orders") { renderAdminOrders(box); return; }
  if (state.adminTab === "customers") { renderAdminCustomers(box); return; }
  if (state.adminTab === "coupons") { renderAdminCoupons(box); return; }
  if (state.adminTab === "reviews") { renderAdminReviews(box); return; }
  if (state.adminTab === "settings") { renderAdminSettings(box); return; }
}
function statBox(v, label) { return '<div class="stat"><strong>' + esc(String(v)) + "</strong><span>" + esc(label) + "</span></div>"; }
async function renderAdminProducts(box) {
  box.innerHTML = '<p><button class="btn btn-dark" id="newProdBtn">+ ' + esc(t("new_product")) + '</button></p><div id="prodFormBox"></div><div id="prodList"><p class="muted">' + esc(t("loading")) + "</p></div>";
  var list = [];
  try { var d = await api("admin-products-list", { page: 1 }); list = d.items || d.products || d || []; }
  catch (e) { $("prodList").innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; return; }
  state.adminProducts = list;
  $("prodList").innerHTML = list.length ? '<div class="table-wrap"><table class="data"><tr><th>' + (state.lang === "ar" ? "المنتج" : "Product") + "</th><th>" + esc(t("product_price")) + "</th><th>" + (state.lang === "ar" ? "المخزون" : "Stock") + "</th><th></th></tr>" +
    list.map(function (p) {
      return "<tr><td><strong>" + esc(pname(p)) + "</strong><br><span class=\"muted small\" dir=\"ltr\">" + esc(p.sku || "") + "</span></td>" +
        "<td>" + esc(fmtPrice(p.price_egp)) + "</td><td>" + esc(String(prodStock(p))) + "</td>" +
        '<td style="white-space:nowrap"><button class="btn btn-ghost btn-sm" data-prod-edit="' + esc(p.id) + '">' + esc(t("edit")) + "</button> " +
        '<button class="btn btn-danger btn-sm" data-prod-del="' + esc(p.id) + '">' + esc(t("del")) + "</button></td></tr>";
    }).join("") + "</table></div>" : '<p class="empty">' + esc(t("no_results")) + "</p>";
  function openProdForm(p) {
    p = p || {};
    var fb = $("prodFormBox");
    var imgs = prodImages(p).join("\n");
    var vars = (p.variants || []).map(function (v) { return [v.color_name_ar, v.color_name_en, v.color_hex, v.size, v.stock_qty].join(","); }).join("\n");
    fb.innerHTML = '<form class="card" id="prodForm"><input type="hidden" id="pfId" value="' + esc(p.id || "") + '">' +
      '<label>' + esc(t("product_name_ar")) + ' <input type="text" id="pfNameAr" required value="' + esc(p.name_ar || "") + '"></label>' +
      '<label>' + esc(t("product_name_en")) + ' <input type="text" id="pfNameEn" required value="' + esc(p.name_en || "") + '" dir="ltr"></label>' +
      '<label>' + esc(t("product_desc_ar")) + ' <textarea id="pfDescAr" rows="2">' + esc(p.description_ar || "") + "</textarea></label>" +
      '<label>' + esc(t("product_desc_en")) + ' <textarea id="pfDescEn" rows="2">' + esc(p.description_en || "") + "</textarea></label>" +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem"><label>' + (state.lang === "ar" ? "الماركة" : "Brand") + ' <input type="text" id="pfBrand" value="' + esc(p.brand || "إطلالة") + '"></label>' +
      '<label>' + (state.lang === "ar" ? "القسم" : "Gender") + ' <select id="pfGender"><option value="men"' + (p.gender === "men" ? " selected" : "") + '>' + esc(t("men")) + '</option><option value="women"' + (p.gender === "women" ? " selected" : "") + '>' + esc(t("women")) + '</option><option value="kids"' + (p.gender === "kids" ? " selected" : "") + '>' + esc(t("kids")) + "</option></select></label>" +
      '<label>' + (state.lang === "ar" ? "القسم الفرعي (slug)" : "Subcategory (slug)") + ' <input type="text" id="pfSub" value="' + esc(p.subcategory || "") + '" dir="ltr"></label>' +
      '<label>SKU <input type="text" id="pfSku" value="' + esc(p.sku || "") + '" dir="ltr"></label>' +
      '<label>' + esc(t("product_price")) + ' <input type="number" id="pfPrice" required min="0" step="1" value="' + esc(p.price_egp != null ? p.price_egp : "") + '"></label>' +
      '<label>' + esc(t("product_old_price")) + ' <input type="number" id="pfOld" min="0" step="1" value="' + esc(p.original_price_egp || "") + '"></label></div>' +
      '<label>' + esc(t("product_images")) + ' <textarea id="pfImages" rows="2" dir="ltr">' + esc(imgs) + "</textarea></label>" +
      '<label>' + esc(t("product_variants")) + ' <textarea id="pfVars" rows="3" dir="ltr">' + esc(vars) + "</textarea></label>" +
      '<div class="chips" style="margin-bottom:1rem">' +
      [["pfNew", t("product_flags"), p.is_new], ["pfBest", t("product_best"), p.is_best_seller], ["pfTrend", t("product_trend"), p.is_trending], ["pfFeat", t("product_feat"), p.is_featured], ["pfActive", t("product_active"), p.active !== false]].map(function (x) {
        return '<label style="display:flex;gap:.4rem;align-items:center"><input type="checkbox" id="' + x[0] + '" style="width:auto"' + (x[2] ? " checked" : "") + "> " + esc(x[1]) + "</label>";
      }).join("") + "</div>" +
      '<button class="btn btn-dark" type="submit">' + esc(t("save_product")) + '</button> <button class="btn btn-ghost" type="button" id="pfCancel">' + esc(t("cancel")) + "</button>" +
      '<p class="form-msg" id="pfMsg" role="alert"></p></form>';
    $("pfCancel").addEventListener("click", function () { fb.innerHTML = ""; });
    $("prodForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var images = $("pfImages").value.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      var variants = $("pfVars").value.split("\n").map(function (line) {
        var parts = line.split(",").map(function (s) { return s.trim(); });
        if (parts.length < 5) return null;
        return { color_name_ar: parts[0], color_name_en: parts[1], color_hex: parts[2], size: parts[3], stock_qty: Number(parts[4] || 0) };
      }).filter(Boolean);
      var payload = {
        name_ar: $("pfNameAr").value.trim(), name_en: $("pfNameEn").value.trim(),
        description_ar: $("pfDescAr").value.trim(), description_en: $("pfDescEn").value.trim(),
        brand: $("pfBrand").value.trim() || "إطلالة", gender: $("pfGender").value,
        category_slug: $("pfGender").value, subcategory: $("pfSub").value.trim(),
        price_egp: Number($("pfPrice").value), original_price_egp: $("pfOld").value ? Number($("pfOld").value) : null,
        is_new: $("pfNew").checked, is_best_seller: $("pfBest").checked, is_trending: $("pfTrend").checked,
        is_featured: $("pfFeat").checked, active: $("pfActive").checked, images: images, variants: variants
      };
      if ($("pfSku").value.trim()) payload.sku = $("pfSku").value.trim();
      if ($("pfId").value) payload.id = $("pfId").value;
      try {
        await api("admin-product-save", payload);
        setMsg($("pfMsg"), t("profile_saved"), "ok");
        renderAdminProducts(box);
      } catch (err) { setMsg($("pfMsg"), err.message || t("err_generic"), "error"); }
    });
  }
  $("newProdBtn").addEventListener("click", function () { openProdForm(null); });
  box.querySelectorAll("[data-prod-edit]").forEach(function (b) {
    b.addEventListener("click", async function () {
      try {
        var d = await apiRead("get-product", { id: Number(b.dataset.prodEdit) });
        openProdForm(d.product);
      } catch (e) {
        var p = list.find(function (x) { return String(x.id) === String(b.dataset.prodEdit); });
        openProdForm(p);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
  box.querySelectorAll("[data-prod-del]").forEach(function (b) {
    b.addEventListener("click", async function () {
      if (!confirm(t("del") + "?")) return;
      try { await api("admin-product-delete", { id: b.dataset.prodDel }); toast(t("address_deleted")); renderAdminProducts(box); }
      catch (err) { toast(err.message || t("err_generic")); }
    });
  });
}
async function renderAdminOrders(box) {
  box.innerHTML = '<div class="toolbar"><input type="search" id="ordQ" placeholder="' + esc(t("search_admin")) + '" style="max-width:320px">' +
    '<select id="ordStatus"><option value="">' + esc(t("all_status")) + "</option>" +
    ["pending", "confirmed", "shipped", "delivered", "cancelled"].map(function (s) { return '<option value="' + s + '">' + esc(orderStatusLabel(s)) + "</option>"; }).join("") + "</select></div>" +
    '<div id="ordList"><p class="muted">' + esc(t("loading")) + "</p></div>";
  async function load() {
    var q = $("ordQ").value.trim(), st = $("ordStatus").value;
    var params = {}; if (q) params.q = q; if (st) params.status = st;
    try {
      var d = await api("admin-orders-list", params);
      var list = d.items || d.orders || d || [];
      $("ordList").innerHTML = list.length ? list.map(function (o) {
        return '<div class="order-card" data-ord-open="' + esc(o.order_number) + '" style="cursor:pointer"><div><strong dir="ltr">' + esc(o.order_number) + "</strong> • " + esc(o.customer_name || o.user_name || o.email || "") +
          "<br>" + esc(fmtDate(o.created_at)) + " • " + esc(fmtPrice(o.total_egp)) + ' <span class="status ' + esc(o.status) + '">' + esc(orderStatusLabel(o.status)) + "</span></div>" +
          '<div><select data-ord-status="' + esc(o.id) + '">' +
          ["pending", "confirmed", "shipped", "delivered", "cancelled"].map(function (s) {
            return '<option value="' + s + '"' + (o.status === s ? " selected" : "") + ">" + esc(orderStatusLabel(s)) + "</option>";
          }).join("") + "</select> " +
          '<a href="#/order/' + esc(o.order_number) + '" class="btn btn-ghost btn-sm">' + esc(t("view_order")) + "</a> " +
          '<button class="btn btn-dark btn-sm" data-ord-update="' + esc(o.id) + '">' + esc(t("update_status")) + "</button></div></div>";
      }).join("") : '<p class="empty">' + esc(t("no_results")) + "</p>";
      $("ordList").querySelectorAll("[data-ord-open]").forEach(function (card) {
        card.addEventListener("click", function (e) {
          var tg = e.target && e.target.closest ? e.target.closest("select,button,a") : null;
          if (tg) return;
          location.hash = "#/order/" + encodeURIComponent(card.dataset.ordOpen);
        });
      });
      $("ordList").querySelectorAll("[data-ord-update]").forEach(function (b) {
        b.addEventListener("click", async function () {
          var sel = document.querySelector('[data-ord-status="' + b.dataset.ordUpdate + '"]');
          try { await api("admin-order-update", { id: b.dataset.ordUpdate, status: sel.value }); toast(t("profile_saved")); load(); }
          catch (err) { toast(err.message || t("err_generic")); }
        });
      });
    } catch (e) { $("ordList").innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
  }
  $("ordQ").addEventListener("input", function () { clearTimeout(load._t); load._t = setTimeout(load, 400); });
  $("ordStatus").addEventListener("change", load);
  load();
}
async function renderAdminCustomers(box) {
  box.innerHTML = '<div id="custList"><p class="muted">' + esc(t("loading")) + "</p></div>";
  try {
    var d = await api("admin-customers-list", {});
    var list = d.items || d.customers || d || [];
    $("custList").innerHTML = list.length ? '<div class="table-wrap"><table class="data"><tr><th>' + esc(t("name")) + "</th><th>" + esc(t("email")) + "</th><th>" + esc(t("orders")) + "</th><th>" + esc(t("revenue")) + "</th><th></th></tr>" +
      list.map(function (c) {
        return "<tr><td>" + esc(c.name || "") + (c.role === "admin" ? ' <span class="status approved">أدمن</span>' : "") + "</td><td dir=\"ltr\">" + esc(c.email || "") + "</td><td>" + Number(c.orders_count || 0) + "</td><td>" + esc(fmtPrice(c.total_spent_egp || c.total_spent || 0)) + '</td><td><button class="btn btn-ghost btn-sm" data-cust="' + esc(c.id) + '">' + esc(t("view_order")) + "</button></td></tr>";
      }).join("") + "</table></div>" : '<p class="empty">' + esc(t("no_results")) + "</p>";
    $("custList").querySelectorAll("[data-cust]").forEach(function (b) {
      b.addEventListener("click", async function () {
        try {
          var dd = await api("admin-customer-get", { user_id: b.dataset.cust });
          var u = dd.customer || dd.user || dd;
          var orders = dd.orders || [];
          alert((state.lang === "ar" ? "العميل: " : "Customer: ") + (u.name || "") + " — " + (u.email || "") + "\n" +
            (state.lang === "ar" ? "الطلبات: " : "Orders: ") + orders.length);
        } catch (err) { toast(err.message || t("err_generic")); }
      });
    });
  } catch (e) { $("custList").innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
}
async function renderAdminCoupons(box) {
  box.innerHTML = '<p><button class="btn btn-dark" id="newCouponBtn">+ ' + esc(t("add_new")) + '</button></p><div id="couponFormBox"></div><div id="couponList"><p class="muted">' + esc(t("loading")) + "</p></div>";
  async function load() {
    try {
      var d = await api("admin-coupons-list");
      var list = d.items || d.coupons || d || [];
      $("couponList").innerHTML = list.length ? '<div class="table-wrap"><table class="data"><tr><th>' + esc(t("coupon_code")) + "</th><th>" + esc(t("coupon_type")) + "</th><th>" + esc(t("coupon_value")) + "</th><th>" + esc(t("coupon_min")) + "</th><th>" + esc(t("coupon_active")) + "</th><th></th></tr>" +
        list.map(function (c) {
          return "<tr><td dir=\"ltr\"><strong>" + esc(c.code) + "</strong></td><td>" + esc(c.type) + "</td><td>" + esc(String(c.value)) + (c.type === "percent" ? "%" : "") + "</td><td>" + esc(fmtPrice(c.min_order_egp || 0)) + "</td><td>" + (c.active ? "✅" : "❌") + '</td><td><button class="btn btn-danger btn-sm" data-coupon-del="' + esc(c.id) + '">' + esc(t("del")) + "</button></td></tr>";
        }).join("") + "</table></div>" : '<p class="empty">' + esc(t("no_results")) + "</p>";
      $("couponList").querySelectorAll("[data-coupon-del]").forEach(function (b) {
        b.addEventListener("click", async function () {
          if (!confirm(t("del") + "?")) return;
          try { await api("admin-coupon-delete", { id: b.dataset.couponDel }); load(); }
          catch (err) { toast(err.message || t("err_generic")); }
        });
      });
    } catch (e) { $("couponList").innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
  }
  $("newCouponBtn").addEventListener("click", function () {
    $("couponFormBox").innerHTML = '<form class="card" id="couponForm">' +
      '<label>' + esc(t("coupon_code")) + ' <input type="text" id="cpCode" required dir="ltr" style="text-transform:uppercase"></label>' +
      '<label>' + esc(t("coupon_type")) + ' <select id="cpType"><option value="percent">' + esc(t("percent")) + '</option><option value="fixed">' + esc(t("fixed")) + "</option></select></label>" +
      '<label>' + esc(t("coupon_value")) + ' <input type="number" id="cpValue" required min="0" step="0.01"></label>' +
      '<label>' + esc(t("coupon_min")) + ' <input type="number" id="cpMin" min="0" step="1" value="0"></label>' +
      '<label>' + esc(t("coupon_uses")) + ' <input type="number" id="cpUses" min="0" step="1"></label>' +
      '<label>' + esc(t("coupon_exp")) + ' <input type="datetime-local" id="cpExp"></label>' +
      '<label style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" id="cpActive" checked style="width:auto"> ' + esc(t("coupon_active")) + "</label>" +
      '<button class="btn btn-dark" type="submit">' + esc(t("save")) + '</button><p class="form-msg" id="cpMsg" role="alert"></p></form>';
    $("couponForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      try {
        await api("admin-coupon-save", {
          code: $("cpCode").value.trim().toUpperCase(), type: $("cpType").value,
          value: Number($("cpValue").value), min_order_egp: Number($("cpMin").value || 0),
          max_uses: $("cpUses").value ? Number($("cpUses").value) : null,
          expires_at: $("cpExp").value || null, active: $("cpActive").checked
        });
        setMsg($("cpMsg"), t("profile_saved"), "ok"); load();
      } catch (err) { setMsg($("cpMsg"), err.message || t("err_generic"), "error"); }
    });
  });
  load();
}
async function renderAdminReviews(box) {
  box.innerHTML = '<div id="revList"><p class="muted">' + esc(t("loading")) + "</p></div>";
  try {
    var d = await api("admin-reviews-list");
    var list = d.items || d.reviews || d || [];
    $("revList").innerHTML = list.length ? list.map(function (rv) {
      return '<div class="review-item"><strong>' + esc(rv.user_name || rv.user_email || "") + "</strong> " + stars(rv.rating) +
        (rv.title ? " — <strong>" + esc(rv.title) + "</strong>" : "") + " <span class=\"status " + esc(rv.status) + "\">" + esc(rv.status) + "</span>" +
        '<p class="muted">' + esc(rv.body || "") + "</p>" +
        (rv.status === "pending" ? '<button class="btn btn-dark btn-sm" data-rev="' + esc(rv.id) + '" data-decision="approved">' + esc(t("approve")) + "</button> " +
          '<button class="btn btn-danger btn-sm" data-rev="' + esc(rv.id) + '" data-decision="rejected">' + esc(t("reject")) + "</button>" : "") +
        "</div>";
    }).join("") : '<p class="empty">' + esc(t("no_results")) + "</p>";
    $("revList").querySelectorAll("[data-rev]").forEach(function (b) {
      b.addEventListener("click", async function () {
        try { await api("admin-review-update", { id: b.dataset.rev, decision: b.dataset.decision }); toast(t("profile_saved")); renderAdminReviews(box); }
        catch (err) { toast(err.message || t("err_generic")); }
      });
    });
  } catch (e) { $("revList").innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; }
}
async function renderAdminSettings(box) {
  box.innerHTML = '<p class="muted">' + esc(t("loading")) + "</p>";
  var s = {};
  try { var d = await api("admin-settings-get"); s = d.settings || d || {}; }
  catch (e) { box.innerHTML = '<p class="empty">' + esc(e.message || t("err_load")) + "</p>"; return; }
  box.innerHTML = '<form class="card form-card" id="setForm">' +
    '<label>' + esc(t("store_name")) + ' <input type="text" id="stName" value="' + esc(s.store_name || "إطلالة") + '"></label>' +
    '<label>' + esc(t("ship_cairo")) + ' <input type="number" id="stShipC" min="0" step="1" value="' + esc(s.shipping_fee_cairo != null ? s.shipping_fee_cairo : 35) + '"></label>' +
    '<label>' + esc(t("ship_other")) + ' <input type="number" id="stShipO" min="0" step="1" value="' + esc(s.shipping_fee_other != null ? s.shipping_fee_other : 60) + '"></label>' +
    '<label>' + esc(t("free_ship_at")) + ' <input type="number" id="stFree" min="0" step="1" value="' + esc(s.free_shipping_threshold != null ? s.free_shipping_threshold : 1500) + '"></label>' +
    '<label>' + esc(t("support_phone")) + ' <input type="text" id="stPhone" dir="ltr" value="' + esc(s.support_phone || "") + '"></label>' +
    '<label>' + esc(t("support_email")) + ' <input type="email" id="stEmail" dir="ltr" value="' + esc(s.support_email || "") + '"></label>' +
    '<label>' + esc(t("announcement")) + ' <input type="text" id="stAnnAr" value="' + esc(s.announcement_ar || "") + '"></label>' +
    '<label>' + esc(t("announcement_en")) + ' <input type="text" id="stAnnEn" dir="ltr" value="' + esc(s.announcement_en || "") + '"></label>' +
    '<label>' + (state.lang === "ar" ? "بانرات (JSON)" : "Banners (JSON)") + ' <textarea id="stBanners" rows="3" dir="ltr">' + esc(typeof s.banners === "string" ? s.banners : JSON.stringify(s.banners || [], null, 2)) + "</textarea></label>" +
    '<button class="btn btn-dark" type="submit">' + esc(t("save")) + '</button><p class="form-msg" id="stMsg" role="alert"></p></form>';
  $("setForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var settings = {
      store_name: $("stName").value.trim(),
      shipping_fee_cairo: String(Number($("stShipC").value || 0)),
      shipping_fee_other: String(Number($("stShipO").value || 0)),
      free_shipping_threshold: String(Number($("stFree").value || 0)),
      support_phone: $("stPhone").value.trim(), support_email: $("stEmail").value.trim(),
      announcement_ar: $("stAnnAr").value.trim(), announcement_en: $("stAnnEn").value.trim(),
      banners: $("stBanners").value.trim()
    };
    try { await api("admin-settings-save", { settings: settings }); setMsg($("stMsg"), t("settings_saved"), "ok"); loadSettingsPublic(); }
    catch (err) { setMsg($("stMsg"), err.message || t("err_generic"), "error"); }
  });
}

/* ---------- إعدادات عامة ---------- */
var WA_DEFAULT_NUMBER = "201091296456";
var WA_DEFAULT_MSG = "مرحبًا، لدي استفسار بخصوص منتجات المتجر.";
function waNumber() {
  var raw = (state.settings && state.settings.support_phone) || WA_DEFAULT_NUMBER;
  var digits = String(raw).replace(/[^0-9]/g, "");
  if (digits.charAt(0) === "0") digits = "20" + digits.slice(1);
  return digits || WA_DEFAULT_NUMBER;
}
function updateWaLink() {
  var a = $("waFloat"); if (!a) return;
  a.href = "https://wa.me/" + waNumber() + "?text=" + encodeURIComponent(WA_DEFAULT_MSG);
}
async function loadSettingsPublic() {
  try {
    var d = await apiRead("get-settings-public");
    state.settings = d;
    var ann = $("announceBar");
    if (ann) ann.textContent = L(d.announcement_ar, d.announcement_en) || ann.textContent;
    var ce = $("contactEmail"); if (ce && d.support_email) ce.textContent = d.support_email;
    var cp = $("contactPhone"); if (cp && d.support_phone) cp.textContent = d.support_phone;
  } catch (e) { state.settings = fbSettings(); }
  updateWaLink();
}
async function loadCategories() {
  try { var d = await apiRead("list-categories"); state.categories = d.categories || []; }
  catch (e) { state.categories = fbCategories().categories; }
}

/* ---------- ربط النماذج والأحداث العامة ---------- */
function bindGlobal() {
  $("langBtn").addEventListener("click", function () { setLang(state.lang === "ar" ? "en" : "ar"); });
  $("burgerBtn").addEventListener("click", function () { $("mainNav").classList.toggle("open"); });
  $("searchToggleBtn").addEventListener("click", function () {
    var bar = $("searchBar"); bar.hidden = !bar.hidden;
    if (!bar.hidden) $("searchInput").focus();
  });
  $("searchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var q = $("searchInput").value.trim();
    if (q) location.hash = "#/search?q=" + encodeURIComponent(q);
  });
  $("searchInput").addEventListener("input", async function () {
    var q = $("searchInput").value.trim();
    var box = $("searchSuggest");
    if (q.length < 2) { box.innerHTML = ""; return; }
    try {
      var d = await apiRead("search-suggest", { q: q });
      var s = d.suggestions || [];
      box.innerHTML = s.map(function (it) {
        return '<a href="#/product/' + it.id + '"><span>' + esc(L(it.name_ar, it.name_en)) + "</span><strong>" + esc(fmtPrice(it.price_egp)) + "</strong></a>";
      }).join("");
    } catch (e) { box.innerHTML = ""; }
  });
  $("newsletterForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var email = $("newsletterEmail").value.trim();
    setMsg($("newsletterMsg"), t("loading"));
    try {
      await api("subscribe-newsletter", { email: email });
      setMsg($("newsletterMsg"), t("newsletter_ok"), "ok");
      $("newsletterForm").reset();
    } catch (err) { setMsg($("newsletterMsg"), err.message || t("newsletter_fail"), "error"); }
  });
  $("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    setMsg($("loginMsg"), t("loading"));
    try {
      var d = await api("login", { email: $("loginEmail").value.trim(), password: $("loginPassword").value });
      await afterLogin(d);
      setMsg($("loginMsg"), "");
    } catch (err) { setMsg($("loginMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
  $("registerForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    setMsg($("registerMsg"), t("loading"));
    try {
      var d = await api("register", {
        name: $("regName").value.trim(), email: $("regEmail").value.trim(),
        password: $("regPassword").value, phone: $("regPhone").value.trim() || undefined
      });
      toast(t("register_ok"));
      await afterLogin(d);
      setMsg($("registerMsg"), "");
    } catch (err) { setMsg($("registerMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
  $("forgotForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
    setMsg($("forgotMsg"), t("loading"));
    try {
      await api("forgot-password", { email: $("forgotEmail").value.trim() });
      setMsg($("forgotMsg"), t("forgot_ok"), "ok");
    } catch (err) { setMsg($("forgotMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
  $("logoutBtn").addEventListener("click", function () {
    state.user = null; state.session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    applyAuthUI(); toast(t("logout_ok")); location.hash = "#/";
  });
  $("contactForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true; setMsg($("contactMsg"), t("loading"));
    try {
      await api("contact-message", {
        name: $("contactName").value.trim(),
        email: $("contactEmailInput").value.trim(),
        phone: $("contactPhoneInput") ? $("contactPhoneInput").value.trim() : "",
        subject: $("contactSubjectInput") ? $("contactSubjectInput").value.trim() : "",
        message: $("contactMessage").value.trim()
      });
      setMsg($("contactMsg"), t("contact_ok"), "ok");
      $("contactForm").reset();
    } catch (err) { setMsg($("contactMsg"), err.message || t("err_generic"), "error"); }
    finally { btn.disabled = false; }
  });
  document.addEventListener("click", function (e) {
    var nav = e.target.closest("[data-nav-link]");
    if (nav) { $("mainNav").classList.remove("open"); }
  });
}

/* ---------- تحذير الإعدادات الناقصة (config.js لسه placeholders) ---------- */
function configIsPlaceholder() {
  var url = CFG.SUPABASE_URL || "";
  var key = CFG.SUPABASE_ANON_KEY || "";
  return !url || !key || url.indexOf("YOUR-") >= 0 || key.indexOf("YOUR-") >= 0;
}
function showConfigWarning() {
  if (!configIsPlaceholder()) return;
  var bar = $("configWarning");
  if (bar) { bar.textContent = t("config_missing"); bar.hidden = false; }
}

/* ---------- تشغيل التطبيق ---------- */
(async function init() {
  applyLang();
  showConfigWarning();
  updateCounts();
  bindGlobal();
  await loadSettingsPublic();
  await loadCategories();
  await restoreSession();
  renderRoute();
})();

})();
