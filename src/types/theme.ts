// types/theme.ts
export type Theme = {
    colors: {
        primary: string
        secondary: string
        background: string
        text: string
        // Add more color properties as needed
    }
    spacing: {
        small: string
        medium: string
        large: string
        // Add more spacing properties as needed
    }
    breakpoints: {
        sm: string
        md: string
        lg: string
        xl: string
    }
    // Add more theme properties as needed
}