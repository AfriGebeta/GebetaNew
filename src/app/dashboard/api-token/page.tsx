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
import React, {useContext, useState} from "react";
import {revokeToken, setToken} from "@/service/apis";
import {useToast} from "@/hooks/use-toast"
import {CopyIcon, EyeIcon, Trash2Icon} from "lucide-react";
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

    //default ones
    const [selectedScopes, setSelectedScopes] = useState([
        "DIRECTION",
        "GEOCODING",
        "TILE",
        "MATRIX",
        "ONM",
        "TSS"
    ]);

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

            // console.log('Token creation response:', response);

            if (response.success) {
                const newTokenData = {
                    ...response.data,
                    tokenIdentifierName: response.data.tokenIdentifierName || identifierName
                };

                // console.log('New token data:', newTokenData);

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
                //reset
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
        </div>
    );
}