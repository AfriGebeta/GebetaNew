"use client"
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"; // Import the Dialog components
import React, {useContext, useState} from "react";
import { setToken } from "@/service/apis";
import useLocalStorage from "@/hooks/use-local-storage";
import toast from "react-hot-toast";
import { CopyIcon, EyeIcon } from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";

export default function APIToken() {
    const {currentUser, setCurrentUser} = useContext(AuthContext)
    const [tokenList, setTokenList] = useState(currentUser?.user?.token || []);
    const [newToken, setNewToken] = useState("");
    const [selectedToken, setSelectedToken] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const copyToClipboard = (token) => {
        navigator.clipboard.writeText(token)
            .then(() => toast.success("Copied to clipboard"))
            .catch(err => {
                console.error('Failed to copy: ', err);
                toast.error("Failed to copy to clipboard");
            });
    };

    const createToken = async () => {
        try {
            const response = await setToken(currentUser.token);
            const updatedTokens = [...tokenList, response.token];
            setTokenList(updatedTokens);
            setCurrentUser({ ...currentUser, user: { ...currentUser.user, token: updatedTokens } });
            setNewToken(response.token);
            toast.success("Token created successfully");
        } catch (err) {
            console.error('Failed to create token: ', err);
            toast.error("Failed to create token");
        }
    };

    const handleShowToken = (token) => {
        setSelectedToken(token);
        setDialogOpen(true);
    };

    return (
        <div className="rounded text-[#aaa] p-6 mt-2">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-white">API Tokens</h2>
                <Button className="bg-[#FFA500] text-white" onClick={createToken}>
                    Create Token
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tokenList.map((token, index) => (
                        <TableRow key={index}>
                            <TableCell>{token.replace(/./g, '●').slice(0,24)}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        variant="link"
                                        onClick={() => copyToClipboard(token)}
                                        className="flex items-center"
                                    >
                                        <CopyIcon className="mr-1" /> Copy
                                    </Button>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="link"
                                                onClick={() => handleShowToken(token)}
                                            >
                                                <EyeIcon /> Show
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>API Token</DialogTitle>
                                                <DialogDescription className="relative break-words overflow-hidden max-w-sm">
                                                    <div className="whitespace-normal break-words overflow-wrap break-all">
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
                    ))}
                </TableBody>
            </Table>

        </div>
    );
}