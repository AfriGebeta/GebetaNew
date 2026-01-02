//@ts-nocheck
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ScopeSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedScopes: string[];
    onToggleScope: (scope: string) => void;
    onCreateToken: (identifierName: string) => void;
    isCreating: boolean;
    trigger?: React.ReactNode;
}

const availableScopes = [
    "FEATURE_ALL",
    "MATRIX",
    "ONM",
    "TILE",
    "DIRECTION",
    "TSS",
    "VRP",
    "TRACKING_HTTP",
    "TRACKING_SOCKET",
    "GEOCODING"
];

export default function ScopeSelectionModal({
    open,
    onOpenChange,
    selectedScopes,
    onToggleScope,
    onCreateToken,
    isCreating,
    trigger
}: ScopeSelectionModalProps) {
    const [identifierName, setIdentifierName] = useState("");

    const handleCreateToken = () => {
        onCreateToken(identifierName);
        setIdentifierName("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-lg bg-white dark:bg-[#0a0a0f] border-gray-200 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-[#1B1E2B] dark:text-white text-xl">
                        Set Token with Scopes
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Select the scopes for your token
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        <p className="text-sm font-medium text-[#1B1E2B] dark:text-white">Scopes</p>
                        {availableScopes.map((scope) => (
                            <div key={scope} className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id={scope}
                                    checked={selectedScopes.includes(scope)}
                                    onChange={() => onToggleScope(scope)}
                                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[#FFA500] focus:ring-[#FFA500] focus:ring-offset-0 cursor-pointer"
                                />
                                <label
                                    htmlFor={scope}
                                    className="text-[#1B1E2B] dark:text-white text-sm font-medium cursor-pointer select-none"
                                >
                                    {scope}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label
                            htmlFor="identifierName"
                            className="block text-sm font-medium text-[#1B1E2B] dark:text-white mb-2"
                        >
                            Token Identifier
                        </label>
                        <input
                            type="text"
                            id="identifierName"
                            value={identifierName}
                            onChange={(e) => setIdentifierName(e.target.value)}
                            placeholder="e.g., Your App"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                                     bg-white dark:bg-gray-800 text-[#1B1E2B] dark:text-white
                                     focus:outline-none focus:ring-2 focus:ring-[#FFA500] focus:border-transparent
                                     placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            setIdentifierName("");
                        }}
                        className="border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCreateToken}
                        disabled={isCreating || selectedScopes.length === 0 || !identifierName.trim()}
                        className="bg-[#FFA500] text-white hover:bg-[#FF8C00] disabled:opacity-50"
                    >
                        {isCreating ? "Creating..." : "Set Token"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
