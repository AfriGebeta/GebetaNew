import React from "react"

const Container = ({ children }: {children:React.ReactNode}) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
            {children}
        </div>
    );
};

export default Container;