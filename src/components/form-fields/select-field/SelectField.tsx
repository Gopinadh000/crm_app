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
      <label htmlFor={name} className="text-sm font-medium text-app-text-secondary">
        {label}
        {required ? <span className="ml-1 text-app-error">*</span> : null}
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
            color: 'var(--app-text)',
            backgroundColor: 'var(--app-surface)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--app-border)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--app-border-strong)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'var(--app-primary-500)',
            },
            '& .MuiSelect-icon': {
              color: 'var(--app-text-muted)',
            },
            '& .MuiSelect-select': {
              py: 1,
            },
          }}
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  backgroundColor: 'var(--app-surface)',
                  color: 'var(--app-text)',
                  border: '1px solid var(--app-border)',
                },
              },
            },
          }}
        >
          <MenuItem value="" disabled>
            <span className="text-app-text-muted">{placeholder}</span>
          </MenuItem>
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {error ? (
          <FormHelperText sx={{ color: 'var(--app-error)' }}>{error}</FormHelperText>
        ) : null}
      </FormControl>
    </div>
  )
}

export default SelectField
