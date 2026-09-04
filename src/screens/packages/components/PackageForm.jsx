"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/common/Input"
import { Button } from "@/components/common/Button"
import { usePackages } from "@/hooks/usePackages"

const INCLUSIONS_LIST = [
  { key: "visa", label: "Visa Processing" },
  { key: "flight", label: "Return Flight Ticket" },
  { key: "meals", label: "Full Board Meals" },
  { key: "ziyarah", label: "Ziyarah Tours" },
  { key: "hotel", label: "Hotel Accommodation" },
  { key: "transfers", label: "Airport Transfers" },
]

export const PackageForm = ({ initialData, onSubmit, onCancel }) => {
  const [dateError, setDateError] = useState("")
  const [generating, setGenerating] = useState(false)

  const {
    packageTypes = [],
    serviceLevels = [],
    availableExtensions = [],
    metadataLoading,
    suggestPackageContent,
  } = usePackages()

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    itinerary: initialData?.itinerary || "",

    packageType: initialData?.packageType || "",
    serviceLevel: initialData?.serviceLevel || "",

    isGroupPackage: initialData?.isGroupPackage ?? true,

    prices: {
      adult: initialData?.prices?.adult || "",
      child: initialData?.prices?.child || "",
      individual: initialData?.prices?.individual || "",
    },
    tiers: initialData?.tiers || [],

    departureDate: initialData?.departureDate || "",
    returnDate: initialData?.returnDate || "",
    duration: initialData?.duration || "",

    maxPilgrims: initialData?.maxPilgrims || "",

    installmentsEnabled: initialData?.installmentsEnabled || false,
    installments: {
      registrationFee: initialData?.installments?.registrationFee || "",
      firstDeposit: initialData?.installments?.firstDeposit || "",
      balance: initialData?.installments?.balance || "",
    },

    inclusions: {
      visa: initialData?.inclusions?.visa ?? true,
      flight: initialData?.inclusions?.flight ?? true,
      meals: initialData?.inclusions?.meals ?? true,
      ziyarah: initialData?.inclusions?.ziyarah ?? false,
      hotel: initialData?.inclusions?.hotel ?? true,
      transfers: initialData?.inclusions?.transfers ?? false,
    },

    groupDiscountEnabled: initialData?.groupDiscountEnabled ?? false,
    groupDiscountThreshold: initialData?.groupDiscountThreshold || "",
    groupDiscountPercentage: initialData?.groupDiscountPercentage || "",

    extensionIds: initialData?.extensionIds || [],
  })

  const handleGenerateSuggestions = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a package name first.")
      return
    }

    setGenerating(true)
    try {
      const { description, itinerary } = await suggestPackageContent({
        name: formData.name,
        packageType: formData.packageType || "tour",
        serviceLevel: formData.serviceLevel || "standard",
      })

      setFormData((prev) => ({
        ...prev,
        description: description || prev.description,
        itinerary: itinerary || prev.itinerary,
      }))
    } catch (err) {
      console.error("Unexpected AI error:", err)
    } finally {
      setGenerating(false)
    }
  }

  useEffect(() => {
    const { departureDate, returnDate } = formData
    if (!departureDate || !returnDate) {
      setFormData((p) => ({ ...p, duration: "" }))
      setDateError("")
      return
    }

    const start = new Date(departureDate)
    const end = new Date(returnDate)
    if (end < start) {
      setDateError("Return date cannot be earlier than departure date")
      setFormData((p) => ({ ...p, duration: "" }))
      return
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
    setDateError("")
    setFormData((p) => ({ ...p, duration: diffDays }))
  }, [formData.departureDate, formData.returnDate])

  const totalPrice = useMemo(() => {
    return formData.isGroupPackage
      ? Number(formData.prices.adult || 0)
      : Number(formData.prices.individual || 0)
  }, [formData.isGroupPackage, formData.prices])

  const installmentTotal =
    Number(formData.installments.registrationFee || 0) +
    Number(formData.installments.firstDeposit || 0) +
    Number(formData.installments.balance || 0)

  const installmentValid = !formData.installmentsEnabled || installmentTotal === totalPrice

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePriceChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      prices: { ...prev.prices, [field]: value },
    }))
  }

  const handleInstallmentChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      installments: { ...prev.installments, [name]: value },
    }))
  }

  const toggleInclusion = (key) => {
    setFormData((prev) => ({
      ...prev,
      inclusions: { ...prev.inclusions, [key]: !prev.inclusions[key] },
    }))
  }

  const toggleExtension = (extId) => {
    setFormData((prev) => {
      const current = prev.extensionIds
      if (current.includes(extId)) {
        return { ...prev, extensionIds: current.filter(id => id !== extId) }
      }
      return { ...prev, extensionIds: [...current, extId] }
    })
  }

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      tiers: [...prev.tiers, { name: "", price: "", serviceLevel: "standard" }]
    }))
  }

  const removeTier = (index) => {
    setFormData((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }))
  }

  const updateTier = (index, field, value) => {
    setFormData((prev) => {
      const newTiers = [...prev.tiers]
      newTiers[index] = { ...newTiers[index], [field]: value }
      return { ...prev, tiers: newTiers }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!installmentValid || totalPrice === 0) return

    await onSubmit({
      ...formData,
      price: totalPrice,
      duration: Number(formData.duration),
      maxPilgrims: Number(formData.maxPilgrims) || null,
      installments: formData.installmentsEnabled
        ? {
          registrationFee: Number(formData.installments.registrationFee),
          firstDeposit: Number(formData.installments.firstDeposit),
          balance: Number(formData.installments.balance),
        }
        : null,
      groupDiscountEnabled: formData.groupDiscountEnabled,
      groupDiscountThreshold: formData.groupDiscountEnabled ? Number(formData.groupDiscountThreshold) : null,
      groupDiscountPercentage: formData.groupDiscountEnabled ? Number(formData.groupDiscountPercentage) : null,
      extensionIds: formData.extensionIds,
      tiers: formData.tiers.map(t => ({
        ...t,
        price: Number(t.price)
      })),
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-32">
        <div className="xl:col-span-2 space-y-6">
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-6">Package Details</h2>

            <Input
              label="Package Name *"
              placeholder="e.g Luxury Hajj Experience 2026"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />



            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-fg mb-2">Package Type</label>
                <select
                  value={formData.packageType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, packageType: e.target.value }))}
                  disabled={metadataLoading}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-fg"
                >
                  <option value="">Select Package Type</option>
                  {packageTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-fg mb-2">Service Level</label>
                <select
                  value={formData.serviceLevel}
                  onChange={(e) => setFormData((prev) => ({ ...prev, serviceLevel: e.target.value }))}
                  disabled={metadataLoading}
                  className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-fg"
                >
                  <option value="">Select Service Level</option>
                  {serviceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Departure Date *" name="departureDate" type="date" value={formData.departureDate} onChange={handleChange} required />
              <Input label="Return Date *" name="returnDate" type="date" value={formData.returnDate} onChange={handleChange} required />
            </div>

            {dateError && <p className="text-red-500 text-sm mt-2">{dateError}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input label="Duration (Days)" value={formData.duration} readOnly className="bg-bg/40 cursor-not-allowed" />
              <Input label="Maximum Pilgrims" name="maxPilgrims" type="number" value={formData.maxPilgrims} onChange={handleChange} placeholder="e.g 50" />
            </div>

            {/* AI CTA – Perfect spot: right after name */}
            <div className="my-6 flex justify-center">
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                disabled={!formData.name.trim() || generating || metadataLoading}
                className="px-8 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transition shadow-lg"
              >
                {generating ? (
                  <>
                    <span className="animate-pulse">Generating...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span> Generate Description & Itinerary with AI
                  </>
                )}
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-fg mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="A compelling overview of your package..."
                rows={5}
                className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-fg resize-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </section>

          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4 flex items-center gap-2">
              Itinerary Highlights
            </h2>
            <textarea
              name="itinerary"
              value={formData.itinerary}
              onChange={handleChange}
              rows={8}
              placeholder="Day 1: Arrival in Jeddah...\nDay 2: Umrah rituals...\nDay 3: Ziyarah in Madinah..."
              className="w-full rounded-xl bg-bg border border-border px-4 py-3 text-sm text-fg resize-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-fg/60 mt-2">Quick summary. Full detailed itinerary can be added later.</p>
          </section>
        </div>



        {/* RIGHT COLUMN - Pricing, Installments, Inclusions */}
        <div className="space-y-6">
          {/* Pricing */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4">Pricing</h2>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-fg">Group Package?</span>
              <input
                type="checkbox"
                checked={formData.isGroupPackage}
                onChange={() => setFormData((p) => ({ ...p, isGroupPackage: !p.isGroupPackage }))}
                className="w-5 h-5 accent-primary"
              />
            </div>

            {formData.isGroupPackage ? (
              <>
                <Input
                  label="Base Price per Adult (₦)"
                  type="number"
                  value={formData.prices.adult}
                  onChange={(e) => handlePriceChange("adult", e.target.value)}
                  placeholder="e.g 1000000"
                  required
                />
                <Input
                  label="Price per Child (₦)"
                  type="number"
                  value={formData.prices.child}
                  onChange={(e) => handlePriceChange("child", e.target.value)}
                  placeholder="e.g 950000"
                />
              </>
            ) : (
              <Input
                label="Base Price per Person (₦)"
                type="number"
                value={formData.prices.individual}
                onChange={(e) => handlePriceChange("individual", e.target.value)}
                placeholder="e.g 1200000"
                required
              />
            )}
            
            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-semibold text-fg">Package Tiers (Variants)</h3>
                <Button type="button" variant="outline" onClick={addTier} size="sm">
                  + Add Tier
                </Button>
              </div>
              <p className="text-sm text-fg/60 mb-4">Add specific tiers like Standard, Executive, or Premium with different pricing.</p>
              
              <div className="space-y-4">
                {formData.tiers.map((tier, idx) => (
                  <div key={idx} className="bg-bg/50 border border-border rounded-xl p-4 relative group">
                    <button 
                      type="button" 
                      onClick={() => removeTier(idx)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                    >
                      &times;
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Tier Name" 
                        value={tier.name} 
                        onChange={(e) => updateTier(idx, "name", e.target.value)}
                        placeholder="e.g Premium Package" 
                        required
                      />
                      <Input 
                        label="Price (₦)" 
                        type="number"
                        value={tier.price} 
                        onChange={(e) => updateTier(idx, "price", e.target.value)}
                        placeholder="e.g 9150000" 
                        required
                      />
                    </div>
                  </div>
                ))}
                {formData.tiers.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-fg/60">No tiers added. Base price will be used.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Installments */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4">Installments</h2>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-fg">Enable Installments?</span>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, installmentsEnabled: !p.installmentsEnabled }))}
                className={`relative w-12 h-6 rounded-full transition ${formData.installmentsEnabled ? "bg-primary" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.installmentsEnabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>

            {formData.installmentsEnabled && (
              <div className="space-y-3">
                <Input
                  label="Registration Fee (₦)"
                  name="registrationFee"
                  type="number"
                  value={formData.installments.registrationFee}
                  onChange={handleInstallmentChange}
                  placeholder="e.g 100000"
                />
                <Input
                  label="First Deposit (₦)"
                  name="firstDeposit"
                  type="number"
                  value={formData.installments.firstDeposit}
                  onChange={handleInstallmentChange}
                  placeholder="e.g 300000"
                />
                <Input
                  label="Balance (₦)"
                  name="balance"
                  type="number"
                  value={formData.installments.balance}
                  onChange={handleInstallmentChange}
                  placeholder="e.g 600000"
                />
                {!installmentValid && totalPrice > 0 && (
                  <p className="text-sm text-red-500">
                    Total must equal ₦{totalPrice.toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Group Volume Discounts */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4">Group Volume Discounts</h2>

            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-fg">Enable Group Discounts?</span>
              <button
                type="button"
                onClick={() => setFormData((p) => ({ ...p, groupDiscountEnabled: !p.groupDiscountEnabled }))}
                className={`relative w-12 h-6 rounded-full transition ${formData.groupDiscountEnabled ? "bg-primary" : "bg-border"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${formData.groupDiscountEnabled ? "translate-x-6" : ""}`}
                />
              </button>
            </div>

            {formData.groupDiscountEnabled && (
              <div className="space-y-3">
                <Input
                  label="Minimum Pilgrims (Threshold)"
                  name="groupDiscountThreshold"
                  type="number"
                  value={formData.groupDiscountThreshold}
                  onChange={handleChange}
                  placeholder="e.g 5"
                />
                <Input
                  label="Discount Percentage (%)"
                  name="groupDiscountPercentage"
                  type="number"
                  value={formData.groupDiscountPercentage}
                  onChange={handleChange}
                  placeholder="e.g 10"
                />
              </div>
            )}
          </section>

          {/* Add-ons / Extensions */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4">Add-ons (Optional)</h2>
            <p className="text-sm text-fg/60 mb-4">Select optional add-ons users can purchase with this package.</p>
            {availableExtensions.length === 0 ? (
              <p className="text-sm text-fg/50 italic">No add-ons available.</p>
            ) : (
              <div className="space-y-3">
                {availableExtensions.map((ext) => (
                  <button
                    type="button"
                    key={ext.id}
                    onClick={() => toggleExtension(ext.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${formData.extensionIds.includes(ext.id)
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-fg/70"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${formData.extensionIds.includes(ext.id)
                          ? "bg-primary border-primary text-white"
                          : "border-border"
                          }`}
                      >
                        {formData.extensionIds.includes(ext.id) && "✓"}
                      </div>
                      <span>{ext.name}</span>
                    </div>
                    <span className="font-semibold text-sm">₦{Number(ext.price).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Inclusions */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-fg mb-4">Inclusions</h2>
            <div className="space-y-3">
              {INCLUSIONS_LIST.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => toggleInclusion(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition ${formData.inclusions[item.key]
                    ? "bg-primary/10 border-primary text-primary"
                    : "border-border text-fg/70"
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${formData.inclusions[item.key]
                      ? "bg-primary border-primary text-white"
                      : "border-border"
                      }`}
                  >
                    {formData.inclusions[item.key] && "✓"}
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </form>

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] bg-card border-t border-border px-6 py-4 flex justify-between items-center z-20">
        <span className="font-semibold text-lg">
          Total: ₦{totalPrice.toLocaleString()}
        </span>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-border text-fg hover:bg-border/50 transition"
          >
            Cancel
          </button>
          <Button
            type="submit"
            disabled={!installmentValid || totalPrice === 0}
            onClick={handleSubmit}
          >
            {initialData ? "Update Package" : "Create Package"}
          </Button>
        </div>
      </div>
    </>
  )
}