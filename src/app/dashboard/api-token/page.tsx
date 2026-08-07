//@ts-nocheck
"use client"
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
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
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import React, {useContext, useEffect, useState} from "react";
import {createAllowedIp, deleteAllowedIp, getAllowedIps, updateAllowedIp, revokeToken, setToken} from "@/service/apis";
import {useToast} from "@/hooks/use-toast"
import {CopyIcon, EyeIcon, NetworkIcon, PencilIcon, PlusIcon, Trash2Icon} from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import ScopeSelectionModal from "@/components/ScopeSelectionModal";
import { useReferenceData } from "@/hooks/useReferenceData";
import { getDefaultSelectedScopes, getGrantedScopes } from "@/lib/referenceData";
import { formatAllowedIpDate, maskApiKey, normalizeAllowedIp } from "@/lib/allowedIp";

export default function APIToken() {
    const { currentUser, setCurrentUser } = useContext(AuthContext)
    const [tokenList, setTokenList] = useState((currentUser?.user?.token || []).filter(t => !t.revoked));
    const [newToken, setNewToken] = useState("");
    const [selectedToken, setSelectedToken] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [allowedIps, setAllowedIps] = useState([]);
    const [allowedIpDialogOpen, setAllowedIpDialogOpen] = useState(false);
    const [editAllowedIpDialogOpen, setEditAllowedIpDialogOpen] = useState(false);
    const [lockIpAddress, setLockIpAddress] = useState("");
    const [lockApiKey, setLockApiKey] = useState("");
    const [lockDescription, setLockDescription] = useState("");
    const [editAllowedIpForm, setEditAllowedIpForm] = useState({ id: "", ipAddress: "", apiKey: "", description: "" });
    const [isAddingAllowedIp, setIsAddingAllowedIp] = useState(false);
    const [isUpdatingAllowedIp, setIsUpdatingAllowedIp] = useState(false);
    const [isDeletingAllowedIpId, setIsDeletingAllowedIpId] = useState(null);
    const [allowedIpsLoading, setAllowedIpsLoading] = useState(false);
    const [allowedIpsCount, setAllowedIpsCount] = useState(0);

    const { allowedScopes, loading: scopesLoading } = useReferenceData();
    // allowedScopes is the platform-wide list of scope types that exist; a given
    // account can only be issued a token for the subset the backend has actually
    // granted it (currentUser.user.allowed_scopes) - requesting anything outside
    // that subset gets rejected with a 422, so the picker must offer only these.
    const grantedScopes = getGrantedScopes(allowedScopes, currentUser?.user?.allowed_scopes);
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [defaultsApplied, setDefaultsApplied] = useState(false);

    useEffect(() => {
        if (!scopesLoading && grantedScopes.length > 0 && !defaultsApplied) {
            setSelectedScopes(getDefaultSelectedScopes(grantedScopes));
            setDefaultsApplied(true);
        }
    }, [scopesLoading, grantedScopes, defaultsApplied]);

    const fetchAllowedIps = async () => {
        if (!currentUser?.token) return;
        setAllowedIpsLoading(true);
        const result = await getAllowedIps(currentUser.token);
        const domains = (result.domains ?? []).map(normalizeAllowedIp);
        setAllowedIps(domains);
        setAllowedIpsCount(result.count ?? domains.length);
        setAllowedIpsLoading(false);
    };

    useEffect(() => {
        if (currentUser?.token) fetchAllowedIps();
    }, [currentUser?.token]);

    const toggleScope = (scope) => {
        setSelectedScopes(prev =>
            prev.includes(scope)
                ? prev.filter(s => s !== scope)
                : [...prev, scope]
        );
    };

    const {toast} = useToast()

    const copyToClipboard = (token) => {
        navigator.clipboard.writeText(token)
            .then(() => toast({ description: "Copied to clipboard"}))
            .catch(err => {
                toast({
                    description: "Failed to copy to clipboard",
                    variant: "destructive"
                });
            })
    };

    const createToken = async (identifierName) => {
        if (selectedScopes.length === 0) {
            toast({
                description: "Please select at least one scope",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        try {
            const response = await setToken({
                apiToken: currentUser?.token,
                userId: currentUser?.user?.id,
                scopes: selectedScopes,
                identifierName: identifierName
            });

            if (response.success) {
                const newTokenData = {
                    ...response.data,
                    tokenIdentifierName: response.data.tokenIdentifierName || identifierName
                };

                const updatedTokens = [...tokenList, newTokenData];
                setTokenList(updatedTokens);
                setCurrentUser({
                    ...currentUser,
                    user: {
                        ...currentUser.user,
                        token: updatedTokens
                    }
                });
                setNewToken(response.data.token);
                setScopeDialogOpen(false);
                toast({
                    description: response.message || "Token created successfully",
                });
                setSelectedScopes(getDefaultSelectedScopes(grantedScopes));
            } else {
                toast({
                    description: `${response.message}`,
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error('Failed to create token: ', err);
            toast({
                description: "Failed to create token",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevokeToken = async (tokenToRevoke) => {
        try {
            const response = await revokeToken(currentUser.token, tokenToRevoke?.token)
            if (response.success) {
                const updatedTokens = tokenList.filter(t => t.token !== tokenToRevoke.token || t.id !== tokenToRevoke.id)
                setTokenList(updatedTokens);
                setCurrentUser({
                    ...currentUser,
                    user: {
                        ...currentUser.user,
                        token: updatedTokens
                    }
                });
                toast({
                    description: "Token revoked successfully"
                });
            } else {
                toast({
                    description: `${response.message}`,
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                description: "Failed to revoke token",
                variant: "destructive"
            })
        }
    }

    const handleShowToken = (token) => {
        setSelectedToken(token);
        setDialogOpen(true);
    };

    const handleAddAllowedIp = async () => {
        if (!lockIpAddress.trim()) {
            toast({ description: "Please enter an IP address", variant: "destructive"});
            return;
        }
        if (!lockApiKey.trim()) {
            toast({ description: "Please enter an API key", variant: "destructive"});
            return;
        }
        setIsAddingAllowedIp(true);
        const result = await createAllowedIp(currentUser?.token, {
            ipAddress: lockIpAddress.trim(),
            apiKey: lockApiKey.trim(),
            description: lockDescription.trim() || undefined,
        });
        if (result.success) {
            setLockIpAddress("");
            setLockApiKey("");
            setLockDescription("");
            setAllowedIpDialogOpen(false);
            await fetchAllowedIps();
            toast({description: "Allowed IP added successfully"});
        } else {
            toast({description: result.message || "Failed to add allowed IP", variant: "destructive"});
        }
        setIsAddingAllowedIp(false);
    };

    const handleDeleteAllowedIp = async (id) => {
        setIsDeletingAllowedIpId(id);
        const result = await deleteAllowedIp(currentUser?.token, id);
        if (result.success) {
            await fetchAllowedIps();
            toast({description: "Allowed IP removed"});
        } else {
            toast({description: result.message || "Failed to remove allowed IP", variant: "destructive"});
        }
        setIsDeletingAllowedIpId(null);
    };

    const openEditAllowedIp = (entry) => {
        setEditAllowedIpForm({
            id: entry.id,
            ipAddress: entry.ipAddress,
            apiKey: entry.apiKey,
            description: entry.description,
        });
        setEditAllowedIpDialogOpen(true);
    };

    const handleUpdateAllowedIp = async () => {
        if (!editAllowedIpForm.ipAddress.trim()) {
            toast({description: "Please enter an IP address", variant: "destructive"});
            return;
        }
        if (!editAllowedIpForm.apiKey.trim()) {
            toast({description: "Please enter an API key", variant: "destructive"});
            return;
        }
        setIsUpdatingAllowedIp(true);
        const result = await updateAllowedIp(currentUser?.token, {
            id: editAllowedIpForm.id,
            ipAddress: editAllowedIpForm.ipAddress.trim(),
            apiKey: editAllowedIpForm.apiKey.trim(),
            description: editAllowedIpForm.description.trim() || undefined,
        });
        if (result.success) {
            setEditAllowedIpDialogOpen(false);
            await fetchAllowedIps();
            toast({description: "Allowed IP updated"});
        } else {
            toast({description: result.message || "Failed to update allowed IP", variant: "destructive"});
        }
        setIsUpdatingAllowedIp(false);
    };

    return (
        <div className="rounded text-[#aaa] p-4 md:p-6 mt-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-sm font-medium text-white dark:text-white">API Tokens</h2>
                <ScopeSelectionModal
                    open={scopeDialogOpen}
                    onOpenChange={setScopeDialogOpen}
                    selectedScopes={selectedScopes}
                    onToggleScope={toggleScope}
                    onCreateToken={createToken}
                    isCreating={isCreating}
                    availableScopes={grantedScopes}
                    scopesLoading={scopesLoading}
                    emptyScopesMessage="Your account has no API scopes granted yet. Contact support to enable them."
                    trigger={
                        <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                            Create Token
                        </Button>
                    }
                />
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tokenList.map((token, index) => {
                        return (
                            <TableRow key={index}>
                                <TableCell className="font-mono">
                                    <span className="hidden sm:inline">{(token?.token).replace(/./g, '●').slice(0, 24)}</span>
                                    <span className="inline sm:hidden">{(token?.token).replace(/./g, '●').slice(0, 12)}</span>
                                </TableCell>
                                <TableCell>{token?.tokenIdentifierName || ''}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="link"
                                            onClick={() => copyToClipboard(token?.token)}
                                            className="flex items-center p-2"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="link"
                                            onClick={() => handleRevokeToken(token)}
                                            className="flex items-center p-2"
                                        >
                                            <Trash2Icon className="w-4 h-4" />
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="link"
                                                    onClick={() => handleShowToken(token?.token)}
                                                    className="p-2"
                                                >
                                                    <EyeIcon className="w-4 h-4" />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-md">
                                                <DialogHeader>
                                                    <DialogTitle>API Token</DialogTitle>
                                                    <DialogDescription
                                                        className="relative break-words overflow-hidden max-w-sm">
                                                        <div
                                                            className="whitespace-normal break-words overflow-wrap break-all">
                                                            {selectedToken}
                                                        </div>
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter className="sm:justify-start">
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="secondary">
                                                            Close
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-sm font-medium text-white dark:text-white">Allowed IPs</h2>
                        <p className="text-xs text-[#aaa] mt-1">
                            Restrict API access to specific IP addresses and API keys
                            {!allowedIpsLoading && allowedIpsCount > 0 ? ` · ${allowedIpsCount} total` : ""}
                        </p>
                    </div>
                    <Dialog open={allowedIpDialogOpen} onOpenChange={setAllowedIpDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                                <PlusIcon className="w-4 h-4 mr-1" /> Add Allowed IP
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Allowed IP</DialogTitle>
                                <DialogDescription>
                                    Restrict API access to a specific IP address. Only requests from this IP using the linked API key will be allowed.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                    <Label htmlFor="lock-ip-address">IP Address</Label>
                                    <Input
                                        id="lock-ip-address"
                                        placeholder="e.g. 203.0.113.42"
                                        value={lockIpAddress}
                                        onChange={(e) => setLockIpAddress(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lock-apikey">API Key</Label>
                                    <Input
                                        id="lock-apikey"
                                        placeholder="Enter API key"
                                        value={lockApiKey}
                                        onChange={(e) => setLockApiKey(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lock-description">Description (Optional)</Label>
                                    <Input
                                        id="lock-description"
                                        placeholder="e.g. Production server"
                                        value={lockDescription}
                                        onChange={(e) => setLockDescription(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                    onClick={handleAddAllowedIp}
                                    disabled={isAddingAllowedIp || !lockIpAddress.trim() || !lockApiKey.trim()}
                                >
                                    {isAddingAllowedIp ? "Adding..." : "Add"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={editAllowedIpDialogOpen} onOpenChange={setEditAllowedIpDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Allowed IP</DialogTitle>
                            <DialogDescription>Update the IP address, API key, and description.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-ip-address">IP Address</Label>
                                <Input
                                    id="edit-ip-address"
                                    placeholder="e.g. 203.0.113.42"
                                    value={editAllowedIpForm.ipAddress}
                                    onChange={(e) => setEditAllowedIpForm(f => ({ ...f, ipAddress: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-apikey">API Key</Label>
                                <Input
                                    id="edit-apikey"
                                    placeholder="Enter API key"
                                    value={editAllowedIpForm.apiKey}
                                    onChange={(e) => setEditAllowedIpForm(f => ({ ...f, apiKey: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-description">Description (Optional)</Label>
                                <Input
                                    id="edit-description"
                                    placeholder="e.g. Production server"
                                    value={editAllowedIpForm.description}
                                    onChange={(e) => setEditAllowedIpForm(f => ({ ...f, description: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                onClick={handleUpdateAllowedIp}
                                disabled={isUpdatingAllowedIp || !editAllowedIpForm.ipAddress.trim() || !editAllowedIpForm.apiKey.trim()}
                            >
                                {isUpdatingAllowedIp ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {allowedIpsLoading ? (
                    <p className="text-sm text-[#aaa] py-4">Loading...</p>
                ) : allowedIps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#aaa] border border-dashed rounded-md">
                        <NetworkIcon className="w-8 h-8 opacity-40" />
                        <p className="text-sm">No allowed IPs configured</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>IP Address</TableHead>
                                <TableHead>API Key</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allowedIps.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="font-mono text-sm">{entry.ipAddress || "—"}</TableCell>
                                    <TableCell className="font-mono text-sm">
                                        <div className="flex items-center gap-2">
                                            <span>{maskApiKey(entry.apiKey)}</span>
                                            {entry.apiKey ? (
                                                <Button
                                                    variant="link"
                                                    onClick={() => copyToClipboard(entry.apiKey)}
                                                    className="p-0 h-auto"
                                                    title="Copy API key"
                                                >
                                                    <CopyIcon className="w-3.5 h-3.5" />
                                                </Button>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm">{entry.description || "—"}</TableCell>
                                    <TableCell className="text-sm text-[#aaa]">{formatAllowedIpDate(entry.createdAt)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-1">
                                            <Button
                                                variant="link"
                                                onClick={() => openEditAllowedIp(entry)}
                                                className="p-2"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => handleDeleteAllowedIp(entry.id)}
                                                disabled={isDeletingAllowedIpId === entry.id}
                                                className="p-2"
                                            >
                                                <Trash2Icon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
