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
            console.log('Fetched access blocks:', result);
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
        <div className="rounded text-[#aaa] p-4 md:p-6 mt-2">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">Access Blocks</h2>
                <p className="text-sm text-[#aaa]">
                    Block specific IP addresses or device IDs from using your API keys.
                    This helps prevent abuse and unauthorized access to your services.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-medium text-white">Blocked Access</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#FFA500] text-white hover:bg-[#FF8C00] text-sm px-4 py-2">
                            <PlusIcon className="w-4 h-4 mr-1" /> Add Block
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Create Access Block</DialogTitle>
                            <DialogDescription>
                                Block an IP address or device ID from accessing your API.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="block-type">Block Type</Label>
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
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="block-value">
                                    {blockType === "IP" ? "IP Address" : "Device ID"}
                                </Label>
                                <Input
                                    id="block-value"
                                    placeholder={blockType === "IP" ? "ip address" : "device id"}
                                    value={blockValue}
                                    onChange={(e) => setBlockValue(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="block-reason">Reason</Label>
                                <Input
                                    id="block-reason"
                                    placeholder="e.g., abuse, suspicious activity"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary">Cancel</Button>
                            </DialogClose>
                            <Button
                                className="bg-[#FFA500] text-white hover:bg-[#FF8C00]"
                                onClick={createBlock}
                                disabled={isCreating}
                            >
                                {isCreating ? "Creating..." : "Create Block"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

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
            ) : accessBlocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-[#aaa] border border-dashed rounded-md">
                    <ShieldBanIcon className="w-12 h-12 opacity-40" />
                    <p className="text-sm">No access blocks configured</p>
                    <p className="text-xs text-center max-w-md">
                        Create access blocks to prevent specific IPs or devices from using your API
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {accessBlocks.map((block) => {
                        console.log('Rendering block:', block);
                        return (
                            <div key={block.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs px-2 py-0.5 rounded whitespace-nowrap bg-red-500/20 text-red-400">
                                                {block.type}
                                            </span>
                                            <p className="text-sm font-medium text-white font-mono">
                                                {block.value || 'No value'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs text-[#aaa]">
                                                <span className="font-semibold">Value:</span> {block.value}
                                            </p>
                                            <p className="text-xs text-[#aaa]">
                                                <span className="font-semibold">Reason:</span> {block.reason}
                                            </p>
                                            <p className="text-xs text-[#aaa]">
                                                <span className="font-semibold">Created:</span> {new Date(block.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="link"
                                        onClick={() => handleDeleteBlock(block.id)}
                                        disabled={isDeleting === block.id}
                                        className="p-2 text-red-500 hover:text-red-600"
                                    >
                                        <Trash2Icon className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
