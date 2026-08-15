import { useState, useEffect } from 'react';
import api from '../services/axiosInstance';

function SuccessBanner({ message }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 font-medium fade-in">
      <span className="material-symbols-outlined text-[18px] shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}>
        check_circle
      </span>
      {message}
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-[#ba1a1a] font-medium fade-in">
      <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
      {message}
    </div>
  );
}

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

export default function AddressManagement() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState(null);
  
  const [formData, setFormData] = useState({
    type: 'Home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    deliveryInstructions: '',
    location: null
  });

  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/users/addresses');
      if (data.success) {
        setAddresses(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load addresses.');
    } finally {
      setLoading(false);
    }
  };

  const existingTypes = addresses.map(a => a.type);
  const getAvailableTypes = (isEditing, currentType) => {
    if (isEditing) {
      return ADDRESS_TYPES.filter(t => !existingTypes.includes(t) || t === currentType);
    }
    return ADDRESS_TYPES.filter(t => !existingTypes.includes(t));
  };

  const availableAddTypes = getAvailableTypes(false);

  const handleAddClick = () => {
    if (availableAddTypes.length === 0) {
      setError('You have already added all available address types (Home, Work, Other).');
      return;
    }
    setFormData({
      type: availableAddTypes[0],
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      deliveryInstructions: '',
      location: null
    });
    setFormMode('add');
    setShowForm(true);
    setDetectedLocation(null);
    setError('');
    setSuccess('');
  };

  const handleEditClick = (address) => {
    setFormData({
      type: address.type,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      deliveryInstructions: address.deliveryInstructions || '',
      location: address.location || null
    });
    setEditingId(address._id);
    setFormMode('edit');
    setShowForm(true);
    setDetectedLocation(null);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      if (formMode === 'add') {
        const { data } = await api.post('/api/users/addresses', formData);
        if (data.success) {
          setSuccess('Address added successfully.');
          setAddresses([...addresses, data.data]);
          setShowForm(false);
          setDetectedLocation(null);
        }
      } else {
        const { data } = await api.put(`/api/users/addresses/${editingId}`, formData);
        if (data.success) {
          setSuccess('Address updated successfully.');
          setAddresses(addresses.map(a => a._id === editingId ? data.data : a));
          setShowForm(false);
          setDetectedLocation(null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleConfirmDetectedLocation = async () => {
    setError('');
    setSuccess('');
    
    if (!formData.fullName || !formData.phone) {
      setError("Please provide your Full Name and Phone Number to save this address.");
      return;
    }
    
    try {
      const { data } = await api.post('/api/users/addresses', formData);
      if (data.success) {
        setSuccess('Address added successfully.');
        setAddresses([...addresses, data.data]);
        setDetectedLocation(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        try {
          // Use our new backend geocoding route
          const { data } = await api.post('/api/users/addresses/geocode', {
            latitude,
            longitude
          });
          
          if (data && data.success) {
            const addr = data.data;
            
            // Check available types
            if (availableAddTypes.length === 0) {
              setLocationLoading(false);
              setError('You have already added all available address types (Home, Work, Other). Please edit an existing one instead.');
              return;
            }

            setFormData({
              type: availableAddTypes[0],
              fullName: '',
              phone: '',
              addressLine1: addr.addressLine1 || '',
              addressLine2: addr.addressLine2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postalCode: addr.postalCode || '',
              deliveryInstructions: '',
              location: { latitude, longitude }
            });
            
            setDetectedLocation({
              formattedAddress: addr.formattedAddress
            });
            setShowForm(false);
            setFormMode('add');
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch address details from coordinates.');
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) setError('Location permission denied.');
        else if (err.code === 2) setError('Location unavailable.');
        else setError('Failed to get location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const AddressCard = ({ type, icon, fallbackText }) => {
    const address = addresses.find(a => a.type === type);
    
    return (
      <div className="flex flex-col border border-[#c3c6d7]/50 rounded-xl p-5 bg-white shadow-sm h-full">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-outlined text-[#004ac6]">{icon}</span>
          <h3 className="font-bold text-[#0b1c30] text-lg">{type}</h3>
        </div>
        
        {address ? (
          <div className="flex flex-col gap-1 text-sm text-[#434655] flex-1">
            <p className="font-semibold text-[#0b1c30]">{address.fullName}</p>
            <p>{address.phone}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} {address.postalCode}</p>
            
            <div className="mt-4 pt-4 border-t border-slate-100 mt-auto">
              <button 
                onClick={() => handleEditClick(address)}
                className="text-[#004ac6] font-semibold text-sm hover:underline"
              >
                [Edit]
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col text-sm text-[#737686] flex-1 justify-between">
            <p className="mb-4">{fallbackText}</p>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <button 
                onClick={handleAddClick}
                className="text-[#004ac6] font-semibold text-sm flex items-center gap-1 hover:underline"
                disabled={availableAddTypes.length === 0}
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add {type} Address
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {success && <SuccessBanner message={success} />}
      {error && !showForm && !detectedLocation && <ErrorBanner message={error} />}

      {!showForm && !detectedLocation ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AddressCard type="Home" icon="home" fallbackText="No home address added" />
            <AddressCard type="Work" icon="work" fallbackText="No work address added" />
            <AddressCard type="Other" icon="location_on" fallbackText="No other address added" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              onClick={handleUseCurrentLocation}
              disabled={locationLoading || availableAddTypes.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[#004ac6] bg-[#eff4ff] hover:bg-[#dce9ff] transition-all disabled:opacity-60 border border-[#004ac6]/20"
            >
              {locationLoading ? (
                <div className="w-4 h-4 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-[18px]">my_location</span>
              )}
              Use Current Location
            </button>
            
            <button
              onClick={handleAddClick}
              disabled={availableAddTypes.length === 0}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] transition-all disabled:opacity-60 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Address Manually
            </button>
          </div>
        </>
      ) : detectedLocation ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6]">location_on</span>
                <h3 className="font-bold text-[#0b1c30] text-xl">Current Location Detected</h3>
             </div>
            <button onClick={() => setDetectedLocation(null)} className="text-[#737686] hover:text-[#0b1c30]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          
          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <div className="bg-[#eff4ff] border border-[#c3c6d7]/50 rounded-xl p-5 mb-6 text-[#0b1c30]">
            <p className="whitespace-pre-wrap font-medium">{detectedLocation.formattedAddress}</p>
          </div>

          <p className="font-semibold text-[#0b1c30] mb-4">Is this your correct delivery address?</p>

          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#434655]">Address Type:</label>
              <div className="flex flex-wrap gap-4">
                {availableAddTypes.map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={formData.type === t}
                      onChange={handleInputChange}
                      className="text-[#004ac6] focus:ring-[#004ac6]"
                    />
                    <span className="text-sm text-[#0b1c30]">{t}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Quick Name and Phone for direct save */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
               <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#434655]">Full Name <span className="text-red-500">*</span></label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-[#434655]">Phone Number <span className="text-red-500">*</span></label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="10-digit number"
                    className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                  />
                </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setShowForm(true);
                setDetectedLocation(null);
              }}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#004ac6] bg-white border border-[#004ac6] hover:bg-[#eff4ff] transition-all"
            >
              Edit Address
            </button>
            <button
              onClick={handleConfirmDetectedLocation}
              disabled={!formData.fullName || !formData.phone}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] transition-all shadow-sm disabled:opacity-60"
            >
              Confirm & Save
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-[#0b1c30] text-xl">
              {formMode === 'add' ? 'Add New Address' : 'Edit Address'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-[#737686] hover:text-[#0b1c30]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {error && <div className="mb-4"><ErrorBanner message={error} /></div>}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="flex items-center gap-1.5 text-sm font-semibold text-[#004ac6] hover:underline disabled:opacity-60"
              >
                 {locationLoading ? (
                  <div className="w-4 h-4 border-2 border-[#004ac6] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined text-[18px]">my_location</span>
                )}
                Auto-fill with current location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">Address Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] focus:border-[#004ac6] outline-none text-sm transition-all"
                >
                  {getAvailableTypes(formMode === 'edit', formData.type).map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">Full Name</label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="10-digit number"
                  pattern="^\d{10,}$"
                  title="Phone number must be at least 10 digits"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">Pincode</label>
                <input
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 226001"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[#434655]">House/Flat/Building & Street</label>
                <input
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  placeholder="123 ABC Road"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[#434655]">Landmark (Optional)</label>
                <input
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Near City Mall"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Lucknow"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-[#434655]">State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  placeholder="Uttar Pradesh"
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-[#434655]">Delivery Instructions (Optional)</label>
                <textarea
                  name="deliveryInstructions"
                  value={formData.deliveryInstructions}
                  onChange={handleInputChange}
                  placeholder="Leave at the front desk..."
                  rows={2}
                  className="w-full px-4 py-3 border border-[#c3c6d7] rounded-xl bg-white text-[#0b1c30] focus:ring-2 focus:ring-[#004ac6] outline-none text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#434655] bg-white border border-[#c3c6d7] hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-[#004ac6] hover:bg-[#0039a0] transition-all shadow-sm"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
