import React, { useRef, useState } from 'react'
import MaterialAutocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

const DEBOUNCE_TIMEOUT_MS = 350

type AutcompleteProps = {
    options: string[]
    getAutocomplete: (value: string) => void
    onSelect: (value: string) => void
    labelText: string
}

const Autocomplete = ({
    options,
    getAutocomplete,
    onSelect,
    labelText,
}: AutcompleteProps) => {
    const [value, setValue] = useState('')
    const debounce = useRef<NodeJS.Timeout | null>(null)

    return (
        <MaterialAutocomplete
            clearOnBlur={false}
            disablePortal
            id='combo-box-demo'
            value={value}
            options={options}
            sx={{ width: 350 }}
            onChange={(_event, value) => {
                if (value !== null) {
                    onSelect(value)
                }
                setValue('')
            }}
            noOptionsText=''
            renderOption={(props, option, state) => {
                const prefix = state.inputValue
                const startIndex = option
                    .toLocaleLowerCase()
                    .indexOf(prefix.toLowerCase())
                const before = option.substring(0, startIndex)
                const bold = option.substring(
                    startIndex,
                    startIndex + prefix.length
                )
                const after = option.substring(startIndex + prefix.length)
                return (
                    <li {...props}>
                        <div>
                            {before}
                            <strong>{bold}</strong>
                            {after}
                        </div>
                    </li>
                )
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    value={value}
                    onKeyDown={(e) => {
                        var code = e.keyCode || e.which

                        // do nothing if it's an arrow key or enter
                        if (
                            code == 37 ||
                            code == 38 ||
                            code == 39 ||
                            code == 40 ||
                            code == 13
                        ) {
                            e.preventDefault()
                        }
                    }}
                    onChange={(e) => {
                        setValue(e.target.value)
                        debounce.current && clearTimeout(debounce.current)
                        debounce.current = setTimeout(() => {
                            getAutocomplete(e.target.value)
                        }, DEBOUNCE_TIMEOUT_MS)
                    }}
                    label={labelText}
                />
            )}
        />
    )
}

export default Autocomplete
