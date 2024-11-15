const config: {
	plugins: { handler: () => void }[]; theme: {
		extend: {
			dropShadow: { custom: string };
			keyframes: {
				"accordion-up": { from: { height: string }; to: { height: string } };
				"smooth-scroll": { "100%": { transform: string }; "0%": { transform: string } };
				"accordion-down": { from: { height: string }; to: { height: string } };
				"smooth-scroll-2": { "100%": { transform: string }; "0%": { transform: string } };
				"caret-blink": { "20%,50%": { opacity: string }; "0%,70%,100%": { opacity: string } }
			};
			borderRadius: { md: string; sm: string; lg: string };
			backgroundImage: { "0": string; custom: string; noise: string; "250": string; " xmlns=": string };
			letterSpacing: { "20": string };
			lineHeight: { "25": string; "15": string; "17": string; "60": string; "50": string };
			colors: {
				border: string;
				ring: string;
				popover: { foreground: string; DEFAULT: string };
				foreground: string;
				accent: { foreground: string; DEFAULT: string };
				destructive: { foreground: string; DEFAULT: string };
				secondary: { foreground: string; DEFAULT: string };
				input: string;
				background: string;
				sidebar: {
					border: string;
					"primary-foreground": string;
					ring: string;
					foreground: string;
					accent: string;
					DEFAULT: string;
					"accent-foreground": string;
					primary: string
				};
				muted: { foreground: string; DEFAULT: string };
				chart: { "1": string; "2": string; "3": string; "4": string; "5": string };
				card: { foreground: string; DEFAULT: string };
				primary: { foreground: string; DEFAULT: string }
			};
			animation: {
				"accordion-up": string;
				"smooth-scroll": string;
				"accordion-down": string;
				"smooth-scroll-2": string;
				"caret-blink": string
			}
		}
	}; darkMode: string[]; content: string[]
} = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
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
  			'0': '0',
  			'250': '250',
  			custom: 'linear-gradient(179.416deg, rgba(255, 255, 255, 0%) 0%, rgba(255, 165, 0, 0%) 30%, rgba(255, 165, 0, 0.3) 100%)',
  			noise: 'url(\\\\\\\\\\\\\\\\"data:image/svg+xml,%3C!-- svg: first layer --%3E%3Csvg viewBox=',
  			' xmlns=': 'http'
  		},
  		keyframes: {
			"caret-blink": {
				"0%,70%,100%": { opacity: "1" },
				"20%,50%": { opacity: "0" },
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
  			'smooth-scroll': 'smooth-scroll 30s linear infinite',
  			'smooth-scroll-2': 'smooth-scroll 40s linear infinite',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
			"caret-blink": "caret-blink 1.25s ease-out infinite",
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;


