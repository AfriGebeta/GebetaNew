// Spinner.tsx
import {Loader2} from "lucide-react";

const Spinner = () => {
    return (
        <div className="h-screen flex justify-center items-center">
            <Loader2 className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white text-[#FFA500]" />
        </div>
    );
};

export default Spinner;