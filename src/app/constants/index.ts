interface Features {
    title: string
    subtitle: string
    description: string
    image: {
        source:string
        alt:string
        width:number
        height:number
    }
}

interface Pricing {
    title:string
    subtitle:string
    price:number | string
    features:{
        service:string
        credit:number | string
        showInfo?:boolean
        toolTip?:string
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
    title:string
    companyLogo:string
    companyLogoSize:{
        width:number
        height:number
    }
    showcasePicture:string
    description:string
    interviewed:string
}

interface FooterLink {
    title:string
    link:string
}

interface MegaMenu {
    title: string;
    link?: string | ""
    submenu?: {
        title: string;
        link: string;
        description: string;
    }[];
}

export const menuItems:Array<MegaMenu> = [
    {
        title: "Products",
        submenu: [
            { title: "Geocoding",link:"/products/geocoding" ,description: "Convert addresses to coordinates and vice versa" },
            { title: "Route Optimization",link:"/products/tss" , description: "Find the most efficient routes for multiple stops" },
            { title: "Directions", link:"/products/direction" ,description: "Get turn-by-turn navigation for various transportation modes" },
            { title: "Matrix",link:"/products/matrix" , description: "Calculate travel times and distances between multiple origins and destinations" },
        ],
    },
    {
        title: "Solutions",
        submenu: [
            { title: "Logistics",link:"/solutions/logistics" , description: "Optimize your supply chain and delivery operations" },
            { title: "Delivery",link:"/solution/delivery" , description: "Streamline last-mile delivery and route planning" },
            { title: "Ride-hailing",link:"/solutions/ride",  description: "Enhance your ride-sharing and taxi services" },
        ],
    },
    {
        title: "Company",
        submenu: [
            { title: "Who We Are",link:"/company/who_we_are", description: "Learn about our mission and vision" },
            { title: "What We Value",link:"/company/what_we_value", description: "Discover our core principles and culture" },
            { title: "What We Do", link:"/company/what_we_do", description: "Explore our innovative mapping solutions" },
        ],
    },
    { title: "Documentation" ,link:"https://www.docs.gebetamaps.app"},
    { title: "Blog" ,link:"/blog"},
    { title: "Pricing", link:"/pricing" },
];

//Features

export const features:Array<Features> = [
    {
        title:"Seamless Local Data Access",
        subtitle:"Geocoding",
        description:"makes it effortless to access and integrate detailed local data. Whether for web or mobile platforms, we empower you to customize and include all the data you need, ensuring your users get the most relevant and up-to-date information.",
        image:{
            source:"/assets/geocoding.webp",
            alt:"searching places",
            width:586,
            height:494
        }
    },
    {
        title:"Smart Route Optimization",
        subtitle:"Route Optimization",
        description:"API provides your users with the most optimal routes, making navigation easy. Whether you're developing for web or mobile, we ensure streamlined navigation, helping users save time and reach their destinations faster.",
        image:{
            source:"/assets/geocoding.webp",
            alt:"searching places",
            width:586,
            height:494
        }
    },
    {
        title:"Optimized Navigation Routes",
        subtitle:"Direction",
        description:"API ensures seamless routing, offering the fastest and most efficient paths. Whether for web or mobile applications, we simplify navigation, so users can reach their destinations swiftly and hassle-free, every time.",
        image:{
            source:"/assets/geocoding.webp",
            alt:"searching places",
            width:586,
            height:494
        }
    },
    {
        title:"Map Multiple Routes",
        subtitle:"ONM",
        description:"API one-to-many routing feature allows you to easily generate optimized routes from a single point to multiple destinations. Whether managing deliveries, planning logistics, or mapping out multiple stops, our API ensures that your users receive the most efficient paths to all their endpoints in one go",
        image:{
            source:"/assets/geocoding.webp",
            alt:"searching places",
            width:586,
            height:494
        }
    },
]

//Pricing

export const pricing: Array<Pricing> = [
    {
        title: "Individual",
        subtitle: "Best choice for your startup get your api key and use today!",
        price: 500,
        features: [
            {
                service: "Geocoding",
                credit: 300
            },
            {
                service: "Route Optimization",
                credit: 300,
                showInfo: true,
                toolTip:"Route Optimization is bla bla"
            },
            {
                service: "ONM",
                credit: 300,
                showInfo:true,
                toolTip:"ONM is bla bla"
            },
        ]
    },
    {
        title: "Business",
        subtitle: "Grow and expand your business like never before.",
        price: 1000,
        features: [
            {
                service: "Geocoding",
                credit: 1500
            },
            {
                service: "Route Optimization",
                credit: 1500,
                showInfo: true,
                toolTip:"Route Optimization is bla bla"
            },
            {
                service: "ONM",
                credit: 1500,
                showInfo: true,
                toolTip:"ONM is bla bla"
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
        title: "Enterprise",
        subtitle: "Talk to Us to Create a Pricing Model That Fits Your Needs, Only Paying for What You Use!",
        price: "Let's Talk",
        features: [
            {
                service: "Geocoding",
                credit: "Unlimited"
            },
            {
                service: "Route Optimization",
                credit: "Unlimited",
                showInfo: true,
                toolTip:"Route Optimization is bla bla"
            },
            {
                service: "Direction",
                credit: "Unlimited"
            },
            {
                service: "ONM",
                credit: "Unlimited",
                showInfo: true,
                toolTip:"ONM is bla bla"
            },
            {
                service: "Matrix",
                credit: "Unlimited",
                showInfo: true,
                toolTip:"Matrix is bla bla"
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
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },{
        companyLogo:"/assets/zayride",
        reviewerName:"Habtamu Tadesse",
        reviewerRole:"Founder and CEO",
        reviewerImage:"/assets/habtamu.png",
        description:"I highly recommend Gebeta Maps as an essential mapping service for ZayRide. Their accurate and up-to-date maps have greatly improved navigation for our taxi drivers, ensuring efficient and reliable transportation services for our passengers."
    },
]

//Showcases

export const showcases:Array<Showcase> = [
    {
        title:"Zayride",
        companyLogo:"/assets/zayride.svg",
        companyLogoSize:{width:102, height:60},
        showcasePicture:"/assets/zayride-showcase.png",
        description:"See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed:"Habtamu Tadesse"
    },
    {
        title:"NID",
        companyLogo:"/assets/nid.svg",
        companyLogoSize:{width:58, height:59},
        showcasePicture:"/assets/zayride-showcase.png",
        description:"See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed:"Habtamu Tadesse"
    },
    {
        title:"Adika",
        companyLogo:"/assets/adika.svg",
        companyLogoSize:{width:60, height:60},
        showcasePicture:"/assets/zayride-showcase.png",
        description:"See how our friends at zayride used our ai tools to optimize their routes to reach new customers and explode their reach  in this year.",
        interviewed:"Habtamu Tadesse"
    },
]

//Footer links

export const footerLinks:Array<FooterLink> = [
    {
        title:"",
        link:""
    }
]