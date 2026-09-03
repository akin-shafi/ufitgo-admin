// src/components/common/PhoneInput.tsx
import PhoneInput from "react-phone-number-input"
import "react-phone-number-input/style.css"

interface PhoneInputFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  disabled?: boolean
  placeholder?: string
}

export function PhoneInputField({
  label,
  name,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Enter phone number",
}: PhoneInputFieldProps) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <PhoneInput
        international
        defaultCountry="NG"
        placeholder={placeholder}
        className="ufitgo-phone-input input-field"
        value={value || undefined}
        disabled={disabled}
        onChange={(newValue) => {
          if (!disabled) {
            onChange(newValue ?? "")
          }
        }}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
