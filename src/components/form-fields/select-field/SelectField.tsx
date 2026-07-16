import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from '@mui/material'

type SelectOption = {
  label: string
  value: string
}

type SelectFieldProps = {
  label: string
  name: string
  value?: string
  required?: boolean
  error?: string
  placeholder?: string
  options: SelectOption[]
  onChange: (e: SelectChangeEvent<string>) => void
}

const SelectField = ({
  label,
  name,
  value = '',
  required,
  error,
  placeholder = 'Select an option',
  options,
  onChange,
}: SelectFieldProps) => {
  return (
    <div className="flex w-full flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>

      <FormControl fullWidth size="small" error={Boolean(error)}>
        <Select
          id={name}
          name={name}
          value={value}
          displayEmpty
          onChange={onChange}
          sx={{
            borderRadius: '6px',
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              py: 1,
            },
          }}
        >
          <MenuItem value="" disabled>
            <span className="text-gray-400">{placeholder}</span>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error ? <FormHelperText>{error}</FormHelperText> : null}
      </FormControl>
    </div>
  )
}

export default SelectField
