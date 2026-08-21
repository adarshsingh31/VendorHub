import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProduct,
  getProductById,
  getSellerProducts,
  updateProduct,
} from "../../services/productService";
import {
  Package,
  Plus,
  ShoppingCart,
  TrendingUp,
  Star,
  BarChart3,
  Settings,
  MapPin,
} from "lucide-react";

const C = {
  cream: "#F5F1E8",
  white: "#FFFFFF",
  navyDark: "#1E2A47",
  navyMed: "#3D4A66",
  navySoft: "#5B6785",
  orange: "#E8A33D",
  orangeDeep: "#D4922E",
  orangeSoft: "#FBE9CF",
  orangeSofter: "#FCEFDA",
  border: "#E6E0D2",
  muted: "#948F82",
  danger: "#C1543C",
};

const stubPages = {
  SellerProducts: {
    title: "My Products",
    icon: "inventory_2",
    desc: "Manage your product listings.",
  },
  AddProduct: {
    title: "Add Product",
    icon: "add_box",
    desc: "List a new product for sale.",
  },
  SellerInventory: {
    title: "Inventory",
    icon: "shelves",
    desc: "Track your stock levels.",
  },
  SellerOrders: {
    title: "Orders",
    icon: "shopping_cart",
    desc: "View and manage customer orders.",
  },
  SellerEarnings: {
    title: "Earnings",
    icon: "payments",
    desc: "Track your revenue and withdrawals.",
  },
  SellerReviews: {
    title: "Reviews",
    icon: "star",
    desc: "See what customers are saying.",
  },
  SellerAnalytics: {
    title: "Analytics",
    icon: "monitoring",
    desc: "Understand your store performance.",
  },
  SellerSettings: {
    title: "Store Settings",
    icon: "settings",
    desc: "Update your store profile and preferences.",
  },
};

function SellerStubPage({ pageKey }) {
  const page = stubPages[pageKey];

  return (
    <div className="py-12 flex flex-col items-center justify-center text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary animate-float">
        <span className="material-symbols-outlined text-4xl">{page.icon}</span>
      </div>
      <h1 className="text-2xl font-display font-bold text-text mb-2">
        {page.title}
      </h1>
      <p className="text-text-soft max-w-md">{page.desc}</p>
      <p className="text-sm text-text-muted mt-4">
        This page is under construction. Backend integration coming soon.
      </p>
    </div>
  );
}

// SellerLayout removed — DashboardLayout in ProtectedRoute provides the shared sidebar + header.

function ProductImageSlider({ images = [], fallbackImage }) {
  const safeImages = images.length > 0 ? images : [fallbackImage];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images.join("|")]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  return (
    <div className="relative h-52 w-full overflow-hidden rounded-t-2xl bg-[#f7f3ee]">
      <img
        src={safeImages[currentIndex]}
        alt="Product preview"
        className="h-full w-full object-cover"
      />

      {safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/30 text-lg text-white opacity-0 transition-opacity duration-200 hover:opacity-100 group-hover:opacity-100"
            style={{ zIndex: 2 }}
            aria-label="Previous image"
          >
            &#10094;
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/30 text-lg text-white opacity-0 transition-opacity duration-200 hover:opacity-100 group-hover:opacity-100"
            style={{ zIndex: 2 }}
            aria-label="Next image"
          >
            &#10095;
          </button>

          <div
            className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1"
            style={{ zIndex: 2 }}
          >
            {safeImages.map((_, index) => (
              <button
                key={`${safeImages[index]}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 w-2.5 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>

          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white"
            style={{ zIndex: 2 }}
          >
            {currentIndex + 1} / {safeImages.length}
          </div>
        </>
      )}
    </div>
  );
}

export function AddProductPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    status: "active",
    images: [],
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const removeImage = (imageId) => {
    setImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);

      if (imageToRemove?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024;
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];

    const remainingSlots = maxFiles - images.length;

    if (selectedFiles.length === 0) {
      event.target.value = "";
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can upload up to ${maxFiles} images. Please select ${remainingSlots} or fewer.`,
      );
      event.target.value = "";
      return;
    }

    const invalidFiles = selectedFiles.filter(
      (file) => !validImageTypes.includes(file.type) || file.size > maxFileSize,
    );

    if (invalidFiles.length > 0) {
      setError("Only JPG, JPEG, PNG, or WEBP images under 5MB are allowed.");
      event.target.value = "";
      return;
    }

    const nextImages = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    setImages((prev) => [...prev, ...nextImages]);
    setError("");
    event.target.value = "";
  };

  const sellingPrice = Number(formData.price) || 0;
  const originalPrice = Number(formData.originalPrice) || 0;
  const discountPercent =
    originalPrice > sellingPrice && originalPrice > 0
      ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100)
      : 0;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (images.length === 0) {
      setError("Please select at least one product image.");
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();

      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("category", formData.category);
      if (formData.subcategory) {
        formPayload.append("subcategory", formData.subcategory);
      }
      formPayload.append("price", String(Number(formData.price)));
      if (formData.originalPrice) {
        formPayload.append(
          "originalPrice",
          String(Number(formData.originalPrice)),
        );
      }
      formPayload.append("stock", String(Number(formData.stock)));
      if (formData.sku) {
        formPayload.append("sku", formData.sku);
      }
      formPayload.append("status", formData.status || "active");

      images.forEach((image) => {
        formPayload.append("images", image.file);
      });

      const response = await createProduct(formPayload);
      setSuccess(response.message || "Product created successfully");
      setFormData({
        name: "",
        description: "",
        category: "",
        subcategory: "",
        price: "",
        originalPrice: "",
        stock: "",
        sku: "",
        status: "active",
        images: [],
      });
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto w-full">
        <div className="page-head flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-display text-text m-0">
              Add new product
            </h1>
            <p className="m-0 text-text-muted text-[15px]">
              Fill in the details below — you can save a draft and come back any
              time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover-lift"
          >
            Back to products
          </button>
        </div>

        <form
          id="productForm"
          onSubmit={handleSubmit}
          className="space-y-5 mt-6"
        >
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger-content">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-success/20 bg-[#E6F2E9] px-4 py-3 text-sm text-[#1E7A3E]">
              {success}
            </div>
          )}

          <div className="panel">
            <h2>Basic information</h2>

            <div className="field">
              <label htmlFor="name">Product name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Handloom cotton saree, Coimbatore weave"
              />
            </div>

            <div className="panel-row">
              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & kitchen">Home &amp; kitchen</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Toys">Toys</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="subcategory">Subcategory</label>
                <input
                  id="subcategory"
                  name="subcategory"
                  type="text"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Sarees"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                className="tall"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Materials, sizing, care instructions, what makes it worth buying…"
              />
            </div>
          </div>

          <div className="two-up">
            <div className="panel">
              <h2>Pricing</h2>
              <div className="field">
                <label htmlFor="price">Selling price</label>
                <div className="price-input">
                  <span>₹</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="originalPrice">
                  Original price{" "}
                  <span className="hint">— shown struck through</span>
                </label>
                <div className="price-input">
                  <span>₹</span>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
                <div className="discount-note" id="discountNote">
                  {discountPercent > 0 ? `${discountPercent}% off` : ""}
                </div>
              </div>
            </div>

            <div className="panel">
              <h2>Inventory</h2>
              <div className="field">
                <label htmlFor="stock">Stock quantity</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="field">
                <label htmlFor="sku">
                  SKU <span className="hint">— your internal code</span>
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. HL-SAREE-001"
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Product images</h2>
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              <p>Click to upload, or drag images here</p>
              <span>
                JPG, JPEG, PNG, or WEBP · up to 5 images · max 5MB each
              </span>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFiles}
              />
            </div>
            <div className="image-grid" id="imageGrid">
              {images.length === 0 ? (
                <div className="image-placeholder">No images selected yet</div>
              ) : (
                images.map((image, index) => (
                  <div key={image.id} className="image-tile relative">
                    <img
                      src={image.url}
                      alt={`${image.name} preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="action-bar">
            <button
              className="btn-primary"
              id="publishBtn"
              type="submit"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export function SellerProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getSellerProducts();
        setProducts(response.products || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-[0.14em] uppercase text-text-muted font-semibold mb-1">
              My catalog
            </p>
            <h1 className="font-display text-[28px] font-semibold m-0 text-text">
              My Products
            </h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/seller/products/add")}
            className="bg-primary text-primary-content border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover-lift flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add product
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger-content mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-border bg-surface p-8 text-center text-text-muted">
            Loading your products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">
                inventory_2
              </span>
            </div>
            <h2 className="font-display text-[22px] text-text mb-2">
              No products yet
            </h2>
            <p className="text-text-muted mb-5">
              Add your first product to start selling.
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller/products/add")}
              className="bg-primary text-primary-content border-none font-bold text-[13px] px-4 py-2.5 rounded-lg hover-lift"
            >
              Create product
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-soft"
              >
                <div className="group relative">
                  <ProductImageSlider
                    images={product.images || []}
                    fallbackImage="https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80"
                  />
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-text-soft">
                    {product.status || "active"}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-[20px] text-text m-0 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-[12px] text-text-muted">
                        {product.category}
                        {product.subcategory ? ` • ${product.subcategory}` : ""}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-[#E6F2E9] text-[#1E7A3E]">
                      {product.stock} in stock
                    </span>
                  </div>

                  <p className="text-[13px] text-text-soft mt-3 mb-4 line-clamp-3 min-h-[42px]">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[19px] font-bold text-text">
                        ₹{product.price}
                      </div>
                      {product.originalPrice &&
                      Number(product.originalPrice) > Number(product.price) ? (
                        <div className="text-[12px] text-text-muted line-through">
                          ₹{product.originalPrice}
                        </div>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/seller/products/${product._id}/edit`)
                      }
                      className="border border-border bg-surface text-text-soft rounded-lg px-3 py-2 text-[12px] font-semibold hover-lift"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    stock: "",
    sku: "",
    status: "active",
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        const response = await getProductById(id);
        const product = response.product;

        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: product.category || "",
          subcategory: product.subcategory || "",
          price: product.price ?? "",
          originalPrice: product.originalPrice ?? "",
          stock: product.stock ?? "",
          sku: product.sku || "",
          status: product.status || "active",
        });
        setExistingImages(
          (product.images || []).map((image, index) => ({
            id: `${image}-${index}`,
            url: image,
            name: `image-${index + 1}`,
          })),
        );
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const removeExistingImage = (imageId) => {
    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
  };

  const removeNewImage = (imageId) => {
    setNewImages((prev) => {
      const imageToRemove = prev.find((image) => image.id === imageId);

      if (imageToRemove?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(imageToRemove.url);
      }

      return prev.filter((image) => image.id !== imageId);
    });
  };

  const handleFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    const maxFiles = 5;
    const maxFileSize = 5 * 1024 * 1024;
    const validImageTypes = ["image/jpeg", "image/png", "image/webp"];
    const totalImages = existingImages.length + newImages.length;
    const remainingSlots = maxFiles - totalImages;

    if (selectedFiles.length === 0) {
      event.target.value = "";
      return;
    }

    if (selectedFiles.length > remainingSlots) {
      setError(
        `You can keep up to ${maxFiles} images total. Please select ${remainingSlots} or fewer.`,
      );
      event.target.value = "";
      return;
    }

    const invalidFiles = selectedFiles.filter(
      (file) => !validImageTypes.includes(file.type) || file.size > maxFileSize,
    );

    if (invalidFiles.length > 0) {
      setError("Only JPG, JPEG, PNG, or WEBP images under 5MB are allowed.");
      event.target.value = "";
      return;
    }

    const nextImages = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      file,
    }));

    setNewImages((prev) => [...prev, ...nextImages]);
    setError("");
    event.target.value = "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      setError("Please keep at least one product image.");
      return;
    }

    if (Number(formData.price) < 0 || Number(formData.stock) < 0) {
      setError("Price and stock cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("description", formData.description);
      formPayload.append("category", formData.category);
      if (formData.subcategory) {
        formPayload.append("subcategory", formData.subcategory);
      }
      formPayload.append("price", String(Number(formData.price)));
      if (formData.originalPrice) {
        formPayload.append(
          "originalPrice",
          String(Number(formData.originalPrice)),
        );
      }
      formPayload.append("stock", String(Number(formData.stock)));
      if (formData.sku) {
        formPayload.append("sku", formData.sku);
      }
      formPayload.append("status", formData.status || "active");
      formPayload.append(
        "existingImages",
        JSON.stringify(existingImages.map((image) => image.url)),
      );

      newImages.forEach((image) => {
        formPayload.append("images", image.file);
      });

      const response = await updateProduct(id, formPayload);
      setSuccess(response.message || "Product updated successfully");
      setTimeout(() => {
        navigate("/seller/products");
      }, 800);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="max-w-4xl mx-auto w-full py-12 text-center text-text-muted">
        Loading product details...
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto w-full">
        <div className="page-head flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-display text-text m-0">
              Edit product
            </h1>
            <p className="m-0 text-text-muted text-[15px]">
              Update your listing details and images.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="bg-surface text-text-soft border border-border font-semibold text-[13px] px-4 py-2.5 rounded-lg hover-lift"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-6">
          {error && (
            <div className="rounded-xl border border-danger/20 bg-danger-bg px-4 py-3 text-sm text-danger-content">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-success/20 bg-[#E6F2E9] px-4 py-3 text-sm text-[#1E7A3E]">
              {success}
            </div>
          )}

          <div className="panel">
            <h2>Basic information</h2>

            <div className="field">
              <label htmlFor="name">Product name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Handloom cotton saree, Coimbatore weave"
              />
            </div>

            <div className="panel-row">
              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & kitchen">Home &amp; kitchen</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Grocery">Grocery</option>
                  <option value="Toys">Toys</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="subcategory">Subcategory</label>
                <input
                  id="subcategory"
                  name="subcategory"
                  type="text"
                  value={formData.subcategory}
                  onChange={handleChange}
                  placeholder="e.g. Sarees"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                className="tall"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Materials, sizing, care instructions, what makes it worth buying…"
              />
            </div>
          </div>

          <div className="two-up">
            <div className="panel">
              <h2>Pricing</h2>
              <div className="field">
                <label htmlFor="price">Selling price</label>
                <div className="price-input">
                  <span>₹</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="originalPrice">
                  Original price{" "}
                  <span className="hint">— shown struck through</span>
                </label>
                <div className="price-input">
                  <span>₹</span>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <div className="panel">
              <h2>Inventory</h2>
              <div className="field">
                <label htmlFor="stock">Stock quantity</label>
                <input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
              <div className="field">
                <label htmlFor="sku">
                  SKU <span className="hint">— your internal code</span>
                </label>
                <input
                  id="sku"
                  name="sku"
                  type="text"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. HL-SAREE-001"
                />
              </div>
            </div>
          </div>

          <div className="panel">
            <h2>Product images</h2>

            <div className="mb-4">
              <p className="text-[13px] text-text-soft mb-3">Current images</p>
              <div className="image-grid">
                {existingImages.length === 0 ? (
                  <div className="image-placeholder">No current images</div>
                ) : (
                  existingImages.map((image, index) => (
                    <div key={image.id} className="image-tile relative">
                      <img src={image.url} alt={`Current image ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image.id)}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 16V4" />
                <path d="M7 9l5-5 5 5" />
                <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              </svg>
              <p>Add new images</p>
              <span>
                JPG, JPEG, PNG, or WEBP · up to 5 total images · max 5MB each
              </span>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFiles}
              />
            </div>

            <div className="mt-4">
              <p className="text-[13px] text-text-soft mb-3">New images</p>
              <div className="image-grid">
                {newImages.length === 0 ? (
                  <div className="image-placeholder">
                    No new images selected
                  </div>
                ) : (
                  newImages.map((image, index) => (
                    <div key={image.id} className="image-tile relative">
                      <img src={image.url} alt={`New image ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => removeNewImage(image.id)}
                        className="absolute top-2 right-2 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="action-bar">
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update product"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export const SellerInventoryPage = () => <SellerStubPage pageKey="SellerInventory" />;

export const SellerEarningsPage = () => <SellerStubPage pageKey="SellerEarnings" />;
export const SellerReviewsPage = () => <SellerStubPage pageKey="SellerReviews" />;
export const SellerAnalyticsPage = () => <SellerStubPage pageKey="SellerAnalytics" />;
export const SellerSettingsPage = () => <SellerStubPage pageKey="SellerSettings" />;
export const SellerAddressesPage = () => <SellerStubPage pageKey="Addresses" />;
