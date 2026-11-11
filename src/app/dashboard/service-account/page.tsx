//@ts-nocheck
"use client"
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Field from "@/components/ui/field";
import Tag from "@/components/ui/tag";
import { EmptyState, Page, PageIntro, Section } from "@/components/dashboard/page";
import React, { useContext, useEffect, useState } from "react";
import { createServiceAccount, getServiceAccounts, deleteServiceAccount } from "@/service/apis";
import { useToast } from "@/hooks/use-toast"
import { CopyIcon, EyeIcon, EyeOffIcon, KeyIcon, PlusIcon, ShieldCheckIcon, Trash2Icon } from "lucide-react";
import { AuthContext } from "@/providers/AuthProvider";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useReferenceData } from "@/hooks/useReferenceData";
import { formatScopeLabel, getGrantedScopes } from "@/lib/referenceData";

export default function ServiceAccount() {
    const { currentUser } = useContext(AuthContext)
    const [serviceAccounts, setServiceAccounts] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [description, setDescription] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const { allowedScopes, loading: scopesLoading } = useReferenceData();
    // Restrict to the subset of scopes actually granted to this account (see the
    // same reasoning in dashboard/api-token/page.tsx) rather than the full
    // platform-wide reference list.
    const grantedScopes = getGrantedScopes(allowedScopes, currentUser?.user?.allowed_scopes);
    const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
    const [defaultsApplied, setDefaultsApplied] = useState(false);
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

    useEffect(() => {
        if (!scopesLoading && grantedScopes.length > 0 && !defaultsApplied) {
            setSelectedScopes([...grantedScopes]);
            setDefaultsApplied(true);
        }
    }, [scopesLoading, grantedScopes, defaultsApplied]);

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
                setSelectedScopes([...grantedScopes]);

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
        <Page>
            <PageIntro
                title="Service Accounts"
                description="Service accounts provide secure authentication using two tokens (client and server). Combine them to get short lived access tokens instead of exposing long term credentials."
                actions={
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="primary">
                                <PlusIcon aria-hidden /> Create Service Account
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[520px]">
                            <DialogHeader>
                                <DialogTitle>Create Service Account</DialogTitle>
                                <DialogDescription>
                                    Create a new service account with client and server tokens for secure authentication.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogBody className="gap-5">
                                <Field label="Description" htmlFor="description" hint="Optional">
                                    <Input
                                        id="description"
                                        placeholder="e.g. Production API access"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </Field>
                                <div className="flex items-center justify-between gap-4 rounded-lg border border-line-strong p-3">
                                    <div className="flex flex-col gap-1.5">
                                        <Label htmlFor="admin-mode" className="text-foreground">Admin Token</Label>
                                        <span className="caption-style text-subtle">Grant admin privileges to this service account</span>
                                    </div>
                                    <Switch
                                        id="admin-mode"
                                        checked={isAdmin}
                                        onCheckedChange={setIsAdmin}
                                    />
                                </div>
                                <fieldset className="flex flex-col gap-2">
                                    <legend className="caption-style mb-2 text-soft">Scopes</legend>
                                    {scopesLoading ? (
                                        <p className="caption-style text-subtle">Loading scopes...</p>
                                    ) : grantedScopes.length === 0 ? (
                                        <p className="caption-style text-subtle">Your account has no API scopes granted yet. Contact support to enable them.</p>
                                    ) : (
                                        <ul className="grid max-h-[220px] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                                            {grantedScopes.map((scope) => (
                                                <li key={scope}>
                                                    <Label
                                                        htmlFor={`sa-scope-${scope}`}
                                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[14px] text-foreground transition-colors duration-150 ease-power3-out hover:bg-hover"
                                                    >
                                                        <Checkbox
                                                            id={`sa-scope-${scope}`}
                                                            checked={selectedScopes.includes(scope)}
                                                            onCheckedChange={() => toggleScope(scope)}
                                                        />
                                                        {formatScopeLabel(scope)}
                                                    </Label>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </fieldset>
                            </DialogBody>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button
                                    variant="primary"
                                    onClick={createAccount}
                                    disabled={isCreating || scopesLoading || selectedScopes.length === 0}
                                >
                                    {isCreating ? "Creating..." : "Create"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <Dialog open={tokenDialogOpen} onOpenChange={setTokenDialogOpen}>
                <DialogContent className="max-w-[560px]">
                    <DialogHeader>
                        <DialogTitle>Service Account Token Created</DialogTitle>
                        <DialogDescription>
                            Save this token securely. You won't be able to see it again!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                        <Field label="Token" htmlFor="new-sa-token">
                            <div className="flex items-center gap-2">
                                <Input
                                    id="new-sa-token"
                                    value={newlyCreatedToken || ""}
                                    readOnly
                                    className="font-mono text-[12px]"
                                />
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => copyToClipboard(newlyCreatedToken, "Token")}
                                    aria-label="Copy token"
                                >
                                    <CopyIcon aria-hidden />
                                </Button>
                            </div>
                        </Field>
                        <p className="caption-style rounded-lg border border-[var(--ds-tag-amber-border)] bg-[var(--ds-tag-amber-bg)] p-3 leading-[1.4] text-[var(--ds-tag-amber-text)]">
                            <span className="font-medium">Important:</span> This token will only be shown once. Make sure to copy and store it securely.
                        </p>
                    </DialogBody>
                    <DialogFooter>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setTokenDialogOpen(false);
                                setNewlyCreatedToken(null);
                            }}
                        >
                            I've Saved the Token
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Section title="Your service accounts">
                {isLoading ? (
                    <div className="divide-y divide-line-strong overflow-hidden rounded-lg bg-card shadow-card">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start justify-between gap-4 p-4">
                                <div className="flex flex-1 flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[22px] w-16 rounded-full" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <Skeleton className="h-3 w-64" />
                                </div>
                                <Skeleton className="size-[30px] rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : serviceAccounts.length === 0 ? (
                    <EmptyState
                        icon={<ShieldCheckIcon />}
                        title="No service accounts yet"
                        description="Create a service account to get secure client and server tokens for authentication."
                    />
                ) : (
                    <ul className="divide-y divide-line-strong overflow-hidden rounded-lg bg-card shadow-card">
                        {serviceAccounts.map((account) => (
                            <li key={account.id} className="flex items-start justify-between gap-4 p-4">
                                <div className="flex min-w-0 flex-1 flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Tag tone={account.status === 'ACTIVE' ? "green" : "neutral"}>{account.status}</Tag>
                                        {account.isAdmin && <Tag tone="purple">Admin</Tag>}
                                        <span className="truncate text-[14px] font-medium text-foreground">
                                            {account.description || `Service Account #${account.id}`}
                                        </span>
                                    </div>
                                    <dl className="caption-style flex flex-wrap gap-x-4 gap-y-2 text-subtle">
                                        <div className="flex gap-1"><dt>Platform:</dt><dd className="text-soft">{account.platform}</dd></div>
                                        <div className="flex gap-1"><dt>User Token ID:</dt><dd className="font-mono text-soft">{account.userTokenId}</dd></div>
                                        <div className="flex gap-1"><dt>Created:</dt><dd className="text-soft">{new Date(account.createdAt).toLocaleDateString()}</dd></div>
                                    </dl>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteAccount(account.id)}
                                    disabled={isDeleting === account.id || account.revoked}
                                    aria-label="Delete service account"
                                    className="hover:text-danger"
                                >
                                    <Trash2Icon aria-hidden />
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </Section>
        </Page>
    );
}
