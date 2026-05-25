//@ts-nocheck
"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useContext, useEffect, useState } from "react";
import { createServiceAccount, getServiceAccounts, deleteServiceAccount } from "@/service/apis";
import { useToast } from "@/hooks/use-toast"
import { CopyIcon, EyeIcon, EyeOffIcon, KeyIcon, PlusIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { AuthContext } from "@/providers/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";

const AVAILABLE_SCOPES = [
    { value: "FEATURE_ALL", label: "Feature All" },
    { value: "TRACKING_HTTP", label: "Tracking HTTP" },
    { value: "MATRIX", label: "Matrix" },
    { value: "ONM", label: "ONM" },
    { value: "TILE", label: "Tile" },
    { value: "DIRECTION", label: "Direction" },
    { value: "TSS", label: "TSS" },
    { value: "VRP", label: "VRP" },
    { value: "TRACKING_SOCKET", label: "Tracking Socket" },
    { value: "GEOCODING", label: "Geocoding" }
];

export default function ServiceAccount() {
    const { currentUser } = useContext(AuthContext)
    const [serviceAccounts, setServiceAccounts] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [description, setDescription] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [selectedScopes, setSelectedScopes] = useState(AVAILABLE_SCOPES.map(s => s.value));
    const [showClientToken, setShowClientToken] = useState({});
    const [showServerToken, setShowServerToken] = useState({});
    const [isDeleting, setIsDeleting] = useState(null);
    const [newlyCreatedToken, setNewlyCreatedToken] = useState(null);
    const [tokenDialogOpen, setTokenDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast()

    const fetchServiceAccounts = async () => {
        if (!currentUser?.token) return;
        setIsLoading(true);
        try {
            const result = await getServiceAccounts(currentUser.token, currentUser.user?.id);
            setServiceAccounts(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Failed to fetch service accounts:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.token) fetchServiceAccounts();
    }, [currentUser?.token]);

    const toggleScope = (scopeValue) => {
        setSelectedScopes(prev =>
            prev.includes(scopeValue)
                ? prev.filter(s => s !== scopeValue)
                : [...prev, scopeValue]
        );
    };

    const copyToClipboard = (token, label) => {
        navigator.clipboard.writeText(token)
            .then(() => toast({ description: `${label} copied to clipboard` }))
            .catch(() => {
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive"
                });
            })
    };

    const createAccount = async () => {
        if (selectedScopes.length === 0) {
            toast({
                description: "Please select at least one scope",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await createServiceAccount({
                apiToken: currentUser?.token,
                description: description || "",
                scopes: selectedScopes,
                isAdmin: isAdmin
            });

            if (response.success) {
                await fetchServiceAccounts();
                setDialogOpen(false);
                setDescription("");
                setIsAdmin(false);
                setSelectedScopes(AVAILABLE_SCOPES.map(s => s.value));

                if (response.data?.token) {
                    setNewlyCreatedToken(response.data.token);
                    setTokenDialogOpen(true);
                }

                toast({
                    description: "Service account created successfully",
                });
            } else {
                toast({
                    description: response.message || "Failed to create service account",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error('Failed to create service account: ', err);
            toast({
                description: "Failed to create service account",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteAccount = async (id) => {
        setIsDeleting(id);
        try {
            const response = await deleteServiceAccount(currentUser.token, id);
            if (response.success) {
                await fetchServiceAccounts();
                toast({
                    description: "Service account deleted successfully"
                });
            } else {
                toast({
                    description: response.message || "Failed to delete service account",
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                description: "Failed to delete service account",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(null);
        }
    }

    const toggleTokenVisibility = (id, type) => {
        if (type === 'client') {
            setShowClientToken(prev => ({ ...prev, [id]: !prev[id] }));
        } else {
            setShowServerToken(prev => ({ ...prev, [id]: !prev[id] }));
        }
    };

    return (
        <div className="rounded text-[#aaa] p-4 md:p-6 mt-2">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Service Accounts</h2>
                <p className="text-sm text-[#aaa]">
                    Service accounts provide secure authentication using two tokens (client and server).
                    Combine them to get short lived access tokens instead of exposing long term credentials.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-medium text-white">Your Service Accounts</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                            <PlusIcon className="w-4 h-4 mr-1" /> Create Service Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create Service Account</DialogTitle>
                            <DialogDescription>
                                Create a new service account with client and server tokens for secure authentication.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    placeholder="e.g., Production API access"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center justify-between space-x-2 py-2">
                                <div className="space-y-0.5">
                                    <Label htmlFor="admin-mode">Admin Token</Label>
                                    <p className="text-xs text-[#aaa]">Grant admin privileges to this service account</p>
                                </div>
                                <Switch
                                    id="admin-mode"
                                    checked={isAdmin}
                                    onCheckedChange={setIsAdmin}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Scopes</Label>
                                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border rounded">
                                    {AVAILABLE_SCOPES.map((scope) => (
                                        <div key={scope.value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={scope.value}
                                                checked={selectedScopes.includes(scope.value)}
                                                onCheckedChange={() => toggleScope(scope.value)}
                                            />
                                            <label
                                                htmlFor={scope.value}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {scope.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                onClick={createAccount}
                                disabled={isCreating}
                            >
                                {isCreating ? "Creating..." : "Create"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Service Account Token Created</DialogTitle>
                        <DialogDescription>
                            Save this token securely. You won't be able to see it again!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Token</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={newlyCreatedToken || ""}
                                    readOnly
                                    className="font-mono text-xs"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(newlyCreatedToken, "Token")}
                                >
                                    <CopyIcon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3">
                            <p className="text-xs text-black dark:text-black">
                                <span className="font-semibold">Important:</span> This token will only be shown once. Make sure to copy and store it securely.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setTokenDialogOpen(false);
                                setNewlyCreatedToken(null);
                            }}
                            className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                        >
                            I've Saved the Token
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-40" />
                                    </div>
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : serviceAccounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#aaa] border border-dashed rounded-md">
                    <ShieldCheckIcon className="w-12 h-12 opacity-40" />
                    <p className="text-sm">No service accounts yet</p>
                    <p className="text-xs text-center max-w-md">
                        Create a service account to get secure client and server tokens for authentication
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {serviceAccounts.map((account) => (
                        <div key={account.id} className="border rounded-lg p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${account.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                            {account.status}
                                        </span>
                                        <p className="text-sm font-medium text-white">
                                            {account.description || `Service Account #${account.id}`}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-[#aaa]">
                                            Platform: {account.platform}
                                        </p>
                                        <p className="text-xs text-[#aaa]">
                                            Admin: {account.isAdmin ? "Yes" : "No"}
                                        </p>
                                        <p className="text-xs text-[#aaa]">
                                            User Token ID: {account.userTokenId}
                                        </p>
                                        <p className="text-xs text-[#aaa]">
                                            Created: {new Date(account.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="link"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    disabled={isDeleting === account.id || account.revoked}
                                    className="p-2 text-red-500 hover:text-red-600"
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
