const {
	default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-geist-sans)"],
				mono: ["var(--font-geist-mono)"],
				"pixel-square": ["var(--font-geist-pixel-square)"],
				"pixel-grid": ["var(--font-geist-pixel-grid)"],
				"pixel-circle": ["var(--font-geist-pixel-circle)"],
				"pixel-triangle": ["var(--font-geist-pixel-triangle)"],
				"pixel-line": ["var(--font-geist-pixel-line)"],
			},
			backgroundPosition: {
				'1%': '0% 10%'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				ink: {
					DEFAULT: 'hsl(var(--ink))',
					foreground: 'hsl(var(--ink-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				"shadow-color": "var(--shadow-color)",
				'line-strong': 'hsl(var(--ds-line-strong) / <alpha-value>)',
				'subtle': 'hsl(var(--ds-subtle) / <alpha-value>)',
				'faint': 'hsl(var(--ds-faint) / <alpha-value>)',
				'soft': 'hsl(var(--ds-soft) / <alpha-value>)',
				'chip': 'hsl(var(--ds-chip) / <alpha-value>)',
				'icon': 'hsl(var(--ds-icon) / <alpha-value>)',
				'success': 'hsl(var(--ds-success) / <alpha-value>)',
				'warning': 'hsl(var(--ds-warning) / <alpha-value>)',
				'danger': 'hsl(var(--ds-danger) / <alpha-value>)',
				'trend': 'hsl(var(--ds-trend) / <alpha-value>)',
				'trend-muted': 'hsl(var(--ds-trend-muted) / <alpha-value>)',
				'track': 'hsl(var(--ds-track) / <alpha-value>)',
				'status': 'hsl(var(--ds-status) / <alpha-value>)',
				'raised': 'hsl(var(--ds-raised) / <alpha-value>)',
				'raised-hover': 'hsl(var(--ds-raised-hover) / <alpha-value>)',
				hover: 'var(--ds-hover)',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			letterSpacing: {
				'20': '0.2em'
			},
			lineHeight: {
				'15': '15.12px',
				'17': '17.64px',
				'25': '25.2px',
				'50': '50.4px',
				'60': '60.48px'
			},
			dropShadow: {
				custom: '0 8px 16px rgba(255, 165, 0, 0.15)'
			},
			backgroundImage: {
				custom: 'linear-gradient(179.416deg, rgba(255, 255, 255, 0%) 0%, rgba(255, 165, 0, 0%) 30%, rgba(255, 165, 0, 0.3) 100%)',
				noise: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect width=\'100\' height=\'100\' fill=\'rgba(0,0,0,0.03)\'/%3E%3C/svg%3E")',
			},
			keyframes: {
				'blur-fade-rise': {
					'0%': { opacity: '0', filter: 'blur(8px)', transform: 'translateY(12px)' },
					'100%': { opacity: '1', filter: 'blur(0px)', transform: 'translateY(0px)' },
				},
				aurora: {
					from: {
						backgroundPosition: "50% 50%, 50% 50%",
					},
					to: {
						backgroundPosition: "350% 50%, 350% 50%",
					},
				},
				'caret-blink': {
					'0%,70%,100%': {
						opacity: '1'
					},
					'20%,50%': {
						opacity: '0'
					}
				},
				'smooth-scroll': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(-33.33%)'
					}
				},
				'smooth-scroll-2': {
					'0%': {
						transform: 'translateX(0)'
					},
					'100%': {
						transform: 'translateX(-50%)'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'blur-fade-rise': 'blur-fade-rise 0.6s ease-out both',
				'smooth-scroll': 'smooth-scroll 20s linear infinite',
				'smooth-scroll-2': 'smooth-scroll 40s linear infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'caret-blink': 'caret-blink 1.25s ease-out infinite',
				aurora: "aurora 60s linear infinite",
			},
			borderRadius: {
				xl: 'calc(var(--radius) + 4px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				none: "none",
				"2xs": "var(--shadow-2xs)",
				xs: "var(--shadow-xs)",
				sm: "var(--shadow-sm)",
				DEFAULT: "var(--shadow)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
				xl: "var(--shadow-xl)",
				"2xl": "var(--shadow-2xl)",
				"overlay": "var(--ds-shadow-overlay)",
				"btn-primary": "var(--ds-shadow-btn-primary)",
				"btn-ink": "var(--ds-shadow-btn-ink)",
				"btn": "var(--ds-shadow-btn)",
				"btn-subtle": "var(--ds-shadow-btn-subtle)",
				"card": "var(--ds-shadow-card)",
				"badge": "var(--ds-shadow-badge)",
			},

			transitionTimingFunction: {
				'power1-in': 'cubic-bezier(0.11, 0, 0.5, 0)',
				'power1-out': 'cubic-bezier(0.5, 1, 0.89, 1)',
				'power1-in-out': 'cubic-bezier(0.45, 0, 0.55, 1)',
				'power2-in': 'cubic-bezier(0.32, 0, 0.67, 0)',
				'power2-out': 'cubic-bezier(0.33, 1, 0.68, 1)',
				'power2-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
				'power3-in': 'cubic-bezier(0.5, 0, 0.75, 0)',
				'power3-out': 'cubic-bezier(0.25, 1, 0.5, 1)',
				'power3-in-out': 'cubic-bezier(0.76, 0, 0.24, 1)',
				'power4-in': 'cubic-bezier(0.64, 0, 0.78, 0)',
				'power4-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
				'power4-in-out': 'cubic-bezier(0.83, 0, 0.17, 1)',
				'smooth-in-out': 'cubic-bezier(0.7, 0, 0, 1)',
			},
			transitionDuration: {
				'250': '250ms',
				'350': '350ms',
			},

			shadowOffset: {
				x: "var(--shadow-offset-x)",
				y: "var(--shadow-offset-y)",
			},
			shadowBlur: {
				DEFAULT: "var(--shadow-blur)",
			},
			shadowSpread: {
				DEFAULT: "var(--shadow-spread)",
			},
			shadowOpacity: {
				DEFAULT: "var(--shadow-opacity)",
			},
		}
	},
	plugins: [
		addVariablesForColors,
		require("tailwindcss-animate"),
		require('@tailwindcss/typography'),
	],
};

function addVariablesForColors({ addBase, theme }) {
	let allColors = flattenColorPalette(theme("colors"));
	let newVars = Object.fromEntries(
		Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
	);

	addBase({
		":root": newVars,
	});
}

export default config;


