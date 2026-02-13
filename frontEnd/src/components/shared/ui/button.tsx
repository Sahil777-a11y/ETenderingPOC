import { Button, type SxProps, type Theme } from '@mui/material'

export type ButtonProps = {
  label: string
  variant?: 'text' | 'outlined' | 'contained'
  onClick: () => void
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  sx?: SxProps<Theme>;
  disabled?: boolean
}

export const CustomButton: React.FC<ButtonProps> = ({ label, onClick, startIcon, endIcon, sx, disabled, ...props }) => {
  return (
    <Button
      sx={{ borderRadius: 8, ...sx }}
      variant="contained"
      color="primary"
      disableElevation
      onClick={onClick}
      startIcon={startIcon}
      endIcon={endIcon}
      disabled={disabled}
      {...props}
    >
      {label}
    </Button>
  )
}
