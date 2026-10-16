//@ts-nocheck
"use client"
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Field from "@/components/ui/field";
import Tag from "@/components/ui/tag";
import { EmptyState, Page, PageIntro, Section } from "@/components/dashboard/page";
import React, { useContext, useEffect, useState } from "react";
import { createAccessBlock, getAccessBlocks, deleteAccessBlock } from "@/service/apis";
import { useToast } from "@/hooks/use-toast"
import { PlusIcon, ShieldBanIcon, Trash2Icon } from "lucide-react";
import { AuthContext } from "@/providers/AuthProvider";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const BLOCK_TYPES = [
    { value: "IP", label: "IP Address" },
    { value: "Device", label: "Device ID" }
];

export default function AccessBlocks() {
    const { currentUser } = useContext(AuthContext)
    const [accessBlocks, setAccessBlocks] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [blockType, setBlockType] = useState("IP");
    const [blockValue, setBlockValue] = useState("");
    const [blockReason, setBlockReason] = useState("");
    const [isDeleting, setIsDeleting] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const { toast } = useToast()

    const fetchAccessBlocks = async () => {
        if (!currentUser?.token) return;
        setIsLoading(true);
        try {
            const result = await getAccessBlocks(currentUser.token);
            setAccessBlocks(Array.isArray(result) ? result : []);
        } catch (error) {
            console.error("Failed to fetch access blocks:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser?.token) fetchAccessBlocks();
    }, [currentUser?.token]);

    const createBlock = async () => {
        if (!blockValue.trim()) {
            toast({
                description: "Please enter a value to block",
                variant: "destructive"
            });
            return;
        }

        setIsCreating(true);
        try {
            console.log('Creating access block:', {
                type: blockType,
                value: blockValue.trim(),
                reason: blockReason.trim() || "No reason provided"
            });

            const response = await createAccessBlock(currentUser?.token, {
                type: blockType,
                value: blockValue.trim(),
                reason: blockReason.trim() || "No reason provided"
            });

            console.log('Create response:', response);

            if (response.success) {
                await fetchAccessBlocks();
                setDialogOpen(false);
                setBlockValue("");
                setBlockReason("");
                setBlockType("IP");

                toast({
                    description: "Access block created successfully",
                });
            } else {
                toast({
                    description: response.message || "Failed to create access block",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error('Failed to create access block: ', err);
            toast({
                description: "Failed to create access block",
                variant: "destructive"
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteBlock = async (id) => {
        setIsDeleting(id);
        try {
            const response = await deleteAccessBlock(currentUser.token, id);
            if (response.success) {
                await fetchAccessBlocks();
                toast({
                    description: "Access block removed successfully"
                });
            } else {
                toast({
                    description: response.message || "Failed to remove access block",
                    variant: "destructive"
                })
            }
        } catch (err) {
            toast({
                description: "Failed to remove access block",
                variant: "destructive"
            })
        } finally {
            setIsDeleting(null);
        }
    }

    return (
        <Page>
            <PageIntro
                title="Access Blocks"
                description="Block specific IP addresses or device IDs from using your API keys. This helps prevent abuse and unauthorized access to your services."
                actions={
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="primary">
                                <PlusIcon aria-hidden /> Add Block
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Access Block</DialogTitle>
                                <DialogDescription>
                                    Block an IP address or device ID from accessing your API.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogBody>
                                <Field label="Block Type" htmlFor="block-type">
                                    <Select value={blockType} onValueChange={setBlockType}>
                                        <SelectTrigger id="block-type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BLOCK_TYPES.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field label={blockType === "IP" ? "IP Address" : "Device ID"} htmlFor="block-value" required>
                                    <Input
                                        id="block-value"
                                        placeholder={blockType === "IP" ? "e.g. 196.188.0.1" : "Device ID"}
                                        value={blockValue}
                                        onChange={(e) => setBlockValue(e.target.value)}
                                    />
                                </Field>
                                <Field label="Reason" htmlFor="block-reason">
                                    <Input
                                        id="block-reason"
                                        placeholder="e.g. abuse, suspicious activity"
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                    />
                                </Field>
                            </DialogBody>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button variant="primary" onClick={createBlock} disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create Block"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                }
            />

            <Section title="Blocked access">
                {isLoading ? (
                    <div className="divide-y divide-line-strong overflow-hidden rounded-lg bg-card shadow-card">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start justify-between gap-4 p-4">
                                <div className="flex flex-1 flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="h-[22px] w-14 rounded-full" />
                                        <Skeleton className="h-4 w-40" />
                                    </div>
                                    <Skeleton className="h-3 w-56" />
                                </div>
                                <Skeleton className="size-[30px] rounded-full" />
                            </div>
                        ))}
                    </div>
                ) : accessBlocks.length === 0 ? (
                    <EmptyState
                        icon={<ShieldBanIcon />}
                        title="No access blocks configured"
                        description="Create access blocks to prevent specific IPs or devices from using your API."
                    />
                ) : (
                    <ul className="divide-y divide-line-strong overflow-hidden rounded-lg bg-card shadow-card">
                        {accessBlocks.map((block) => (
                            <li key={block.id} className="flex items-start justify-between gap-4 p-4">
                                <div className="flex min-w-0 flex-1 flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <Tag tone="red">{block.type}</Tag>
                                        <span className="truncate font-mono text-[14px] font-medium text-foreground">
                                            {block.value || "No value"}
                                        </span>
                                    </div>
                                    <div className="caption-style flex flex-wrap gap-x-4 gap-y-2 text-subtle">
                                        <span>
                                            Reason: <span className="text-soft">{block.reason}</span>
                                        </span>
                                        <span>
                                            Created: <span className="text-soft">{new Date(block.created_at).toLocaleString()}</span>
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteBlock(block.id)}
                                    disabled={isDeleting === block.id}
                                    aria-label={`Remove block for ${block.value}`}
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
