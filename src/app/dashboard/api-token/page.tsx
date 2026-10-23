//@ts-nocheck
"use client"
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
    Dialog,
    DialogBody,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import Field from "@/components/ui/field";
import {EmptyState, Page, PageIntro, Section} from "@/components/dashboard/page";
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

    const allowedIpFields = (prefix, values, onChange) => (
        <DialogBody>
            <Field label="IP Address" htmlFor={`${prefix}-ip-address`} required>
                <Input
                    id={`${prefix}-ip-address`}
                    placeholder="e.g. 203.0.113.42"
                    value={values.ipAddress}
                    onChange={(e) => onChange("ipAddress", e.target.value)}
                />
            </Field>
            <Field label="API Key" htmlFor={`${prefix}-apikey`} required>
                <Input
                    id={`${prefix}-apikey`}
                    placeholder="Enter API key"
                    value={values.apiKey}
                    onChange={(e) => onChange("apiKey", e.target.value)}
                />
            </Field>
            <Field label="Description" htmlFor={`${prefix}-description`} hint="Optional">
                <Input
                    id={`${prefix}-description`}
                    placeholder="e.g. Production server"
                    value={values.description}
                    onChange={(e) => onChange("description", e.target.value)}
                />
            </Field>
        </DialogBody>
    );

    return (
        <Page>
            <PageIntro
                title="API Keys"
                description="Create and revoke the tokens your apps use to call Gebeta Maps, and lock them to specific IP addresses."
                actions={
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
                            <Button variant="primary">
                                <PlusIcon aria-hidden /> Create Token
                            </Button>
                        }
                    />
                }
            />

            <Section title="API tokens">
                {tokenList.length === 0 ? (
                    <EmptyState title="No API tokens yet" description="Create a token to start calling Gebeta Maps APIs." />
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Token</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tokenList.map((token, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-mono text-subtle">
                                            <span className="hidden sm:inline">{(token?.token).replace(/./g, '●').slice(0, 24)}</span>
                                            <span className="inline sm:hidden">{(token?.token).replace(/./g, '●').slice(0, 12)}</span>
                                        </TableCell>
                                        <TableCell>{token?.tokenIdentifierName || '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(token?.token)}
                                                    aria-label="Copy token"
                                                >
                                                    <CopyIcon aria-hidden />
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleShowToken(token?.token)}
                                                            aria-label="Show token"
                                                        >
                                                            <EyeIcon aria-hidden />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>API Token</DialogTitle>
                                                            <DialogDescription>
                                                                Keep this token secret. Anyone with it can make calls billed to your account.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <DialogBody>
                                                            <code className="block break-all rounded-lg border border-line-strong bg-secondary p-3 font-mono text-[13px] leading-[1.5] text-foreground">
                                                                {selectedToken}
                                                            </code>
                                                        </DialogBody>
                                                        <DialogFooter>
                                                            <DialogClose asChild>
                                                                <Button variant="secondary">Close</Button>
                                                            </DialogClose>
                                                            <Button variant="primary" onClick={() => copyToClipboard(selectedToken)}>
                                                                <CopyIcon aria-hidden /> Copy
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRevokeToken(token)}
                                                    aria-label="Revoke token"
                                                    className="hover:text-danger"
                                                >
                                                    <Trash2Icon aria-hidden />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Section>

            <Section
                title="Allowed IPs"
                description={`Restrict API access to specific IP addresses and API keys${!allowedIpsLoading && allowedIpsCount > 0 ? ` · ${allowedIpsCount} total` : ""}`}
                action={
                    <Dialog open={allowedIpDialogOpen} onOpenChange={setAllowedIpDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="secondary">
                                <PlusIcon aria-hidden /> Add Allowed IP
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Allowed IP</DialogTitle>
                                <DialogDescription>
                                    Restrict API access to a specific IP address. Only requests from this IP using the linked API key will be allowed.
                                </DialogDescription>
                            </DialogHeader>
                            {allowedIpFields(
                                "lock",
                                { ipAddress: lockIpAddress, apiKey: lockApiKey, description: lockDescription },
                                (field, value) => ({ ipAddress: setLockIpAddress, apiKey: setLockApiKey, description: setLockDescription })[field](value)
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="primary"
                                    onClick={handleAddAllowedIp}
                                    disabled={isAddingAllowedIp || !lockIpAddress.trim() || !lockApiKey.trim()}
                                >
                                    {isAddingAllowedIp ? "Adding..." : "Add"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            >
                <Dialog open={editAllowedIpDialogOpen} onOpenChange={setEditAllowedIpDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Allowed IP</DialogTitle>
                            <DialogDescription>Update the IP address, API key, and description.</DialogDescription>
                        </DialogHeader>
                        {allowedIpFields(
                            "edit",
                            editAllowedIpForm,
                            (field, value) => setEditAllowedIpForm(f => ({ ...f, [field]: value }))
                        )}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                variant="primary"
                                onClick={handleUpdateAllowedIp}
                                disabled={isUpdatingAllowedIp || !editAllowedIpForm.ipAddress.trim() || !editAllowedIpForm.apiKey.trim()}
                            >
                                {isUpdatingAllowedIp ? "Saving..." : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {allowedIpsLoading ? (
                    <p className="caption-style py-4 text-subtle">Loading...</p>
                ) : allowedIps.length === 0 ? (
                    <EmptyState icon={<NetworkIcon />} title="No allowed IPs configured" />
                ) : (
                    <TableContainer>
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
                                        <TableCell className="font-mono">{entry.ipAddress || "—"}</TableCell>
                                        <TableCell className="font-mono">
                                            <div className="flex items-center gap-1">
                                                <span className="text-subtle">{maskApiKey(entry.apiKey)}</span>
                                                {entry.apiKey ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => copyToClipboard(entry.apiKey)}
                                                        aria-label="Copy API key"
                                                    >
                                                        <CopyIcon aria-hidden />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-soft">{entry.description || "—"}</TableCell>
                                        <TableCell className="text-subtle">{formatAllowedIpDate(entry.createdAt)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEditAllowedIp(entry)}
                                                    aria-label="Edit allowed IP"
                                                >
                                                    <PencilIcon aria-hidden />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteAllowedIp(entry.id)}
                                                    disabled={isDeletingAllowedIpId === entry.id}
                                                    aria-label="Remove allowed IP"
                                                    className="hover:text-danger"
                                                >
                                                    <Trash2Icon aria-hidden />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Section>
        </Page>
    );
}
