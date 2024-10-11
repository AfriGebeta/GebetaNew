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