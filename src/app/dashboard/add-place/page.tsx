//@ts-nocheck
"use client";

// some comment
import React, {useState, useRef, useContext} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Field from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Page as DashboardPage, PageIntro } from "@/components/dashboard/page";
import { X, Plus, UploadCloud } from "lucide-react";
import {AuthContext} from "@/providers/AuthProvider";
import toast from "react-hot-toast";

export default function Page() {
    const { currentUser } = useContext(AuthContext);

    const [formData, setFormData] = useState({
        name: "",
        lat: "",
        lon: "",
        type: "",
        city: "",
        country: "",
        apiKey: "",
        county: "N/A",
        province: "N/A",
        municipality: "N/A",
        borough: "N/A",
        district: "N/A",
        metadata: {},
        images: []
    });
    const [images , setImages] = useState([]);

    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let token = currentUser?.token || null;
        if (!token) {
            alert("Token not found");
            return;
        }

        setUploading(true);

        try {
            for (const file of files) {
                const policy = {
                    prefix: "images",
                    ext: file.name.split(".").pop(),
                    contentType: file.type,
                    maxSize: 10485760 // 10MB
                };

                const presignRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/storage/pre-sign/post-policy`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ policies: [policy] })
                });

                if (!presignRes.ok) {
                    throw new Error(`Failed to get presigned policy for ${file.name}`);
                }

                const data = await presignRes.json();
                const { url, formData: uploadFields } = data.urls[0];

                const body = new FormData();
                for (const key in uploadFields) {
                    body.append(key, uploadFields[key]);
                }
                body.append("file", file);

                const res = await fetch(url, {
                    method: "POST",
                    body
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.statusText}`);
                }

                const uploadedPath = `${uploadFields.key}`;
                setFormData(prev => ({
                    ...prev,
                    images: [
                        ...prev.images,
                        {
                            name: file.name,
                            preview: URL.createObjectURL(file),
                            path: `${process.env.NEXT_MINIO_IMAGE_BUCKET}+uploadedPath`
                        }


                    ]
                }));

                toast.success(`${file.name} uploaded`);
            }
        } catch (err) {
            console.error(err);
            alert(err.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const removeImage = (index) => {
        setFormData(prev => {
            const newImages = [...prev.images];
            newImages.splice(index, 1);
            return {
                ...prev,
                images: newImages
            };
        });
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "metadata") {

            setFormData(prev => ({
                ...prev,
                metadata: {
                    ...prev.metadata,
                    myvalue: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = () => {

        let token = currentUser?.user?.token || null
        if (token) {
            formData.apiKey = token[0].token;

            let imagePaths = []


            for (let i=0; i < formData.images.length; i++) {
                imagePaths.push({
                    "image-url" : formData.images[i].path,
                    "altText" : "place",
                    "order" : i,
                    "captions" : []

                })
            }
            formData.images = imagePaths;

            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/v1/route/addPlace`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            }).then((res) => {
                if (res.ok) {
                    console.log("place updated")
                }
            })


            console.log(formData);

        }else{
            alert("please create an api token")
        }

    };

    const renderField = (field) => (
        <Field key={field.id} label={field.label} htmlFor={field.id} className={field.colSpan}>
            <Input
                id={field.id}
                name={field.id}
                value={formData[field.id]}
                onChange={handleChange}
            />
        </Field>
    );

    return (
        <DashboardPage>
            <PageIntro
                title="Add New Place"
                description="Submit a place with its location, address details, and photos."
                actions={
                    <Button variant="primary" onClick={handleSubmit}>
                        Submit
                    </Button>
                }
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="border-b border-line-strong">
                        <CardTitle>Place Information</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6 pt-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                {id: "name", label: "Name", colSpan: "md:col-span-2"},
                                {id: "type", label: "Type"},
                                {id: "city", label: "City"},
                                {id: "country", label: "Country"},
                                {id: "lat", label: "Latitude"},
                                {id: "lon", label: "Longitude"}
                            ].map(renderField)}
                        </div>

                        <Field label="Metadata" htmlFor="metadata">
                            <Input
                                id="metadata"
                                name="metadata"
                                value={formData.metadata.myvalue || ""}
                                onChange={handleChange}
                                placeholder="Enter custom metadata value"
                            />
                        </Field>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {[
                                {id: "county", label: "County"},
                                {id: "province", label: "Province"},
                                {id: "municipality", label: "Municipality"},
                                {id: "borough", label: "Borough"},
                                {id: "district", label: "District"},
                            ].map(renderField)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="border-b border-line-strong">
                        <CardTitle>Images</CardTitle>
                        <CardDescription>PNG, JPG, GIF up to 10MB</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5 pt-5">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageUpload}
                            multiple
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-dashed border-line-strong px-6 py-10 text-center outline-none transition-colors duration-150 ease-power3-out hover:bg-hover focus-visible:border-ring"
                        >
                            <UploadCloud aria-hidden className="size-8 text-faint" />
                            <span className="lead-style text-foreground">Click to select images</span>
                            <span className="caption-style text-subtle">You can pick several at once</span>
                        </button>

                        {uploading && (
                            <p className="caption-style rounded-lg border border-[var(--ds-tag-blue-border)] bg-[var(--ds-tag-blue-bg)] p-3 text-[var(--ds-tag-blue-text)]">
                                Uploading images, please wait...
                            </p>
                        )}

                        {formData.images.length > 0 && (
                            <div className="flex flex-col gap-3">
                                <h3 className="eyebrow-style text-subtle">Uploaded images</h3>
                                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {formData.images.map((image, index) => (
                                        <li key={index} className="group relative flex flex-col gap-1.5">
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="h-28 w-full rounded-md object-cover outline outline-1 -outline-offset-1 outline-black/10"
                                            />
                                            <Button
                                                variant="secondary"
                                                size="icon-sm"
                                                onClick={() => removeImage(index)}
                                                aria-label={`Remove ${image.name}`}
                                                className="absolute right-1.5 top-1.5 opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                                            >
                                                <X aria-hidden />
                                            </Button>
                                            <span className="caption-style truncate text-subtle">{image.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardPage>
    );
}
