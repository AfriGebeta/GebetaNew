const Container = ({ children }) => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden">
            {children}
        </div>
    );
};

export default Container;