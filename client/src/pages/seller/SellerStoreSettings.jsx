import React, { useState, useEffect, useRef } from "react";
import { getStoreSettings, updateStoreSettings } from "../../services/storeSettingsService";
import {
  Store, Eye, Truck, Settings, FileText, Briefcase, Bell, CreditCard, AlertTriangle,
  Upload, X, Check, Save, Loader2, MapPin
} from "lucide-react";

const TABS = [
  { id: "profile", label: "Store Profile", icon: Store },
  { id: "visibility", label: "Store Visibility", icon: Eye },
  { id: "shipping", label: "Shipping Settings", icon: Truck },
  { id: "orders", label: "Order Settings", icon: Settings },
  { id: "policies", label: "Store Policies", icon: FileText },
  { id: "business", label: "Business Info", icon: Briefcase },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payout", label: "Payout Settings", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle, className: "text-red-600 hover:bg-red-50" },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function SellerStoreSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    storeName: "",
    storeSlug: "",
    storeDescription: "",
    storeCategory: "",
    location: { city: "", state: "", country: "India" },
    storeStatus: "open",
    storeClosedMessage: "",
    shippingEnabled: true,
    shippingFee: 0,
    freeShippingThreshold: 0,
    estimatedDeliveryTime: "3-7 days",
    processingTime: 2,
    autoConfirmOrders: true,
    allowCustomerCancellation: true,
    returnPolicy: "",
    refundPolicy: "",
    cancellationPolicy: "",
    shippingPolicy: "",
    businessEmail: "",
    businessPhone: "",
    businessHours: {},
    notificationPreferences: {
      newOrder: true, orderCancelled: true, lowStock: true,
      newReview: true, paymentReceived: true, payoutCompleted: true
    }
  });

  // Images state
  const [images, setImages] = useState({
    logoUrl: "",
    bannerUrl: "",
    logoFile: null,
    bannerFile: null,
  });

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getStoreSettings();
      if (res.profile) {
        setFormData((prev) => ({ ...prev, ...res.profile }));
        setImages((prev) => ({
          ...prev,
          logoUrl: res.profile.storeLogo || "",
          bannerUrl: res.profile.storeBanner || "",
        }));
      }
    } catch (err) {
      setError("Failed to load store settings.");
    } finally {
      setLoading(false);
      setUnsavedChanges(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUnsavedChanges(true);
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: type === "checkbox" ? checked : value }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUnsavedChanges(true);
    setImages((prev) => ({
      ...prev,
      [`${type}File`]: file,
      [`${type}Url`]: URL.createObjectURL(file)
    }));
  };

  const removeImage = (type) => {
    setUnsavedChanges(true);
    setImages((prev) => ({
      ...prev,
      [`${type}File`]: null,
      [`${type}Url`]: "" // will signal removal if we handle it
    }));
    // Note: The backend logic currently only uploads new images, it doesn't delete if empty.
    // For a complete implementation, we'd send a flag to clear it.
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const submitData = new FormData();
      
      // Append primitive fields
      Object.keys(formData).forEach(key => {
        if (key === "location" || key === "businessHours" || key === "notificationPreferences") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      if (images.logoFile) submitData.append("logo", images.logoFile);
      if (images.bannerFile) submitData.append("banner", images.bannerFile);

      const res = await updateStoreSettings(submitData);
      
      setSuccess("Settings saved successfully.");
      setUnsavedChanges(false);
      
      if (res.profile) {
        setImages(prev => ({
          ...prev,
          logoFile: null,
          bannerFile: null,
          logoUrl: res.profile.storeLogo || prev.logoUrl,
          bannerUrl: res.profile.storeBanner || prev.bannerUrl
        }));
      }
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Settings</h1>
          <p className="text-gray-500 mt-1">Configure how your store appears and operates.</p>
        </div>
        <div className="flex items-center gap-3">
          {unsavedChanges && <span className="text-sm font-semibold text-orange-500">Unsaved changes</span>}
          <button
            onClick={handleSave}
            disabled={saving || !unsavedChanges}
            className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{success}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : tab.className || "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 min-h-[600px]">
          
          {/* 1. STORE PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Store Profile</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store Name</label>
                    <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} placeholder="e.g. Adarsh Electronics" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store URL Slug</label>
                    <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                      <span className="px-3 py-2 text-gray-500 text-sm border-r border-gray-200 bg-gray-100">vendorhub.com/store/</span>
                      <input type="text" name="storeSlug" value={formData.storeSlug} onChange={handleChange} placeholder="adarsh-electronics" className="w-full px-3 py-2 bg-transparent focus:outline-none text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Store Description</label>
                    <textarea name="storeDescription" value={formData.storeDescription} onChange={handleChange} rows="4" placeholder="Tell customers about your store..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                      <input type="text" name="location.city" value={formData.location.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                      <input type="text" name="location.state" value={formData.location.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Store Logo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Logo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                        {images.logoUrl ? <img src={images.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <Store className="w-8 h-8 text-gray-300" />}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} />
                        <button onClick={() => logoInputRef.current.click()} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-semibold rounded-lg transition-colors">Upload Logo</button>
                        {images.logoUrl && <button onClick={() => removeImage('logo')} className="px-4 py-1.5 text-red-500 hover:bg-red-50 text-sm font-semibold rounded-lg transition-colors ml-2">Remove</button>}
                        <p className="text-xs text-gray-400">JPG, PNG, WEBP. Max 5MB.</p>
                      </div>
                    </div>
                  </div>

                  {/* Store Banner */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Store Banner</label>
                    <div className="w-full h-32 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden relative group">
                      {images.bannerUrl ? (
                        <img src={images.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-6 h-6 mb-2 opacity-50" />
                          <span className="text-xs font-medium">No banner uploaded</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <input type="file" ref={bannerInputRef} hidden accept="image/*" onChange={(e) => handleImageChange(e, 'banner')} />
                        <button onClick={() => bannerInputRef.current.click()} className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded shadow">Replace</button>
                        {images.bannerUrl && <button onClick={() => removeImage('banner')} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded shadow">Remove</button>}
                      </div>
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Live Preview</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="h-20 bg-gray-100 relative">
                        {images.bannerUrl && <img src={images.bannerUrl} className="w-full h-full object-cover" alt="" />}
                        <div className="absolute -bottom-6 left-4 w-14 h-14 bg-white rounded-lg border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                           {images.logoUrl ? <img src={images.logoUrl} className="w-full h-full object-cover" alt="" /> : <Store className="w-6 h-6 text-gray-300" />}
                        </div>
                      </div>
                      <div className="pt-8 pb-4 px-4 bg-white">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{formData.storeName || "Your Store Name"}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <MapPin className="w-3 h-3" /> {formData.location.city || "City"}, {formData.location.state || "State"}
                        </div>
                        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{formData.storeDescription || "Store description will appear here..."}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. STORE VISIBILITY */}
          {activeTab === "visibility" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Store Visibility</h2>
              
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Store Status</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Control whether customers can buy from your store.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="storeStatus" checked={formData.storeStatus === "open"} onChange={(e) => setFormData(p => ({ ...p, storeStatus: e.target.checked ? "open" : "closed" }))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
                
                {formData.storeStatus === "closed" && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    <strong>Your store is currently closed.</strong> Customers cannot place new orders, but existing orders can still be managed.
                  </div>
                )}
              </div>

              {formData.storeStatus === "closed" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Store Closed Message</label>
                  <p className="text-xs text-gray-500 mb-2">Display a message to customers visiting your closed store.</p>
                  <textarea name="storeClosedMessage" value={formData.storeClosedMessage} onChange={handleChange} rows="3" placeholder="e.g. We are temporarily unavailable. We'll be back soon." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
              )}
            </div>
          )}

          {/* 3. SHIPPING SETTINGS */}
          {activeTab === "shipping" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Shipping Settings</h2>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <h3 className="font-bold text-gray-900">Enable Shipping</h3>
                  <p className="text-xs text-gray-500">Turn off if you only sell digital products.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="shippingEnabled" checked={formData.shippingEnabled} onChange={handleChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {formData.shippingEnabled && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Standard Shipping Fee (₹)</label>
                      <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Free Shipping Threshold (₹)</label>
                      <input type="number" name="freeShippingThreshold" value={formData.freeShippingThreshold} onChange={handleChange} min="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                      <p className="text-[10px] text-gray-400 mt-1">Set to 0 to disable free shipping.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Delivery Time</label>
                    <input type="text" name="estimatedDeliveryTime" value={formData.estimatedDeliveryTime} onChange={handleChange} placeholder="e.g. 3-7 days" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. ORDER SETTINGS */}
          {activeTab === "orders" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Order Settings</h2>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Order Processing Time (Days)</label>
                <p className="text-xs text-gray-500 mb-2">How long it takes you to prepare an order for shipment.</p>
                <input type="number" name="processingTime" value={formData.processingTime} onChange={handleChange} min="1" className="w-32 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Automatically Confirm Orders</h3>
                    <p className="text-xs text-gray-500">Orders skip the "Pending" state and go straight to "Confirmed".</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="autoConfirmOrders" checked={formData.autoConfirmOrders} onChange={handleChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Allow Customer Cancellation</h3>
                    <p className="text-xs text-gray-500">Customers can cancel their order before it is shipped.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="allowCustomerCancellation" checked={formData.allowCustomerCancellation} onChange={handleChange} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. POLICIES */}
          {activeTab === "policies" && (
            <div className="space-y-6 animate-in fade-in">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Store Policies</h2>
              <p className="text-sm text-gray-500">These policies will be visible on your public store and product pages.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Return Policy</label>
                  <textarea name="returnPolicy" value={formData.returnPolicy} onChange={handleChange} rows="4" placeholder="e.g. Items can be returned within 7 days of delivery..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Refund Policy</label>
                  <textarea name="refundPolicy" value={formData.refundPolicy} onChange={handleChange} rows="4" placeholder="e.g. Refunds are processed to original payment method within 5 days..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cancellation Policy</label>
                  <textarea name="cancellationPolicy" value={formData.cancellationPolicy} onChange={handleChange} rows="4" placeholder="e.g. Orders can only be cancelled before dispatch..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Shipping Policy</label>
                  <textarea name="shippingPolicy" value={formData.shippingPolicy} onChange={handleChange} rows="4" placeholder="e.g. We ship across India using standard courier partners..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
              </div>
            </div>
          )}

          {/* 6. BUSINESS INFO */}
          {activeTab === "business" && (
            <div className="space-y-6 animate-in fade-in max-w-3xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Business Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Email</label>
                  <input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Phone</label>
                  <input type="tel" name="businessPhone" value={formData.businessPhone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Business Hours</h3>
                <div className="space-y-3">
                  {DAYS.map((day) => {
                    const hrs = formData.businessHours[day] || { enabled: false, open: "09:00", close: "18:00" };
                    return (
                      <div key={day} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input type="checkbox" checked={hrs.enabled} onChange={(e) => {
                            setUnsavedChanges(true);
                            setFormData(p => ({ ...p, businessHours: { ...p.businessHours, [day]: { ...hrs, enabled: e.target.checked } } }));
                          }} className="sr-only peer" />
                          <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                        <div className="w-24 font-semibold text-sm text-gray-700 capitalize">{day}</div>
                        
                        {hrs.enabled ? (
                          <div className="flex items-center gap-2">
                            <input type="time" value={hrs.open} onChange={(e) => {
                              setUnsavedChanges(true);
                              setFormData(p => ({ ...p, businessHours: { ...p.businessHours, [day]: { ...hrs, open: e.target.value } } }));
                            }} className="px-2 py-1 text-sm border border-gray-200 rounded outline-none" />
                            <span className="text-gray-400 text-sm">to</span>
                            <input type="time" value={hrs.close} onChange={(e) => {
                              setUnsavedChanges(true);
                              setFormData(p => ({ ...p, businessHours: { ...p.businessHours, [day]: { ...hrs, close: e.target.value } } }));
                            }} className="px-2 py-1 text-sm border border-gray-200 rounded outline-none" />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-400 font-medium">Closed</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 7. NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Notification Settings</h2>
              <p className="text-sm text-gray-500 mb-4">Choose which events you want to be notified about.</p>
              
              <div className="space-y-4">
                {[
                  { key: "newOrder", label: "New Order", desc: "When a customer places a new order" },
                  { key: "orderCancelled", label: "Order Cancelled", desc: "When a customer or admin cancels an order" },
                  { key: "lowStock", label: "Low Stock Alert", desc: "When inventory drops below threshold" },
                  { key: "newReview", label: "New Customer Review", desc: "When a buyer leaves a review" },
                  { key: "paymentReceived", label: "Payment Received", desc: "When payment is successfully processed" },
                  { key: "payoutCompleted", label: "Payout Completed", desc: "When funds are transferred to your account" },
                ].map((notif) => (
                  <div key={notif.key} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{notif.label}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" checked={formData.notificationPreferences[notif.key] ?? true} onChange={(e) => {
                        setUnsavedChanges(true);
                        setFormData(p => ({ ...p, notificationPreferences: { ...p.notificationPreferences, [notif.key]: e.target.checked } }));
                      }} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. PAYOUT */}
          {activeTab === "payout" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3">Payout Settings</h2>
              
              <div className="bg-gradient-to-r from-primary/5 to-indigo-50 border border-primary/10 rounded-xl p-8 text-center">
                <CreditCard className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Payout Configuration Coming Soon</h3>
                <p className="text-gray-500 text-sm max-w-md mx-auto">
                  Automatic direct-to-bank seller payouts are currently in development. You will be notified when you can configure your banking details securely.
                </p>
              </div>
            </div>
          )}

          {/* 9. DANGER ZONE */}
          {activeTab === "danger" && (
            <div className="space-y-6 animate-in fade-in max-w-xl">
              <h2 className="text-xl font-bold text-red-600 border-b border-red-100 pb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h2>
              
              <div className="border border-red-200 bg-red-50 rounded-xl p-5">
                <h3 className="font-bold text-gray-900 text-base mb-1">Pause / Close Store</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Closing your store prevents customers from placing new orders. Your products, past orders, and earnings will remain intact.
                </p>
                {formData.storeStatus === "open" ? (
                  <button onClick={() => {
                    setUnsavedChanges(true);
                    setFormData(p => ({ ...p, storeStatus: "closed" }));
                    setActiveTab("visibility");
                  }} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors">
                    Close Store Temporarily
                  </button>
                ) : (
                  <button onClick={() => {
                    setUnsavedChanges(true);
                    setFormData(p => ({ ...p, storeStatus: "open" }));
                    setActiveTab("visibility");
                  }} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                    Re-open Store
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
