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
import {createDomainLock, deleteDomainLock, getDomainLocks, updateDomainLock, revokeToken, setToken} from "@/service/apis";
import {useToast} from "@/hooks/use-toast"
import {CopyIcon, EyeIcon, GlobeIcon, PencilIcon, PlusIcon, Trash2Icon} from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import ScopeSelectionModal from "@/components/ScopeSelectionModal";

export default function APIToken() {
    const {currentUser, setCurrentUser} = useContext(AuthContext)
    const [tokenList, setTokenList] = useState(currentUser?.user?.token || []);
    const [newToken, setNewToken] = useState("");
    const [selectedToken, setSelectedToken] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [scopeDialogOpen, setScopeDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    //for domain lock
    const [domainLocks, setDomainLocks] = useState([]);
    const [domainLockDialogOpen, setDomainLockDialogOpen] = useState(false);
    const [editDomainDialogOpen, setEditDomainDialogOpen] = useState(false);
    const [lockDomain, setLockDomain] = useState("");
    const [editDomainForm, setEditDomainForm] = useState({ id: "", domain: "" });
    const [isAddingLock, setIsAddingLock] = useState(false);
    const [isUpdatingLock, setIsUpdatingLock] = useState(false);
    const [isDeletingLockId, setIsDeletingLockId] = useState(null);
    const [domainLocksLoading, setDomainLocksLoading] = useState(false);

    //default ones
    const [selectedScopes, setSelectedScopes] = useState([
        "DIRECTION",
        "GEOCODING",
        "TILE",
        "MATRIX",
        "ONM",
        "TSS"
    ]);

    const fetchDomainLocks = async () => {
        if (!currentUser?.token) return;
        setDomainLocksLoading(true);
        const result = await getDomainLocks(currentUser.token);
        setDomainLocks(Array.isArray(result) ? result : []);
        setDomainLocksLoading(false);
    };

    useEffect(() => {
        if (currentUser?.token) fetchDomainLocks();
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
            .then(() => toast({description: "Copied to clipboard"}))
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
                setSelectedScopes(["DIRECTION", "GEOCODING", "TILE", "MATRIX", "ONM", "TSS"]);
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

    const handleAddDomainLock = async () => {
        if (!lockDomain.trim()) {
            toast({description: "Please enter a domain", variant: "destructive"});
            return;
        }
        setIsAddingLock(true);
        const result = await createDomainLock(currentUser?.token, {
            userId: currentUser?.user?.id,
            domain: lockDomain.trim(),
        });
        if (result.success) {
            setLockDomain("");
            setDomainLockDialogOpen(false);
            await fetchDomainLocks();
            toast({description: "Domain lock added successfully"});
        } else {
            toast({description: result.message || "Failed to add domain lock", variant: "destructive"});
        }
        setIsAddingLock(false);
    };

    const handleDeleteDomainLock = async (id) => {
        setIsDeletingLockId(id);
        const result = await deleteDomainLock(currentUser?.token, id);
        if (result.success) {
            await fetchDomainLocks();
            toast({description: "Domain lock removed"});
        } else {
            toast({description: result.message || "Failed to remove domain lock", variant: "destructive"});
        }
        setIsDeletingLockId(null);
    };

    const openEditDomain = (lock) => {
        setEditDomainForm({ id: lock.id, domain: lock.domain });
        setEditDomainDialogOpen(true);
    };

    const handleUpdateDomainLock = async () => {
        if (!editDomainForm.domain.trim()) {
            toast({description: "Please enter a domain", variant: "destructive"});
            return;
        }
        setIsUpdatingLock(true);
        const result = await updateDomainLock(currentUser?.token, {
            id: editDomainForm.id,
            domain: editDomainForm.domain.trim(),
        });
        if (result.success) {
            setEditDomainDialogOpen(false);
            await fetchDomainLocks();
            toast({description: "Domain lock updated"});
        } else {
            toast({description: result.message || "Failed to update domain lock", variant: "destructive"});
        }
        setIsUpdatingLock(false);
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

            {/*domain lock section*/}
            <div className="mt-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <h2 className="text-sm font-medium text-white dark:text-white">Domain Lock</h2>
                        <p className="text-xs text-[#aaa] mt-1">Restrict API access to specific domains</p>
                    </div>
                    <Dialog open={domainLockDialogOpen} onOpenChange={setDomainLockDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                                <PlusIcon className="w-4 h-4 mr-1" /> Add Domain
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Domain Lock</DialogTitle>
                                <DialogDescription>
                                    Restrict API access to a specific domain. Only requests originating from this domain will be allowed.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1">
                                    <Label htmlFor="lock-domain">Domain</Label>
                                    <Input
                                        id="lock-domain"
                                        placeholder="e.g. https://example.com"
                                        value={lockDomain}
                                        onChange={(e) => setLockDomain(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                    onClick={handleAddDomainLock}
                                    disabled={isAddingLock}
                                >
                                    {isAddingLock ? "Adding..." : "Add Lock"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={editDomainDialogOpen} onOpenChange={setEditDomainDialogOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Domain Lock</DialogTitle>
                            <DialogDescription>Update the domain for this lock.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-domain">Domain</Label>
                                <Input
                                    id="edit-domain"
                                    placeholder="e.g. https://example.com"
                                    value={editDomainForm.domain}
                                    onChange={(e) => setEditDomainForm(f => ({ ...f, domain: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                onClick={handleUpdateDomainLock}
                                disabled={isUpdatingLock}
                            >
                                {isUpdatingLock ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {domainLocksLoading ? (
                    <p className="text-sm text-[#aaa] py-4">Loading...</p>
                ) : domainLocks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 text-[#aaa] border border-dashed rounded-md">
                        <GlobeIcon className="w-8 h-8 opacity-40" />
                        <p className="text-sm">No domain locks configured</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Domain</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {domainLocks.map((lock, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-mono text-sm">{lock.domain}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-1">
                                            <Button
                                                variant="link"
                                                onClick={() => openEditDomain(lock)}
                                                className="p-2"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="link"
                                                onClick={() => handleDeleteDomainLock(lock.id)}
                                                disabled={isDeletingLockId === lock.id}
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
