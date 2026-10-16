//@ts-nocheck
import React, { useState } from 'react';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Field from "@/components/ui/field";
import { formatScopeLabel } from "@/lib/referenceData";

interface ScopeSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedScopes: string[];
    onToggleScope: (scope: string) => void;
    onCreateToken: (identifierName: string) => void;
    isCreating: boolean;
    availableScopes: string[];
    scopesLoading?: boolean;
    emptyScopesMessage?: string;
    trigger?: React.ReactNode;
}

export default function ScopeSelectionModal({
    open,
    onOpenChange,
    selectedScopes,
    onToggleScope,
    onCreateToken,
    isCreating,
    availableScopes,
    scopesLoading = false,
    emptyScopesMessage = "No scopes available",
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
            <DialogContent className="max-w-[520px]">
                <DialogHeader>
                    <DialogTitle>Restrict access</DialogTitle>
                    <DialogDescription>Choose what this token can access</DialogDescription>
                </DialogHeader>

                <DialogBody className="gap-5">
                    <fieldset className="flex flex-col gap-2">
                        <legend className="caption-style mb-2 text-soft">Scopes</legend>
                        {scopesLoading ? (
                            <p className="caption-style text-subtle">Loading scopes...</p>
                        ) : availableScopes.length === 0 ? (
                            <p className="caption-style text-subtle">{emptyScopesMessage}</p>
                        ) : (
                            <ul className="grid max-h-[320px] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2">
                                {availableScopes.map((scope) => (
                                    <li key={scope}>
                                        <Label
                                            htmlFor={`scope-${scope}`}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[14px] text-foreground transition-colors duration-150 ease-power3-out hover:bg-hover"
                                        >
                                            <Checkbox
                                                id={`scope-${scope}`}
                                                checked={selectedScopes.includes(scope)}
                                                onCheckedChange={() => onToggleScope(scope)}
                                            />
                                            {formatScopeLabel(scope)}
                                        </Label>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </fieldset>

                    <Field label="Token Identifier" htmlFor="identifierName" required>
                        <Input
                            id="identifierName"
                            value={identifierName}
                            onChange={(e) => setIdentifierName(e.target.value)}
                            placeholder="e.g. Your App Name"
                        />
                    </Field>
                </DialogBody>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            onOpenChange(false);
                            setIdentifierName("");
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateToken}
                        disabled={isCreating || scopesLoading || selectedScopes.length === 0 || !identifierName.trim()}
                    >
                        {isCreating ? "Creating..." : "Set Token"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
