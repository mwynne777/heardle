import React, { useRef } from 'react'
import MaterialAutocomplete from  '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField';

const DEBOUNCE_TIMEOUT_MS = 350

type AutcompleteProps = {
    options: string[]
    getAutocomplete: (value: string) => void
    onSelect: (value: string) => void
}

const Autocomplete = ({ options, getAutocomplete, onSelect }: AutcompleteProps) => {
    const debounce = useRef<NodeJS.Timeout | null>(null)

    return (
        <MaterialAutocomplete
            clearOnBlur={false}
            disablePortal
            id="combo-box-demo"
            options={options}
            sx={{ width: 350 }}
            onChange={(_event, value) => value && onSelect(value)}
            noOptionsText=''
            renderOption={(props, option, state) => {
                const prefix = state.inputValue
                const startIndex = option.toLocaleLowerCase().indexOf(prefix.toLowerCase())
                const before = option.substring(0, startIndex)
                const bold = option.substring(startIndex, startIndex + prefix.length )
                const after = option.substring(startIndex + prefix.length)
                return (
                    <li {...props}>
                        <div>
                            {before}
                            <strong>{bold}</strong>
                            {after}
                        </div>
                    </li>)
            }}
            renderInput={(params) => 
                <TextField
                    {...params}
                    onKeyDown={(e) => {
                        var code = (e.keyCode || e.which);
        
                        // do nothing if it's an arrow key or enter
                        if (code == 37 || code == 38 || code == 39 || code == 40 || code == 13) {
                            e.preventDefault();
                        }
                    }}
                    onChange={(e) => {
                        debounce.current && clearTimeout(debounce.current)
                        debounce.current = setTimeout(() => {
                            getAutocomplete(e.target.value)
                        }, DEBOUNCE_TIMEOUT_MS);
                    }}
                    label="Guess the song (by title or artist)"
                />
            }
        />
    )
}

export default Autocomplete