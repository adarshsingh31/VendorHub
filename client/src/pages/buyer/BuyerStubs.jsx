import { useState, useEffect } from "react";
import {
  MapPin,
  Navigation,
  PenLine,
  Home,
  Briefcase,
  Star,
  Trash2,
  Pencil,
  Loader2,
  ArrowLeft,
  Plus,
  Check,
  X,
  ShoppingBag,
  Search,
  ShoppingCart,
  ClipboardList,
  Heart,
  Store,
  Menu,
  LogOut,
} from "lucide-react";
import {
  getAddresses,
  addAddress as apiAddAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
  setDefaultAddress as apiSetDefaultAddress,
} from "../../services/addressService";

const stubPages = {
  BuyerProducts: {
    title: "Browse Products",
    icon: "search",
    desc: "Discover thousands of local products.",
  },
  ProductDetails: {
    title: "Product Details",
    icon: "inventory_2",
    desc: "View detailed product information.",
  },
  Cart: {
    title: "My Cart",
    icon: "shopping_cart",
    desc: "Review items before checkout.",
  },
  Checkout: {
    title: "Checkout",
    icon: "payment",
    desc: "Complete your purchase securely.",
  },
  BuyerOrders: {
    title: "My Orders",
    icon: "receipt_long",
    desc: "Track all your past and current orders.",
  },
  Wishlist: {
    title: "My Wishlist",
    icon: "favorite",
    desc: "Products you have saved for later.",
  },
  Addresses: {
    title: "Saved Addresses",
    icon: "location_on",
    desc: "Manage your delivery addresses.",
  },
};

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

const emptyForm = {
  type: "Home",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const ADDRESS_TYPES = ["Home", "Work", "Other"];

const labelIcon = (type) => {
  if (type === "Work") return Briefcase;
  if (type === "Other") return MapPin;
  return Home;
};

function BuyerStubPage({ pageKey }) {
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

function SavedAddresses() {
  const [view, setView] = useState("list");
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [locError, setLocError] = useState("");
  const [detected, setDetected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const getAvailableTypes = (excludeAddressId = null) => {
    const used = new Set(
      addresses
        .filter((addr) => addr._id !== excludeAddressId)
        .map((addr) => addr.type),
    );
    return ADDRESS_TYPES.filter((type) => !used.has(type));
  };

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const startAdd = (type) => {
    const availableTypes = getAvailableTypes();
    const targetType = type || availableTypes[0];

    if (availableTypes.length === 0) {
      setError(
        "You already added Home, Work, and Other addresses. Please edit an existing address.",
      );
      setView("list");
      return;
    }

    if (!availableTypes.includes(targetType)) {
      setError(
        `You already have a ${targetType} address. Please edit your existing ${targetType} address instead.`,
      );
      setView("list");
      return;
    }

    setForm({ ...emptyForm, type: targetType });
    setEditingId(null);
    setLocError("");
    setDetected(null);
    setError("");
    setView("choose");
  };

  const startManual = (prefill) => {
    setForm(prefill || { ...form });
    setError("");
    setView("manual");
  };

  const startLocation = () => {
    setLocError("");
    setError("");
    setView("locating");

    if (!navigator.geolocation) {
      setLocError(
        "Location isn't available in this browser. Try entering your address manually instead.",
      );
      setView("choose");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          );
          const data = await res.json();
          const a = data.address || {};
          const line1 = [
            a.house_number,
            a.road || a.pedestrian || a.neighbourhood,
          ]
            .filter(Boolean)
            .join(" ");
          const filled = {
            ...emptyForm,
            type: form.type,
            fullName: form.fullName,
            phone: form.phone,
            addressLine1: line1 || data.display_name?.split(",")[0] || "",
            addressLine2: a.suburb || a.quarter || "",
            city: a.city || a.town || a.village || a.county || "",
            state: a.state || "",
            postalCode: a.postcode || "",
            country: "India",
          };
          setDetected({
            latitude,
            longitude,
            display: data.display_name,
          });
          setForm(filled);
          setView("confirmLocation");
        } catch (e) {
          setLocError(
            "We found your location but couldn't look up the address. You can fill in the details below.",
          );
          setForm({
            ...emptyForm,
            type: form.type,
            fullName: form.fullName,
            phone: form.phone,
          });
          setDetected({ latitude, longitude, display: null });
          setView("confirmLocation");
        }
      },
      (err) => {
        let msg =
          "We couldn't get your location. You can enter your address manually instead.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location access was denied. You can enter your address manually instead.";
        }
        setLocError(msg);
        setView("choose");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const saveAddress = async () => {
    // Validate required fields
    if (
      !form.type ||
      !form.fullName.trim() ||
      !form.addressLine1.trim() ||
      !form.city.trim() ||
      !form.postalCode.trim()
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate phone
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Phone number must be at least 10 digits");
      return;
    }

    const conflictingType = addresses.find(
      (addr) => addr.type === form.type && addr._id !== editingId,
    );
    if (conflictingType) {
      setError(
        `${form.type} address already exists. Please edit the existing ${form.type} address.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const addressData = {
        type: form.type,
        fullName: form.fullName,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        postalCode: form.postalCode,
        country: form.country,
        isDefault: form.isDefault,
        ...(detected && {
          location: {
            latitude: detected.latitude,
            longitude: detected.longitude,
          },
        }),
      };

      if (editingId) {
        // Update existing address
        await apiUpdateAddress(editingId, addressData);
      } else {
        // Add new address
        await apiAddAddress(addressData);
      }

      // Reload addresses
      await loadAddresses();
      setForm(emptyForm);
      setEditingId(null);
      setDetected(null);
      setView("list");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const editAddress = (addr) => {
    setForm({
      type: addr.type,
      fullName: addr.fullName,
      phone: addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      isDefault: addr.isDefault,
    });
    setEditingId(addr._id);
    setError("");
    setView("manual");
  };

  const confirmDelete = async (id) => {
    try {
      setDeleting(id);
      setError("");
      await apiDeleteAddress(id);
      await loadAddresses();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address");
    } finally {
      setDeleting(null);
    }
  };

  const makeDefault = async (id) => {
    try {
      setError("");
      await apiSetDefaultAddress(id);
      await loadAddresses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set default address");
    }
  };

  const cancel = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDetected(null);
    setLocError("");
    setError("");
    setView(addresses.length ? "list" : "choose");
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto w-full flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2
            size={32}
            style={{ color: C.orange }}
            className="animate-spin mx-auto mb-3"
          />
          <p style={{ color: C.navyMed }} className="text-sm">
            Loading your addresses...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="text-center mb-10">
        <div
          style={{ background: C.orangeSofter }}
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
        >
          <div
            style={{ background: C.orange, color: C.navyDark }}
            className="w-10 h-10 rounded-lg flex items-center justify-center"
          >
            <MapPin size={20} />
          </div>
        </div>
        <h1 style={{ color: C.navyDark }} className="text-3xl font-bold mb-2">
          Saved Addresses
        </h1>
        <p
          style={{
            color: C.navyMed,
            fontFamily: "system-ui, sans-serif",
          }}
          className="text-[15px]"
        >
          Manage your delivery addresses.
        </p>
      </div>

      {error && (
        <div
          style={{
            background: "#FBEAE6",
            color: C.danger,
            border: "1px solid #F2C9C0",
          }}
          className="rounded-lg px-4 py-3 text-sm font-semibold mb-6"
        >
          {error}
        </div>
      )}

      <div style={{ fontFamily: "system-ui, sans-serif" }}>
        {view === "list" && (
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                }}
                className="rounded-xl p-8 text-center"
              >
                <MapPin
                  size={32}
                  style={{ color: C.muted }}
                  className="mx-auto mb-3"
                />
                <p
                  style={{ color: C.navyMed }}
                  className="text-sm font-semibold"
                >
                  No addresses saved yet. Add one to get started!
                </p>
              </div>
            ) : (
              addresses.map((a) => {
                const Icon = labelIcon(a.type);
                return (
                  <div
                    key={a._id}
                    style={{
                      background: C.white,
                      border: `1px solid ${C.border}`,
                    }}
                    className="rounded-xl p-5 flex items-start gap-4"
                  >
                    <div
                      style={{
                        background: C.orangeSofter,
                        color: C.orangeDeep,
                      }}
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          style={{ color: C.navyDark }}
                          className="font-bold text-sm"
                        >
                          {a.type}
                        </span>
                        {a.isDefault && (
                          <span
                            style={{
                              background: C.orangeSoft,
                              color: C.orangeDeep,
                            }}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                          >
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div
                        style={{ color: C.navyMed }}
                        className="text-sm mt-1 font-semibold"
                      >
                        {a.fullName} · {a.phone}
                      </div>
                      <div
                        style={{ color: C.navySoft }}
                        className="text-sm mt-0.5"
                      >
                        {[
                          a.addressLine1,
                          a.addressLine2,
                          a.city,
                          a.state,
                          a.postalCode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {!a.isDefault && (
                          <button
                            onClick={() => makeDefault(a._id)}
                            style={{ color: C.orangeDeep }}
                            className="text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            <Star size={13} /> Set as default
                          </button>
                        )}
                        <button
                          onClick={() => editAddress(a)}
                          style={{ color: C.navyMed }}
                          className="text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <Pencil size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(a._id)}
                          style={{ color: C.danger }}
                          className="text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {getAvailableTypes().length > 0 && (
              <div className="space-y-3">
                {getAvailableTypes().map((type) => (
                  <button
                    key={type}
                    onClick={() => startAdd(type)}
                    style={{
                      borderColor: C.orange,
                      color: C.orangeDeep,
                      background: C.white,
                    }}
                    className="w-full border-2 border-dashed rounded-xl py-4 flex items-center justify-center gap-2 font-bold text-sm hover:bg-orange-50"
                  >
                    <Plus size={16} /> Add {type} Address
                  </button>
                ))}
              </div>
            )}

            {getAvailableTypes().length === 0 && (
              <div
                style={{
                  background: C.white,
                  border: `1px solid ${C.border}`,
                  color: C.navyMed,
                }}
                className="rounded-xl p-4 text-sm font-semibold text-center"
              >
                You have saved all three address types. You can edit or delete
                an existing address.
              </div>
            )}
          </div>
        )}

        {view === "choose" && (
          <div>
            {addresses.length > 0 && (
              <button
                onClick={() => setView("list")}
                style={{ color: C.navyMed }}
                className="flex items-center gap-1.5 text-sm font-semibold mb-6 hover:underline"
              >
                <ArrowLeft size={15} /> Back to saved addresses
              </button>
            )}

            {locError && (
              <div
                style={{
                  background: "#FBEAE6",
                  color: C.danger,
                  border: "1px solid #F2C9C0",
                }}
                className="rounded-lg px-4 py-3 text-sm font-semibold mb-6"
              >
                {locError}
              </div>
            )}

            <p
              style={{ color: C.navyMed }}
              className="text-sm font-semibold mb-2 text-center"
            >
              How would you like to add your {form.type} address?
            </p>
            <p style={{ color: C.muted }} className="text-xs mb-4 text-center">
              Available types: {getAvailableTypes().join(", ") || "None"}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={startLocation}
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.border}`,
                }}
                className="text-left rounded-xl p-6 hover:shadow-md transition-shadow group"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.orange)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                <div
                  style={{
                    background: C.orangeSofter,
                    color: C.orangeDeep,
                  }}
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                >
                  <Navigation size={20} />
                </div>
                <div
                  style={{ color: C.navyDark }}
                  className="font-bold text-base mb-1"
                >
                  Use current location
                </div>
                <div
                  style={{ color: C.muted }}
                  className="text-sm leading-snug"
                >
                  We'll detect your address automatically using your device's
                  location.
                </div>
              </button>

              <button
                onClick={() => startManual()}
                style={{
                  background: C.white,
                  border: `1.5px solid ${C.border}`,
                }}
                className="text-left rounded-xl p-6 hover:shadow-md transition-shadow"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = C.orange)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = C.border)
                }
              >
                <div
                  style={{
                    background: C.orangeSofter,
                    color: C.orangeDeep,
                  }}
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
                >
                  <PenLine size={20} />
                </div>
                <div
                  style={{ color: C.navyDark }}
                  className="font-bold text-base mb-1"
                >
                  Enter manually
                </div>
                <div
                  style={{ color: C.muted }}
                  className="text-sm leading-snug"
                >
                  Type in your delivery address, city, and pincode yourself.
                </div>
              </button>
            </div>
          </div>
        )}

        {view === "locating" && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
            }}
            className="rounded-xl py-16 flex flex-col items-center justify-center"
          >
            <Loader2
              size={28}
              style={{ color: C.orange }}
              className="animate-spin mb-4"
            />
            <div style={{ color: C.navyDark }} className="font-bold text-sm">
              Finding your location…
            </div>
            <div style={{ color: C.muted }} className="text-sm mt-1">
              Please allow location access if prompted.
            </div>
          </div>
        )}

        {(view === "manual" || view === "confirmLocation") && (
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
            }}
            className="rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <button
                onClick={cancel}
                style={{ color: C.navyMed }}
                className="flex items-center gap-1.5 text-sm font-semibold hover:underline"
              >
                <ArrowLeft size={15} /> Back
              </button>
              {view === "confirmLocation" && (
                <span
                  style={{
                    background: C.orangeSoft,
                    color: C.orangeDeep,
                  }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"
                >
                  <Navigation size={11} /> DETECTED FROM LOCATION
                </span>
              )}
            </div>

            {view === "confirmLocation" && (
              <p style={{ color: C.navyMed }} className="text-sm mb-5">
                We filled in what we could find. Please check the details below
                and complete anything that's missing.
              </p>
            )}

            <div className="grid gap-4">
              <div>
                <label
                  style={{ color: C.navyMed }}
                  className="text-xs font-bold block mb-2"
                >
                  SAVE AS
                </label>
                <div className="flex gap-2">
                  {ADDRESS_TYPES.map((t) => {
                    const disabled =
                      !editingId && !getAvailableTypes().includes(t);
                    return (
                      <button
                        key={t}
                        disabled={disabled}
                        onClick={() => setForm({ ...form, type: t })}
                        style={
                          form.type === t
                            ? {
                                background: C.orange,
                                color: C.navyDark,
                                borderColor: C.orange,
                              }
                            : {
                                background: C.white,
                                color: C.navyMed,
                                borderColor: C.border,
                              }
                        }
                        className="px-4 py-1.5 rounded-full text-sm font-bold border disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  value={form.fullName}
                  onChange={(v) => setForm({ ...form, fullName: v })}
                  placeholder="e.g. Priya Sharma"
                />
                <Field
                  label="Phone number"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="e.g. 9876543210"
                />
              </div>

              <Field
                label="Address line 1"
                value={form.addressLine1}
                onChange={(v) => setForm({ ...form, addressLine1: v })}
                placeholder="House no., building, street"
              />
              <Field
                label="Address line 2 (optional)"
                value={form.addressLine2}
                onChange={(v) => setForm({ ...form, addressLine2: v })}
                placeholder="Landmark, area"
              />

              <div className="grid sm:grid-cols-3 gap-4">
                <Field
                  label="City"
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                />
                <Field
                  label="State"
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
                <Field
                  label="Postal Code"
                  value={form.postalCode}
                  onChange={(v) => setForm({ ...form, postalCode: v })}
                />
              </div>

              <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="w-4 h-4"
                  style={{ accentColor: C.orange }}
                />
                <span
                  style={{ color: C.navyMed }}
                  className="text-sm font-semibold"
                >
                  Set as default delivery address
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 mt-7">
              <button
                onClick={saveAddress}
                disabled={saving}
                style={{ background: C.orange, color: C.navyDark }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm hover:brightness-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} /> Save address
                  </>
                )}
              </button>
              <button
                onClick={cancel}
                disabled={saving}
                style={{
                  color: C.navyMed,
                  border: `1px solid ${C.border}`,
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            style={{
              background: C.white,
              border: `1px solid ${C.border}`,
            }}
            className="rounded-xl p-6 max-w-sm w-full"
          >
            <h3
              style={{ color: C.navyDark }}
              className="text-lg font-bold mb-3"
            >
              Delete Address?
            </h3>
            <p style={{ color: C.navyMed }} className="text-sm mb-6">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  color: C.navyMed,
                  border: `1px solid ${C.border}`,
                }}
                className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                disabled={deleting}
                style={{ background: C.danger, color: C.white }}
                className="px-4 py-2 rounded-lg font-bold text-sm hover:brightness-90 disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label
        style={{ color: "#3D4A66" }}
        className="text-xs font-bold block mb-1.5"
      >
        {label.toUpperCase()}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ borderColor: "#E6E0D2", color: "#1E2A47" }}
        className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2"
        onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #FBE9CF")}
        onBlur={(e) => (e.target.style.boxShadow = "none")}
      />
    </div>
  );
}


export { default as CheckoutPage } from "./CheckoutPage";
export { default as BuyerOrdersPage } from "./BuyerOrdersPage";
export const AddressesPage = () => <SavedAddresses />;
