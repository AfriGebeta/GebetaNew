export interface Features {
    title: string
    subtitle: string
    description: string
    image: {
        source: string
        alt: string
        width: number
        height: number
    }
    link: string
}

interface Pricing {
    title: string
    subtitle: string
    price?: number | string
    features?: {
        service: string
        credit: number | string
        showInfo?: boolean
        toolTip?: string
    }[]
}

interface Testimonial {
    companyLogo: string
    reviewerName: string
    reviewerRole: string
    reviewerImage: string
    description: string
}

interface Showcase {
    title: string
    companyLogo: string
    companyLogoSize: {
        width: number
        height: number
    }
    showcasePicture: string
    description: string
    interviewed: string
}

interface FooterLink {
    title: string
    link: string
}

export interface MegaMenu {
    title: string;
    link?: string | ""
    submenu?: {
        title: string;
        link: string;
        description: string;
    }[];
}

interface TeamMember {
    name: string
    role: string
    img: string
}

export const menuItems: Array<MegaMenu> = [
    {
        title: "Products",
        submenu: [
            {
                title: "Geocoding",
                link: "https://docs.gebeta.app/docs/geocoding/geocoding",
                description: "Convert addresses to coordinates and vice versa"
            },
            {
                title: "Route Optimization",
                link: "https://docs.gebeta.app/docs/route-optimization",
                description: "Find the most efficient routes for multiple stops"
            },
            {
                title: "Directions",
                link: "https://docs.gebeta.app/docs/direction",
                description: "Get turn-by-turn navigation for various transportation modes"
            },
            {
                title: "Matrix",
                link: "https://docs.gebeta.app/docs/matrix",
                description: "Calculate travel times and distances between multiple origins and destinations"
            },
        ],
    },
    {title: "Company", link: "/company"},
    {title: "Pricing", link: "/pricing"},
    {title: "Blog", link: "/blog"},
    {title: "Documentation", link: "https://docs.gebeta.app/"},
    {title: "Contact", link: "/contact"},
];

//Features

export const features: Array<Features> = [
    {
        title: "Seamless Local Data Access",
        subtitle: "Geocoding",
        description: "makes it effortless to access and integrate detailed local data. Whether for web or mobile platforms, we empower you to customize and include all the data you need, ensuring your users get the most relevant and up-to-date information.",
        image: {
            source: "/assets/geocoding.jpg",
            alt: "searching places",
            width: 586,
            height: 494
        },
        link: "https://docs.gebeta.app/docs/geocoding/geocoding"
    },
    {
        title: "Smart Route Optimization",
        subtitle: "Route Optimization",
        description: "API provides your users with the most optimal routes, making navigation easy. Whether you're developing for web or mobile, we ensure streamlined navigation, helping users save time and reach their destinations faster.",
        image: {
            source: "/assets/route-optimization.jpg",
            alt: "searching places",
            width: 586,
            height: 494
        },
        link: "https://docs.gebeta.app/docs/route-optimization"
    },
    // {
    //     title: "Optimized Navigation Routes",
    //     subtitle: "Direction",
    //     description: "API ensures seamless routing, offering the fastest and most efficient paths. Whether for web or mobile applications, we simplify navigation, so users can reach their destinations swiftly and hassle-free, every time.",
    //     image: {
    //         source: "/assets/geocoding.webp",
    //         alt: "searching places",
    //         width: 586,
    //         height: 494
    //     }
    // },
    {
        title: "Map Multiple Routes",
        subtitle: "ONM",
        description: "API one-to-many routing feature allows you to easily generate optimized routes from a single point to multiple destinations. Whether managing deliveries, planning logistics, or mapping out multiple stops, our API ensures that your users receive the most efficient paths to all their endpoints in one go",
        image: {
            source: "/assets/onm.jpg",
            alt: "searching places",
            width: 586,
            height: 494
        },
        link: "https://docs.gebeta.app/docs/onm"
    },
]

//Pricing

export const pricing: Array<Pricing> = [
    {
        title: "Start up",
        subtitle: "Best for your early-stage startup affordable and flexible.",
        price: 500,
        features: [
            {
                service: "Geocoding",
                credit: 300
            },
            {
                service: "Route Optimization",
                credit: 300,
            },
            {
                service: "ONM",
                credit: 300,
                showInfo: true,
                toolTip: "One to many"
            },
        ]
    },
    {
        title: "Premium",
        subtitle: "Best for growth-stage startups or enterprises with moderate usage.",
        price: 1000,
        features: [
            {
                service: "Geocoding",
                credit: 1500
            },
            {
                service: "Route Optimization",
                credit: 1500,
            },
            {
                service: "ONM",
                credit: 1500,
                showInfo: true,
                toolTip: "One to many"
            },
            {
                service: "Direction",
                credit: 1500
            },
            {
                service: "Solution support",
                credit: ""
            },
        ]
    },
    {
        title: "Developer",
        subtitle: "Great fit for individual developers and idea testing",
    },
    {
        title: "Enterprise",
        subtitle: "Best choice for high usage by any organization.",
        price: "Let's Talk",
        features: [
            {
                service: "Geocoding",
                credit: "Unlimited"
            },
            {
                service: "Route Optimization",
                credit: "Unlimited",
            },
            {
                service: "Direction",
                credit: "Unlimited"
            },
            {
                service: "ONM",
                credit: "Unlimited",
                showInfo: true,
                toolTip: "One to many"
            },
            {
                service: "Matrix",
                credit: "Unlimited",
            },
            {
                service: "White glove support",
                credit: ""
            },
        ]
    }
];

// Testimonials

export const testimonial: Array<Testimonial> = [
    {
        companyLogo: "/assets/zayride",
        reviewerName: "Habtamu Tadesse",
        reviewerRole: "Founder and CEO",
        reviewerImage: "/assets/habtamu.png",
        description: "I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    }, {
        companyLogo: "/assets/nid",
        reviewerName: "Abenezer Feleke",
        reviewerRole: "NID, Head of Communications",
        reviewerImage: "/assets/habtamu.png",
        description: "Our experience with Gebeta Maps was very satisfactory and would like to express our utmost appreciation with their mapping services. Their expertise has made a tangible impact on our website by enhancing its functionality and user-friendliness, particularly in terms of helping citizens locate our Registration centers with ease. We are pleased to recommend their services to others seeking reliable and effective mapping solutions."
    }, {
        companyLogo: "/assets/adika",
        reviewerName: "Biruk Fekade",
        reviewerRole: "Founder and CEO",
        reviewerImage: "/assets/habtamu.png",
        description: "Gebeta Maps has consistently proven to be an invaluable asset forI highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers. Adika. The seamless integration of their API into our systems has significantly enhanced our location-based services. The accuracy and up-to-date information provided by Gebeta Maps have played a crucial role in improving the overall user experience for our customers."
    },
]

//Showcases

export const showcases: Array<Showcase> = [
    {
        title: "Zayride",
        companyLogo: "/assets/zayride.svg",
        companyLogoSize: {width: 102, height: 60},
        showcasePicture: "/assets/zayride-showcase.png",
        description: "See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed: "Habtamu Tadesse"
    },
    {
        title: "NID",
        companyLogo: "/assets/nid.svg",
        companyLogoSize: {width: 58, height: 59},
        showcasePicture: "/assets/nid-showcase.svg",
        description: "See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed: "Habtamu Tadesse"
    },
    {
        title: "Adika",
        companyLogo: "/assets/adika.svg",
        companyLogoSize: {width: 60, height: 60},
        showcasePicture: "/assets/adika-showcase.png",
        description: "See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed: "Habtamu Tadesse"
    },
]

//Footer links

export const footerLinks: Array<FooterLink> = [
    {
        title: "",
        link: ""
    }
]

//Our Team
// export const teamMembers = [
//     {name: "Bemhreth Gezahegn", role: "CEO", img: "/assets/bemhret.png"},
//     {name: "Abenezer Seifu", role: "CTO", img: "/assets/abeni.png"},
//     {name: "Benayas Teshome", role: "COO", img: "/assets/beni.png"},
//     {name: "Rahel Tura", role: "CFO", img: "/assets/rahel.png"},
//     {name: "Deborah Terefe", role: "Legal Advisor", img: "/assets/debora.png"},
//     {name: "Bereket Terefe", role: "Senior Software Engineer", img: "/assets/bereket.png"},
//     {name: "Daniel Tsegaw", role: "Senior Software Engineer", img: "/assets/dani.png"},
//     {name: "Zubeyr Anwar", role: "Frontend Developer", img: "/assets/zubeyr.jpg"},
//     {name: "Tsegaw Tesfaye", role: "Graphic Designer", img: "/assets/tsegaw.png"},
// ]


export type Properties = Record<string, any>;

export enum TrackingEventNames {
    PRICING_PAGE_VIEW = "Pricing Page View",
    CONTACT_PAGE_VIEW = "Contact Page View",
    SIGNIN_PAGE_VIEW = "Sign In Page View",
    REGISTER_PAGE_VIEW = "Register Page View",
    PASSWORD_RESET_PAGE_VIEW = "Password Reset Page View",

    // User Actions
    REGISTRATION_COMPLETED = "Registration Completed",
    LOGIN_SUCCESSFUL = "Login Successful",
    PASSWORD_RESET_REQUESTED = "Password Reset Requested",
    PASSWORD_RESET_COMPLETED = "Password Reset Completed",
    PROFILE_UPDATED = "Profile Updated",
    SUBSCRIPTION_CHANGED = "Subscription Changed",
    BUTTON_CLICKED = "Button Clicked",
    FORM_SUBMITTED = "Form Submitted"
}

interface TrackableEvent {
    event_name: TrackingEventNames;
    properties?: Properties | null;
    path: string;
}

export const trackableRoutes: TrackableEvent[] = [
    {
        event_name: TrackingEventNames.PRICING_PAGE_VIEW,
        path: "/pricing",
        properties: {
            source: "pricing_page"
        }
    },
    {
        event_name: TrackingEventNames.CONTACT_PAGE_VIEW,
        path: "/contact",
        properties: {
            source: "contact_page"
        }
    },
    {
        event_name: TrackingEventNames.SIGNIN_PAGE_VIEW,
        path: "/auth/signin",
        properties: {
            source: "signin_page"
        }
    },
    {
        event_name: TrackingEventNames.REGISTER_PAGE_VIEW,
        path: "/auth/register",
        properties: {
            source: "registration_page"
        }
    },
    {
        event_name: TrackingEventNames.PASSWORD_RESET_PAGE_VIEW,
        path: "/auth/reset-password",
        properties: {
            source: "password_reset_page"
        }
    }
];